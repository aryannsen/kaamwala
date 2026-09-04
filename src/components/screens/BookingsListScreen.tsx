import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  MapPin,
  Calendar,
  Banknote,
  RefreshCw,
  PlusCircle,
  AlertCircle,
  Clock,
  User,
  Star,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  CustomerServiceRequest,
  fetchCustomerRequests,
  refreshCustomerRequest,
  getRequestStatusDisplay,
  formatEtaDisplay
} from '../../services/requestService';

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
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);
  const [refreshingId, setRefreshingId] = useState<string | null>(null);
  const [cardNotices, setCardNotices] = useState<Record<string, string>>({});

  const loadRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: fetchErr } = await fetchCustomerRequests(customerPhone);
      setRequests(data);
      if (fetchErr) {
        console.warn('Notice synchronizing requests from Supabase:', fetchErr);
        setError('Unable to refresh request status. Please try again.');
      }
    } catch {
      setError('Unable to refresh request status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [customerPhone]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  // Refresh single request status from Supabase
  const handleRefreshSingle = async (req: CustomerServiceRequest, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!req.bookingCode || !req.customerPhone) {
      setCardNotices((prev) => ({
        ...prev,
        [req.id]: 'Booking details unavailable'
      }));
      return;
    }

    setRefreshingId(req.id);
    setCardNotices((prev) => {
      const copy = { ...prev };
      delete copy[req.id];
      return copy;
    });

    try {
      const res = await refreshCustomerRequest(req.bookingCode, req.customerPhone);
      if (res.success && res.request) {
        const updatedReq = res.request;
        setRequests((prev) =>
          prev.map((r) => (r.id === req.id || r.bookingCode === req.bookingCode ? updatedReq : r))
        );
      } else {
        setCardNotices((prev) => ({
          ...prev,
          [req.id]: res.error || 'Unable to refresh request status. Please try again.'
        }));
      }
    } catch {
      setCardNotices((prev) => ({
        ...prev,
        [req.id]: 'Unable to refresh request status. Please try again.'
      }));
    } finally {
      setRefreshingId(null);
    }
  };

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

  const toggleExpand = (id: string) => {
    setExpandedRequestId((prev) => (prev === id ? null : id));
  };

  // Price rendering strictly adhering to Step 7.1 rules:
  // 1. confirmedPrice
  // 2. estimatedPrice
  // 3. "To be confirmed upon inspection"
  // NEVER fallback to catalog price, estimatedMinPrice, estimatedMaxPrice, or ₹0
  const renderPriceText = (req: CustomerServiceRequest) => {
    if (req.confirmedPrice !== null && req.confirmedPrice !== undefined) {
      return (
        <span className="font-extrabold text-[#075B43]">
          Confirmed: ₹{req.confirmedPrice}
        </span>
      );
    }

    if (req.estimatedPrice !== null && req.estimatedPrice !== undefined) {
      return (
        <span className="font-extrabold text-[#111817]">
          Estimated: ₹{req.estimatedPrice}
        </span>
      );
    }

    return (
      <span className="font-medium text-gray-500 text-[11px]">
        To be confirmed upon inspection
      </span>
    );
  };

  return (
    <div className="pb-28 animate-in fade-in duration-150 px-5 pt-3">
      {/* Header Row */}
      <div className="flex items-center justify-between mb-3.5">
        <div>
          <h2 className="text-lg font-extrabold text-[#111817]">My Service Requests</h2>
          <p className="text-xs text-[#66706D] mt-0.5">
            Status of your home service requests in Kadi
          </p>
        </div>
        <button
          onClick={loadRequests}
          disabled={isLoading}
          className="p-2 hover:bg-gray-100 rounded-xl text-gray-500 hover:text-black transition-colors cursor-pointer"
          title="Refresh requests from server"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-[#075B43]' : ''}`} />
        </button>
      </div>

      {/* Loading Skeleton */}
      {isLoading && (
        <div className="space-y-3">
          <div className="text-xs text-gray-500 flex items-center gap-1.5 py-1">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#075B43]" />
            <span>Loading request status...</span>
          </div>
          {[1, 2].map((idx) => (
            <div
              key={idx}
              className="bg-white p-4 rounded-xl border border-[#E7E9E6] animate-pulse space-y-2.5 shadow-2xs"
            >
              <div className="flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/3" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
              <div className="h-5 bg-gray-100 rounded w-2/3" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            onClick={loadRequests}
            className="text-xs font-bold text-red-700 underline cursor-pointer"
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
            className="mt-4 inline-flex items-center gap-2 py-2.5 px-4 bg-[#075B43] hover:bg-[#054432] text-white rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer min-h-[44px]"
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
            const statusConfig = getRequestStatusDisplay(req.status);
            const isExpanded = expandedRequestId === req.id;
            const isRefreshingThis = refreshingId === req.id;
            const cardNotice = cardNotices[req.id];
            const formattedEta = formatEtaDisplay(req.estimatedArrivalAt);

            return (
              <div
                key={req.id}
                onClick={() => toggleExpand(req.id)}
                className={`bg-white rounded-xl border p-4 shadow-2xs transition-all cursor-pointer ${
                  isExpanded ? 'border-[#075B43] ring-1 ring-[#075B43]/20' : 'border-[#E7E9E6] hover:border-gray-300'
                }`}
              >
                {/* Top Row: Category & Status */}
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                        {req.categoryName || 'Home Service'}
                      </span>
                      {req.bookingCode && (
                        <span className="text-[10px] font-bold text-[#075B43] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/50">
                          {req.bookingCode}
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-[#111817] mt-0.5 truncate">
                      {req.serviceName || req.serviceOptionName}
                    </h3>
                  </div>

                  {/* Production Status Badge */}
                  <span
                    className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border shrink-0 ${statusConfig.badgeBg} ${statusConfig.badgeText} ${statusConfig.badgeBorder}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                    {statusConfig.label}
                  </span>
                </div>

                {/* Status Explanation text */}
                <div className="mt-2 text-[11px] text-gray-500 bg-gray-50/70 p-2 rounded-lg border border-gray-100 flex items-start justify-between gap-2">
                  <span className="leading-snug">{statusConfig.description}</span>
                  <button
                    type="button"
                    onClick={(e) => handleRefreshSingle(req, e)}
                    disabled={isRefreshingThis}
                    className="shrink-0 text-gray-400 hover:text-[#075B43] p-0.5 transition-colors cursor-pointer"
                    title="Refresh status"
                  >
                    <RefreshCw className={`w-3 h-3 ${isRefreshingThis ? 'animate-spin text-[#075B43]' : ''}`} />
                  </button>
                </div>

                {/* Card Error / Notice if status refresh fails */}
                {cardNotice && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-lg text-[11px] text-red-700 flex items-center justify-between">
                    <span>{cardNotice}</span>
                    <button
                      type="button"
                      onClick={(e) => handleRefreshSingle(req, e)}
                      className="font-bold underline text-red-800 text-[11px] cursor-pointer"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {/* Price Display */}
                <div className="mt-2.5 flex items-center justify-between text-xs pt-2.5 border-t border-gray-100">
                  <span className="text-gray-500 font-medium">Price:</span>
                  {renderPriceText(req)}
                </div>

                {/* Real ETA Display (Only if provided by backend, never fabricated) */}
                {formattedEta && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-gray-700 pt-2 border-t border-gray-100">
                    <Clock className="w-3.5 h-3.5 text-[#075B43] shrink-0" />
                    <span>
                      Estimated Arrival:{' '}
                      <strong className="font-semibold text-[#111817]">{formattedEta}</strong>
                    </span>
                  </div>
                )}

                {/* Assigned Professional (Displayed only after Admin assignment; no phone/WhatsApp) */}
                {req.professionalName ? (
                  <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                    <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                      <User className="w-3 h-3 text-[#075B43]" />
                      <span>Assigned Professional</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2 bg-emerald-50/50 rounded-lg border border-emerald-100">
                      {req.professionalPhoto ? (
                        <img
                          src={req.professionalPhoto}
                          alt={req.professionalName}
                          referrerPolicy="no-referrer"
                          className="w-8 h-8 rounded-full object-cover border border-emerald-200 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-[#075B43]/10 text-[#075B43] flex items-center justify-center font-bold text-xs shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs font-bold text-[#111817] truncate">
                          {req.professionalName}
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
                          {req.professionalRating !== null && req.professionalRating !== undefined && (
                            <span className="flex items-center gap-0.5 text-amber-700 font-semibold">
                              <Star className="w-2.5 h-2.5 fill-amber-500 text-amber-500" />
                              {req.professionalRating.toFixed(1)}
                            </span>
                          )}
                          {req.professionalCompletedJobs !== null && req.professionalCompletedJobs !== undefined && (
                            <span>• {req.professionalCompletedJobs} jobs</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mt-2 pt-2 border-t border-gray-100 flex items-center gap-1.5 text-[11px] text-gray-500">
                    <Clock className="w-3 h-3 text-gray-400 shrink-0" />
                    <span>Professional will be assigned by KaamWala</span>
                  </div>
                )}

                {/* Address */}
                <div className="mt-2 flex items-start gap-1.5 text-xs text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-[#075B43] shrink-0 mt-0.5" />
                  <span className="line-clamp-1 leading-snug">{req.address}</span>
                </div>

                {/* Date & Expand Toggle */}
                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-[#66706D]">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span>{formatDate(req.createdAt)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-[#075B43] font-semibold">
                    <span>{isExpanded ? 'Hide details' : 'View details'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </div>
                </div>

                {/* Expanded Details Section */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5 text-xs text-gray-600 animate-in fade-in duration-150">
                    {/* Full Address */}
                    <div>
                      <span className="font-semibold text-gray-700">Service Location: </span>
                      <span className="text-[#111817]">{req.address}</span>
                    </div>

                    {/* Problem note if exists */}
                    {req.problemDescription && (
                      <div className="p-2 bg-gray-50 rounded-lg border border-gray-100 text-[11px] text-gray-600">
                        <strong className="text-gray-700 font-semibold">Problem Note: </strong>
                        {req.problemDescription}
                      </div>
                    )}

                    {/* Payment Info */}
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                      <Banknote className="w-3.5 h-3.5 text-[#075B43]" />
                      <span>Payment: Cash on Service (Pay after work is done)</span>
                    </div>

                    {/* Manual Refresh Button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={(e) => handleRefreshSingle(req, e)}
                        disabled={isRefreshingThis}
                        className="inline-flex items-center gap-1.5 py-1.5 px-3 bg-gray-50 hover:bg-gray-100 text-[#075B43] font-semibold rounded-lg text-xs border border-gray-200 transition-colors cursor-pointer min-h-[36px]"
                      >
                        <RefreshCw className={`w-3 h-3 ${isRefreshingThis ? 'animate-spin' : ''}`} />
                        <span>{isRefreshingThis ? 'Checking status...' : 'Check Latest Status'}</span>
                      </button>
                    </div>
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

