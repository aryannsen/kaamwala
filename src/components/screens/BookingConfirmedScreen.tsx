import React, { useState } from 'react';
import { Check, ShieldCheck, Copy, Phone, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Booking } from '../../types';

interface BookingConfirmedScreenProps {
  booking: Booking;
  onTrackBooking: () => void;
  onHome: () => void;
}

export const BookingConfirmedScreen: React.FC<BookingConfirmedScreenProps> = ({
  booking,
  onTrackBooking,
  onHome
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(booking.bookingCode).catch(() => {});
      }
    } catch {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCall = () => {
    try {
      window.open(`tel:${booking.professional.phone}`, '_self');
    } catch {}
  };

  const handleWhatsApp = () => {
    try {
      const text = encodeURIComponent(
        `Hello ${booking.professional.name}, I booked ${booking.serviceOptionName} (ID: ${booking.bookingCode}) on KaamWala for ${booking.address}.`
      );
      window.open(`https://wa.me/91${booking.professional.phone.replace(/[^0-9]/g, '').slice(-10)}?text=${text}`, '_blank', 'noopener,noreferrer');
    } catch {}
  };

  return (
    <div className="pb-24 animate-in fade-in duration-150 px-5 pt-3">
      {/* Success Badge */}
      <div className="flex flex-col items-center justify-center text-center my-4">
        <div className="w-18 h-18 bg-[#10B981] rounded-full flex items-center justify-center text-white shadow-lg mb-3">
          <Check className="w-10 h-10 stroke-[3]" />
        </div>
        <h2 className="text-xl font-extrabold text-[#111817]">Your booking is confirmed!</h2>
        <p className="text-xs text-[#66706D] font-medium mt-1">
          {booking.professional.name} is on the way
        </p>
      </div>

      {/* Professional Card */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E7E9E6] shadow-2xs mb-3 flex items-center gap-3">
        <img
          src={booking.professional.photo}
          alt={booking.professional.name}
          className="w-13 h-13 rounded-full object-cover shrink-0 border border-gray-100 shadow-2xs"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-[#111817] truncate">{booking.professional.name}</h3>
            {booking.professional.verified && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#075B43] bg-[#075B43]/10 px-1.5 py-0.5 rounded">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            )}
          </div>
          <div className="text-xs text-[#66706D] mt-0.5">{booking.professional.distanceKm} km away</div>
          <div className="text-xs font-semibold text-[#075B43] flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#075B43]" />
            <span>Arrives in {booking.professional.arrivalEtaMinutes}</span>
          </div>
        </div>
      </div>

      {/* Booking ID Box */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E7E9E6] shadow-2xs mb-3 flex items-center justify-between">
        <div>
          <div className="text-[10px] text-[#66706D] font-medium uppercase tracking-wider">Booking ID</div>
          <div className="text-sm font-extrabold text-[#111817] font-mono tracking-wide">
            {booking.bookingCode}
          </div>
        </div>
        <button
          onClick={handleCopy}
          className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-black transition-colors"
          title="Copy booking ID"
        >
          {copied ? <Check className="w-4 h-4 text-[#075B43]" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>

      {/* Notification Note */}
      <div className="p-3 bg-[#075B43]/5 border border-[#075B43]/20 rounded-xl mb-4 flex items-start gap-2.5">
        <CheckCircle2 className="w-4 h-4 text-[#075B43] shrink-0 mt-0.5" />
        <span className="text-xs text-[#075B43] font-medium leading-tight">
          We will notify you when the KaamWala reaches your location in Kadi.
        </span>
      </div>

      {/* Call & WhatsApp Buttons */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <button
          id="confirmed-call-btn"
          onClick={handleCall}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-white border border-[#E7E9E6] hover:bg-gray-50 rounded-xl text-xs font-bold text-[#111817] shadow-2xs transition-colors"
        >
          <Phone className="w-4 h-4 text-[#075B43]" />
          <span>Call</span>
        </button>

        <button
          id="confirmed-whatsapp-btn"
          onClick={handleWhatsApp}
          className="flex items-center justify-center gap-2 py-3 px-4 bg-[#075B43] hover:bg-[#064635] rounded-xl text-xs font-bold text-white shadow-xs transition-colors"
        >
          <MessageSquare className="w-4 h-4 text-[#F5B51B]" />
          <span>WhatsApp</span>
        </button>
      </div>

      {/* Track Booking Button */}
      <button
        id="confirmed-track-btn"
        onClick={onTrackBooking}
        className="w-full py-3.5 px-4 bg-[#F5B51B] hover:bg-[#E5A817] active:scale-[0.99] text-[#111817] font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2"
      >
        <span>Track Live Booking</span>
        <ArrowRight className="w-4 h-4" />
      </button>

      <div className="text-center mt-3">
        <button
          onClick={onHome}
          className="text-xs font-semibold text-[#66706D] hover:text-[#111817] underline"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};
