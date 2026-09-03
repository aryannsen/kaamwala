import React from 'react';
import { MapPin, ShieldCheck, Star, Clock, CheckCircle } from 'lucide-react';
import { LocationArea, CustomerLocation, Professional, ServiceOption } from '../../types';

interface ProfessionalMatchingScreenProps {
  location?: LocationArea | CustomerLocation | null;
  onOpenLocationModal: () => void;
  serviceOption: ServiceOption;
  professionals: Professional[];
  onSelectProfessional: (professional: Professional) => void;
}

export const ProfessionalMatchingScreen: React.FC<ProfessionalMatchingScreenProps> = ({
  location,
  onOpenLocationModal,
  serviceOption,
  professionals,
  onSelectProfessional
}) => {
  const displayLocation = location
    ? 'formattedAddress' in location
      ? location.locality || location.city || location.formattedAddress.split(',')[0]
      : location.name
    : null;

  return (
    <div className="pb-24 animate-in fade-in duration-150 px-5 pt-2">
      {/* Location Bar */}
      <div className="p-3 bg-white border border-[#E7E9E6] rounded-xl flex items-center justify-between shadow-2xs mb-4">
        <div className="flex items-center gap-2 overflow-hidden">
          <MapPin className={`w-4 h-4 shrink-0 ${displayLocation ? 'text-[#075B43]' : 'text-gray-400'}`} />
          <div className="text-xs">
            <span className="text-gray-400 block text-[10px]">Your Service Location</span>
            <span className="font-bold text-[#111817] truncate block">
              {displayLocation ? `${displayLocation}` : 'Select your location'}
            </span>
          </div>
        </div>
        <button
          id="matching-change-location-btn"
          onClick={onOpenLocationModal}
          className="text-xs font-bold text-[#075B43] hover:underline shrink-0"
        >
          {displayLocation ? 'Change' : 'Set Location'}
        </button>
      </div>

      {/* List of KaamWalas */}
      <div className="space-y-4">
        {professionals.map((pro, index) => {
          const isBestMatch = pro.badge === 'Best Match' || index === 0;

          return (
            <div key={pro.id} className="relative">
              {/* "Best Match" pill badge matching reference */}
              {isBestMatch && (
                <div className="mb-1.5 flex items-center gap-1 text-[11px] font-bold text-[#CA8A04] tracking-wide">
                  <Star className="w-3.5 h-3.5 fill-[#CA8A04]" />
                  <span>Best Match</span>
                </div>
              )}

              {/* Professional Card */}
              <div
                className={`bg-white rounded-2xl border p-4 shadow-2xs relative transition-all ${
                  isBestMatch
                    ? 'border-[#F5B51B] ring-1 ring-[#F5B51B]/20'
                    : 'border-[#E7E9E6]'
                }`}
              >
                {/* Star rating badge on top-left of image */}
                <div className="flex items-start gap-3.5">
                  <div className="relative shrink-0">
                    <img
                      src={pro.photo}
                      alt={pro.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    {/* Star badge chip */}
                    <div className="absolute -top-1 -left-1 bg-[#F5B51B] text-[#111817] font-extrabold text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
                      <span>★</span>
                      <span>{pro.rating}</span>
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Name and Verified Badge */}
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-[#111817] truncate">
                        {pro.name}
                      </h3>
                      {pro.verified && (
                        <div className="flex items-center gap-0.5 text-[11px] font-semibold text-[#075B43] bg-[#075B43]/10 px-1.5 py-0.5 rounded">
                          <ShieldCheck className="w-3 h-3" />
                          <span>Verified</span>
                        </div>
                      )}
                    </div>

                    {/* Experience */}
                    <div className="text-xs text-[#66706D] font-medium mt-0.5">
                      {pro.experienceYears}+ years experience
                    </div>

                    {/* Distance & Reviews */}
                    <div className="flex items-center gap-3 text-xs text-[#66706D] mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        {pro.distanceKm} km away
                      </span>
                      <span>•</span>
                      <span>
                        ★ {pro.rating} ({pro.reviewCount} reviews)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Confirmed ETA Status */}
                <div className="mt-3 py-1.5 px-2.5 bg-emerald-50 rounded-lg flex items-center gap-1.5 text-xs font-semibold text-[#075B43]">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
                  <span>Arrives in {pro.arrivalEtaMinutes}</span>
                </div>

                {/* Price and Action button */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <div className="text-xl font-extrabold text-[#111817]">
                      ₹{pro.estimatedPrice}
                    </div>
                    <div className="text-[10px] text-[#66706D] font-medium">
                      Estimated Price
                    </div>
                  </div>

                  <button
                    id={`select-pro-${pro.id}`}
                    onClick={() => onSelectProfessional(pro)}
                    className="py-2.5 px-5 bg-[#075B43] hover:bg-[#064635] active:scale-95 text-white font-bold text-xs rounded-xl transition-all shadow-xs"
                  >
                    Select & Continue
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
