// Production database contracts & RPC types
export {
  VALID_REQUEST_STATUSES,
  isValidRequestStatus,
  REQUEST_STATUS_CONFIG,
  getRequestStatusDisplay,
  formatEtaDisplay
} from './database';

export type {
  RequestStatus,
  RequestStatusDisplayConfig,
  PricingType,
  ProductionRequestStatus,
  ProductionPricingType,
  ServiceRequest,
  Customer,
  CustomerAddress,
  RequestAssignment,
  RequestStatusHistory,
  Review,
  CustomerRequestStatusDetail,
  CreateServiceRequestParams,
  GetServiceRequestIdentityParams,
  ServiceRequestIdentity,
  GetServiceRequestStatusParams,
  CreateServiceReviewParams
} from './database';

export type BookingStatus =
  | 'REQUESTED'
  | 'REVIEWING'
  | 'CONFIRMING'
  | 'CONFIRMED'
  | 'PROFESSIONAL_CONFIRMED'
  | 'ASSIGNED'
  | 'CUSTOMER_CONTACTED'
  | 'ON_THE_WAY'
  | 'ARRIVED'
  | 'WORK_STARTED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'UNFULFILLED';

export interface ServiceCategory {
  id: string;
  name: string;
  tagline: string;
  iconName: string;
  startingPrice: number;
  popular: boolean;
  bgTint: string;
  iconColor: string;
  bannerDescription?: string;
}

export interface ServiceOption {
  id: string;
  categoryId: string;
  name: string;
  startingPrice: number;
  estimatedPriceMin: number;
  estimatedPriceMax: number;
  isCustomQuote?: boolean;
  description: string;
  includes: string[];
  excludes: string[];
  durationEstimate: string;
}

export interface Professional {
  id: string;
  name: string;
  serviceCategoryIds: string[];
  photo: string;
  verified: boolean;
  rating: number;
  reviewCount: number;
  experienceYears: number;
  distanceKm: number;
  isConfirmed: boolean;
  arrivalEtaMinutes: string;
  estimatedPrice: number;
  phone: string;
  serviceAreas: string[];
  about?: string;
  badge?: string; // e.g. "Best Match"
}

export interface LocationArea {
  id: string;
  name: string;
  taluka: string;
  district: string;
  pincode: string;
  isPopular?: boolean;
}

export type LocationSource = 'gps' | 'search' | 'map';

export interface CustomerLocation {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
  source: LocationSource;
  confirmedAt?: string;
  label?: string;
}

export interface CustomerProfile {
  id?: string;
  name: string;
  phone: string;
  address: string;
  savedAddresses: {
    id: string;
    label: string;
    address: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
    latitude?: number;
    longitude?: number;
    isDefault: boolean;
  }[];
}

export interface TimelineEvent {
  status: BookingStatus;
  label: string;
  timestamp: string;
  completed: boolean;
  current?: boolean;
}

export interface Booking {
  id: string;
  bookingCode: string; // e.g. "KW12345678"
  customerName: string;
  customerPhone: string;
  address: string;
  categoryId: string;
  categoryName: string;
  serviceOptionId: string;
  serviceOptionName: string;
  professional: Professional;
  estimatedPrice: number;
  finalPrice?: number;
  paymentMethod: 'Cash on Service' | 'Online UPI';
  status: BookingStatus;
  createdAt: string;
  etaDisplay: string;
  timeline: TimelineEvent[];
  rating?: number;
  reviewText?: string;
  reviewTags?: string[];
  uploadedPhotoUrl?: string;
}

// Legacy UI compatibility aliases
export type LegacyBooking = Booking;
export type LegacyProfessional = Professional;
export type LegacyServiceCategory = ServiceCategory;
export type LegacyServiceOption = ServiceOption;
