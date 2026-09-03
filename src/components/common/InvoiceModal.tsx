import React from 'react';
import { X, CheckCircle, Printer, Download, Share2 } from 'lucide-react';
import { Booking } from '../../types';
import { KaamWalaLogo } from './KaamWalaLogo';

interface InvoiceModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ booking, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 bg-[#075B43] text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-[#F5B51B]" />
            <div>
              <h3 className="font-bold text-base">Service Receipt</h3>
              <p className="text-xs text-white/80">Paid via {booking.paymentMethod}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Body */}
        <div className="p-5 overflow-y-auto space-y-4 text-sm text-[#111817]">
          {/* Logo & Meta */}
          <div className="flex justify-between items-start border-b border-gray-100 pb-4">
            <KaamWalaLogo size="sm" showSubtitle />
            <div className="text-right">
              <span className="text-[11px] text-gray-500 block">Booking ID</span>
              <span className="font-mono font-bold text-xs text-[#075B43]">{booking.bookingCode}</span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {new Date(booking.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* Customer & Location */}
          <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded-xl border border-gray-100">
            <div>
              <span className="text-gray-400 block font-medium">Billed To</span>
              <span className="font-bold text-gray-800">{booking.customerName}</span>
              <span className="text-gray-600 block">{booking.customerPhone}</span>
              <span className="text-gray-500 block truncate mt-0.5">{booking.address}</span>
            </div>
            <div>
              <span className="text-gray-400 block font-medium">Service Professional</span>
              <span className="font-bold text-gray-800">{booking.professional.name}</span>
              <span className="text-emerald-700 font-medium block">✓ Verified KaamWala</span>
              <span className="text-gray-500 block">{booking.professional.phone}</span>
            </div>
          </div>

          {/* Line items */}
          <div className="space-y-2">
            <div className="text-xs font-bold uppercase tracking-wider text-gray-400">Services Provided</div>
            <div className="flex justify-between items-start py-2 border-b border-gray-100">
              <div>
                <div className="font-semibold text-[#111817]">{booking.serviceOptionName}</div>
                <div className="text-xs text-gray-500">{booking.categoryName} inspection & labour</div>
              </div>
              <div className="font-bold text-gray-900">₹{booking.estimatedPrice}</div>
            </div>

            <div className="flex justify-between items-center text-xs py-1 text-gray-600">
              <span>Materials / Replacement Parts</span>
              <span>₹0.00</span>
            </div>

            <div className="flex justify-between items-center text-xs py-1 text-gray-600">
              <span>Kadi Platform Convenience Fee</span>
              <span className="text-emerald-700 font-semibold">FREE</span>
            </div>
          </div>

          {/* Total */}
          <div className="pt-3 border-t-2 border-dashed border-gray-200 flex justify-between items-center">
            <div>
              <div className="text-xs text-gray-500">Total Amount Paid</div>
              <div className="text-[10px] text-gray-400">Inclusive of all local taxes</div>
            </div>
            <div className="text-xl font-extrabold text-[#075B43]">
              ₹{booking.finalPrice || booking.estimatedPrice}
            </div>
          </div>

          {/* Trust note */}
          <div className="p-3 bg-[#075B43]/5 border border-[#075B43]/15 rounded-xl text-center text-xs text-[#075B43]">
            Thank you for choosing KaamWala Kadi! All completed jobs are backed by our 7-day service satisfaction warranty.
          </div>
        </div>

        {/* Footer actions */}
        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center gap-3">
          <button
            onClick={() => {
              try {
                window.print();
              } catch (e) {
                console.warn('Print not supported in iframe', e);
              }
            }}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-700 transition-colors"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-2.5 px-3 bg-[#075B43] hover:bg-[#064635] text-white rounded-xl text-xs font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
