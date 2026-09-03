import React, { useState } from 'react';
import { Check, Camera, Image as ImageIcon, X } from 'lucide-react';
import { ServiceOption, ServiceCategory } from '../../types';
import { TapGraphic, TrustRow } from '../common/Illustrations';
import { renderCategoryIcon } from '../../lib/iconMap';
import { formatPricingDisplay } from '../../services/catalogService';

interface ServiceDetailScreenProps {
  category: ServiceCategory;
  option: ServiceOption;
  onContinue: (uploadedPhotoUrl?: string) => void;
}

export const ServiceDetailScreen: React.FC<ServiceDetailScreenProps> = ({
  category,
  option,
  onContinue
}) => {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const formattedPrice = formatPricingDisplay(option);

  return (
    <div className="pb-28 animate-in fade-in duration-150 px-5 pt-2">
      {/* Visual Illustration Container */}
      <div className="flex flex-col items-center justify-center py-2">
        {category.id === 'plumbing' && (option.id?.includes('tap') || option.name?.toLowerCase().includes('tap')) ? (
          <TapGraphic className="w-44 h-44" />
        ) : (
          <div
            className="w-24 h-24 rounded-3xl flex items-center justify-center my-3 shadow-xs"
            style={{ backgroundColor: category.bgTint, color: category.iconColor }}
          >
            {renderCategoryIcon(category.iconName, 'w-12 h-12')}
          </div>
        )}
      </div>

      {/* Service Title */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-extrabold text-[#111817]">{option.name}</h2>
        {option.description && (
          <p className="text-xs text-[#66706D] mt-1 max-w-xs mx-auto">
            {option.description}
          </p>
        )}
      </div>

      {/* Service Includes */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <h3 className="text-sm font-bold text-[#111817] mb-2.5">Service Includes</h3>
        <div className="space-y-2">
          {option.includes.map((inc, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-[#111817] font-medium">
              <Check className="w-4 h-4 text-[#075B43] stroke-[2.5] shrink-0" />
              <span>{inc}</span>
            </div>
          ))}
          {option.excludes.map((exc, i) => (
            <div key={i} className="flex items-center gap-2.5 text-xs text-[#66706D]">
              <Check className="w-4 h-4 text-[#66706D] stroke-[2] shrink-0" />
              <span>{exc}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Estimated Price Card */}
      <div className="bg-[#FAFAF7] p-4 rounded-xl border border-[#E7E9E6] mb-4">
        <div className="text-xs text-[#66706D] font-medium">Estimated Price</div>
        <div className="text-2xl font-extrabold text-[#111817] mt-0.5">
          {formattedPrice || 'Inspection & quote'}
        </div>
        <div className="text-[11px] text-[#66706D] mt-1">
          Final price may vary depending on the work required.
        </div>
      </div>

      {/* Trust Row */}
      <div className="mb-4">
        <TrustRow variant="detail" />
      </div>

      {/* Optional Photo Upload */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E7E9E6] shadow-2xs mb-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs font-bold text-[#111817]">Upload a photo (Optional)</div>
            <div className="text-[11px] text-[#66706D]">Helps the professional understand the problem</div>
          </div>
          <label className="cursor-pointer py-1.5 px-3 bg-gray-50 border border-gray-200 hover:bg-gray-100 rounded-lg text-xs font-semibold text-[#075B43] flex items-center gap-1.5 transition-colors">
            <Camera className="w-3.5 h-3.5" />
            <span>Upload</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </label>
        </div>

        {photoUrl && (
          <div className="mt-2.5 relative inline-block">
            <img
              src={photoUrl}
              alt="Uploaded issue"
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
            <button
              onClick={() => setPhotoUrl(null)}
              className="absolute -top-1.5 -right-1.5 bg-black text-white rounded-full p-0.5 shadow-sm"
              aria-label="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Fixed / Sticky Bottom CTA Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E7E9E6] z-30">
        <div className="max-w-md mx-auto">
          <button
            id="service-detail-continue-btn"
            onClick={() => onContinue(photoUrl || undefined)}
            className="w-full py-3.5 px-4 bg-[#F5B51B] hover:bg-[#E5A817] active:scale-[0.99] text-[#111817] font-bold text-base rounded-xl transition-all shadow-xs flex items-center justify-center"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
};
