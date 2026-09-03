import { supabase, isSupabaseConfigured } from '../lib/supabase';
import {
  SupabaseServiceCategoryRow,
  SupabaseServiceOptionRow,
  CatalogDataSource
} from '../types/database';
import { ServiceCategory, ServiceOption } from '../types';
import { getCategoryStyle } from '../lib/iconMap';

// ============================================================================
// DEVELOPMENT FALLBACK DATA
// (Used ONLY if Supabase is unconfigured or unreachable during local dev)
// (Clearly isolated here so it can be easily removed prior to production)
// ============================================================================
import { SERVICE_CATEGORIES as DEV_CATEGORIES, SERVICE_OPTIONS as DEV_OPTIONS } from '../data/mockDatabase';

/**
 * Normalizes raw Supabase database row to the application's ServiceCategory interface.
 */
export function normalizeCategoryRow(row: SupabaseServiceCategoryRow): ServiceCategory {
  const iconKey = row.icon || row.icon_name || row.name;
  const style = getCategoryStyle(row.id || row.name, row.bg_tint, row.icon_color);

  // Compute starting price from db column
  const startingPrice = row.starting_price ?? (row.min_price ?? 0);

  return {
    id: String(row.id),
    name: row.name,
    tagline: row.tagline || row.description || `Verified ${row.name} services in Kadi`,
    iconName: iconKey || 'HelpCircle',
    startingPrice: startingPrice,
    popular: Boolean(row.is_popular ?? row.popular ?? (row.display_order <= 6)),
    bgTint: style.bgTint,
    iconColor: style.iconColor,
    bannerDescription: row.banner_description || `Trusted local ${row.name.toLowerCase()} experts in Kadi • Quick response`
  };
}

/**
 * Normalizes raw Supabase database row to the application's ServiceOption interface.
 */
export function normalizeOptionRow(row: SupabaseServiceOptionRow): ServiceOption {
  // Parse includes/excludes if stored as json or comma-separated string
  let parsedIncludes: string[] = [];
  if (Array.isArray(row.includes)) {
    parsedIncludes = row.includes;
  } else if (typeof row.includes === 'string' && row.includes.trim().length > 0) {
    try {
      const parsed = JSON.parse(row.includes);
      parsedIncludes = Array.isArray(parsed) ? parsed : [row.includes];
    } catch {
      parsedIncludes = row.includes.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  let parsedExcludes: string[] = [];
  if (Array.isArray(row.excludes)) {
    parsedExcludes = row.excludes;
  } else if (typeof row.excludes === 'string' && row.excludes.trim().length > 0) {
    try {
      const parsed = JSON.parse(row.excludes);
      parsedExcludes = Array.isArray(parsed) ? parsed : [row.excludes];
    } catch {
      parsedExcludes = row.excludes.split(',').map((s) => s.trim()).filter(Boolean);
    }
  }

  // Handle price fields: starting_price, min_price, max_price (or estimated_price_min/max)
  const startingPrice = row.starting_price ?? row.min_price ?? row.estimated_price_min ?? 0;
  const minPrice = row.min_price ?? row.estimated_price_min ?? startingPrice;
  const maxPrice = row.max_price ?? row.estimated_price_max ?? minPrice;

  return {
    id: String(row.id),
    categoryId: String(row.category_id),
    name: row.name,
    startingPrice,
    estimatedPriceMin: minPrice,
    estimatedPriceMax: maxPrice,
    isCustomQuote: Boolean(row.is_custom_quote),
    description: row.description || '',
    includes: parsedIncludes.length > 0 ? parsedIncludes : ['Standard diagnosis & labor', 'Service warranty'],
    excludes: parsedExcludes.length > 0 ? parsedExcludes : ['Cost of replacement spare parts'],
    durationEstimate: row.duration_estimate || '30-45 mins'
  };
}

/**
 * Format pricing display strictly according to requirement #12:
 * - If only starting_price exists: "From ₹X"
 * - If min_price and max_price exist and are different: "₹X – ₹Y"
 * - If min_price and max_price are the same: "₹X"
 * - Never invent a price in the UI (returns null if neither is available).
 */
export function formatPricingDisplay(option: {
  startingPrice?: number | null;
  starting_price?: number | null;
  min_price?: number | null;
  max_price?: number | null;
  estimatedPriceMin?: number | null;
  estimatedPriceMax?: number | null;
  isCustomQuote?: boolean | null;
}): string | null {
  if (option.isCustomQuote) {
    return 'Get a custom quote';
  }

  const min = option.min_price ?? option.estimatedPriceMin ?? null;
  const max = option.max_price ?? option.estimatedPriceMax ?? null;
  const start = option.starting_price ?? option.startingPrice ?? null;

  // If min_price and max_price exist and are different: "₹X – ₹Y"
  if (min !== null && max !== null && min > 0 && max > 0 && min !== max) {
    return `₹${min} – ₹${max}`;
  }

  // If min_price and max_price are the same: "₹X"
  if (min !== null && max !== null && min > 0 && min === max) {
    return `₹${min}`;
  }

  // If only min_price exists and valid
  if (min !== null && min > 0 && (max === null || max === 0)) {
    return `From ₹${min}`;
  }

  // If only starting_price exists: "From ₹X"
  if (start !== null && start > 0) {
    return `From ₹${start}`;
  }

  // If only max_price exists:
  if (max !== null && max > 0) {
    return `Up to ₹${max}`;
  }

  return null;
}

// In-memory cache to prevent unnecessary repeated requests (Requirement #19)
interface CatalogCache {
  categories: ServiceCategory[] | null;
  categoriesTimestamp: number;
  optionsByCategory: Record<string, { options: ServiceOption[]; timestamp: number }>;
  allOptions: ServiceOption[] | null;
  allOptionsTimestamp: number;
  lastDataSource: CatalogDataSource;
  lastError: string | null;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes cache TTL

const cache: CatalogCache = {
  categories: null,
  categoriesTimestamp: 0,
  optionsByCategory: {},
  allOptions: null,
  allOptionsTimestamp: 0,
  lastDataSource: 'development_fallback',
  lastError: null
};

export interface FetchResult<T> {
  data: T;
  dataSource: CatalogDataSource;
  error: string | null;
  isFallback: boolean;
}

/**
 * Fetch active service categories from:
 *   service_categories
 * where:
 *   is_active = true
 * Order by:
 *   display_order ascending
 */
export async function fetchServiceCategories(forceRefresh = false): Promise<FetchResult<ServiceCategory[]>> {
  const now = Date.now();

  // Return cached result if valid and not forcing refresh
  if (!forceRefresh && cache.categories && (now - cache.categoriesTimestamp < CACHE_TTL_MS)) {
    return {
      data: cache.categories,
      dataSource: cache.lastDataSource,
      error: null,
      isFallback: cache.lastDataSource === 'development_fallback'
    };
  }

  // If Supabase client is configured, query the real database table
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) {
        console.warn('Supabase service_categories query failed:', error.message);
        cache.lastError = 'Unable to reach service catalog database.';
        // Fall back only if Supabase returned an error
        return getFallbackCategories('Database connection failed. Showing local preview catalog.');
      }

      if (Array.isArray(data)) {
        const normalized = data.map((row) => normalizeCategoryRow(row as SupabaseServiceCategoryRow));
        cache.categories = normalized;
        cache.categoriesTimestamp = now;
        cache.lastDataSource = 'supabase';
        cache.lastError = null;

        return {
          data: normalized,
          dataSource: 'supabase',
          error: null,
          isFallback: false
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error connecting to Supabase.';
      console.warn('Supabase service_categories exception:', message);
      cache.lastError = 'Network error while contacting the catalog.';
      return getFallbackCategories('Network error. Showing local preview catalog.');
    }
  }

  // Supabase is not configured yet: return development fallback
  return getFallbackCategories(null);
}

/**
 * Fetch active service options from:
 *   service_options
 * where:
 *   is_active = true
 * Order by:
 *   display_order ascending
 *
 * Filtered by category_id when provided.
 */
export async function fetchServiceOptions(
  categoryId?: string,
  forceRefresh = false
): Promise<FetchResult<ServiceOption[]>> {
  const now = Date.now();

  // Check category-specific cache
  if (categoryId && !forceRefresh && cache.optionsByCategory[categoryId]) {
    const cachedEntry = cache.optionsByCategory[categoryId];
    if (now - cachedEntry.timestamp < CACHE_TTL_MS) {
      return {
        data: cachedEntry.options,
        dataSource: cache.lastDataSource,
        error: null,
        isFallback: cache.lastDataSource === 'development_fallback'
      };
    }
  }

  // Query Supabase
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('service_options')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (categoryId) {
        query = query.eq('category_id', categoryId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase service_options query failed:', error.message);
        return getFallbackOptions(categoryId, 'Unable to load service options from database.');
      }

      if (Array.isArray(data)) {
        const normalized = data.map((row) => normalizeOptionRow(row as SupabaseServiceOptionRow));

        if (categoryId) {
          cache.optionsByCategory[categoryId] = {
            options: normalized,
            timestamp: now
          };
        } else {
          cache.allOptions = normalized;
          cache.allOptionsTimestamp = now;
        }

        cache.lastDataSource = 'supabase';
        cache.lastError = null;

        return {
          data: normalized,
          dataSource: 'supabase',
          error: null,
          isFallback: false
        };
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Network error fetching options.';
      console.warn('Supabase service_options exception:', message);
      return getFallbackOptions(categoryId, 'Network error while loading service options.');
    }
  }

  // Supabase not configured: return development fallback
  return getFallbackOptions(categoryId, null);
}

// Development fallback helpers (clearly isolated, never silently mixed)
function getFallbackCategories(errorMessage: string | null): FetchResult<ServiceCategory[]> {
  cache.categories = [...DEV_CATEGORIES];
  cache.categoriesTimestamp = Date.now();
  cache.lastDataSource = 'development_fallback';
  cache.lastError = errorMessage;

  return {
    data: [...DEV_CATEGORIES],
    dataSource: 'development_fallback',
    error: errorMessage,
    isFallback: true
  };
}

function getFallbackOptions(categoryId?: string, errorMessage?: string | null): FetchResult<ServiceOption[]> {
  let fallbackList: ServiceOption[] = [];

  if (categoryId) {
    fallbackList = DEV_OPTIONS[categoryId] || [];
  } else {
    fallbackList = Object.values(DEV_OPTIONS).flat();
  }

  if (categoryId) {
    cache.optionsByCategory[categoryId] = {
      options: fallbackList,
      timestamp: Date.now()
    };
  }

  return {
    data: fallbackList,
    dataSource: 'development_fallback',
    error: errorMessage || null,
    isFallback: true
  };
}

/**
 * Clear the cache and force fresh queries.
 */
export function clearCatalogCache(): void {
  cache.categories = null;
  cache.categoriesTimestamp = 0;
  cache.optionsByCategory = {};
  cache.allOptions = null;
  cache.allOptionsTimestamp = 0;
}

/**
 * Quick synchronous getter for initial render to prevent layout shifts.
 */
export function getInitialCategoriesSync(): ServiceCategory[] {
  if (cache.categories && cache.categories.length > 0) {
    return cache.categories;
  }
  return [...DEV_CATEGORIES];
}
