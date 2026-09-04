/**
 * Request Service for KaamWala
 * Secure customer service-request submission and status tracking.
 * Strictly prevents public data exposure, ID tampering, and unauthorized customer lookups.
 */

import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  SupabaseCustomerAddressRow,
  SupabaseServiceRequestRow,
  ServiceRequest,
  RequestStatus,
  isValidRequestStatus,
  CreateServiceRequestParams,
  CustomerRequestStatusDetail,
  GetServiceRequestStatusParams,
  GetServiceRequestIdentityParams,
  ServiceRequestIdentity
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
  requestId?: string;
  bookingCode?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  serviceOptionId?: string;
  serviceOptionName?: string;
  serviceName?: string;
  categoryName?: string;
  addressId?: string;
  address?: string;
  locality?: string;
  problemDescription?: string;
  photoUrl?: string;
  estimatedMinPrice?: number;
  estimatedMaxPrice?: number;
  estimatedPrice?: number | null;
  confirmedPrice?: number | null;
  professionalName?: string | null;
  professionalPhoto?: string | null;
  professionalRating?: number | null;
  professionalCompletedJobs?: number | null;
  estimatedArrivalAt?: string | null;
  assignedAt?: string | null;
  paymentMethod?: string;
  status: RequestStatus | string;
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
 * Production Path: Invokes PostgreSQL RPC `create_service_request` with exact production parameters.
 * This is the authoritative backend function shared with the Admin Portal, creating the service_request
 * with status 'REQUESTED' and triggering admin workflow.
 *
 * Does not generate fake booking codes or mock statuses on the client.
 * Does not fall back to unverified mock requests on failure.
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
  const cleanCity = submission.location?.city?.trim() || 'Kadi';
  const cleanArea = cleanLocality || cleanCity || 'Kadi';
  const cleanState = submission.location?.state?.trim() || 'Gujarat';
  const cleanPincode = submission.location?.pincode?.trim() || '382715';

  // Validate and resolve service_option_id to an authoritative UUID (preserving schema integrity)
  const serviceOptionUuid = resolveServiceOptionUuid(submission.serviceOptionId);
  if (!isValidUuid(serviceOptionUuid)) {
    return {
      success: false,
      request: null as any,
      supabaseError: `Invalid service option identifier: "${submission.serviceOptionId}". A valid UUID is required.`
    };
  }

  // If Supabase is not configured, do NOT fake success — notify the user
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      request: null as any,
      supabaseError: 'Database connection is not configured. Please check your Supabase connection settings.'
    };
  }

  // Build exact production RPC payload matching CreateServiceRequestParams
  const rpcPayload: CreateServiceRequestParams = {
    p_customer_name: cleanName,
    p_customer_phone: cleanPhone,
    p_address_line: cleanAddress,
    p_area: cleanArea,
    p_city: cleanCity,
    p_state: cleanState,
    p_pincode: cleanPincode,
    p_latitude: cleanLat,
    p_longitude: cleanLng,
    p_service_option_id: serviceOptionUuid,
    p_problem_description: submission.problemDescription?.trim() || null,
    p_problem_photos: submission.photoUrl?.trim() ? [{ url: submission.photoUrl.trim() }] : [],
    p_customer_notes: null
  };

  console.log('[create_service_request] Invoking production RPC with payload:', rpcPayload);

  try {
    const { data: createdRequestId, error: rpcError } = await supabase.rpc(
      'create_service_request',
      rpcPayload
    );

    console.log('[create_service_request] RPC response:', { data: createdRequestId, error: rpcError });

    if (rpcError || !createdRequestId) {
      console.error('[create_service_request] RPC error returned:', rpcError);
      return {
        success: false,
        request: null as any,
        supabaseError: rpcError?.message || 'Failed to submit service request. Please try again.'
      };
    }

    const finalRequestId = typeof createdRequestId === 'string' ? createdRequestId : String(createdRequestId);

    // After receiving genuine UUID, retrieve authoritative booking identity
    console.log('[get_service_request_identity] Fetching booking identity for request:', finalRequestId);
    const identityResult = await fetchServiceRequestIdentity(finalRequestId, cleanPhone);

    if (!identityResult.success || !identityResult.identity?.booking_code) {
      console.error('[get_service_request_identity] Identity lookup failed:', identityResult.error);
      return {
        success: false,
        request: null as any,
        supabaseError: identityResult.error || 'Failed to verify booking identity with database. Please try again.'
      };
    }

    const finalBookingCode = identityResult.identity.booking_code;

    // Construct standardized client request starting with backend status REQUESTED and genuine bookingCode
    const confirmedRequest: CustomerServiceRequest = {
      id: finalRequestId,
      requestId: finalRequestId,
      bookingCode: finalBookingCode,
      customerId: '',
      customerName: cleanName,
      customerPhone: cleanPhone,
      serviceOptionId: serviceOptionUuid,
      serviceOptionName: submission.serviceOptionName,
      serviceName: submission.serviceOptionName,
      categoryName: submission.categoryName || 'Home Service',
      address: cleanAddress,
      locality: cleanArea,
      problemDescription: submission.problemDescription?.trim(),
      photoUrl: submission.photoUrl?.trim(),
      estimatedMinPrice: undefined,
      estimatedMaxPrice: undefined,
      estimatedPrice: null,
      confirmedPrice: null,
      professionalName: null,
      professionalPhoto: null,
      professionalRating: null,
      professionalCompletedJobs: null,
      estimatedArrivalAt: null,
      assignedAt: null,
      paymentMethod: 'cash_on_service',
      status: 'REQUESTED',
      createdAt: now
    };

    // Store only genuine confirmed request locally for migration compatibility
    storeRequestLocally(confirmedRequest);

    return {
      success: true,
      request: confirmedRequest,
      supabaseError: null
    };
  } catch (err: any) {
    console.error('[create_service_request] Invocation exception:', err);
    return {
      success: false,
      request: null as any,
      supabaseError: err?.message || 'Unexpected network error submitting service request.'
    };
  }
}

/**
 * 2a. Fetch Service Request Identity (Authoritative Booking Identity Contract)
 * Invokes PostgreSQL RPC `get_service_request_identity` with request UUID and customer phone.
 * Verifies request ownership server-side and returns only request_id and booking_code.
 * Never exposes technician contacts, commission, or admin notes.
 */
export async function fetchServiceRequestIdentity(
  requestId: string,
  customerPhone: string
): Promise<{
  success: boolean;
  identity: ServiceRequestIdentity | null;
  error: string | null;
}> {
  if (!requestId?.trim() || !customerPhone?.trim()) {
    return {
      success: false,
      identity: null,
      error: 'Request ID and customer phone are required to retrieve booking identity.'
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      identity: null,
      error: 'Database connection is not configured.'
    };
  }

  let cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.substring(2);
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.substring(1);
  }

  const rpcParams: GetServiceRequestIdentityParams = {
    p_request_id: requestId.trim(),
    p_customer_phone: cleanPhone
  };

  console.log('[get_service_request_identity] Invoking RPC with params:', rpcParams);

  try {
    const { data, error } = await supabase.rpc('get_service_request_identity', rpcParams);

    console.log('[get_service_request_identity] RPC response:', { data, error });

    if (error) {
      console.error('[get_service_request_identity] RPC error:', error);
      return {
        success: false,
        identity: null,
        error: error.message || 'Failed to verify booking identity.'
      };
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        identity: null,
        error: 'Booking identity not found or customer phone does not match request record.'
      };
    }

    const row = data[0] as ServiceRequestIdentity;
    if (!row.booking_code) {
      return {
        success: false,
        identity: null,
        error: 'Authoritative booking code was not returned by database.'
      };
    }

    return {
      success: true,
      identity: row,
      error: null
    };
  } catch (err: any) {
    console.error('[get_service_request_identity] Invocation exception:', err);
    return {
      success: false,
      identity: null,
      error: err?.message || 'Network error verifying booking identity.'
    };
  }
}

/**
 * 2b. Fetch Customer Request Status (Production Customer Status Contract)
 * Invokes PostgreSQL RPC `get_service_request_status` with strict customer-safe parameters.
 * Does NOT expose direct technician contact info, internal commission, or admin notes.
 * Does NOT add polling or realtime in this step; prepares the typed service contract.
 */
export async function fetchCustomerRequestStatus(
  bookingCode: string,
  customerPhone: string
): Promise<{
  success: boolean;
  statusDetail: CustomerRequestStatusDetail | null;
  error: string | null;
}> {
  if (!bookingCode?.trim() || !customerPhone?.trim()) {
    return {
      success: false,
      statusDetail: null,
      error: 'Booking code and customer phone are required to check request status.'
    };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      statusDetail: null,
      error: 'Database connection is not configured.'
    };
  }

  let cleanPhone = customerPhone.replace(/[^0-9]/g, '');
  if (cleanPhone.startsWith('91') && cleanPhone.length === 12) {
    cleanPhone = cleanPhone.substring(2);
  } else if (cleanPhone.startsWith('0') && cleanPhone.length === 11) {
    cleanPhone = cleanPhone.substring(1);
  }

  if (!cleanPhone || cleanPhone.length !== 10) {
    return {
      success: false,
      statusDetail: null,
      error: 'Please provide a valid 10-digit mobile number.'
    };
  }

  const cleanBookingCode = bookingCode.trim().toUpperCase();
  if (!cleanBookingCode) {
    return {
      success: false,
      statusDetail: null,
      error: 'Please provide a valid booking code.'
    };
  }

  const rpcParams: GetServiceRequestStatusParams = {
    p_booking_code: cleanBookingCode,
    p_customer_phone: cleanPhone
  };

  try {
    const { data, error } = await supabase.rpc('get_service_request_status', rpcParams);

    if (error) {
      console.error('[get_service_request_status] RPC error:', error);
      return {
        success: false,
        statusDetail: null,
        error: error.message || 'Failed to retrieve request status.'
      };
    }

    if (!data || !Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        statusDetail: null,
        error: 'Request not found or customer phone does not match booking.'
      };
    }

    const row = data[0] as any;

    // Validate that status belongs to production RequestStatus enum
    if (!isValidRequestStatus(row.status)) {
      return {
        success: false,
        statusDetail: null,
        error: `Unexpected backend status: ${String(row.status)}`
      };
    }

    const normalizedDetail: CustomerRequestStatusDetail = {
      request_id: row.request_id,
      booking_code: row.booking_code,
      service_name: row.service_name,
      status: row.status,
      estimated_price: row.estimated_price !== null && row.estimated_price !== undefined ? Number(row.estimated_price) : null,
      confirmed_price: row.confirmed_price !== null && row.confirmed_price !== undefined ? Number(row.confirmed_price) : null,
      professional_name: row.professional_name || null,
      professional_photo: row.professional_photo || row.professional_photo_url || null,
      professional_photo_url: row.professional_photo_url || row.professional_photo || null,
      professional_rating: row.professional_rating !== null && row.professional_rating !== undefined ? Number(row.professional_rating) : null,
      professional_completed_jobs: row.professional_completed_jobs !== null && row.professional_completed_jobs !== undefined ? Number(row.professional_completed_jobs) : null,
      estimated_arrival_at: row.estimated_arrival_at || null,
      assigned_at: row.assigned_at || null,
      created_at: row.created_at || row.request_created_at || '',
      request_created_at: row.request_created_at || row.created_at || ''
    };

    return {
      success: true,
      statusDetail: normalizedDetail,
      error: null
    };
  } catch (err: any) {
    console.error('[get_service_request_status] Invocation exception:', err);
    return {
      success: false,
      statusDetail: null,
      error: err?.message || 'Network error retrieving request status.'
    };
  }
}

/**
 * Backward compatibility alias for customer request submission.
 */
export const submitCustomerServiceRequest = submitServiceRequest;

/**
 * 3. Fetch Customer Service Requests:
 * Synchronizes locally-recorded customer requests with authoritative Supabase status RPC.
 * Strictly queries status ONLY for requests owned by this customer using get_service_request_status.
 * Never executes direct SELECT on service_requests or sensitive tables.
 * Disables and replaces legacy get_my_service_requests RPC.
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

  const rawPhone = phone || localList.find((r) => r.customerPhone)?.customerPhone || '';
  let defaultCleanPhone = rawPhone.replace(/[^0-9]/g, '');
  if (defaultCleanPhone.startsWith('91') && defaultCleanPhone.length === 12) {
    defaultCleanPhone = defaultCleanPhone.substring(2);
  } else if (defaultCleanPhone.startsWith('0') && defaultCleanPhone.length === 11) {
    defaultCleanPhone = defaultCleanPhone.substring(1);
  }

  try {
    // Refresh each locally stored request that has a genuine bookingCode and phone
    const updatedList: CustomerServiceRequest[] = await Promise.all(
      localList.map(async (local) => {
        const reqPhone = local.customerPhone || defaultCleanPhone;
        if (local.bookingCode && reqPhone) {
          const statusRes = await fetchCustomerRequestStatus(local.bookingCode, reqPhone);
          if (statusRes.success && statusRes.statusDetail) {
            const detail = statusRes.statusDetail;
            return {
              ...local,
              requestId: detail.request_id || local.id,
              serviceName: detail.service_name || local.serviceOptionName,
              status: detail.status,
              estimatedPrice: detail.estimated_price,
              confirmedPrice: detail.confirmed_price,
              professionalName: detail.professional_name,
              professionalPhoto: detail.professional_photo || detail.professional_photo_url || null,
              professionalRating: detail.professional_rating,
              professionalCompletedJobs: detail.professional_completed_jobs,
              estimatedArrivalAt: detail.estimated_arrival_at,
              assignedAt: detail.assigned_at,
              createdAt: detail.created_at || (detail as any).request_created_at || local.createdAt
            };
          }
        }
        return local;
      })
    );

    // Save refreshed state in local storage cache
    updateStoredRequestsLocally(updatedList);
    return { data: updatedList, error: null };
  } catch (err: any) {
    console.warn('Exception synchronizing customer requests status (showing cached):', err?.message);
    return { data: localList, error: null };
  }
}

/**
 * 4. Refresh a single customer service request by bookingCode & phone.
 * Synchronizes with Supabase get_service_request_status, updates local storage cache,
 * and returns the authoritative request representation.
 */
export async function refreshCustomerRequest(
  bookingCode: string,
  customerPhone: string
): Promise<{
  success: boolean;
  request: CustomerServiceRequest | null;
  error: string | null;
}> {
  const statusRes = await fetchCustomerRequestStatus(bookingCode, customerPhone);
  if (!statusRes.success || !statusRes.statusDetail) {
    return {
      success: false,
      request: null,
      error: statusRes.error || 'Unable to refresh request status. Please try again.'
    };
  }

  const detail = statusRes.statusDetail;
  const localList = getStoredRequests();
  let updatedRequest: CustomerServiceRequest | null = null;

  const updatedList = localList.map((local) => {
    if (
      local.bookingCode === bookingCode ||
      local.id === detail.request_id ||
      local.requestId === detail.request_id
    ) {
      updatedRequest = {
        ...local,
        requestId: detail.request_id || local.requestId || local.id,
        bookingCode: detail.booking_code || local.bookingCode,
        serviceName: detail.service_name || local.serviceName || local.serviceOptionName,
        status: detail.status,
        estimatedPrice: detail.estimated_price,
        confirmedPrice: detail.confirmed_price,
        professionalName: detail.professional_name,
        professionalPhoto: detail.professional_photo || detail.professional_photo_url || null,
        professionalRating: detail.professional_rating,
        professionalCompletedJobs: detail.professional_completed_jobs,
        estimatedArrivalAt: detail.estimated_arrival_at,
        assignedAt: detail.assigned_at,
        createdAt: detail.created_at || (detail as any).request_created_at || local.createdAt
      };
      return updatedRequest;
    }
    return local;
  });

  if (updatedRequest) {
    updateStoredRequestsLocally(updatedList);
  } else {
    updatedRequest = {
      id: detail.request_id,
      requestId: detail.request_id,
      bookingCode: detail.booking_code,
      serviceName: detail.service_name,
      serviceOptionName: detail.service_name,
      customerPhone,
      status: detail.status,
      estimatedPrice: detail.estimated_price,
      confirmedPrice: detail.confirmed_price,
      professionalName: detail.professional_name,
      professionalPhoto: detail.professional_photo || detail.professional_photo_url || null,
      professionalRating: detail.professional_rating,
      professionalCompletedJobs: detail.professional_completed_jobs,
      estimatedArrivalAt: detail.estimated_arrival_at,
      assignedAt: detail.assigned_at,
      createdAt: detail.created_at || (detail as any).request_created_at || new Date().toISOString()
    };
    storeRequestLocally(updatedRequest);
  }

  return {
    success: true,
    request: updatedRequest,
    error: null
  };
}

export { getRequestStatusDisplay, formatEtaDisplay } from '../types';

