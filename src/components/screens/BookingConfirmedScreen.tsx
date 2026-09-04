import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Home,
  FileText,
  Clock,
  MapPin,
  Banknote,
  Sparkles,
  RefreshCw,
  AlertCircle,
  User,
  Star
} from 'lucide-react';
import {
  CustomerServiceRequest,
  refreshCustomerRequest,
  getRequestStatusDisplay,
  formatEtaDisplay
} from '../../services/requestService';

interface BookingConfirmedScreenProps {
  request: CustomerServiceRequest;
  onViewRequests: () => void;
  onHome: () => void;
}

export const BookingConfirmedScreen: React.FC<BookingConfirmedScreenProps> = ({
  request,
  onViewRequests,
  onHome
}) => {
  // If bookingCode is missing, show a controlled "Booking details unavailable" state
  if (!request || !request.bookingCode) {
    return (
      <div className="pb-28 animate-in fade-in duration-200 px-5 pt-8 text-center">
        <div className="w-16 h-16 bg-amber-50 border border-amber-200 rounded-full flex items-center justify-center text-amber-700 mx-auto mb-4 shadow-2xs">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-extrabold text-[#111817]">Booking details unavailable</h2>
        <p className="text-xs text-[#66706D] mt-2 max-w-xs mx-auto leading-relaxed">
          Unable to verify the booking reference for this service request. Please check your saved requests.
        </p>
        <div className="space-y-2.5 mt-6">
          <button
            id="view-my-requests-btn"
            type="button"
            onClick={onViewRequests}
            className="w-full py-3 px-4 bg-[#075B43] hover:bg-[#054432] active:bg-[#043426] text-white rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <FileText className="w-4 h-4" />
            <span>View My Requests</span>
          </button>
          <button
            id="back-to-home-btn"
            type="button"
            onClick={onHome}
            className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-[#111817] rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
          >
            <Home className="w-4 h-4 text-gray-600" />
            <span>Back to Home</span>
          </button>
        </div>
      </div>
    );
  }

  // Active synchronized request state
  const [currentRequest, setCurrentRequest] = useState<CustomerServiceRequest>(request);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshError, setRefreshError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<Date | null>(null);

  // Synchronize status with Supabase get_service_request_status RPC
  const handleRefreshStatus = useCallback(async () => {
    if (!currentRequest.bookingCode || !currentRequest.customerPhone) {
      return;
    }

    setIsRefreshing(true);
    setRefreshError(null);

    try {
      const res = await refreshCustomerRequest(
        currentRequest.bookingCode,
        currentRequest.customerPhone
      );

      if (res.success && res.request) {
        setCurrentRequest(res.request);
        setLastSyncedAt(new Date());
      } else {
        setRefreshError(res.error || 'Unable to refresh request status. Please try again.');
      }
    } catch {
      setRefreshError('Unable to refresh request status. Please try again.');
    } finally {
      setIsRefreshing(false);
    }
  }, [currentRequest.bookingCode, currentRequest.customerPhone]);

  // Live status refresh on screen mount / return
  useEffect(() => {
    handleRefreshStatus();
  }, [handleRefreshStatus]);

  const statusConfig = getRequestStatusDisplay(currentRequest.status);
  const formattedEta = formatEtaDisplay(currentRequest.estimatedArrivalAt);

  // Price formatting strictly adhering to Step 7.1 rules:
  // 1. confirmedPrice
  // 2. estimatedPrice
  // 3. "To be confirmed upon inspection"
  // NEVER fallback to catalog prices, estimatedMinPrice, estimatedMaxPrice, or ₹0
  const renderPriceSection = () => {
    if (currentRequest.confirmedPrice !== null && currentRequest.confirmedPrice !== undefined) {
      return (
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium text-xs">Confirmed Price:</span>
          <span className="font-extrabold text-[#075B43] text-sm">
            ₹{currentRequest.confirmedPrice}
          </span>
        </div>
      );
    }

    if (currentRequest.estimatedPrice !== null && currentRequest.estimatedPrice !== undefined) {
      return (
        <div className="flex items-center justify-between text-gray-600">
          <span className="font-medium text-xs">Estimated Price:</span>
          <span className="font-extrabold text-[#111817]">
            ₹{currentRequest.estimatedPrice}
          </span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-between text-gray-600">
        <span className="font-medium text-xs">Price:</span>
        <span className="font-semibold text-gray-700 text-xs">
          To be confirmed upon inspection
        </span>
      </div>
    );
  };

  return (
    <div className="pb-28 animate-in fade-in duration-200 px-5 pt-4">
      {/* 7. Success Badge & Header */}
      <div className="flex flex-col items-center justify-center text-center my-3">
        <div className="w-16 h-16 bg-[#075B43] rounded-full flex items-center justify-center text-white shadow-lg mb-2.5">
          <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111817]">Request received! 🎉</h2>
        <p className="text-xs sm:text-sm text-[#66706D] font-medium mt-1 max-w-xs mx-auto leading-relaxed">
          Your service request has been received. Our KaamWala team will review it and contact you shortly.
        </p>
      </div>

      {/* Booking Code Reference Banner */}
      <div className="bg-white border border-[#E7E9E6] rounded-xl p-3.5 shadow-2xs mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">
            Booking Reference Code
          </div>
          <div className="text-base font-extrabold text-[#075B43] tracking-wide mt-0.5">
            {currentRequest.bookingCode}
          </div>
        </div>
        <button
          id="refresh-booking-status-btn"
          type="button"
          onClick={handleRefreshStatus}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#075B43] hover:text-[#054432] bg-emerald-50/70 hover:bg-emerald-100/70 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 transition-colors cursor-pointer"
          title="Refresh status from server"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span>{isRefreshing ? 'Checking...' : 'Refresh'}</span>
        </button>
      </div>

      {/* Refresh Error Notice (Controlled) */}
      {refreshError && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{refreshError}</span>
          </div>
          <button
            type="button"
            onClick={handleRefreshStatus}
            className="text-xs font-bold text-red-700 underline cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Service Request Summary Card */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E9E6] shadow-2xs mb-4">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div className="pr-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#075B43] bg-[#075B43]/10 px-2 py-0.5 rounded">
              {currentRequest.categoryName || 'Home Service'}
            </span>
            <h3 className="text-base font-bold text-[#111817] mt-1">
              {currentRequest.serviceName || currentRequest.serviceOptionName}
            </h3>
          </div>
          <div className="text-right shrink-0">
            <span
              className={`inline-flex items-center gap-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${statusConfig.badgeBg} ${statusConfig.badgeText} ${statusConfig.badgeBorder}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor} animate-pulse`} />
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-3 space-y-2.5 text-xs">
          {/* Status description */}
          <div className="text-xs text-gray-500 bg-gray-50/80 p-2 rounded-lg border border-gray-100">
            {statusConfig.description}
          </div>

          {/* Price Section */}
          {renderPriceSection()}

          {/* ETA Display (Only if real ETA is returned from Supabase; never fabricated) */}
          {formattedEta && (
            <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-gray-700">
              <Clock className="w-4 h-4 text-[#075B43] shrink-0" />
              <span>
                Estimated Arrival:{' '}
                <strong className="font-semibold text-[#111817]">{formattedEta}</strong>
              </span>
            </div>
          )}

          {/* Assigned Professional (Displayed only after Admin assignment; no phone/WhatsApp) */}
          {currentRequest.professionalName ? (
            <div className="pt-2.5 border-t border-gray-100">
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-[#075B43]" />
                <span>Assigned Professional</span>
              </div>
              <div className="flex items-center gap-3 p-2.5 bg-emerald-50/50 rounded-xl border border-emerald-100">
                {currentRequest.professionalPhoto ? (
                  <img
                    src={currentRequest.professionalPhoto}
                    alt={currentRequest.professionalName}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-full object-cover border border-emerald-200 shrink-0"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[#075B43]/10 text-[#075B43] flex items-center justify-center font-bold text-sm shrink-0">
                    <User className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#111817] truncate">
                    {currentRequest.professionalName}
                  </div>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-600">
                    {currentRequest.professionalRating !== null && currentRequest.professionalRating !== undefined && (
                      <span className="flex items-center gap-0.5 text-amber-700 font-semibold">
                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                        {currentRequest.professionalRating.toFixed(1)}
                      </span>
                    )}
                    {currentRequest.professionalCompletedJobs !== null && currentRequest.professionalCompletedJobs !== undefined && (
                      <span>• {currentRequest.professionalCompletedJobs} jobs</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="pt-2 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
              <Clock className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <span>Professional will be assigned by KaamWala after review.</span>
            </div>
          )}

          {/* Service Address */}
          <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
            <MapPin className="w-4 h-4 text-[#075B43] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                Service Address
              </div>
              <div className="text-xs text-[#111817] font-medium mt-0.5 leading-snug">
                {currentRequest.address || 'Address provided'}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-gray-700">
            <Banknote className="w-4 h-4 text-[#075B43] shrink-0" />
            <span>
              Payment: <strong className="font-semibold text-[#111817]">Cash on Service</strong> (Pay after work is done)
            </span>
          </div>
        </div>
      </div>

      {/* What happens next? */}
      <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4 mb-6">
        <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#075B43]" />
          What happens next?
        </h4>
        <div className="space-y-2 text-xs text-emerald-900 leading-snug">
          <div className="flex items-start gap-2">
            <span className="font-bold text-[#075B43]">1.</span>
            <span>Our Kadi operations team reviews your request.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-[#075B43]">2.</span>
            <span>
              We will call you on{' '}
              <strong className="font-semibold">{currentRequest.customerPhone}</strong> to confirm technician visit timing.
            </span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-[#075B43]">3.</span>
            <span>Professional arrives at your doorstep to inspect and complete the job.</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-2.5">
        <button
          id="view-my-requests-btn"
          type="button"
          onClick={onViewRequests}
          className="w-full py-3 px-4 bg-[#075B43] hover:bg-[#054432] active:bg-[#043426] text-white rounded-xl font-bold text-sm transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
        >
          <FileText className="w-4 h-4" />
          <span>View My Requests</span>
        </button>

        <button
          id="back-to-home-btn"
          type="button"
          onClick={onHome}
          className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-[#111817] rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
        >
          <Home className="w-4 h-4 text-gray-600" />
          <span>Back to Home</span>
        </button>
      </div>
    </div>
  );
};

