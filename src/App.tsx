/**
 * KaamWala - Hyperlocal Home Services Platform for Kadi, Gujarat
 * Recreating the mobile reference design with complete booking and tracking flow.
 */

import React, { useState, useEffect } from 'react';
import {
  Booking,
  BookingStatus,
  CustomerLocation,
  CustomerProfile,
  LocationArea,
  Professional,
  ServiceCategory,
  ServiceOption
} from './types';
import { DEFAULT_CUSTOMER } from './data/mockDatabase';
import { dataService } from './services/supabaseClient';
import {
  getSavedCustomerLocation,
  saveCustomerLocationLocally,
  persistCustomerLocationToSupabase
} from './services/locationService';
import { Header } from './components/common/Header';
import { BottomNavigation, NavTab } from './components/common/BottomNavigation';
import { LocationModal } from './components/common/LocationModal';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { SelectServiceScreen } from './components/screens/SelectServiceScreen';
import { CategoryServicesScreen } from './components/screens/CategoryServicesScreen';
import { ServiceDetailScreen } from './components/screens/ServiceDetailScreen';
import { ProfessionalMatchingScreen } from './components/screens/ProfessionalMatchingScreen';
import { ConfirmDetailsScreen } from './components/screens/ConfirmDetailsScreen';
import { BookingConfirmedScreen } from './components/screens/BookingConfirmedScreen';
import { BookingTrackingScreen } from './components/screens/BookingTrackingScreen';
import { BookingCompletedScreen } from './components/screens/BookingCompletedScreen';
import { BookingsListScreen } from './components/screens/BookingsListScreen';
import { HelpScreen } from './components/screens/HelpScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';

type FlowScreen =
  | 'TAB_VIEW'
  | 'SELECT_SERVICE'
  | 'CATEGORY_SERVICES'
  | 'SERVICE_DETAIL'
  | 'MATCHING_PROS'
  | 'CONFIRM_DETAILS'
  | 'BOOKING_CONFIRMED'
  | 'TRACK_BOOKING'
  | 'BOOKING_COMPLETED';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentScreen, setCurrentScreen] = useState<FlowScreen>('TAB_VIEW');

  // Location & Customer State (Real customer location, no demo Fuwara Chowk default)
  const [customerLocation, setCustomerLocation] = useState<CustomerLocation | null>(() => {
    return getSavedCustomerLocation();
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    try {
      const prof = dataService.getCustomerProfile();
      if (prof && prof.name) return prof;
    } catch {}
    return DEFAULT_CUSTOMER;
  });

  // Data Collections - preloaded synchronously so initial render is NEVER empty
  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    try {
      return dataService.getCategoriesSync();
    } catch {
      return [];
    }
  });
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const [bookings, setBookings] = useState<Booking[]>(() => {
    try {
      return dataService.getBookingsSync();
    } catch {
      return [];
    }
  });

  // Active Flow Selection State
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<ServiceOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);

  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);
  const [matchingProfessionals, setMatchingProfessionals] = useState<Professional[]>([]);
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null);
  const [activeBooking, setActiveBooking] = useState<Booking | null>(null);

  // Load catalog categories asynchronously from Supabase
  const loadCategories = async (forceRefresh = false) => {
    setIsCatalogLoading(true);
    setCatalogError(null);
    try {
      const cats = await dataService.getCategories();
      if (Array.isArray(cats) && cats.length > 0) {
        setCategories(cats);
      }
    } catch (err) {
      console.warn('Could not fetch categories from Supabase:', err);
      setCatalogError('Unable to connect to service catalog.');
    } finally {
      setIsCatalogLoading(false);
    }
  };

  // Load initial data asynchronously to sync any changes
  useEffect(() => {
    loadCategories(false);

    async function loadBookings() {
      try {
        const bks = await dataService.getBookings();
        if (Array.isArray(bks)) {
          setBookings(bks);
        }
      } catch (err) {
        console.error('Failed to reload bookings', err);
      }
    }
    loadBookings();
  }, []);

  // Safe recovery if navigation state points to a flow screen without required selection
  useEffect(() => {
    if (currentScreen === 'CATEGORY_SERVICES' && !selectedCategory) {
      setCurrentScreen('TAB_VIEW');
    } else if (currentScreen === 'SERVICE_DETAIL' && (!selectedCategory || !selectedOption)) {
      setCurrentScreen('TAB_VIEW');
    } else if (currentScreen === 'MATCHING_PROS' && !selectedOption) {
      setCurrentScreen('TAB_VIEW');
    } else if (currentScreen === 'CONFIRM_DETAILS' && (!selectedProfessional || !selectedOption)) {
      setCurrentScreen('TAB_VIEW');
    } else if (
      (currentScreen === 'TRACK_BOOKING' || currentScreen === 'BOOKING_CONFIRMED' || currentScreen === 'BOOKING_COMPLETED') &&
      !activeBooking
    ) {
      setCurrentScreen('TAB_VIEW');
    }
  }, [currentScreen, selectedCategory, selectedOption, selectedProfessional, activeBooking]);

  // Update customer location from Google Maps picker or search
  const handleConfirmLocation = (loc: CustomerLocation) => {
    setCustomerLocation(loc);
    saveCustomerLocationLocally(loc);

    // Synchronize customer profile address so checkout forms auto-fill
    setCustomerProfile((prev) => {
      const updated: CustomerProfile = {
        ...prev,
        address: loc.formattedAddress,
        savedAddresses: [
          {
            id: 'addr-main',
            label: loc.label || 'Service Address',
            address: loc.formattedAddress,
            locality: loc.locality,
            city: loc.city,
            state: loc.state,
            pincode: loc.pincode,
            latitude: loc.latitude,
            longitude: loc.longitude,
            isDefault: true
          },
          ...(prev.savedAddresses || []).filter((a) => a.address !== loc.formattedAddress)
        ]
      };
      dataService.setCustomerProfile(updated);
      return updated;
    });

    // Also persist asynchronously to Supabase customer_addresses
    persistCustomerLocationToSupabase(loc).catch((err) => {
      console.warn('Background Supabase address sync notice:', err);
    });
  };

  // Backwards-compatible locality selector
  const handleSelectLocation = (loc: LocationArea) => {
    const custLoc: CustomerLocation = {
      latitude: 23.3032,
      longitude: 72.3312,
      formattedAddress: `${loc.name}, Kadi, Gujarat ${loc.pincode}`,
      locality: loc.name,
      city: loc.taluka || 'Kadi',
      state: 'Gujarat',
      pincode: loc.pincode,
      source: 'search'
    };
    handleConfirmLocation(custLoc);
  };

  // Update customer profile
  const handleUpdateProfile = (profile: CustomerProfile) => {
    setCustomerProfile(profile);
    dataService.setCustomerProfile(profile);
  };

  // Flow Step 1: User clicks category from Home or Select Service
  const handleSelectCategory = async (cat: ServiceCategory) => {
    setSelectedCategory(cat);
    setCurrentScreen('CATEGORY_SERVICES');
    setIsOptionsLoading(true);
    setOptionsError(null);

    try {
      const options = await dataService.getServiceOptions(cat.id);
      setCategoryOptions(options);
    } catch (err) {
      console.warn('Failed to load options for category:', cat.id, err);
      setOptionsError('Unable to load services for this category.');
    } finally {
      setIsOptionsLoading(false);
    }
  };

  // Flow Step 2: User picks specific job (e.g., Tap Repair / Leakage)
  const handleSelectOption = (opt: ServiceOption) => {
    setSelectedOption(opt);
    setCurrentScreen('SERVICE_DETAIL');
  };

  // Flow Step 3: From Service Detail -> Find Matching Pros in Kadi
  const handleContinueToPros = async (uploadedPhotoUrl?: string) => {
    if (!selectedCategory || !selectedOption) return;
    const localityName = customerLocation?.locality || customerLocation?.city || 'Kadi';
    const pros = await dataService.getProfessionalsForCategory(selectedCategory.id, localityName);
    setMatchingProfessionals(pros);
    setCurrentScreen('MATCHING_PROS');
  };

  // Flow Step 4: User selects a professional (e.g., Ramesh Patel)
  const handleSelectProfessional = (pro: Professional) => {
    setSelectedProfessional(pro);
    setCurrentScreen('CONFIRM_DETAILS');
  };

  // Flow Step 5: User confirms booking
  const handleConfirmBooking = async (paymentMethod: 'Cash on Service' | 'Online UPI') => {
    if (!selectedCategory || !selectedOption || !selectedProfessional) return;

    const newBooking = await dataService.createBooking({
      customerName: customerProfile.name,
      customerPhone: customerProfile.phone,
      address: customerProfile.address,
      categoryId: selectedCategory.id,
      categoryName: selectedCategory.name,
      serviceOptionId: selectedOption.id,
      serviceOptionName: selectedOption.name,
      professional: selectedProfessional,
      estimatedPrice: selectedProfessional.estimatedPrice,
      paymentMethod
    });

    // Update state
    const all = await dataService.getBookings();
    setBookings(all);
    setActiveBooking(newBooking);
    setCurrentScreen('BOOKING_CONFIRMED');
  };

  // Update active booking status
  const handleUpdateStatus = async (newStatus: BookingStatus) => {
    if (!activeBooking) return;
    const updated = await dataService.updateBookingStatus(activeBooking.id, newStatus);
    if (updated) {
      setActiveBooking(updated);
      const all = await dataService.getBookings();
      setBookings(all);
    }
  };

  // Submit review
  const handleSubmitReview = async (rating: number, comment: string, tags: string[]) => {
    if (!activeBooking) return;
    await dataService.submitReview(activeBooking.id, rating, comment, tags);
    const all = await dataService.getBookings();
    setBookings(all);
  };

  // Back Button Navigation
  const handleBack = () => {
    switch (currentScreen) {
      case 'SELECT_SERVICE':
        setCurrentScreen('TAB_VIEW');
        setActiveTab('home');
        break;
      case 'CATEGORY_SERVICES':
        setCurrentScreen('SELECT_SERVICE');
        break;
      case 'SERVICE_DETAIL':
        setCurrentScreen('CATEGORY_SERVICES');
        break;
      case 'MATCHING_PROS':
        setCurrentScreen('SERVICE_DETAIL');
        break;
      case 'CONFIRM_DETAILS':
        setCurrentScreen('MATCHING_PROS');
        break;
      case 'BOOKING_CONFIRMED':
        setCurrentScreen('TAB_VIEW');
        setActiveTab('bookings');
        break;
      case 'TRACK_BOOKING':
        setCurrentScreen('TAB_VIEW');
        setActiveTab('bookings');
        break;
      case 'BOOKING_COMPLETED':
        setCurrentScreen('TAB_VIEW');
        setActiveTab('bookings');
        break;
      default:
        setCurrentScreen('TAB_VIEW');
    }
  };

  // Helper for title on header
  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'SELECT_SERVICE':
        return 'Select Service';
      case 'CATEGORY_SERVICES':
        return selectedCategory ? selectedCategory.name : 'Services';
      case 'SERVICE_DETAIL':
        return selectedOption ? selectedOption.name : 'Service Detail';
      case 'MATCHING_PROS':
        return 'Select a KaamWala';
      case 'CONFIRM_DETAILS':
        return 'Confirm Details';
      case 'BOOKING_CONFIRMED':
        return 'Booking Confirmed';
      case 'TRACK_BOOKING':
        return 'Track Your Booking';
      case 'BOOKING_COMPLETED':
        return 'Booking Completed';
      default:
        if (activeTab === 'bookings') return 'My Bookings';
        if (activeTab === 'help') return 'Help & Support';
        if (activeTab === 'profile') return 'My Profile';
        return undefined; // Home screen shows custom logo header
    }
  };

  const isSubScreen = currentScreen !== 'TAB_VIEW' || activeTab !== 'home';
  const showBottomNav = currentScreen === 'TAB_VIEW';

  const activeBookingCount = bookings.filter(
    (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  ).length;

  return (
    <div className="min-h-screen bg-[#F0F2F1] flex flex-col items-center justify-start sm:py-4">
      {/* Mobile App Viewport Container */}
      <div className="w-full sm:max-w-[420px] bg-white sm:rounded-[28px] sm:shadow-2xl sm:border sm:border-gray-200/80 min-h-screen sm:min-h-[844px] flex flex-col relative overflow-x-hidden font-['Plus_Jakarta_Sans',sans-serif]">
        
        {/* Header */}
        <Header
          title={getHeaderTitle()}
          showBack={currentScreen !== 'TAB_VIEW'}
          onBack={handleBack}
          selectedLocation={customerLocation}
          onOpenLocationModal={() => setIsLocationModalOpen(true)}
          onNavigateTab={(tab) => {
            setCurrentScreen('TAB_VIEW');
            setActiveTab(tab);
          }}
        />

        {/* Main Content View Switcher */}
        <main className="flex-1 flex flex-col">
          {currentScreen === 'TAB_VIEW' && (
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  selectedLocation={customerLocation}
                  onOpenLocationModal={() => setIsLocationModalOpen(true)}
                  categories={categories}
                  onSelectCategory={handleSelectCategory}
                  onViewAllServices={() => setCurrentScreen('SELECT_SERVICE')}
                  isLoading={isCatalogLoading}
                  error={catalogError}
                  onRetry={() => loadCategories(true)}
                />
              )}

              {activeTab === 'bookings' && (
                <BookingsListScreen
                  bookings={bookings}
                  onSelectBookingForTracking={(booking) => {
                    setActiveBooking(booking);
                    setCurrentScreen('TRACK_BOOKING');
                  }}
                  onReviewBooking={(booking) => {
                    setActiveBooking(booking);
                    setCurrentScreen('BOOKING_COMPLETED');
                  }}
                />
              )}

              {activeTab === 'help' && <HelpScreen />}

              {activeTab === 'profile' && (
                <ProfileScreen
                  profile={customerProfile}
                  onUpdateProfile={handleUpdateProfile}
                />
              )}
            </>
          )}

          {currentScreen === 'SELECT_SERVICE' && (
            <SelectServiceScreen
              categories={categories}
              onSelectCategory={handleSelectCategory}
              isLoading={isCatalogLoading}
              error={catalogError}
              onRetry={() => loadCategories(true)}
            />
          )}

          {currentScreen === 'CATEGORY_SERVICES' && selectedCategory && (
            <CategoryServicesScreen
              category={selectedCategory}
              options={categoryOptions}
              onSelectOption={handleSelectOption}
              isLoading={isOptionsLoading}
              error={optionsError}
              onRetry={() => handleSelectCategory(selectedCategory)}
            />
          )}

          {currentScreen === 'SERVICE_DETAIL' && selectedCategory && selectedOption && (
            <ServiceDetailScreen
              category={selectedCategory}
              option={selectedOption}
              onContinue={handleContinueToPros}
            />
          )}

          {currentScreen === 'MATCHING_PROS' && selectedOption && (
            <ProfessionalMatchingScreen
              location={customerLocation}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              serviceOption={selectedOption}
              professionals={matchingProfessionals}
              onSelectProfessional={handleSelectProfessional}
            />
          )}

          {currentScreen === 'CONFIRM_DETAILS' && selectedProfessional && selectedOption && (
            <ConfirmDetailsScreen
              professional={selectedProfessional}
              serviceOption={selectedOption}
              customerProfile={customerProfile}
              onUpdateProfile={handleUpdateProfile}
              onConfirmBooking={handleConfirmBooking}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
            />
          )}

          {currentScreen === 'BOOKING_CONFIRMED' && activeBooking && (
            <BookingConfirmedScreen
              booking={activeBooking}
              onTrackBooking={() => setCurrentScreen('TRACK_BOOKING')}
              onHome={() => {
                setCurrentScreen('TAB_VIEW');
                setActiveTab('bookings');
              }}
            />
          )}

          {currentScreen === 'TRACK_BOOKING' && activeBooking && (
            <BookingTrackingScreen
              booking={activeBooking}
              onUpdateStatus={handleUpdateStatus}
              onWorkCompleted={() => setCurrentScreen('BOOKING_COMPLETED')}
            />
          )}

          {currentScreen === 'BOOKING_COMPLETED' && activeBooking && (
            <BookingCompletedScreen
              booking={activeBooking}
              onSubmitReview={handleSubmitReview}
              onHome={() => {
                setCurrentScreen('TAB_VIEW');
                setActiveTab('home');
              }}
            />
          )}
        </main>

        {/* Global Bottom Navigation (Visible on Primary Tab Views) */}
        {showBottomNav && (
          <BottomNavigation
            activeTab={activeTab}
            onTabChange={(tab) => {
              setCurrentScreen('TAB_VIEW');
              setActiveTab(tab);
            }}
            activeBookingCount={activeBookingCount}
          />
        )}

        {/* Location Picker Bottom Sheet / Modal */}
        <LocationModal
          isOpen={isLocationModalOpen}
          onClose={() => setIsLocationModalOpen(false)}
          currentLocation={customerLocation}
          onConfirmLocation={handleConfirmLocation}
        />
      </div>
    </div>
  );
}
