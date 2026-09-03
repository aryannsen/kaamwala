import React from 'react';
import { ChevronRight, Shield, AlertCircle, RefreshCw } from 'lucide-react';
import { ServiceCategory, ServiceOption } from '../../types';
import { renderCategoryIcon } from '../../lib/iconMap';
import { formatPricingDisplay } from '../../services/catalogService';

interface CategoryServicesScreenProps {
  category: ServiceCategory;
  options: ServiceOption[];
  onSelectOption: (option: ServiceOption) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const CategoryServicesScreen: React.FC<CategoryServicesScreenProps> = ({
  category,
  options = [],
  onSelectOption,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const safeOptions = Array.isArray(options) ? options : [];

  return (
    <div className="pb-24 animate-in fade-in duration-150 px-5 pt-3">
      {/* Top Banner Card in Dark Forest Green */}
      <div className="bg-[#075B43] text-white p-3.5 rounded-xl shadow-2xs mb-4 flex items-center justify-between">
        <div>
          <div className="font-bold text-sm tracking-tight">
            Trusted {category.name.toLowerCase()} experts near you
          </div>
          <div className="text-[11px] text-emerald-100 mt-0.5 flex items-center gap-2">
            <span>Quick response</span>
            <span>•</span>
            <span>On-time service in Kadi</span>
          </div>
        </div>
        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
          <Shield className="w-4 h-4 text-[#F5B51B]" />
        </div>
      </div>

      {/* Section Header */}
      <h2 className="text-base font-bold text-[#111817] mb-3">What do you need?</h2>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-2.5">
          {[1, 2, 3, 4].map((idx) => (
            <div
              key={idx}
              className="w-full bg-white p-3.5 rounded-xl border border-[#E7E9E6] flex items-center justify-between animate-pulse shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-gray-100 shrink-0" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-36 mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-24" />
                </div>
              </div>
              <div className="w-4 h-4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {!isLoading && error && safeOptions.length === 0 && (
        <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-5 text-center shadow-2xs my-4">
          <div className="flex items-center justify-center gap-1.5 text-red-800 text-sm font-semibold mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Unable to load services for {category.name}</span>
          </div>
          <p className="text-xs text-red-600 mb-3">Please check your connection and try again.</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-[#075B43] hover:bg-[#064e3b] rounded-lg px-4 py-2 transition-colors shadow-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && safeOptions.length === 0 && (
        <div className="py-8 text-center text-gray-500 text-sm bg-white rounded-xl border border-gray-200 p-6 shadow-2xs">
          <p className="font-semibold text-gray-700">No services currently listed in {category.name}</p>
          <p className="text-xs text-gray-400 mt-1">Our team in Kadi is onboarding new options.</p>
        </div>
      )}

      {/* Options List */}
      {!isLoading && safeOptions.length > 0 && (
        <div className="space-y-2.5">
          {safeOptions.map((opt) => {
            const priceLabel = formatPricingDisplay(opt);

            return (
              <button
                key={opt.id}
                id={`service-opt-${opt.id}`}
                onClick={() => onSelectOption(opt)}
                className="w-full bg-white p-3.5 rounded-xl border border-[#E7E9E6] flex items-center justify-between hover:border-[#075B43] active:bg-gray-50 transition-all shadow-2xs group text-left"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: category.bgTint, color: category.iconColor }}
                  >
                    {renderCategoryIcon(category.iconName, 'w-4 h-4')}
                  </div>

                  <div className="pr-2">
                    <div className="text-[14px] font-bold text-[#111817] group-hover:text-[#075B43] transition-colors">
                      {opt.name}
                    </div>
                    {opt.description && (
                      <div className="text-[11px] text-[#66706D] line-clamp-1 mt-0.5">
                        {opt.description}
                      </div>
                    )}
                    {priceLabel && (
                      <div className="text-xs text-[#075B43] font-semibold mt-0.5">
                        {priceLabel}
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#075B43] group-hover:translate-x-0.5 transition-all shrink-0" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
