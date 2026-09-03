import {
  Booking,
  BookingStatus,
  CustomerProfile,
  LocationArea,
  Professional,
  ServiceCategory,
  ServiceOption,
  TimelineEvent
} from '../types';
import {
  DEFAULT_CUSTOMER,
  KADI_LOCALITIES,
  PROFESSIONALS
} from '../data/mockDatabase';
import {
  fetchServiceCategories,
  fetchServiceOptions,
  getInitialCategoriesSync,
  formatPricingDisplay
} from './catalogService';
export {
  fetchServiceCategories,
  fetchServiceOptions,
  getInitialCategoriesSync,
  formatPricingDisplay
};

// In-memory storage fallback for restricted iframe environments or when localStorage throws SecurityError
const memoryStore: Record<string, string> = {};

const safeStorage = {
  getItem(key: string): string | null {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return window.localStorage.getItem(key);
      }
    } catch {
      // Storage access blocked or restricted in sandbox/iframe
    }
    return memoryStore[key] ?? null;
  },
  setItem(key: string, value: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(key, value);
        return;
      }
    } catch {
      // Storage access blocked
    }
    memoryStore[key] = value;
  },
  removeItem(key: string): void {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.removeItem(key);
        return;
      }
    } catch {}
    delete memoryStore[key];
  }
};

const STORAGE_KEYS = {
  BOOKINGS: 'kaamwala_bookings_v1',
  CUSTOMER: 'kaamwala_customer_v1',
  CURRENT_LOCATION: 'kaamwala_location_v1'
};

// Initial realistic demo bookings matching Prompt Section 20 & reference image
const SEED_BOOKINGS: Booking[] = [
  {
    id: 'b-active-1',
    bookingCode: 'KW12345678',
    customerName: 'Aryan Verma',
    customerPhone: '98765 43210',
    address: 'B-14, Swastik Society, Near Fuwara Chowk, Kadi, Gujarat 382715',
    categoryId: 'plumbing',
    categoryName: 'Plumbing',
    serviceOptionId: 'tap-repair',
    serviceOptionName: 'Tap Repair / Leakage',
    professional: PROFESSIONALS[0], // Ramesh Patel
    estimatedPrice: 499,
    finalPrice: 499,
    paymentMethod: 'Cash on Service',
    status: 'ON_THE_WAY',
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    etaDisplay: '15–20 min',
    timeline: [
      { status: 'CONFIRMED', label: 'Booking Confirmed', timestamp: '10:30 AM', completed: true },
      { status: 'ON_THE_WAY', label: 'KaamWala is on the way', timestamp: '10:35 AM', completed: true, current: true },
      { status: 'ARRIVED', label: 'Arrived at your location', timestamp: '-', completed: false },
      { status: 'WORK_STARTED', label: 'Work Started', timestamp: '-', completed: false },
      { status: 'COMPLETED', label: 'Work Completed', timestamp: '-', completed: false }
    ]
  },
  {
    id: 'b-past-1',
    bookingCode: 'KW98765432',
    customerName: 'Aryan Verma',
    customerPhone: '98765 43210',
    address: 'B-14, Swastik Society, Near Fuwara Chowk, Kadi, Gujarat 382715',
    categoryId: 'electrical',
    categoryName: 'Electrical',
    serviceOptionId: 'fan-repair',
    serviceOptionName: 'Fan Repair / Installation',
    professional: PROFESSIONALS[2], // Jignesh Prajapati
    estimatedPrice: 299,
    finalPrice: 299,
    paymentMethod: 'Cash on Service',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    etaDisplay: 'Completed',
    timeline: [
      { status: 'CONFIRMED', label: 'Booking Confirmed', timestamp: '02:00 PM', completed: true },
      { status: 'ON_THE_WAY', label: 'KaamWala is on the way', timestamp: '02:15 PM', completed: true },
      { status: 'ARRIVED', label: 'Arrived at your location', timestamp: '02:30 PM', completed: true },
      { status: 'WORK_STARTED', label: 'Work Started', timestamp: '02:35 PM', completed: true },
      { status: 'COMPLETED', label: 'Work Completed', timestamp: '03:10 PM', completed: true }
    ],
    rating: 5,
    reviewText: 'Arrived right on time and fixed the capacitor quickly. Honest work!'
  },
  {
    id: 'b-past-2',
    bookingCode: 'KW45612378',
    customerName: 'Aryan Verma',
    customerPhone: '98765 43210',
    address: 'B-14, Swastik Society, Near Fuwara Chowk, Kadi, Gujarat 382715',
    categoryId: 'carpentry',
    categoryName: 'Carpentry',
    serviceOptionId: 'door-lock',
    serviceOptionName: 'Door Lock Repair / Change',
    professional: PROFESSIONALS[3], // Arvind Panchal
    estimatedPrice: 799,
    finalPrice: 799,
    paymentMethod: 'Cash on Service',
    status: 'COMPLETED',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    etaDisplay: 'Completed',
    timeline: [
      { status: 'CONFIRMED', label: 'Booking Confirmed', timestamp: '11:00 AM', completed: true },
      { status: 'ON_THE_WAY', label: 'KaamWala is on the way', timestamp: '11:20 AM', completed: true },
      { status: 'ARRIVED', label: 'Arrived at your location', timestamp: '11:45 AM', completed: true },
      { status: 'WORK_STARTED', label: 'Work Started', timestamp: '11:50 AM', completed: true },
      { status: 'COMPLETED', label: 'Work Completed', timestamp: '12:40 PM', completed: true }
    ],
    rating: 5,
    reviewText: 'Great lock fitting, very sturdy alignment.'
  }
];

// Helper to initialize local storage safely
function getStoredBookings(): Booking[] {
  try {
    const raw = safeStorage.getItem(STORAGE_KEYS.BOOKINGS);
    if (!raw) {
      safeStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(SEED_BOOKINGS));
      return SEED_BOOKINGS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return SEED_BOOKINGS;
  } catch {
    return SEED_BOOKINGS;
  }
}

function setStoredBookings(bookings: Booking[]) {
  try {
    safeStorage.setItem(STORAGE_KEYS.BOOKINGS, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to persist bookings', e);
  }
}

/**
 * Data Service Abstraction (Supabase-ready).
 * In production with Supabase configured, this layer delegates to:
 *   const { data, error } = await supabase.from('...').select('*')
 */
export const dataService = {
  // 1. Categories (Data-driven from Supabase service_categories table)
  getCategoriesSync(): ServiceCategory[] {
    return getInitialCategoriesSync();
  },

  async getCategories(): Promise<ServiceCategory[]> {
    const result = await fetchServiceCategories();
    return result.data;
  },

  async getCategoryById(id: string): Promise<ServiceCategory | undefined> {
    const result = await fetchServiceCategories();
    return result.data.find((c) => c.id === id);
  },

  // 2. Service Options for a category (Data-driven from Supabase service_options table)
  async getServiceOptions(categoryId: string): Promise<ServiceOption[]> {
    const result = await fetchServiceOptions(categoryId);
    return result.data;
  },

  async getServiceOptionById(categoryId: string, optionId: string): Promise<ServiceOption | undefined> {
    const result = await fetchServiceOptions(categoryId);
    return result.data.find((o) => o.id === optionId);
  },

  // 3. Professionals
  async getProfessionalsForCategory(categoryId: string, localityName?: string): Promise<Professional[]> {
    const pros = PROFESSIONALS.filter((p) => p.serviceCategoryIds.includes(categoryId));
    if (pros.length === 0) {
      // Return general pros if specific category is sparse
      return PROFESSIONALS.slice(0, 2);
    }
    // Intelligent ranking: best rating, confirmed status, distance
    return pros.sort((a, b) => {
      if (a.badge === 'Best Match') return -1;
      if (b.badge === 'Best Match') return 1;
      return a.distanceKm - b.distanceKm;
    });
  },

  async getProfessionalById(id: string): Promise<Professional | undefined> {
    return PROFESSIONALS.find((p) => p.id === id);
  },

  // 4. Localities
  async getLocalities(): Promise<LocationArea[]> {
    return [...KADI_LOCALITIES];
  },

  getSelectedLocation(): LocationArea {
    try {
      const raw = safeStorage.getItem(STORAGE_KEYS.CURRENT_LOCATION);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return parsed;
        }
      }
    } catch {}
    return KADI_LOCALITIES[0]; // Fuwara Chowk, Kadi
  },

  setSelectedLocation(loc: LocationArea) {
    try {
      if (loc && loc.name) {
        safeStorage.setItem(STORAGE_KEYS.CURRENT_LOCATION, JSON.stringify(loc));
      }
    } catch {}
  },

  // 5. Customer Profile
  getCustomerProfile(): CustomerProfile {
    try {
      const raw = safeStorage.getItem(STORAGE_KEYS.CUSTOMER);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object' && parsed.name) {
          return parsed;
        }
      }
    } catch {}
    return DEFAULT_CUSTOMER;
  },

  setCustomerProfile(profile: CustomerProfile) {
    try {
      if (profile && profile.name) {
        safeStorage.setItem(STORAGE_KEYS.CUSTOMER, JSON.stringify(profile));
      }
    } catch {}
  },

  // 6. Bookings
  getBookingsSync(): Booking[] {
    return getStoredBookings();
  },

  // 6. Bookings
  async getBookings(): Promise<Booking[]> {
    return getStoredBookings();
  },

  async getBookingById(id: string): Promise<Booking | undefined> {
    const list = getStoredBookings();
    return list.find((b) => b.id === id || b.bookingCode === id);
  },

  async createBooking(params: {
    customerName: string;
    customerPhone: string;
    address: string;
    categoryId: string;
    categoryName: string;
    serviceOptionId: string;
    serviceOptionName: string;
    professional: Professional;
    estimatedPrice: number;
    paymentMethod: 'Cash on Service' | 'Online UPI';
    uploadedPhotoUrl?: string;
  }): Promise<Booking> {
    const randomSuffix = Math.floor(10000000 + Math.random() * 90000000);
    const bookingCode = `KW${randomSuffix}`;
    const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newBooking: Booking = {
      id: `b-${Date.now()}`,
      bookingCode,
      customerName: params.customerName,
      customerPhone: params.customerPhone,
      address: params.address,
      categoryId: params.categoryId,
      categoryName: params.categoryName,
      serviceOptionId: params.serviceOptionId,
      serviceOptionName: params.serviceOptionName,
      professional: params.professional,
      estimatedPrice: params.estimatedPrice,
      paymentMethod: params.paymentMethod,
      status: 'ON_THE_WAY',
      createdAt: new Date().toISOString(),
      etaDisplay: params.professional.arrivalEtaMinutes || '15–20 min',
      timeline: [
        { status: 'CONFIRMED', label: 'Booking Confirmed', timestamp: nowStr, completed: true },
        { status: 'ON_THE_WAY', label: 'KaamWala is on the way', timestamp: nowStr, completed: true, current: true },
        { status: 'ARRIVED', label: 'Arrived at your location', timestamp: '-', completed: false },
        { status: 'WORK_STARTED', label: 'Work Started', timestamp: '-', completed: false },
        { status: 'COMPLETED', label: 'Work Completed', timestamp: '-', completed: false }
      ],
      uploadedPhotoUrl: params.uploadedPhotoUrl
    };

    const currentList = getStoredBookings();
    const updated = [newBooking, ...currentList];
    setStoredBookings(updated);
    return newBooking;
  },

  async updateBookingStatus(bookingId: string, newStatus: BookingStatus): Promise<Booking | null> {
    const list = getStoredBookings();
    const index = list.findIndex((b) => b.id === bookingId);
    if (index === -1) return null;

    const booking = { ...list[index] };
    booking.status = newStatus;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Update timeline stages
    const stages: BookingStatus[] = ['CONFIRMED', 'ON_THE_WAY', 'ARRIVED', 'WORK_STARTED', 'COMPLETED'];
    const currentStageIdx = stages.indexOf(newStatus);

    booking.timeline = booking.timeline.map((step) => {
      const stepIdx = stages.indexOf(step.status);
      if (stepIdx <= currentStageIdx) {
        return {
          ...step,
          completed: true,
          current: stepIdx === currentStageIdx,
          timestamp: step.timestamp === '-' ? nowTime : step.timestamp
        };
      }
      return {
        ...step,
        completed: false,
        current: false
      };
    });

    list[index] = booking;
    setStoredBookings(list);
    return booking;
  },

  async submitReview(
    bookingId: string,
    rating: number,
    reviewText: string,
    reviewTags?: string[]
  ): Promise<Booking | null> {
    const list = getStoredBookings();
    const index = list.findIndex((b) => b.id === bookingId);
    if (index === -1) return null;

    list[index].rating = rating;
    list[index].reviewText = reviewText;
    list[index].reviewTags = reviewTags;
    setStoredBookings(list);
    return list[index];
  }
};
