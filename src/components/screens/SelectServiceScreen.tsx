import React, { useState } from 'react';
import { Search, ChevronRight, AlertCircle, RefreshCw } from 'lucide-react';
import { ServiceCategory } from '../../types';
import { renderCategoryIcon } from '../../lib/iconMap';
import { formatPricingDisplay } from '../../services/catalogService';

interface SelectServiceScreenProps {
  categories: ServiceCategory[];
  onSelectCategory: (category: ServiceCategory) => void;
  isLoading?: boolean;
  error?: string | null;
  onRetry?: () => void;
}

export const SelectServiceScreen: React.FC<SelectServiceScreenProps> = ({
  categories = [],
  onSelectCategory,
  isLoading = false,
  error = null,
  onRetry
}) => {
  const [query, setQuery] = useState('');

  const safeCategories = Array.isArray(categories) ? categories : [];
  const filtered = safeCategories.filter(
    (c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      (c.tagline && c.tagline.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div className="pb-24 animate-in fade-in duration-150 px-5 pt-3">
      {/* Search Field */}
      <div className="relative mb-4">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a service..."
          disabled={isLoading}
          className="w-full pl-10 pr-4 py-3 bg-white border border-[#E7E9E6] rounded-xl text-sm focus:outline-none focus:border-[#075B43] transition-colors shadow-2xs placeholder:text-gray-400 disabled:bg-gray-50"
          autoFocus={false}
        />
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-2.5">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="w-full bg-white p-3.5 rounded-xl border border-[#E7E9E6] flex items-center justify-between animate-pulse shadow-2xs"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-gray-100 shrink-0" />
                <div>
                  <div className="h-4 bg-gray-200 rounded w-28 mb-1.5" />
                  <div className="h-3 bg-gray-100 rounded w-20" />
                </div>
              </div>
              <div className="w-4 h-4 bg-gray-100 rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Error State with Retry Button */}
      {!isLoading && error && safeCategories.length === 0 && (
        <div className="bg-[#FEF2F2] border border-red-200 rounded-xl p-5 text-center shadow-2xs my-4">
          <div className="flex items-center justify-center gap-1.5 text-red-800 text-sm font-semibold mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" />
            <span>Unable to load service catalog</span>
          </div>
          <p className="text-xs text-red-600 mb-3">Please check your connection or try again.</p>
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

      {/* Empty Database State */}
      {!isLoading && !error && safeCategories.length === 0 && (
        <div className="py-12 text-center text-gray-500 text-sm">
          <p className="font-semibold text-gray-700">No active services in catalog</p>
          <p className="text-xs text-gray-400 mt-1">Please check back soon.</p>
        </div>
      )}

      {/* Services List */}
      {!isLoading && safeCategories.length > 0 && (
        <div className="space-y-2.5">
          {filtered.map((cat) => {
            const priceLabel = formatPricingDisplay({
              startingPrice: cat.startingPrice,
              starting_price: cat.startingPrice
            });

            return (
              <button
                key={cat.id}
                id={`service-list-item-${cat.id}`}
                onClick={() => onSelectCategory(cat)}
                className="w-full bg-white p-3.5 rounded-xl border border-[#E7E9E6] flex items-center justify-between hover:border-[#075B43] active:bg-gray-50 transition-all shadow-2xs group text-left"
              >
                <div className="flex items-center gap-3.5">
                  {/* Category Icon */}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: cat.bgTint, color: cat.iconColor }}
                  >
                    {renderCategoryIcon(cat.iconName, 'w-5 h-5')}
                  </div>

                  <div>
                    <div className="text-[15px] font-bold text-[#111817] group-hover:text-[#075B43] transition-colors">
                      {cat.name}
                    </div>
                    {priceLabel && (
                      <div className="text-xs text-[#66706D] font-medium">
                        {priceLabel}
                      </div>
                    )}
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#075B43] group-hover:translate-x-0.5 transition-all" />
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center text-gray-500 text-sm">
              <p className="font-semibold text-gray-700">No services match "{query}"</p>
              <p className="text-xs text-gray-400 mt-1">Try searching for plumbing, electrical, or ac.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
