import React from 'react';
import {
  CheckCircle2,
  Home,
  FileText,
  Clock,
  MapPin,
  PhoneCall,
  Banknote,
  Sparkles
} from 'lucide-react';
import { CustomerServiceRequest } from '../../services/requestService';

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
  return (
    <div className="pb-28 animate-in fade-in duration-200 px-5 pt-4">
      {/* 7. Success Badge & Header */}
      <div className="flex flex-col items-center justify-center text-center my-4">
        <div className="w-18 h-18 bg-[#075B43] rounded-full flex items-center justify-center text-white shadow-lg mb-3">
          <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#111817]">Request received! 🎉</h2>
        <p className="text-xs sm:text-sm text-[#66706D] font-medium mt-1.5 max-w-xs mx-auto leading-relaxed">
          Your service request has been received. Our KaamWala team will review it and contact you shortly.
        </p>
      </div>

      {/* Service Request Summary Card */}
      <div className="bg-white p-4 rounded-2xl border border-[#E7E9E6] shadow-2xs mb-4">
        <div className="flex items-start justify-between pb-3 border-b border-gray-100">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#075B43] bg-[#075B43]/10 px-2 py-0.5 rounded">
              {request.categoryName}
            </span>
            <h3 className="text-base font-bold text-[#111817] mt-1">
              {request.serviceOptionName}
            </h3>
          </div>
          <div className="text-right">
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse" />
              {request.status}
            </span>
          </div>
        </div>

        {/* Details Grid */}
        <div className="mt-3 space-y-2.5 text-xs">
          {/* Estimated Price */}
          <div className="flex items-center justify-between text-gray-600">
            <span className="font-medium">Estimated Price:</span>
            <span className="font-extrabold text-[#111817]">
              {request.estimatedMinPrice === request.estimatedMaxPrice
                ? `₹${request.estimatedMinPrice}`
                : `₹${request.estimatedMinPrice} – ₹${request.estimatedMaxPrice}`}
            </span>
          </div>

          {/* Service Address */}
          <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
            <MapPin className="w-4 h-4 text-[#075B43] shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider">
                Service Address
              </div>
              <div className="text-xs text-[#111817] font-medium mt-0.5 leading-snug">
                {request.address}
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="flex items-center gap-2 pt-2 border-t border-gray-100 text-gray-700">
            <Banknote className="w-4 h-4 text-[#075B43] shrink-0" />
            <span>Payment: <strong className="font-semibold text-[#111817]">Cash on Service</strong> (Pay after work is done)</span>
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
            <span>We will call you on <strong className="font-semibold">{request.customerPhone}</strong> to confirm technician visit timing.</span>
          </div>
          <div className="flex items-start gap-2">
            <span className="font-bold text-[#075B43]">3.</span>
            <span>Verified professional arrives at your doorstep to inspect and complete the job.</span>
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
