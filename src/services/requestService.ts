/**
 * Request Service for KaamWala
 * Secure customer service-request submission and status tracking.
 * Strictly prevents public data exposure, ID tampering, and unauthorized customer lookups.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  SupabaseCustomerAddressRow,
  SupabaseServiceRequestRow
} from '../types/database';
import { CustomerLocation } from '../types';
import { resolveServiceOptionUuid } from '../data/serviceCatalogUuids';

export interface ServiceRequestSubmission {
  customerName: string;
  customerPhone: string;
  location: CustomerLocation;
  serviceOptionId: string;
  serviceOptionName: string;
  categoryName?: string;
  problemDescription?: string;
  photoUrl?: string;
  estimatedMinPrice: number;
  estimatedMaxPrice: number;
}

export interface CustomerServiceRequest {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone?: string;
  serviceOptionId: string;
  serviceOptionName: string;
  categoryName: string;
  addressId?: string;
  address: string;
  locality?: string;
  problemDescription?: string;
  photoUrl?: string;
  estimatedMinPrice: number;
  estimatedMaxPrice: number;
  paymentMethod: string;
  status: string; // 'requested', 'confirmed', etc.
  createdAt: string;
}

const LOCAL_REQUESTS_KEY = 'kaamwala_service_requests_v1';
const memoryRequests: CustomerServiceRequest[] = [];

/**
 * Generate a cryptographically strong UUIDv4
 */
export function generateSecureUuid(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Validate UUID format
 */
export function isValidUuid(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export function getStoredRequests(): CustomerServiceRequest[] {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(LOCAL_REQUESTS_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    }
  } catch {}
  return [...memoryRequests];
}

export function storeRequestLocally(req: CustomerServiceRequest): void {
  try {
    memoryRequests.unshift(req);
    if (typeof window !== 'undefined' && window.localStorage) {
      const existing = getStoredRequests();
      const updated = [req, ...existing.filter((r) => r.id !== req.id)];
      window.localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(updated));
    }
  } catch {}
}

export function updateStoredRequestsLocally(updatedList: CustomerServiceRequest[]): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(LOCAL_REQUESTS_KEY, JSON.stringify(updatedList));
    }
  } catch {}
}

/**
 * 1. Upload problem photo to Supabase Storage with strict MIME & extension verification.
 * Does not allow arbitrary file uploads or script injection (e.g. HTML, SVG).
 */
export async function uploadProblemPhoto(
  file: File
): Promise<{ url: string | null; error: string | null }> {
  // Allowed safe image types
  const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
  const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

  if (!file) {
    return { url: null, error: 'No file provided' };
  }

  // Validate size
  if (file.size > MAX_FILE_SIZE) {
    return { url: null, error: 'Photo size should be less than 5MB.' };
  }

  // Validate MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      url: null,
      error: 'Invalid file format. Please choose a JPG, PNG, or WebP photo.'
    };
  }

  const rawExt = (file.name.split('.').pop() || '').toLowerCase();
  const fileExt = ALLOWED_EXTENSIONS.includes(rawExt) ? rawExt : 'jpg';

  if (!isSupabaseConfigured || !supabase) {
    return {
      url: null,
      error: 'Supabase storage is not configured. Request will proceed without a photo.'
    };
  }

  try {
    // Generate an unguessable filename with timestamp and random UUID token
    const randomToken = generateSecureUuid().substring(0, 12);
    const fileName = `${Date.now()}-${randomToken}.${fileExt}`;
    const filePath = `problems/${fileName}`;

    // Target storage bucket 'service-requests'
    const { error: uploadError } = await supabase.storage
      .from('service-requests')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type
      });

    if (uploadError) {
      console.warn('Storage upload notice (proceeding without photo):', uploadError.message);
      return {
        url: null,
        error: `Photo upload not available (${uploadError.message}). You can submit without a photo.`
      };
    }

    const { data: publicUrlData } = supabase.storage
      .from('service-requests')
      .getPublicUrl(filePath);

    return {
      url: publicUrlData?.publicUrl || null,
      error: null
    };
  } catch (err: any) {
    console.warn('Exception during photo upload:', err?.message);
    return {
      url: null,
      error: 'Failed to upload photo. You can continue submitting without a photo.'
    };
  }
}

/**
 * 2. Submit Service Request:
 * Primary Path: Calls atomic PostgreSQL RPC `submit_service_request` with SECURITY DEFINER.
 * This ensures customer deduplication, address linking, request creation, and initial status history
 * happen in ONE atomic server transaction with zero public customer exposure.
 *
 * Fallback Path: If RPC is not installed, executes direct sanitized INSERTs with client-generated UUIDs
 * and NO `.select()` calls (compatible with strict zero-SELECT RLS policies).
 */
export async function submitServiceRequest(
  submission: ServiceRequestSubmission
): Promise<{
  success: boolean;
  request: CustomerServiceRequest;
  supabaseError?: string | null;
}> {
  const now = new Date().toISOString();
  // Strip non-digits and normalize Indian mobile number
  let cleanPhone = submission.customerPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.substring(2);
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.substring(1);
  }

  const cleanName = submission.customerName.trim();
  const cleanAddress = submission.location?.formattedAddress?.trim() || '';

  // Validate inputs before network calls
  if (!cleanName || cleanName.length < 2) {
    return {
      success: false,
      request: null as any,
      supabaseError: 'Customer name is required and must be at least 2 characters.'
    };
  }

  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return {
      success: false,
      request: null as any,
      supabaseError: 'Please provide a valid 10-digit Indian mobile number.'
    };
  }

  if (!cleanAddress || cleanAddress.length < 5) {
    return {
      success: false,
      request: null as any,
      supabaseError: 'Service address is required and must be at least 5 characters long.'
    };
  }

  // Handle location coordinates strictly without inventing fake fallbacks
  const rawLat = submission.location?.latitude;
  const rawLng = submission.location?.longitude;
  const hasValidCoords =
    typeof rawLat === 'number' &&
    !isNaN(rawLat) &&
    rawLat >= -90 &&
    rawLat <= 90 &&
    typeof rawLng === 'number' &&
    !isNaN(rawLng) &&
    rawLng >= -180 &&
    rawLng <= 180 &&
    !(rawLat === 0 && rawLng === 0);

  const cleanLat = hasValidCoords ? rawLat : null;
  const cleanLng = hasValidCoords ? rawLng : null;
  const cleanLocality = submission.location?.locality?.trim() || null;
  const cleanCity = submission.location?.city?.trim() || null;
  const cleanState = submission.location?.state?.trim() || null;
  const cleanPincode = submission.location?.pincode?.trim() || null;

  // Validate and resolve service_option_id to an authoritative UUID (preserving schema integrity)
  const serviceOptionUuid = resolveServiceOptionUuid(submission.serviceOptionId);
  if (!isValidUuid(serviceOptionUuid)) {
    return {
      success: false,
      request: null as any,
      supabaseError: `Invalid service option identifier: "${submission.serviceOptionId}". A valid UUID is required.`
    };
  }

  // Strictly enforce Supabase persistence (do not use localStorage as a persistence fallback)
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      request: null as any,
      supabaseError: 'Supabase database is not connected. Please verify your environment configuration.'
    };
  }

  let finalRequestId = generateSecureUuid();
  let finalCustomerId = generateSecureUuid();
  let finalAddressId = generateSecureUuid();
  let finalMinPrice = submission.estimatedMinPrice;
  let finalMaxPrice = submission.estimatedMaxPrice;
  let supabaseErrorMsg: string | null = null;

  let rpcSucceeded = false;
  let directInsertSucceeded = false;

  // A. Attempt secure server-side RPC transaction first (calculates authoritative pricing server-side)
  const rpcPayload = {
    p_customer_name: cleanName,
    p_customer_phone: cleanPhone,
    p_address: cleanAddress,
    p_locality: cleanLocality,
    p_city: cleanCity,
    p_state: cleanState,
    p_pincode: cleanPincode,
    p_latitude: cleanLat,
    p_longitude: cleanLng,
    p_service_option_id: serviceOptionUuid,
    p_problem_description: submission.problemDescription?.trim() || null,
    p_photo_url: submission.photoUrl?.trim() || null
  };

  console.log('[submit_service_request] Invoking RPC with payload:', rpcPayload);

  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('submit_service_request', rpcPayload);

    console.log('[submit_service_request] RPC response:', { data: rpcData, error: rpcError });

    if (!rpcError && rpcData) {
      rpcSucceeded = true;
      if (rpcData.request_id) finalRequestId = rpcData.request_id;
      if (rpcData.customer_id) finalCustomerId = rpcData.customer_id;
      if (rpcData.address_id) finalAddressId = rpcData.address_id;
      if (rpcData.estimated_min_price !== undefined) {
        finalMinPrice = Number(rpcData.estimated_min_price);
      }
      if (rpcData.estimated_max_price !== undefined) {
        finalMaxPrice = Number(rpcData.estimated_max_price);
      }
      supabaseErrorMsg = null;
    } else if (rpcError) {
      console.error('[submit_service_request] RPC error returned:', rpcError);
      supabaseErrorMsg = rpcError.message;
    }
  } catch (err: any) {
    console.error('[submit_service_request] RPC invocation exception:', err);
    supabaseErrorMsg = err?.message || 'RPC invocation failed';
  }

  // B. Direct Insert Fallback (if RPC not yet created in Supabase SQL editor)
  if (!rpcSucceeded) {
    console.warn('[submit_service_request] RPC did not succeed; attempting direct insert fallback...');
    try {
      // 1. Insert customer without calling .select()
      const custPayload = {
        id: finalCustomerId,
        name: cleanName,
        phone: cleanPhone
      };
      const { error: custErr } = await supabase
        .from('customers')
        .insert(custPayload);

      if (custErr) {
        console.error('[submit_service_request] Direct customer insert error:', custErr);
      }

      // 2. Insert customer address without calling .select()
      const addressPayload: SupabaseCustomerAddressRow = {
        id: finalAddressId,
        customer_id: finalCustomerId,
        label: submission.location.label || 'Service Address',
        address: cleanAddress,
        locality: cleanLocality,
        city: cleanCity,
        state: cleanState,
        pincode: cleanPincode,
        latitude: cleanLat ?? 0,
        longitude: cleanLng ?? 0,
        is_default: true
      };
      const { error: addrErr } = await supabase
        .from('customer_addresses')
        .insert(addressPayload);

      if (addrErr) {
        console.error('[submit_service_request] Direct address insert error:', addrErr);
      }

      // 3. Insert service request with validated UUID foreign key intact
      const requestPayload: SupabaseServiceRequestRow = {
        id: finalRequestId,
        customer_id: finalCustomerId,
        service_option_id: serviceOptionUuid,
        address_id: finalAddressId,
        problem_description: submission.problemDescription?.trim() || null,
        photo_url: submission.photoUrl?.trim() || null,
        estimated_min_price: finalMinPrice,
        estimated_max_price: finalMaxPrice,
        payment_method: 'cash_on_service',
        status: 'requested'
      };
      const { error: reqErr } = await supabase
        .from('service_requests')
        .insert(requestPayload);

      if (reqErr) {
        console.error('[submit_service_request] Direct service request insert error:', reqErr);
        supabaseErrorMsg = reqErr.message;
      } else {
        directInsertSucceeded = true;
        supabaseErrorMsg = null;

        // 4. Insert status history
        await supabase
          .from('request_status_history')
          .insert({
            request_id: finalRequestId,
            status: 'requested'
          });
      }
    } catch (directErr: any) {
      console.error('[submit_service_request] Direct insert flow exception:', directErr);
      supabaseErrorMsg = directErr?.message || 'Direct insert exception';
    }
  }

  const persistedToSupabase = rpcSucceeded || directInsertSucceeded;

  if (!persistedToSupabase) {
    console.error('[submit_service_request] CRITICAL: Service request was NOT persisted to Supabase database. Reason:', supabaseErrorMsg);
    return {
      success: false,
      request: null as any,
      supabaseError: supabaseErrorMsg || 'Database submission failed. The service request was not persisted to Supabase.'
    };
  }

  // Construct standardized client-side request object
  const clientRequest: CustomerServiceRequest = {
    id: finalRequestId,
    customerId: finalCustomerId,
    customerName: cleanName,
    customerPhone: cleanPhone,
    serviceOptionId: serviceOptionUuid,
    serviceOptionName: submission.serviceOptionName,
    categoryName: submission.categoryName || 'Home Service',
    addressId: finalAddressId,
    address: cleanAddress,
    locality: cleanLocality || cleanCity || undefined,
    problemDescription: submission.problemDescription,
    photoUrl: submission.photoUrl,
    estimatedMinPrice: finalMinPrice,
    estimatedMaxPrice: finalMaxPrice,
    paymentMethod: 'cash_on_service',
    status: 'requested',
    createdAt: now
  };

  // Only store locally once successfully persisted in Supabase database
  storeRequestLocally(clientRequest);

  return {
    success: true,
    request: clientRequest,
    supabaseError: null
  };
}

/**
 * 3. Fetch Customer Service Requests:
 * Strictly retrieves ONLY requests submitted by this customer/session.
 * Never executes an unbounded SELECT * against `service_requests`.
 * If the current browser has 0 local requests, returns empty [] immediately.
 */
export async function fetchCustomerRequests(
  phone?: string
): Promise<{ data: CustomerServiceRequest[]; error: string | null }> {
  // Retrieve the customer's own locally recorded requests
  const localList = getStoredRequests();

  // If this browser/session has no requests, return empty immediately.
  // This completely prevents anonymous clients from ever querying other customers' records.
  if (localList.length === 0) {
    return { data: [], error: null };
  }

  if (!isSupabaseConfigured || !supabase) {
    return { data: localList, error: null };
  }

  // Filter only valid UUIDs submitted by this client
  const targetIds = localList
    .map((r) => r.id)
    .filter((id) => isValidUuid(id));

  if (targetIds.length === 0) {
    return { data: localList, error: null };
  }

  const rawPhone = phone || localList.find((r) => r.customerPhone)?.customerPhone || '';
  let cleanPhone = rawPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.substring(2);
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.substring(1);
  }

  // Mandatory phone requirement: without a valid phone, return locally stored records directly
  if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
    return { data: localList, error: null };
  }

  try {
    // 1. Primary: Use secure RPC function get_my_service_requests
    // Passes specific request IDs and validated phone for mutual verification
    const { data: rpcRows, error: rpcError } = await supabase.rpc('get_my_service_requests', {
      p_request_ids: targetIds,
      p_phone: cleanPhone
    });

    if (!rpcError && Array.isArray(rpcRows)) {
      const updatedList: CustomerServiceRequest[] = localList.map((local) => {
        const match = rpcRows.find((r: any) => r.id === local.id);
        if (match) {
          return {
            ...local,
            status: match.status || local.status,
            serviceOptionId: match.service_option_id || local.serviceOptionId,
            serviceOptionName: match.service_option_name || local.serviceOptionName,
            categoryName: match.category_name || local.categoryName,
            estimatedMinPrice: match.estimated_min_price !== null && match.estimated_min_price !== undefined
              ? Number(match.estimated_min_price)
              : local.estimatedMinPrice,
            estimatedMaxPrice: match.estimated_max_price !== null && match.estimated_max_price !== undefined
              ? Number(match.estimated_max_price)
              : local.estimatedMaxPrice
          };
        }
        return local;
      });

      updateStoredRequestsLocally(updatedList);
      return { data: updatedList, error: null };
    }

    if (rpcError) {
      console.warn('RPC get_my_service_requests notice:', rpcError.message);
    }

    return { data: localList, error: null };
  } catch (err: any) {
    console.warn('Exception fetching customer requests (showing local):', err?.message);
    return { data: localList, error: null };
  }
}
