import React, { useState, useEffect } from 'react';
import {
  FileText,
  MapPin,
  Calendar,
  Banknote,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { CustomerServiceRequest, fetchCustomerRequests } from '../../services/requestService';

interface BookingsListScreenProps {
  onNewRequest: () => void;
  customerPhone?: string;
}

export const BookingsListScreen: React.FC<BookingsListScreenProps> = ({
  onNewRequest,
  customerPhone
}) => {
  const [requests, setRequests] = useState<CustomerServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await fetchCustomerRequests(customerPhone);
      setRequests(data);
      if (fetchErr) {
        // If there was a database notice (e.g. RLS), we show data from local storage
        console.warn('Notice loading requests from Supabase:', fetchErr);
      }
    } catch (err: any) {
      setError('Unable to load service requests.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [customerPhone]);

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Recent';
    }
  };

  return (
    <div className="pb-28 animate-in fade-in duration-150 px-5 pt-3">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-extrabold text-[#111817]">My Service Requests</h2>
          <p className="text-xs text-[#66706D] mt-0.5">
            Real-time status of your requested home services
          </p>
        </div>
        <button
          onClick={loadRequests}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-black transition-colors cursor-pointer"
          title="Refresh requests"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#075B43]' : ''}`} />
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-[#E7E9E6] animate-pulse space-y-2.5 shadow-2xs"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-5 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadRequests}
            className="text-xs font-bold text-red-700 underline"
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && requests.length === 0 && (
        <div className="bg-white rounded-2xl border border-[#E7E9E6] p-8 text-center shadow-2xs my-6">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#075B43] flex items-center justify-center mx-auto mb-3">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-[#111817]">No service requests yet</h3>
          <p className="text-xs text-[#66706D] mt-1 max-w-xs mx-auto leading-relaxed">
            When you request a plumber, electrician, or other home service, it will appear here.
          </p>
          <button
            onClick={onNewRequest}
            className="mt-4 inline-flex items-center gap-2 py-2.5 px-4 bg-[#075B43] hover:bg-[#054432] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Book a Service</span>
          </button>
        </div>
      )}

      {/* Requests List */}
      {!isLoading && requests.length > 0 && (
        <div className="space-y-3.5">
          {requests.map((req) => {
            const priceText =
              req.estimatedMinPrice === req.estimatedMaxPrice
                ? `₹${req.estimatedMinPrice}`
                : `₹${req.estimatedMinPrice} – ₹${req.estimatedMaxPrice}`;

            return (
              <div
                key={req.id}
                className="bg-white rounded-xl border border-[#E7E9E6] p-4 shadow-2xs hover:border-[#075B43] transition-all"
              >
                {/* Top Row: Category & Status */}
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                      {req.categoryName}
                    </span>
                    <h3 className="text-sm font-bold text-[#111817] mt-0.5">
                      {req.serviceOptionName}
                    </h3>
                  </div>

                  {/* Real Status Badge (e.g. Requested) */}
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 capitalize flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-600" />
                    {req.status}
                  </span>
                </div>

                {/* Estimated Price */}
                <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">Estimated Price:</span>
                  <span className="font-extrabold text-[#111817]">{priceText}</span>
                </div>

                {/* Address */}
                <div className="mt-2 flex items-start gap-2 text-xs text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-[#075B43] shrink-0 mt-0.5" />
                  <span className="line-clamp-2 leading-snug">{req.address}</span>
                </div>

                {/* Date and Payment */}
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#66706D]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{formatDate(req.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 font-medium text-emerald-800">
                    <Banknote className="w-3 h-3 text-[#075B43]" />
                    <span>Cash on Service</span>
                  </div>
                </div>

                {/* Problem note if exists */}
                {req.problemDescription && (
                  <div className="mt-2.5 p-2 bg-gray-50 rounded-lg border border-gray-100 text-[11px] text-gray-600">
                    <strong className="text-gray-700 font-semibold">Note: </strong>
                    {req.problemDescription}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
