/**
 * KaamWala - Hyperlocal Home Services Platform for Kadi, Gujarat
 * Simplified customer service-request flow with Supabase integration and no Google Maps dependency.
 */

import React, { useState, useEffect } from 'react';
import {
  CustomerLocation,
  CustomerProfile,
  LocationArea,
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
import { CustomerServiceRequest } from './services/requestService';
import { resolveServiceOptionUuid } from './data/serviceCatalogUuids';
import { Header } from './components/common/Header';
import { BottomNavigation, NavTab } from './components/common/BottomNavigation';
import { LocationModal } from './components/common/LocationModal';

// Screens
import { HomeScreen } from './components/screens/HomeScreen';
import { SelectServiceScreen } from './components/screens/SelectServiceScreen';
import { CategoryServicesScreen } from './components/screens/CategoryServicesScreen';
import { RequestServiceScreen } from './components/screens/RequestServiceScreen';
import { BookingConfirmedScreen } from './components/screens/BookingConfirmedScreen';
import { BookingsListScreen } from './components/screens/BookingsListScreen';
import { HelpScreen } from './components/screens/HelpScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';

type FlowScreen =
  | 'TAB_VIEW'
  | 'SELECT_SERVICE'
  | 'CATEGORY_SERVICES'
  | 'REQUEST_SERVICE'
  | 'REQUEST_RECEIVED';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentScreen, setCurrentScreen] = useState<FlowScreen>('TAB_VIEW');

  // Customer Location (Saved locally / in Supabase, with browser GPS or manual address)
  const [customerLocation, setCustomerLocation] = useState<CustomerLocation | null>(() => {
    return getSavedCustomerLocation();
  });
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  // Customer Profile
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>(() => {
    try {
      const prof = dataService.getCustomerProfile();
      if (prof && prof.name) return prof;
    } catch {}
    return DEFAULT_CUSTOMER;
  });

  // Service Catalog Categories from Supabase service_categories
  const [categories, setCategories] = useState<ServiceCategory[]>(() => {
    try {
      return dataService.getCategoriesSync();
    } catch {
      return [];
    }
  });
  const [isCatalogLoading, setIsCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);

  // Active Flow Selection State
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [categoryOptions, setCategoryOptions] = useState<ServiceOption[]>([]);
  const [isOptionsLoading, setIsOptionsLoading] = useState(false);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [selectedOption, setSelectedOption] = useState<ServiceOption | null>(null);

  // Completed Service Request State (for Step 7 Success screen)
  const [submittedRequest, setSubmittedRequest] = useState<CustomerServiceRequest | null>(null);

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

  useEffect(() => {
    loadCategories(false);
  }, []);

  // Safe navigation recovery
  useEffect(() => {
    if (currentScreen === 'CATEGORY_SERVICES' && !selectedCategory) {
      setCurrentScreen('TAB_VIEW');
    } else if (currentScreen === 'REQUEST_SERVICE' && (!selectedCategory || !selectedOption)) {
      setCurrentScreen('TAB_VIEW');
    } else if (currentScreen === 'REQUEST_RECEIVED' && !submittedRequest) {
      setCurrentScreen('TAB_VIEW');
    }
  }, [currentScreen, selectedCategory, selectedOption, submittedRequest]);

  // Update customer location
  const handleConfirmLocation = (loc: CustomerLocation) => {
    setCustomerLocation(loc);
    saveCustomerLocationLocally(loc);

    // Synchronize customer profile address so request forms auto-fill
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

  // Update customer profile
  const handleUpdateProfile = (profile: CustomerProfile) => {
    setCustomerProfile(profile);
    dataService.setCustomerProfile(profile);
  };

  // Flow Step 2: User clicks category from Home or Select Service
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

  // Flow Step 3: User picks specific job (e.g. Tap Repair / Leakage)
  const handleSelectOption = (opt: ServiceOption) => {
    const optionUuid = resolveServiceOptionUuid(opt.id);
    setSelectedOption({
      ...opt,
      id: optionUuid
    });
    setCurrentScreen('REQUEST_SERVICE');
  };

  // Flow Step 6 -> 7: Request submitted successfully
  const handleRequestSubmitted = (req: CustomerServiceRequest) => {
    setSubmittedRequest(req);
    setCurrentScreen('REQUEST_RECEIVED');
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
      case 'REQUEST_SERVICE':
        setCurrentScreen('CATEGORY_SERVICES');
        break;
      case 'REQUEST_RECEIVED':
        setCurrentScreen('TAB_VIEW');
        setActiveTab('bookings');
        break;
      default:
        setCurrentScreen('TAB_VIEW');
    }
  };

  // Header Title
  const getHeaderTitle = () => {
    switch (currentScreen) {
      case 'SELECT_SERVICE':
        return 'Select Service';
      case 'CATEGORY_SERVICES':
        return selectedCategory ? selectedCategory.name : 'Services';
      case 'REQUEST_SERVICE':
        return selectedOption ? selectedOption.name : 'Request Service';
      case 'REQUEST_RECEIVED':
        return 'Request Received';
      default:
        if (activeTab === 'bookings') return 'My Requests';
        if (activeTab === 'help') return 'Help & Support';
        if (activeTab === 'profile') return 'My Profile';
        return undefined; // Home screen shows custom logo header
    }
  };

  const showBottomNav = currentScreen === 'TAB_VIEW';

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
                  customerPhone={customerProfile.phone}
                  onNewRequest={() => {
                    setCurrentScreen('SELECT_SERVICE');
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

          {currentScreen === 'REQUEST_SERVICE' && selectedCategory && selectedOption && (
            <RequestServiceScreen
              category={selectedCategory}
              option={selectedOption}
              customerLocation={customerLocation}
              onOpenLocationModal={() => setIsLocationModalOpen(true)}
              onRequestSubmitted={handleRequestSubmitted}
              customerProfile={customerProfile}
              onUpdateProfile={handleUpdateProfile}
            />
          )}

          {currentScreen === 'REQUEST_RECEIVED' && submittedRequest && (
            <BookingConfirmedScreen
              request={submittedRequest}
              onViewRequests={() => {
                setCurrentScreen('TAB_VIEW');
                setActiveTab('bookings');
              }}
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
