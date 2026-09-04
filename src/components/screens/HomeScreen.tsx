import React from 'react';
import { MapPin, AlertCircle, RefreshCw, ShieldCheck } from 'lucide-react';
import { LocationArea, CustomerLocation, ServiceCategory } from '../../types';
import { TrustRow } from '../common/Illustrations';
import { renderCategoryIcon } from '../../lib/iconMap';
import { formatPricingDisplay } from '../../services/catalogService';

interface HomeScreenProps {
  selectedLocation?: LocationArea | CustomerLocation | null;
  onOpenLocationModal: () => void;
  categories: ServiceCategory[];
  onSelectCategory: (category: ServiceCategory) => void;
  onViewAllServices: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  selectedLocation,
  onOpenLocationModal,
  categories = [],
  onSelectCategory,
  onViewAllServices,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const safeCategories = Array.isArray(categories) ? categories : [];
  // Requirement 8: Show the first 6 active categories according to display_order
  const popularCategories = safeCategories.slice(0, 6);
  const displayLocation = selectedLocation
    ? 'formattedAddress' in selectedLocation
      ? selectedLocation.locality || selectedLocation.city || selectedLocation.formattedAddress.split(',')[0]
      : selectedLocation.name
    : null;

  return (
    <div className="pb-24 animate-in fade-in duration-150">
      {/* Hero Section */}
      <div className="px-5 pt-4 pb-5">
        <h1 className="text-[28px] sm:text-[32px] font-extrabold tracking-tight text-[#111817] leading-[1.18]">
          Ghar ka<br />
          koi bhi kaam?<br />
          <span className="text-[#F5B51B]">KaamWala bulao.</span>
        </h1>
        <p className="text-[#66706D] text-sm mt-2 font-medium">
          Trusted local professionals, right near you.
        </p>

        {/* Location Selector Bar */}
        <div className="mt-4 p-3 bg-white border border-[#E7E9E6] rounded-xl flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <MapPin className={`w-4 h-4 shrink-0 ${displayLocation ? 'text-[#075B43]' : 'text-gray-400'}`} />
            <span className="text-sm font-semibold text-[#111817] truncate">
              {displayLocation ? `${displayLocation}` : 'Select your location'}
            </span>
          </div>
          <button
            id="home-change-location-btn"
            onClick={onOpenLocationModal}
            className="text-xs font-bold text-[#075B43] hover:underline shrink-0 ml-2"
          >
            {displayLocation ? 'Change' : 'Set Location'}
          </button>
        </div>

        {/* Primary CTA Button: Yellow / Gold */}
        <button
          id="home-find-kaamwala-btn"
          onClick={onViewAllServices}
          className="w-full mt-3 py-3.5 px-4 bg-[#F5B51B] hover:bg-[#E5A817] active:scale-[0.99] text-[#111817] font-bold text-base rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
        >
          Find a KaamWala
        </button>

        {/* Trust Row */}
        <div className="mt-4">
          <TrustRow variant="home" />
        </div>
      </div>

      {/* Popular Services Grid */}
      <div className="px-5 mt-2">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold text-[#111817]">Popular Services</h2>
          <button
            id="view-all-services-link"
            onClick={onViewAllServices}
            className="text-xs font-bold text-[#075B43] hover:underline"
          >
            View all
          </button>
        </div>

        {/* Loading State Skeleton */}
        {isLoading && (
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="bg-white p-3 rounded-xl border border-[#E7E9E6] flex flex-col items-center justify-center text-center animate-pulse shadow-2xs"
              >
                <div className="w-12 h-12 rounded-xl bg-gray-100 mb-2" />
                <div className="h-3 bg-gray-200 rounded w-16 mb-1.5" />
                <div className="h-2.5 bg-gray-100 rounded w-10" />
              </div>
            ))}
          </div>
        )}

        {/* Error State with Retry Button */}
        {!isLoading && error && popularCategories.length === 0 && (
          <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-3.5 text-center shadow-2xs">
            <div className="flex items-center justify-center gap-1.5 text-red-800 text-xs font-semibold mb-1">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>Unable to load services right now.</span>
            </div>
            <p className="text-[11px] text-red-600 mb-2">Please check your connection or try again.</p>
            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#075B43] bg-white border border-[#075B43] rounded-lg px-3 py-1 hover:bg-emerald-50 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry</span>
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !error && popularCategories.length === 0 && (
          <div className="bg-white border border-[#E7E9E6] rounded-xl p-5 text-center shadow-2xs">
            <p className="text-xs font-medium text-gray-500">No active services currently available in Kadi.</p>
          </div>
        )}

        {/* 6 Grid items matching reference layout */}
        {!isLoading && popularCategories.length > 0 && (
          <div className="grid grid-cols-3 gap-2.5">
            {popularCategories.map((cat) => {
              const priceLabel = formatPricingDisplay({
                startingPrice: cat.startingPrice,
                starting_price: cat.startingPrice
              });

              return (
                <button
                  key={cat.id}
                  id={`service-cat-${cat.id}`}
                  onClick={() => onSelectCategory(cat)}
                  className="bg-white p-3 rounded-xl border border-[#E7E9E6] flex flex-col items-center justify-center text-center hover:border-[#075B43] active:scale-95 transition-all shadow-2xs group"
                >
                  {/* Soft tint background container for icon */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center mb-2 transition-transform group-hover:scale-105"
                    style={{ backgroundColor: cat.bgTint }}
                  >
                    <div style={{ color: cat.iconColor }}>
                      {renderCategoryIcon(cat.iconName, 'w-6 h-6')}
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#111817] leading-tight line-clamp-1">
                    {cat.name}
                  </span>
                  {priceLabel && (
                    <span className="text-[10px] text-[#66706D] font-medium mt-0.5">
                      {priceLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* How it works Section */}
      <div className="px-5 mt-7">
        <div className="p-4 bg-white rounded-2xl border border-[#E7E9E6] shadow-2xs">
          <h3 className="text-sm font-bold text-[#111817] mb-3">How it works</h3>
          <div className="space-y-3">
            {[
              { step: '1', title: 'Set your location', desc: 'Enter your doorstep address or use GPS in Kadi' },
              { step: '2', title: 'Select service & job', desc: 'Pick the exact home repair or maintenance task' },
              { step: '3', title: 'Describe problem', desc: 'Add optional notes or a photo to help the technician' },
              { step: '4', title: 'Enter details', desc: 'Simple name & phone — no password or OTP required' },
              { step: '5', title: 'Doorstep service', desc: 'Our team visits your home; pay cash after work is done' }
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#075B43]/10 text-[#075B43] font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                  {item.step}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#111817]">{item.title}</h4>
                  <p className="text-[11px] text-[#66706D]">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Local Kadi Trust Badge */}
      <div className="px-5 mt-4">
        <div className="p-3.5 bg-[#075B43]/5 border border-[#075B43]/15 rounded-xl flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#075B43] text-white flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-[#075B43]">Kadi Verified Network</div>
            <p className="text-[11px] text-[#66706D] leading-tight mt-0.5">
              Every technician is physically vetted by our Kadi operations desk.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
