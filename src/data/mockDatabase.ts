import { resolveServiceCategoryUuid, resolveServiceOptionUuid } from './serviceCatalogUuids';
import { ServiceCategory, ServiceOption, Professional, LocationArea, CustomerProfile } from '../types';

export const KADI_LOCALITIES: LocationArea[] = [
  { id: 'loc-1', name: 'Fuwara Chowk', taluka: 'Kadi', district: 'Mehsana', pincode: '382715', isPopular: true },
  { id: 'loc-2', name: 'Station Road', taluka: 'Kadi', district: 'Mehsana', pincode: '382715', isPopular: true },
  { id: 'loc-3', name: 'Swastik Society', taluka: 'Kadi', district: 'Mehsana', pincode: '382715', isPopular: true },
  { id: 'loc-4', name: 'Detroj Road', taluka: 'Kadi', district: 'Mehsana', pincode: '382715', isPopular: true },
  { id: 'loc-5', name: 'Nani Kadi', taluka: 'Kadi', district: 'Mehsana', pincode: '382715', isPopular: true },
  { id: 'loc-6', name: 'Suvidha Township', taluka: 'Kadi', district: 'Mehsana', pincode: '382715', isPopular: false },
  { id: 'loc-7', name: 'Hariom Nagar', taluka: 'Kadi', district: 'Mehsana', pincode: '382715', isPopular: false },
  { id: 'loc-8', name: 'GIDC Phase 1 & 2', taluka: 'Kadi', district: 'Mehsana', pincode: '382715', isPopular: true },
  { id: 'loc-9', name: 'Kundal Road', taluka: 'Kadi', district: 'Mehsana', pincode: '382715', isPopular: false },
  { id: 'loc-10', name: 'Chhatral Highway Cross', taluka: 'Kadi', district: 'Mehsana', pincode: '382729', isPopular: false }
];

export const SERVICE_CATEGORIES: ServiceCategory[] = [
  {
    id: resolveServiceCategoryUuid('plumbing'),
    name: 'Plumbing',
    tagline: 'Tap, pipe leakage, bathroom fitting & repairs',
    iconName: 'Wrench',
    startingPrice: 199,
    popular: true,
    bgTint: '#EFF6FF',
    iconColor: '#2563EB',
    bannerDescription: 'Trusted plumbers near you • Quick response • On-time service'
  },
  {
    id: resolveServiceCategoryUuid('electrical'),
    name: 'Electrical',
    tagline: 'Switchboard, fan, lights, wiring & MCB',
    iconName: 'Zap',
    startingPrice: 149,
    popular: true,
    bgTint: '#FEF9C3',
    iconColor: '#CA8A04',
    bannerDescription: 'Certified local electricians • Safety verified • Quick diagnosis'
  },
  {
    id: resolveServiceCategoryUuid('carpentry'),
    name: 'Carpentry',
    tagline: 'Door locks, furniture repair & woodwork',
    iconName: 'Hammer',
    startingPrice: 249,
    popular: true,
    bgTint: '#FFEDD5',
    iconColor: '#EA580C',
    bannerDescription: 'Skilled furniture & door specialists • Neat and clean craftsmanship'
  },
  {
    id: resolveServiceCategoryUuid('painting'),
    name: 'Painting',
    tagline: 'Touch-up, full room & waterproofing',
    iconName: 'Paintbrush',
    startingPrice: 499,
    popular: true,
    bgTint: '#FEF3C7',
    iconColor: '#D97706',
    bannerDescription: 'Premium paint finish • Zero mess clean-up • Weatherproof coats'
  },
  {
    id: resolveServiceCategoryUuid('ac_repair'),
    name: 'AC Repair',
    tagline: 'Service, gas refill & cooling fixes',
    iconName: 'Wind',
    startingPrice: 299,
    popular: true,
    bgTint: '#E0F2FE',
    iconColor: '#0284C7',
    bannerDescription: 'Expert AC cooling technicians • Split & Window units'
  },
  {
    id: resolveServiceCategoryUuid('cleaning'),
    name: 'Cleaning',
    tagline: 'Deep bathroom, kitchen & sofa wash',
    iconName: 'Sparkles',
    startingPrice: 149,
    popular: true,
    bgTint: '#F3E8FF',
    iconColor: '#9333EA',
    bannerDescription: 'Eco-friendly cleaning agents • Professional scrubbing tools'
  },
  {
    id: resolveServiceCategoryUuid('ro_water'),
    name: 'RO / Water Purifier',
    tagline: 'Filter change, membrane & service',
    iconName: 'Droplets',
    startingPrice: 199,
    popular: false,
    bgTint: '#ECFEFF',
    iconColor: '#0891B2',
    bannerDescription: 'Pure water guarantee • Genuine TDS-tested filters & membranes'
  },
  {
    id: resolveServiceCategoryUuid('appliance_repair'),
    name: 'Appliance Repair',
    tagline: 'Washing machine, fridge & microwave',
    iconName: 'Tv',
    startingPrice: 199,
    popular: false,
    bgTint: '#F1F5F9',
    iconColor: '#475569',
    bannerDescription: 'Authorized brand spares inspection • Transparent pricing'
  },
  {
    id: resolveServiceCategoryUuid('mason_labour'),
    name: 'Mason / Labour',
    tagline: 'Tile work, plaster & domestic helper',
    iconName: 'HardHat',
    startingPrice: 349,
    popular: false,
    bgTint: '#FEF2F2',
    iconColor: '#DC2626',
    bannerDescription: 'Sturdy brickwork, tile fixing & heavy household moving support'
  },
  {
    id: resolveServiceCategoryUuid('other_services'),
    name: 'Other Services',
    tagline: 'Custom home jobs & general handyman',
    iconName: 'HelpCircle',
    startingPrice: 199,
    popular: false,
    bgTint: '#F4F4F5',
    iconColor: '#52525B',
    bannerDescription: 'Tell us your requirement and our Kadi operations desk will match you'
  }
];

export const SERVICE_OPTIONS: Record<string, ServiceOption[]> = {
  plumbing: [
    {
      id: resolveServiceOptionUuid('tap-install'),
      categoryId: resolveServiceCategoryUuid('plumbing'),
      name: 'Tap Installation',
      startingPrice: 199,
      estimatedPriceMin: 199,
      estimatedPriceMax: 349,
      durationEstimate: '20-30 mins',
      description: 'Standard installation of basin, sink, or wall mixer taps with PTFE tape sealing.',
      includes: ['Removal of old tap (if present)', 'Secure leak-proof fitting', 'Pressure test'],
      excludes: ['Cost of new tap or angle cock valve']
    },
    {
      id: resolveServiceOptionUuid('tap-repair'),
      categoryId: resolveServiceCategoryUuid('plumbing'),
      name: 'Tap Repair / Leakage',
      startingPrice: 299,
      estimatedPriceMin: 299,
      estimatedPriceMax: 599,
      durationEstimate: '30-45 mins',
      description: 'Diagnosis and fix for dripping faucets, low water flow, spindle wear, or worn washer replacement.',
      includes: ['Leakage check & diagnosis', 'Fitting and spindle adjustment', 'Standard labour'],
      excludes: ['Ceramic cartridges or new brass parts if replacement is needed']
    },
    {
      id: resolveServiceOptionUuid('pipe-leakage'),
      categoryId: resolveServiceCategoryUuid('plumbing'),
      name: 'Pipe Leakage',
      startingPrice: 399,
      estimatedPriceMin: 399,
      estimatedPriceMax: 799,
      durationEstimate: '45-60 mins',
      description: 'Repair of concealed or exposed PVC/CPVC pipes, joints, and connector pipes.',
      includes: ['Damage identification', 'Joint sealing or section clamp', 'Water flow check'],
      excludes: ['Wall tile replacement materials']
    },
    {
      id: resolveServiceOptionUuid('bathroom-fitting'),
      categoryId: resolveServiceCategoryUuid('plumbing'),
      name: 'Bathroom Fitting',
      startingPrice: 499,
      estimatedPriceMin: 499,
      estimatedPriceMax: 999,
      durationEstimate: '60-90 mins',
      description: 'Installation of showerheads, health faucets, towel rods, and bathroom accessories.',
      includes: ['Drilling and secure wall anchors', 'Neat alignment', 'Leak inspection'],
      excludes: ['Hardware accessories cost']
    },
    {
      id: resolveServiceOptionUuid('geyser-installation'),
      categoryId: resolveServiceCategoryUuid('plumbing'),
      name: 'Geyser Installation',
      startingPrice: 599,
      estimatedPriceMin: 599,
      estimatedPriceMax: 899,
      durationEstimate: '60 mins',
      description: 'Safe mounting of instant or storage water heater, connecting hot/cold braided pipes.',
      includes: ['Heavy wall-bracket mounting', 'Inlet/outlet connection', 'Thermal heating test'],
      excludes: ['Extra electrical cabling or bypass valve']
    },
    {
      id: resolveServiceOptionUuid('other-plumbing'),
      categoryId: resolveServiceCategoryUuid('plumbing'),
      name: 'Other Plumbing Work',
      startingPrice: 199,
      estimatedPriceMin: 199,
      estimatedPriceMax: 1200,
      isCustomQuote: true,
      durationEstimate: 'Variable',
      description: 'Custom diagnosis for tank overflow, motor connection, or drainage blockage.',
      includes: ['On-site physical inspection', 'Transparent quotation before starting work'],
      excludes: ['Cost of specialized replacement machinery']
    }
  ],
  electrical: [
    {
      id: resolveServiceOptionUuid('switch-socket'),
      categoryId: resolveServiceCategoryUuid('electrical'),
      name: 'Switch & Socket Repair',
      startingPrice: 149,
      estimatedPriceMin: 149,
      estimatedPriceMax: 299,
      durationEstimate: '20-30 mins',
      description: 'Fix loose connections, sparking switches, burnt sockets, or modular plate replacements.',
      includes: ['Safety voltage check', 'Wire re-stripping and terminal tightening', 'Load test'],
      excludes: ['Modular switch plates']
    },
    {
      id: resolveServiceOptionUuid('fan-repair'),
      categoryId: resolveServiceCategoryUuid('electrical'),
      name: 'Fan Repair / Installation',
      startingPrice: 199,
      estimatedPriceMin: 199,
      estimatedPriceMax: 399,
      durationEstimate: '30 mins',
      description: 'Ceiling fan assembly, regulator replacement, or capacitor replacement for low speed.',
      includes: ['Hanging hook safety pin check', 'Blade balancing', 'Speed regulator check'],
      excludes: ['Capacitor or replacement blades']
    },
    {
      id: resolveServiceOptionUuid('mcb-fuse'),
      categoryId: resolveServiceCategoryUuid('electrical'),
      name: 'MCB & Fuse Tripping Fix',
      startingPrice: 249,
      estimatedPriceMin: 249,
      estimatedPriceMax: 549,
      durationEstimate: '45 mins',
      description: 'Inspect short-circuits, frequent breaker trips, or neutral wire faults.',
      includes: ['Distribution board inspection', 'Load balancing diagnosis', 'Earthing check'],
      excludes: ['New MCB breaker unit']
    },
    {
      id: resolveServiceOptionUuid('house-wiring'),
      categoryId: resolveServiceCategoryUuid('electrical'),
      name: 'House Wiring Inspection',
      startingPrice: 399,
      estimatedPriceMin: 399,
      estimatedPriceMax: 899,
      durationEstimate: '60 mins',
      description: 'Complete premise safety audit, tracing hidden breaks, or new line pulling.',
      includes: ['Multimeter conductivity test', 'Earthing resistance audit', 'Safety report'],
      excludes: ['Bulk copper cable spools']
    }
  ],
  carpentry: [
    {
      id: resolveServiceOptionUuid('door-lock'),
      categoryId: resolveServiceCategoryUuid('carpentry'),
      name: 'Door Lock Repair / Change',
      startingPrice: 249,
      estimatedPriceMin: 249,
      estimatedPriceMax: 499,
      durationEstimate: '30 mins',
      description: 'Fix jammed mortise locks, cylinder change, handle alignment, or latch strike plate adjustment.',
      includes: ['Lock dismounting & cleaning', 'Alignment with door frame', 'Smooth key testing'],
      excludes: ['New lock cylinder or handles']
    },
    {
      id: resolveServiceOptionUuid('furniture-assembly'),
      categoryId: resolveServiceCategoryUuid('carpentry'),
      name: 'Furniture Assembly',
      startingPrice: 399,
      estimatedPriceMin: 399,
      estimatedPriceMax: 899,
      durationEstimate: '60-90 mins',
      description: 'Assembly of flat-pack beds, wardrobes, study desks, or shoe racks.',
      includes: ['Systematic hardware fastening', 'Level leveling check', 'Sturdiness reinforcement'],
      excludes: ['Additional wooden planks']
    },
    {
      id: resolveServiceOptionUuid('hinge-repair'),
      categoryId: resolveServiceCategoryUuid('carpentry'),
      name: 'Cupboard Hinge & Channel Repair',
      startingPrice: 199,
      estimatedPriceMin: 199,
      estimatedPriceMax: 399,
      durationEstimate: '30 mins',
      description: 'Fix sagging wardrobe doors, misaligned hydraulic soft-close hinges, or drawer sliding channels.',
      includes: ['Screw socket re-plugging', 'Hinge leveling', 'Smooth glide check'],
      excludes: ['New hydraulic hinges or drawer slides']
    }
  ],
  painting: [
    {
      id: resolveServiceOptionUuid('room-touchup'),
      categoryId: resolveServiceCategoryUuid('painting'),
      name: 'Single Room Touch-up',
      startingPrice: 499,
      estimatedPriceMin: 499,
      estimatedPriceMax: 999,
      durationEstimate: '2-3 hours',
      description: 'Patch nail holes, scrape flaking plaster, apply putty and touch-up matching paint coat.',
      includes: ['Surface sanding', 'Crack filling putty', 'Double coat application'],
      excludes: ['Paint cans unless requested']
    },
    {
      id: resolveServiceOptionUuid('waterproofing'),
      categoryId: resolveServiceCategoryUuid('painting'),
      name: 'Waterproofing & Seepage Check',
      startingPrice: 699,
      estimatedPriceMin: 699,
      estimatedPriceMax: 1499,
      durationEstimate: '2 hours',
      description: 'Identify moisture source in walls/ceilings, apply anti-fungal barrier coat.',
      includes: ['Moisture meter reading', 'Seepage diagnosis', 'Chemical primer application'],
      excludes: ['Exterior terrace coatings']
    }
  ],
  ac_repair: [
    {
      id: resolveServiceOptionUuid('ac-service'),
      categoryId: resolveServiceCategoryUuid('ac_repair'),
      name: 'AC General Jet Pump Service',
      startingPrice: 299,
      estimatedPriceMin: 299,
      estimatedPriceMax: 499,
      durationEstimate: '45 mins',
      description: 'Deep high-pressure water jet cleaning of indoor cooling coils, filters, and outdoor condenser.',
      includes: ['Filter mesh wash', 'Condenser coil flushing', 'Drain pipe unclogging', 'Cooling check'],
      excludes: ['Refrigerant gas top-up']
    },
    {
      id: resolveServiceOptionUuid('ac-gas-refill'),
      categoryId: resolveServiceCategoryUuid('ac_repair'),
      name: 'AC Gas Refill / Leak Fix',
      startingPrice: 1499,
      estimatedPriceMin: 1499,
      estimatedPriceMax: 2199,
      durationEstimate: '60 mins',
      description: 'Nitrogen pressure leak detection, copper braze repair, vacuuming, and accurate R32/R410/R22 gas charge.',
      includes: ['Leak diagnosis', 'Vacuum extraction', 'Weight-calibrated gas filling', 'Ampere test'],
      excludes: ['Compressor replacement']
    }
  ],
  cleaning: [
    {
      id: resolveServiceOptionUuid('bathroom-clean'),
      categoryId: resolveServiceCategoryUuid('cleaning'),
      name: 'Deep Bathroom Cleaning',
      startingPrice: 149,
      estimatedPriceMin: 149,
      estimatedPriceMax: 349,
      durationEstimate: '45 mins',
      description: 'Hard water scale removal from floor tiles, sanitary fixtures, mirror, and toilet disinfections.',
      includes: ['Tile scrubbing', 'Acid-free chemical descaling', 'Mirror & tap polishing'],
      excludes: ['Exhaust fan motor rewiring']
    },
    {
      id: resolveServiceOptionUuid('kitchen-clean'),
      categoryId: resolveServiceCategoryUuid('cleaning'),
      name: 'Kitchen Degreasing & Clean',
      startingPrice: 399,
      estimatedPriceMin: 399,
      estimatedPriceMax: 799,
      durationEstimate: '60 mins',
      description: 'Oil grease removal from gas stove, kitchen counter, sink, and exterior cabinet surfaces.',
      includes: ['Degreasing chemical spray', 'Steam wipe of tiles', 'Stainless steel polish'],
      excludes: ['Chimney internal duct dismantling']
    }
  ],
  ro_water: [
    {
      id: resolveServiceOptionUuid('ro-filters'),
      categoryId: resolveServiceCategoryUuid('ro_water'),
      name: 'Filter Cartridge Replacement',
      startingPrice: 199,
      estimatedPriceMin: 199,
      estimatedPriceMax: 499,
      durationEstimate: '30 mins',
      description: 'Replacement of pre-filter spun candle, sediment filter, and activated carbon filter with TDS test.',
      includes: ['Housing bowl cleaning', 'O-ring lubrication', 'TDS water quality check'],
      excludes: ['RO Membrane cylinder']
    },
    {
      id: resolveServiceOptionUuid('ro-complete-service'),
      categoryId: resolveServiceCategoryUuid('ro_water'),
      name: 'Complete RO Purifier Service',
      startingPrice: 399,
      estimatedPriceMin: 399,
      estimatedPriceMax: 799,
      durationEstimate: '45 mins',
      description: 'Booster pump pressure check, solenoid valve inspection, membrane flushing, and sanitized storage tank wash.',
      includes: ['Full pressure audit', 'Storage tank clean', 'Electrical adapter test'],
      excludes: ['Pump motor replacement']
    }
  ],
  appliance_repair: [
    {
      id: resolveServiceOptionUuid('washing-machine'),
      categoryId: resolveServiceCategoryUuid('appliance_repair'),
      name: 'Washing Machine Inspection',
      startingPrice: 199,
      estimatedPriceMin: 199,
      estimatedPriceMax: 499,
      durationEstimate: '45 mins',
      description: 'Diagnosis of spin motor noise, water draining failure, error codes on front/top load machines.',
      includes: ['Belt & pulley inspection', 'Inlet valve check', 'Transparent quotation before parts'],
      excludes: ['Control PCB board cost']
    }
  ],
  mason_labour: [
    {
      id: resolveServiceOptionUuid('tile-repair'),
      categoryId: resolveServiceCategoryUuid('mason_labour'),
      name: 'Tile Fixing & Grout Repair',
      startingPrice: 349,
      estimatedPriceMin: 349,
      estimatedPriceMax: 699,
      durationEstimate: '60 mins',
      description: 'Fixing cracked floor/wall tiles, epoxy waterproof grouting between joints.',
      includes: ['Surface leveling', 'Adhesive cement mix application', 'Clean sponge wiping'],
      excludes: ['Supply of matching tiles']
    }
  ],
  other_services: [
    {
      id: resolveServiceOptionUuid('general-handyman'),
      categoryId: resolveServiceCategoryUuid('other_services'),
      name: 'General Handyman Visit',
      startingPrice: 199,
      estimatedPriceMin: 199,
      estimatedPriceMax: 499,
      isCustomQuote: true,
      durationEstimate: '45 mins',
      description: 'Versatile household tasks including picture frames, curtain rods, minor adjustments.',
      includes: ['Tool kit inspection', 'First hour labour'],
      excludes: ['Raw materials']
    }
  ]
};

// Ensure SERVICE_OPTIONS can be indexed by both category slug and authoritative category UUID
Object.entries({ ...SERVICE_OPTIONS }).forEach(([catSlug, opts]) => {
  const catUuid = resolveServiceCategoryUuid(catSlug);
  if (catUuid && catUuid !== catSlug) {
    SERVICE_OPTIONS[catUuid] = opts;
  }
});

export const PROFESSIONALS: Professional[] = [
  {
    id: 'pro-1',
    name: 'Ramesh Patel',
    serviceCategoryIds: ['plumbing'],
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.8,
    reviewCount: 126,
    experienceYears: 7,
    distanceKm: 1.2,
    isConfirmed: true,
    arrivalEtaMinutes: '15–20 min',
    estimatedPrice: 499,
    phone: '+91 98251 44321',
    serviceAreas: ['Fuwara Chowk', 'Station Road', 'Swastik Society', 'Detroj Road', 'Nani Kadi'],
    badge: 'Best Match',
    about: 'Experienced master plumber based near Fuwara Chowk, Kadi. Specializes in residential leakage repair, CPVC fittings, and sanitary adjustments.'
  },
  {
    id: 'pro-2',
    name: 'Mahesh Yadav',
    serviceCategoryIds: ['plumbing'],
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.6,
    reviewCount: 84,
    experienceYears: 5,
    distanceKm: 2.1,
    isConfirmed: true,
    arrivalEtaMinutes: '20–25 min',
    estimatedPrice: 499,
    phone: '+91 97241 88312',
    serviceAreas: ['Station Road', 'Suvidha Township', 'Kundal Road', 'Hariom Nagar'],
    about: 'Reliable plumbing expert with 5+ years servicing residential apartments and bungalows in Kadi.'
  },
  {
    id: 'pro-3',
    name: 'Jignesh Prajapati',
    serviceCategoryIds: ['electrical', 'appliance_repair'],
    photo: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=300&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.9,
    reviewCount: 192,
    experienceYears: 8,
    distanceKm: 1.5,
    isConfirmed: true,
    arrivalEtaMinutes: '15–20 min',
    estimatedPrice: 249,
    phone: '+91 94280 11984',
    serviceAreas: ['Fuwara Chowk', 'Station Road', 'GIDC Phase 1 & 2', 'Nani Kadi'],
    badge: 'Top Rated',
    about: 'Certified wireman and electrician. Quick fault diagnosis for tripping circuits, fan installations, and MCB panels.'
  },
  {
    id: 'pro-4',
    name: 'Arvind Panchal',
    serviceCategoryIds: ['carpentry'],
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.7,
    reviewCount: 110,
    experienceYears: 10,
    distanceKm: 2.4,
    isConfirmed: true,
    arrivalEtaMinutes: '25–30 min',
    estimatedPrice: 399,
    phone: '+91 98982 77410',
    serviceAreas: ['Swastik Society', 'Detroj Road', 'Kundal Road', 'Station Road'],
    about: 'Traditional carpenter with a decade of expertise in door locks, kitchen cabinets, and modern modular furniture.'
  },
  {
    id: 'pro-5',
    name: 'Bhavik Soni',
    serviceCategoryIds: ['ac_repair', 'ro_water'],
    photo: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.8,
    reviewCount: 95,
    experienceYears: 6,
    distanceKm: 1.8,
    isConfirmed: true,
    arrivalEtaMinutes: '20–30 min',
    estimatedPrice: 349,
    phone: '+91 96014 33209',
    serviceAreas: ['Fuwara Chowk', 'GIDC Phase 1 & 2', 'Suvidha Township'],
    about: 'AC cooling & RO water purifier technician with calibrated vacuum pumps and pressure gauges.'
  },
  {
    id: 'pro-6',
    name: 'Haresh Solanki',
    serviceCategoryIds: ['painting', 'mason_labour'],
    photo: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&auto=format&fit=crop&q=80',
    verified: true,
    rating: 4.7,
    reviewCount: 78,
    experienceYears: 9,
    distanceKm: 3.0,
    isConfirmed: true,
    arrivalEtaMinutes: '30–40 min',
    estimatedPrice: 499,
    phone: '+91 99791 55620',
    serviceAreas: ['All Kadi & nearby GIDC zones'],
    about: 'Expert in wall plastering, dampness proofing, tile replacement, and interior finish.'
  }
];

export const DEFAULT_CUSTOMER: CustomerProfile = {
  name: 'Aryan Verma',
  phone: '98765 43210',
  address: '',
  savedAddresses: []
};
