/**
 * Database entities matching Supabase tables:
 * - service_categories
 * - service_options
 *
 * Relationship: service_categories.id -> service_options.category_id
 */

export interface SupabaseServiceCategoryRow {
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
}

export interface SupabaseServiceOptionRow {
  id: string;
  category_id: string;
  name: string;
  description?: string | null;
  starting_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  estimated_price_min?: number | null;
  estimated_price_max?: number | null;
  duration_estimate?: string | null;
  includes?: string[] | string | null;
  excludes?: string[] | string | null;
  is_custom_quote?: boolean | null;
  display_order: number;
  is_active: boolean;
  created_at?: string | null;
}

export interface SupabaseCustomerAddressRow {
  id?: string;
  customer_id?: string;
  label?: string;
  address: string;
  locality?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  latitude: number;
  longitude: number;
  is_default?: boolean;
  created_at?: string;
}

export interface SupabaseCustomerRow {
  id: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
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
