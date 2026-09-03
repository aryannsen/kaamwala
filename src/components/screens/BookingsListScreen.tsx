import React, { useState } from 'react';
import { ChevronRight, Clock, CheckCircle2, ShieldCheck, FileText, ArrowRight } from 'lucide-react';
import { Booking } from '../../types';
import { InvoiceModal } from '../common/InvoiceModal';

interface BookingsListScreenProps {
  bookings: Booking[];
  onSelectBookingForTracking: (booking: Booking) => void;
  onReviewBooking: (booking: Booking) => void;
}

export const BookingsListScreen: React.FC<BookingsListScreenProps> = ({
  bookings,
  onSelectBookingForTracking,
  onReviewBooking
}) => {
  const [activeTab, setActiveTab] = useState<'ACTIVE' | 'PAST'>('ACTIVE');
  const [selectedInvoiceBooking, setSelectedInvoiceBooking] = useState<Booking | null>(null);

  const activeBookings = bookings.filter(
    (b) => b.status !== 'COMPLETED' && b.status !== 'CANCELLED'
  );
  const pastBookings = bookings.filter(
    (b) => b.status === 'COMPLETED' || b.status === 'CANCELLED'
  );

  const displayedList = activeTab === 'ACTIVE' ? activeBookings : pastBookings;

  return (
    <div className="pb-24 animate-in fade-in duration-150 px-5 pt-3">
      {/* Top Segmented Tabs: ACTIVE / PAST */}
      <div className="flex bg-gray-100 p-1 rounded-xl mb-4">
        <button
          id="tab-active-bookings"
          onClick={() => setActiveTab('ACTIVE')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'ACTIVE'
              ? 'bg-white text-[#111817] shadow-xs'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Active ({activeBookings.length})
        </button>
        <button
          id="tab-past-bookings"
          onClick={() => setActiveTab('PAST')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === 'PAST'
              ? 'bg-white text-[#111817] shadow-xs'
              : 'text-gray-500 hover:text-black'
          }`}
        >
          Past Bookings ({pastBookings.length})
        </button>
      </div>

      {/* Bookings List */}
      <div className="space-y-3">
        {displayedList.map((booking) => {
          const isActive = booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED';

          return (
            <div
              key={booking.id}
              className="bg-white rounded-xl border border-[#E7E9E6] p-4 shadow-2xs hover:border-[#075B43] transition-all"
            >
              {/* Top Row: Category & Status */}
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400">
                    {booking.categoryName}
                  </span>
                  <h3 className="text-sm font-bold text-[#111817] mt-0.5">
                    {booking.serviceOptionName}
                  </h3>
                </div>

                <div
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isActive
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {isActive ? 'In Progress' : 'Completed'}
                </div>
              </div>

              {/* Professional row */}
              <div className="flex items-center gap-2.5 mt-3 pt-3 border-t border-gray-100">
                <img
                  src={booking.professional.photo}
                  alt={booking.professional.name}
                  className="w-9 h-9 rounded-full object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-[#111817] truncate">
                    {booking.professional.name}
                  </div>
                  <div className="text-[11px] text-[#66706D]">
                    {isActive
                      ? `Arriving in ${booking.etaDisplay}`
                      : `${new Date(booking.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short'
                        })}`}
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-sm font-extrabold text-[#111817]">
                    ₹{booking.finalPrice || booking.estimatedPrice}
                  </span>
                  <span className="text-[9px] text-gray-400 block font-mono">
                    {booking.bookingCode}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between gap-2">
                {isActive ? (
                  <button
                    onClick={() => onSelectBookingForTracking(booking)}
                    className="w-full py-2 bg-[#075B43] hover:bg-[#064635] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span>Track Status & Map</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div className="flex items-center gap-2 w-full">
                    <button
                      onClick={() => setSelectedInvoiceBooking(booking)}
                      className="flex-1 py-1.5 bg-gray-50 border border-gray-200 text-gray-700 hover:bg-gray-100 text-xs font-semibold rounded-lg flex items-center justify-center gap-1"
                    >
                      <FileText className="w-3 h-3 text-[#075B43]" />
                      <span>Receipt</span>
                    </button>
                    {!booking.rating ? (
                      <button
                        onClick={() => onReviewBooking(booking)}
                        className="flex-1 py-1.5 bg-[#F5B51B] hover:bg-[#E5A817] text-[#111817] text-xs font-bold rounded-lg"
                      >
                        Leave Review
                      </button>
                    ) : (
                      <div className="flex items-center gap-1 text-xs text-amber-600 font-bold px-2">
                        <span>★ {booking.rating}.0</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {displayedList.length === 0 && (
          <div className="py-12 text-center text-gray-500 text-xs bg-white rounded-xl border border-gray-100 p-6">
            <p className="font-semibold text-gray-700 text-sm">
              {activeTab === 'ACTIVE' ? 'No active bookings' : 'No past bookings found'}
            </p>
            <p className="text-gray-400 mt-1">
              {activeTab === 'ACTIVE'
                ? 'Your requested services will appear here with live ETA.'
                : 'Your completed services and invoices will be stored here.'}
            </p>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {selectedInvoiceBooking && (
        <InvoiceModal
          booking={selectedInvoiceBooking}
          isOpen={!!selectedInvoiceBooking}
          onClose={() => setSelectedInvoiceBooking(null)}
        />
      )}
    </div>
  );
};
