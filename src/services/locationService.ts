/**
 * Location Service for KaamWala
 * Manages customer location state, geocoding resolution, and Supabase customer_addresses storage.
 * Respects strict zero-mock policy: no fake locations, no hardcoded coordinates.
 */

import { CustomerLocation, LocationSource } from '../types';
import { SupabaseCustomerAddressRow } from '../types/database';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

const LOCATION_STORAGE_KEY = 'kaamwala_customer_location_v2';
const CUSTOMER_ID_KEY = 'kaamwala_customer_uuid_v1';

// In-memory fallback for sandboxed iframes where localStorage might be blocked
const memoryStore: Record<string, string> = {};

function safeGet(key: string): string | null {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
  } catch {}
  return memoryStore[key] ?? null;
}

function safeSet(key: string, value: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
      return;
    }
  } catch {}
  memoryStore[key] = value;
}

function safeRemove(key: string): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
      return;
    }
  } catch {}
  delete memoryStore[key];
}

/**
 * Get or create a persistent client-side customer UUID
 */
export function getOrCreateCustomerId(): string {
  let id = safeGet(CUSTOMER_ID_KEY);
  if (!id) {
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
      id = crypto.randomUUID();
    } else {
      id = 'cust-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now();
    }
    safeSet(CUSTOMER_ID_KEY, id);
  }
  return id;
}

/**
 * Retrieve the active confirmed customer location.
 * Returns null if the customer has not selected/confirmed a location yet.
 */
export function getSavedCustomerLocation(): CustomerLocation | null {
  try {
    const raw = safeGet(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.latitude === 'number' &&
      typeof parsed.longitude === 'number' &&
      typeof parsed.formattedAddress === 'string'
    ) {
      return parsed as CustomerLocation;
    }
  } catch (err) {
    console.warn('Failed to parse stored location', err);
  }
  return null;
}

/**
 * Persist confirmed location locally
 */
export function saveCustomerLocationLocally(loc: CustomerLocation): void {
  try {
    safeSet(LOCATION_STORAGE_KEY, JSON.stringify(loc));
  } catch (err) {
    console.warn('Failed to save location locally', err);
  }
}

/**
 * Clear stored location
 */
export function clearCustomerLocation(): void {
  safeRemove(LOCATION_STORAGE_KEY);
}

/**
 * Parse Google Maps Geocoder or Places address components into structured fields
 */
export function extractAddressComponents(
  components: Array<{
    long_name?: string;
    short_name?: string;
    types?: string[];
    longText?: string;
    shortText?: string;
  }> = []
): {
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
} {
  let locality: string | undefined;
  let city: string | undefined;
  let state: string | undefined;
  let pincode: string | undefined;

  for (const c of components) {
    const types = c.types || [];
    const text = c.long_name || c.longText || c.short_name || c.shortText || '';
    if (!text) continue;

    if (types.includes('sublocality_level_1') || types.includes('sublocality') || types.includes('neighborhood')) {
      if (!locality) locality = text;
    } else if (types.includes('locality')) {
      city = text;
      if (!locality) locality = text;
    } else if (types.includes('administrative_area_level_2')) {
      if (!city) city = text;
    } else if (types.includes('administrative_area_level_1')) {
      state = text;
    } else if (types.includes('postal_code')) {
      pincode = text;
    }
  }

  return { locality, city, state, pincode };
}

/**
 * Reverse geocode latitude and longitude using Google Maps JS Geocoder
 */
export async function reverseGeocodeCoordinates(
  lat: number,
  lng: number,
  geocoderInstance?: google.maps.Geocoder
): Promise<{
  formattedAddress: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
}> {
  // Ensure geocoder is instantiated
  let geocoder = geocoderInstance;
  if (!geocoder) {
    if (typeof google !== 'undefined' && google.maps && google.maps.Geocoder) {
      geocoder = new google.maps.Geocoder();
    } else {
      throw new Error('Google Maps Geocoder is not loaded yet.');
    }
  }

  return new Promise((resolve, reject) => {
    geocoder!.geocode(
      { location: { lat, lng } },
      (results, status) => {
        if (status === google.maps.GeocoderStatus.OK && results && results.length > 0) {
          const first = results[0];
          const parsed = extractAddressComponents(first.address_components as any);

          resolve({
            formattedAddress: first.formatted_address || `${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            locality: parsed.locality,
            city: parsed.city,
            state: parsed.state,
            pincode: parsed.pincode
          });
        } else {
          reject(new Error(`Geocoder failed with status: ${status}`));
        }
      }
    );
  });
}

/**
 * Save confirmed customer location to Supabase customer_addresses table.
 * Adheres strictly to the existing database schema without modifying it.
 */
export async function saveAddressToSupabase(
  location: CustomerLocation,
  options: {
    customerId?: string;
    label?: string;
    isDefault?: boolean;
  } = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
  // Always save locally first so user flow is never disrupted
  saveCustomerLocationLocally(location);

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: true,
      error: 'Supabase not configured; stored locally.'
    };
  }

  try {
    const customerId = options.customerId || getOrCreateCustomerId();
    const label = options.label || location.label || 'Home';

    // Prepare payload matching customer_addresses columns
    const payload: SupabaseCustomerAddressRow = {
      customer_id: customerId,
      label,
      address: location.formattedAddress,
      locality: location.locality || null,
      city: location.city || null,
      state: location.state || null,
      pincode: location.pincode || null,
      latitude: location.latitude,
      longitude: location.longitude,
      is_default: options.isDefault ?? true
    };

    const { data, error } = await supabase
      .from('customer_addresses')
      .insert(payload)
      .select();

    if (error) {
      console.warn('Supabase customer_addresses insert notice (stored locally):', error.message);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      data
    };
  } catch (err: any) {
    console.warn('Network error saving to customer_addresses:', err?.message);
    return {
      success: false,
      error: err?.message || 'Network error'
    };
  }
}

export const persistCustomerLocationToSupabase = saveAddressToSupabase;

