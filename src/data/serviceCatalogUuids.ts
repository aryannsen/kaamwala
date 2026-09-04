/**
 * Authoritative UUID mappings for Service Categories and Service Options.
 * Preserves Supabase schema integrity where service_options.id and
 * service_requests.service_option_id are UUIDs.
 */

export interface CategoryUuidMapping {
  slug: string;
  uuid: string;
  name: string;
  displayOrder: number;
}

export interface OptionUuidMapping {
  slug: string;
  uuid: string;
  categorySlug: string;
  categoryUuid: string;
  name: string;
  startingPrice: number;
  minPrice: number;
  maxPrice: number;
  displayOrder: number;
}

export const CATEGORY_UUID_MAPPINGS: CategoryUuidMapping[] = [
  { slug: 'plumbing', uuid: 'c1000000-0000-4000-8000-000000000001', name: 'Plumbing', displayOrder: 1 },
  { slug: 'electrical', uuid: 'c1000000-0000-4000-8000-000000000002', name: 'Electrical', displayOrder: 2 },
  { slug: 'carpentry', uuid: 'c1000000-0000-4000-8000-000000000003', name: 'Carpentry', displayOrder: 3 },
  { slug: 'painting', uuid: 'c1000000-0000-4000-8000-000000000004', name: 'Painting', displayOrder: 4 },
  { slug: 'ac_repair', uuid: 'c1000000-0000-4000-8000-000000000005', name: 'AC Repair', displayOrder: 5 },
  { slug: 'cleaning', uuid: 'c1000000-0000-4000-8000-000000000006', name: 'Cleaning', displayOrder: 6 },
  { slug: 'ro_water', uuid: 'c1000000-0000-4000-8000-000000000007', name: 'RO / Water Purifier', displayOrder: 7 },
  { slug: 'appliance_repair', uuid: 'c1000000-0000-4000-8000-000000000008', name: 'Appliance Repair', displayOrder: 8 },
  { slug: 'mason_labour', uuid: 'c1000000-0000-4000-8000-000000000009', name: 'Mason / Labour', displayOrder: 9 },
  { slug: 'other_services', uuid: 'c1000000-0000-4000-8000-000000000010', name: 'Other Services', displayOrder: 10 }
];

export const OPTION_UUID_MAPPINGS: OptionUuidMapping[] = [
  { slug: 'tap-install', uuid: 'e1000000-0000-4000-8000-000000000001', categorySlug: 'plumbing', categoryUuid: 'c1000000-0000-4000-8000-000000000001', name: 'Tap Installation', startingPrice: 199, minPrice: 199, maxPrice: 349, displayOrder: 1 },
  { slug: 'tap-repair', uuid: 'e1000000-0000-4000-8000-000000000002', categorySlug: 'plumbing', categoryUuid: 'c1000000-0000-4000-8000-000000000001', name: 'Tap Repair / Leakage', startingPrice: 299, minPrice: 299, maxPrice: 599, displayOrder: 2 },
  { slug: 'pipe-leakage', uuid: 'e1000000-0000-4000-8000-000000000003', categorySlug: 'plumbing', categoryUuid: 'c1000000-0000-4000-8000-000000000001', name: 'Pipe Leakage', startingPrice: 399, minPrice: 399, maxPrice: 799, displayOrder: 3 },
  { slug: 'bathroom-fitting', uuid: 'e1000000-0000-4000-8000-000000000004', categorySlug: 'plumbing', categoryUuid: 'c1000000-0000-4000-8000-000000000001', name: 'Bathroom Fitting', startingPrice: 499, minPrice: 499, maxPrice: 999, displayOrder: 4 },
  { slug: 'geyser-installation', uuid: 'e1000000-0000-4000-8000-000000000005', categorySlug: 'plumbing', categoryUuid: 'c1000000-0000-4000-8000-000000000001', name: 'Geyser Installation', startingPrice: 599, minPrice: 599, maxPrice: 899, displayOrder: 5 },
  { slug: 'other-plumbing', uuid: 'e1000000-0000-4000-8000-000000000006', categorySlug: 'plumbing', categoryUuid: 'c1000000-0000-4000-8000-000000000001', name: 'Other Plumbing Work', startingPrice: 199, minPrice: 199, maxPrice: 1200, displayOrder: 6 },
  { slug: 'switch-socket', uuid: 'e1000000-0000-4000-8000-000000000007', categorySlug: 'electrical', categoryUuid: 'c1000000-0000-4000-8000-000000000002', name: 'Switch & Socket Repair', startingPrice: 149, minPrice: 149, maxPrice: 299, displayOrder: 7 },
  { slug: 'fan-repair', uuid: 'e1000000-0000-4000-8000-000000000008', categorySlug: 'electrical', categoryUuid: 'c1000000-0000-4000-8000-000000000002', name: 'Fan Repair / Installation', startingPrice: 199, minPrice: 199, maxPrice: 399, displayOrder: 8 },
  { slug: 'mcb-fuse', uuid: 'e1000000-0000-4000-8000-000000000009', categorySlug: 'electrical', categoryUuid: 'c1000000-0000-4000-8000-000000000002', name: 'MCB & Fuse Tripping Fix', startingPrice: 249, minPrice: 249, maxPrice: 549, displayOrder: 9 },
  { slug: 'house-wiring', uuid: 'e1000000-0000-4000-8000-000000000010', categorySlug: 'electrical', categoryUuid: 'c1000000-0000-4000-8000-000000000002', name: 'House Wiring Inspection', startingPrice: 399, minPrice: 399, maxPrice: 899, displayOrder: 10 },
  { slug: 'door-lock', uuid: 'e1000000-0000-4000-8000-000000000011', categorySlug: 'carpentry', categoryUuid: 'c1000000-0000-4000-8000-000000000003', name: 'Door Lock Repair / Change', startingPrice: 249, minPrice: 249, maxPrice: 499, displayOrder: 11 },
  { slug: 'furniture-assembly', uuid: 'e1000000-0000-4000-8000-000000000012', categorySlug: 'carpentry', categoryUuid: 'c1000000-0000-4000-8000-000000000003', name: 'Furniture Assembly', startingPrice: 399, minPrice: 399, maxPrice: 899, displayOrder: 12 },
  { slug: 'hinge-repair', uuid: 'e1000000-0000-4000-8000-000000000013', categorySlug: 'carpentry', categoryUuid: 'c1000000-0000-4000-8000-000000000003', name: 'Cupboard Hinge & Channel Repair', startingPrice: 199, minPrice: 199, maxPrice: 399, displayOrder: 13 },
  { slug: 'room-touchup', uuid: 'e1000000-0000-4000-8000-000000000014', categorySlug: 'painting', categoryUuid: 'c1000000-0000-4000-8000-000000000004', name: 'Single Room Touch-up', startingPrice: 499, minPrice: 499, maxPrice: 999, displayOrder: 14 },
  { slug: 'waterproofing', uuid: 'e1000000-0000-4000-8000-000000000015', categorySlug: 'painting', categoryUuid: 'c1000000-0000-4000-8000-000000000004', name: 'Waterproofing & Seepage Check', startingPrice: 699, minPrice: 699, maxPrice: 1499, displayOrder: 15 },
  { slug: 'ac-service', uuid: 'e1000000-0000-4000-8000-000000000016', categorySlug: 'ac_repair', categoryUuid: 'c1000000-0000-4000-8000-000000000005', name: 'AC General Jet Pump Service', startingPrice: 299, minPrice: 299, maxPrice: 599, displayOrder: 16 },
  { slug: 'ac-gas-refill', uuid: 'e1000000-0000-4000-8000-000000000017', categorySlug: 'ac_repair', categoryUuid: 'c1000000-0000-4000-8000-000000000005', name: 'AC Gas Refill / Leak Fix', startingPrice: 1299, minPrice: 1299, maxPrice: 2499, displayOrder: 17 },
  { slug: 'bathroom-clean', uuid: 'e1000000-0000-4000-8000-000000000018', categorySlug: 'cleaning', categoryUuid: 'c1000000-0000-4000-8000-000000000006', name: 'Deep Bathroom Cleaning', startingPrice: 149, minPrice: 149, maxPrice: 349, displayOrder: 18 },
  { slug: 'kitchen-clean', uuid: 'e1000000-0000-4000-8000-000000000019', categorySlug: 'cleaning', categoryUuid: 'c1000000-0000-4000-8000-000000000006', name: 'Kitchen Degreasing & Clean', startingPrice: 499, minPrice: 499, maxPrice: 899, displayOrder: 19 },
  { slug: 'ro-filters', uuid: 'e1000000-0000-4000-8000-000000000020', categorySlug: 'ro_water', categoryUuid: 'c1000000-0000-4000-8000-000000000007', name: 'Filter Cartridge Replacement', startingPrice: 199, minPrice: 199, maxPrice: 499, displayOrder: 20 },
  { slug: 'ro-complete-service', uuid: 'e1000000-0000-4000-8000-000000000021', categorySlug: 'ro_water', categoryUuid: 'c1000000-0000-4000-8000-000000000007', name: 'Complete RO Purifier Service', startingPrice: 399, minPrice: 399, maxPrice: 799, displayOrder: 21 },
  { slug: 'washing-machine', uuid: 'e1000000-0000-4000-8000-000000000022', categorySlug: 'appliance_repair', categoryUuid: 'c1000000-0000-4000-8000-000000000008', name: 'Washing Machine Inspection', startingPrice: 199, minPrice: 199, maxPrice: 499, displayOrder: 22 },
  { slug: 'tile-repair', uuid: 'e1000000-0000-4000-8000-000000000023', categorySlug: 'mason_labour', categoryUuid: 'c1000000-0000-4000-8000-000000000009', name: 'Tile Fixing & Grout Repair', startingPrice: 349, minPrice: 349, maxPrice: 699, displayOrder: 23 },
  { slug: 'general-handyman', uuid: 'e1000000-0000-4000-8000-000000000024', categorySlug: 'other_services', categoryUuid: 'c1000000-0000-4000-8000-000000000010', name: 'General Handyman Visit', startingPrice: 199, minPrice: 199, maxPrice: 499, displayOrder: 24 }
];

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const OPTION_SLUG_MAP = new Map<string, string>();
const OPTION_UUID_MAP = new Map<string, string>();
OPTION_UUID_MAPPINGS.forEach((opt) => {
  OPTION_SLUG_MAP.set(opt.slug, opt.uuid);
  OPTION_UUID_MAP.set(opt.uuid, opt.slug);
});

const CATEGORY_SLUG_MAP = new Map<string, string>();
const CATEGORY_UUID_MAP = new Map<string, string>();
CATEGORY_UUID_MAPPINGS.forEach((cat) => {
  CATEGORY_SLUG_MAP.set(cat.slug, cat.uuid);
  CATEGORY_UUID_MAP.set(cat.uuid, cat.slug);
});

/**
 * Resolves any service option identifier (slug or UUID) to its authoritative database UUID.
 */
export function resolveServiceOptionUuid(idOrSlug: string): string {
  if (!idOrSlug) return '';
  const trimmed = idOrSlug.trim();
  if (UUID_REGEX.test(trimmed)) {
    return trimmed;
  }
  return OPTION_SLUG_MAP.get(trimmed) || trimmed;
}

/**
 * Resolves any service category identifier (slug or UUID) to its authoritative database UUID.
 */
export function resolveServiceCategoryUuid(idOrSlug: string): string {
  if (!idOrSlug) return '';
  const trimmed = idOrSlug.trim();
  if (UUID_REGEX.test(trimmed)) {
    return trimmed;
  }
  return CATEGORY_SLUG_MAP.get(trimmed) || trimmed;
}

/**
 * Checks if a string is a valid UUID format.
 */
export function isValidUuid(id: string): boolean {
  return Boolean(id && UUID_REGEX.test(id.trim()));
}

/**
 * Dynamic UUID registry for service categories and options.
 * Allows live Supabase catalog queries to register real database UUIDs
 * so the application is ready for dynamic Supabase IDs without hardcoded seed dependencies.
 */
export function registerDynamicCategoryUuid(slugOrName: string, uuid: string): void {
  if (slugOrName && uuid && isValidUuid(uuid)) {
    CATEGORY_SLUG_MAP.set(slugOrName.toLowerCase().trim(), uuid.trim());
    CATEGORY_UUID_MAP.set(uuid.trim(), slugOrName.toLowerCase().trim());
  }
}

export function registerDynamicOptionUuid(slugOrName: string, uuid: string): void {
  if (slugOrName && uuid && isValidUuid(uuid)) {
    OPTION_SLUG_MAP.set(slugOrName.toLowerCase().trim(), uuid.trim());
    OPTION_UUID_MAP.set(uuid.trim(), slugOrName.toLowerCase().trim());
  }
}
