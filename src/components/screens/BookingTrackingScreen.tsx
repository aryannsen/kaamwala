import React, { useState } from 'react';
import { RefreshCw, ShieldCheck, CheckCircle2, Circle, Clock, Phone, MessageSquare, ChevronRight, Navigation, Home, AlertCircle } from 'lucide-react';
import { Booking, BookingStatus } from '../../types';

interface BookingTrackingScreenProps {
  booking: Booking;
  onUpdateStatus: (newStatus: BookingStatus) => void;
  onWorkCompleted: () => void;
}

export const BookingTrackingScreen: React.FC<BookingTrackingScreenProps> = ({
  booking,
  onUpdateStatus,
  onWorkCompleted
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const handleAdvanceStatus = () => {
    if (booking.status === 'CONFIRMED') {
      onUpdateStatus('ON_THE_WAY');
    } else if (booking.status === 'ON_THE_WAY') {
      onUpdateStatus('ARRIVED');
    } else if (booking.status === 'ARRIVED') {
      onUpdateStatus('WORK_STARTED');
    } else if (booking.status === 'WORK_STARTED') {
      onUpdateStatus('COMPLETED');
      onWorkCompleted();
    }
  };

  const getStatusLabel = (status: BookingStatus) => {
    switch (status) {
      case 'CONFIRMED':
        return 'Confirmed';
      case 'ON_THE_WAY':
        return 'On the way';
      case 'ARRIVED':
        return 'Arrived';
      case 'WORK_STARTED':
        return 'Work in progress';
      case 'COMPLETED':
        return 'Completed';
      default:
        return status;
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-150 px-5 pt-2">
      {/* Top Professional Header Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E7E9E6] shadow-2xs mb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={booking.professional.photo}
            alt={booking.professional.name}
            className="w-12 h-12 rounded-full object-cover shrink-0 border border-gray-100"
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-bold text-[#111817]">{booking.professional.name}</h3>
              {booking.professional.verified && (
                <span className="flex items-center gap-0.5 text-[9px] font-bold text-[#075B43] bg-[#075B43]/10 px-1 py-0.5 rounded">
                  <ShieldCheck className="w-2.5 h-2.5" />
                  Verified
                </span>
              )}
            </div>
            <div className="text-xs text-[#66706D] mt-0.5">{booking.professional.distanceKm} km away</div>
          </div>
        </div>

        {/* Status pill badge */}
        <div className="py-1 px-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold rounded-full">
          {getStatusLabel(booking.status)}
        </div>
      </div>

      {/* Styled Vector Map Visual matching reference image */}
      <div className="relative w-full h-52 bg-[#E9EFEA] rounded-2xl overflow-hidden border border-[#D5DDD7] shadow-inner mb-4">
        {/* Subtle Map Roads & Grid Background */}
        <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#DCE4DF" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#F1F5F2" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Secondary Kadi Streets */}
          <path d="M -10 60 Q 90 80 180 50 T 360 90" fill="none" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
          <path d="M 40 180 Q 120 140 220 170 T 380 120" fill="none" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
          <path d="M 120 -10 Q 140 90 110 220" fill="none" stroke="#FFFFFF" strokeWidth="9" strokeLinecap="round" />
          <path d="M 280 -10 Q 250 90 290 220" fill="none" stroke="#FFFFFF" strokeWidth="7" strokeLinecap="round" />

          {/* Main Route in Solid Forest Green */}
          <path
            d="M 60 70 C 110 80, 140 120, 200 110 S 260 150, 310 145"
            fill="none"
            stroke="#075B43"
            strokeWidth="4"
            strokeDasharray="6 4"
            strokeLinecap="round"
          />

          {/* Professional Origin / Current Pin */}
          <g transform="translate(60, 70)">
            <circle cx="0" cy="0" r="16" fill="#075B43" opacity="0.2" />
            <circle cx="0" cy="0" r="10" fill="#075B43" />
            {/* Scooter / tool icon */}
            <circle cx="0" cy="0" r="4" fill="white" />
          </g>

          {/* Customer Destination House Pin */}
          <g transform="translate(310, 145)">
            <circle cx="0" cy="0" r="16" fill="#F5B51B" opacity="0.25" />
            <circle cx="0" cy="0" r="11" fill="#F5B51B" stroke="white" strokeWidth="2" />
            <path d="M -4 2 L 0 -4 L 4 2 Z" fill="#111817" />
          </g>
        </svg>

        {/* Floating ETA Pill Badge on Route */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#111817] text-white px-3.5 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-xs font-bold border border-white/20">
          <Clock className="w-3.5 h-3.5 text-[#F5B51B]" />
          <span>Arriving in {booking.etaDisplay}</span>
        </div>

        {/* Location notes on map */}
        <div className="absolute bottom-2 left-2 bg-white/90 backdrop-blur-xs px-2 py-1 rounded text-[10px] font-semibold text-gray-700 shadow-2xs">
          📍 En Route → {booking.address ? booking.address.split(',')[0] : 'Service Location'}
        </div>
      </div>

      {/* Booking Status Timeline */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-[#111817]">Booking Status</h4>
          <button
            onClick={handleRefresh}
            className="text-xs text-gray-400 hover:text-black flex items-center gap-1"
            title="Refresh status"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#075B43]' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Timeline items */}
        <div className="space-y-4 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-100">
          {booking.timeline.map((step, idx) => {
            const isCompleted = step.completed;
            const isCurrent = step.current;

            return (
              <div key={idx} className="relative flex items-center justify-between pl-7">
                {/* Node icon */}
                <div className="absolute left-0">
                  {isCompleted ? (
                    <div className="w-6 h-6 rounded-full bg-emerald-50 text-[#075B43] flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 fill-[#075B43] text-white" />
                    </div>
                  ) : isCurrent ? (
                    <div className="w-6 h-6 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center animate-pulse">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F5B51B]" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-50 text-gray-300 flex items-center justify-center">
                      <Circle className="w-3.5 h-3.5 stroke-[2]" />
                    </div>
                  )}
                </div>

                {/* Status text */}
                <div>
                  <div
                    className={`text-xs font-bold ${
                      isCompleted ? 'text-[#111817]' : isCurrent ? 'text-amber-800' : 'text-gray-400'
                    }`}
                  >
                    {step.label}
                  </div>
                </div>

                {/* Timestamp */}
                <div className="text-[11px] font-mono text-gray-400">
                  {step.timestamp}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operator Live Simulation Controls (Demonstration) */}
      <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wide">
            Kadi Dispatch Control
          </span>
          <span className="text-[10px] text-gray-400">Tap to advance state</span>
        </div>
        <button
          id="advance-status-btn"
          onClick={handleAdvanceStatus}
          className="w-full mt-2 py-2 px-3 bg-white border border-[#075B43] hover:bg-[#075B43]/5 text-[#075B43] font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
        >
          <span>
            {booking.status === 'ON_THE_WAY' && 'Simulate: KaamWala Arrived'}
            {booking.status === 'ARRIVED' && 'Simulate: Work Started'}
            {booking.status === 'WORK_STARTED' && 'Simulate: Work Completed (Finish)'}
            {booking.status === 'COMPLETED' && 'Booking Completed ✓'}
          </span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Action Buttons: Call & WhatsApp */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => {
            try {
              window.open(`tel:${booking.professional.phone}`, '_self');
            } catch {}
          }}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[#E7E9E6] hover:bg-gray-50 rounded-xl text-xs font-bold text-[#111817] shadow-2xs transition-colors"
        >
          <Phone className="w-4 h-4 text-[#075B43]" />
          <span>Call {booking.professional.name.split(' ')[0]}</span>
        </button>

        <button
          onClick={() => {
            try {
              const text = encodeURIComponent(`Hi ${booking.professional.name}, checking on my KaamWala booking ${booking.bookingCode}.`);
              window.open(`https://wa.me/91${booking.professional.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${text}`, '_blank', 'noopener,noreferrer');
            } catch {}
          }}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-[#075B43] hover:bg-[#064635] rounded-xl text-xs font-bold text-white shadow-xs transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-[#F5B51B]" />
          <span>WhatsApp</span>
        </button>
      </div>
    </div>
  );
};
