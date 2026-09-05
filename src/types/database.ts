/**
 * KaamWala Production Supabase Database Types & RPC Contracts
 * Authoritative schema matching the production PostgreSQL backend:
 *
 * Production Tables:
 * - service_categories
 * - service_options
 * - professionals
 * - professional_contacts
 * - professional_services
 * - professional_service_areas
 * - customers
 * - customer_addresses
 * - service_requests
 * - request_assignments
 * - request_status_history
 * - reviews
 *
 * Production Enums:
 * - request_status
 * - pricing_type
 *
 * Production Customer RPCs:
 * - create_service_request
 * - get_service_request_status
 * - create_service_review
 */

// ============================================================================
// 1. PRODUCTION ENUMS
// ============================================================================

export type RequestStatus =
  | 'REQUESTED'
  | 'REVIEWING'
  | 'PROFESSIONAL_CONFIRMED'
  | 'ASSIGNED'
  | 'CUSTOMER_CONTACTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'WORK_STARTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UNFULFILLED';

export type ProductionRequestStatus = RequestStatus;

export type PricingType =
  | 'FIXED'
  | 'STARTING_FROM'
  | 'INSPECTION'
  | 'RANGE';

export type ProductionPricingType = PricingType;

// ============================================================================
// 2. PRODUCTION TABLE SCHEMAS
// ============================================================================

export interface ServiceCategory {
  id: string;
  name: string;
  description?: string | null;
  tagline?: string | null;
  icon?: string | null;
  icon_name?: string | null;
  starting_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  display_order: number;
  is_active: boolean;
  popular?: boolean | null;
  is_popular?: boolean | null;
  bg_tint?: string | null;
  icon_color?: string | null;
  banner_description?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ServiceOption {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  pricing_type?: PricingType | null;
  starting_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  duration_estimate?: string | null;
  includes?: string[] | string | null;
  excludes?: string[] | string | null;
  is_custom_quote?: boolean | null;
  display_order: number;
  is_active: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface Professional {
  id: string;
  name: string;
  photo_url?: string | null;
  rating?: number | null;
  completed_jobs?: number | null;
  is_active?: boolean;
  is_verified?: boolean;
  bio?: string | null;
  experience_years?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ProfessionalContact {
  id: string;
  professional_id: string;
  phone: string;
  whatsapp?: string | null;
  email?: string | null;
  is_primary: boolean;
  created_at?: string | null;
}

export interface ProfessionalService {
  id: string;
  professional_id: string;
  service_option_id: string;
  is_active: boolean;
  created_at?: string | null;
}

export interface ProfessionalServiceArea {
  id: string;
  professional_id: string;
  area: string;
  taluka?: string | null;
  district?: string | null;
  pincode?: string | null;
  is_active?: boolean;
  created_at?: string | null;
}

export interface Customer {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface CustomerAddress {
  id: string;
  customer_id: string;
  label?: string | null;
  address_line: string;
  address?: string; // compatibility mapping
  area?: string | null;
  locality?: string | null; // compatibility mapping
  city: string;
  state: string;
  pincode: string;
  latitude: number;
  longitude: number;
  is_default?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface ServiceRequest {
  id: string;
  booking_code: string;
  customer_id: string;
  address_id: string;
  service_option_id: string;
  problem_description: string | null;
  problem_photos: string[] | Array<{ url: string; [key: string]: any }> | null;
  pricing_type: PricingType;
  estimated_price: number | null;
  confirmed_price: number | null;
  status: RequestStatus;
  customer_notes: string | null;
  admin_notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface RequestAssignment {
  id: string;
  request_id: string;
  professional_id: string;
  status: string;
  assigned_at: string;
  estimated_arrival_at?: string | null;
  completed_at?: string | null;
  notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface RequestStatusHistory {
  id: string;
  request_id: string;
  status: RequestStatus;
  changed_by?: string | null;
  notes?: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  request_id: string;
  customer_id?: string | null;
  professional_id?: string | null;
  rating: number;
  comment?: string | null;
  review_text?: string | null;
  review_tags?: string[] | null;
  created_at: string;
  updated_at?: string;
}

// ============================================================================
// 3. PRODUCTION RPC CONTRACT TYPES
// ============================================================================

/**
 * Input contract for RPC: create_service_request
 */
export interface CreateServiceRequestParams {
  p_customer_name: string;
  p_customer_phone: string;
  p_address_line: string;
  p_area: string;
  p_city: string;
  p_state: string;
  p_pincode: string;
  p_latitude: number | null;
  p_longitude: number | null;
  p_service_option_id: string;
  p_problem_description?: string | null;
  p_problem_photos?: Array<{ url: string; [key: string]: any }> | string[] | null;
  p_customer_notes?: string | null;
}

/**
 * Input contract for RPC: get_service_request_identity
 */
export interface GetServiceRequestIdentityParams {
  p_request_id: string;
  p_customer_phone: string;
}

/**
 * Controlled output contract for RPC: get_service_request_identity
 * Strictly limits identity to request primary key and business booking code.
 */
export interface ServiceRequestIdentity {
  request_id: string;
  booking_code: string;
}

/**
 * Input contract for RPC: get_service_request_status
 */
export interface GetServiceRequestStatusParams {
  p_booking_code: string;
  p_customer_phone: string;
}

export const VALID_REQUEST_STATUSES: readonly RequestStatus[] = [
  'REQUESTED',
  'REVIEWING',
  'PROFESSIONAL_CONFIRMED',
  'ASSIGNED',
  'CUSTOMER_CONTACTED',
  'ON_THE_WAY',
  'ARRIVED',
  'WORK_STARTED',
  'COMPLETED',
  'CANCELLED',
  'UNFULFILLED'
];

export function isValidRequestStatus(status: unknown): status is RequestStatus {
  return typeof status === 'string' && VALID_REQUEST_STATUSES.includes(status as RequestStatus);
}

export interface RequestStatusDisplayConfig {
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  dotColor: string;
  description: string;
}

export const REQUEST_STATUS_CONFIG: Record<RequestStatus, RequestStatusDisplayConfig> = {
  REQUESTED: {
    label: 'Request Received',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'Your service request has been logged and received.'
  },
  REVIEWING: {
    label: 'Under Review',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-200',
    dotColor: 'bg-blue-500',
    description: 'Operations team is reviewing your service requirements.'
  },
  PROFESSIONAL_CONFIRMED: {
    label: 'Professional Confirmed',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-800',
    badgeBorder: 'border-indigo-200',
    dotColor: 'bg-indigo-500',
    description: 'A professional has accepted your service.'
  },
  ASSIGNED: {
    label: 'Professional Assigned',
    badgeBg: 'bg-sky-50',
    badgeText: 'text-sky-800',
    badgeBorder: 'border-sky-200',
    dotColor: 'bg-sky-500',
    description: 'Professional is allocated to your request.'
  },
  CUSTOMER_CONTACTED: {
    label: 'Customer Contacted',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-200',
    dotColor: 'bg-purple-500',
    description: 'Our team or professional has reached out to you.'
  },
  ON_THE_WAY: {
    label: 'On The Way',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-800',
    badgeBorder: 'border-teal-200',
    dotColor: 'bg-teal-500',
    description: 'Professional is traveling to your service address.'
  },
  ARRIVED: {
    label: 'Arrived at Location',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    description: 'Professional has arrived at your doorstep.'
  },
  WORK_STARTED: {
    label: 'Work in Progress',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'Service work is currently in progress.'
  },
  COMPLETED: {
    label: 'Completed',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-200',
    dotColor: 'bg-emerald-500',
    description: 'Service job has been completed.'
  },
  CANCELLED: {
    label: 'Cancelled',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-800',
    badgeBorder: 'border-rose-200',
    dotColor: 'bg-rose-500',
    description: 'This request was cancelled.'
  },
  UNFULFILLED: {
    label: 'Unfulfilled',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    badgeBorder: 'border-gray-200',
    dotColor: 'bg-gray-400',
    description: 'Unable to fulfill service at this time.'
  }
};

export function getRequestStatusDisplay(status: unknown): RequestStatusDisplayConfig {
  if (isValidRequestStatus(status)) {
    return REQUEST_STATUS_CONFIG[status];
  }
  return {
    label: 'Status Unknown',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    badgeBorder: 'border-gray-200',
    dotColor: 'bg-gray-400',
    description: 'Unable to read the current request status.'
  };
}

export function formatEtaDisplay(isoString: string | null | undefined): string | null {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return null;
  }
}

/**
 * Controlled customer-facing response returned by get_service_request_status.
 * Strictly limits information to customer-safe fields.
 * Does NOT expose direct technician contact info, internal commission, or admin notes.
 */
export interface CustomerRequestStatusDetail {
  request_id: string;
  booking_code: string;
  service_name: string;
  status: RequestStatus;
  estimated_price: number | null;
  confirmed_price: number | null;
  professional_name: string | null;
  professional_photo: string | null;
  professional_photo_url?: string | null;
  professional_rating: number | null;
  professional_completed_jobs: number | null;
  estimated_arrival_at: string | null;
  assigned_at: string | null;
  created_at: string;
  request_created_at?: string;
}

/**
 * Input contract for RPC: create_service_review
 */
export interface CreateServiceReviewParams {
  p_request_id: string;
  p_customer_phone: string;
  p_rating: number;
  p_comment?: string | null;
  p_review_text?: string | null;
  p_review_tags?: string[] | null;
}

// ============================================================================
// 4. BACKWARD-COMPATIBILITY ALIASES (Preserves Existing Service Code)
// ============================================================================

export type SupabaseServiceCategoryRow = ServiceCategory;
export type SupabaseServiceOptionRow = ServiceOption;
export type SupabaseCustomerRow = Customer;

export interface SupabaseCustomerAddressRow {
  id?: string;
  customer_id?: string;
  label?: string;
  address: string;
  address_line?: string;
  locality?: string | null;
  area?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude: number;
  longitude: number;
  is_default?: boolean;
  created_at?: string;
}

export interface SupabaseServiceRequestRow {
  id?: string;
  customer_id: string;
  service_option_id: string;
  address_id: string;
  problem_description?: string | null;
  photo_url?: string | null;
  estimated_min_price?: number | null;
  estimated_max_price?: number | null;
  payment_method?: string;
  status: string;
  booking_code?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseRequestStatusHistoryRow {
  id?: string;
  request_id: string;
  status: string;
  created_at?: string;
}

export type CatalogDataSource = 'supabase' | 'development_fallback';

export interface CatalogState<T> {
  data: T;
  isLoading: boolean;
  error: string | null;
  dataSource: CatalogDataSource;
}
