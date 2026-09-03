import React, { useState } from 'react';
import { ShieldCheck, MapPin, Edit2, Banknote, ChevronRight, Check } from 'lucide-react';
import { CustomerProfile, Professional, ServiceOption } from '../../types';

interface ConfirmDetailsScreenProps {
  professional: Professional;
  serviceOption: ServiceOption;
  customerProfile: CustomerProfile;
  onUpdateProfile: (updated: CustomerProfile) => void;
  onConfirmBooking: (paymentMethod: 'Cash on Service' | 'Online UPI') => void;
  onOpenLocationModal?: () => void;
}

export const ConfirmDetailsScreen: React.FC<ConfirmDetailsScreenProps> = ({
  professional,
  serviceOption,
  customerProfile,
  onUpdateProfile,
  onConfirmBooking,
  onOpenLocationModal
}) => {
  const [name, setName] = useState(customerProfile.name);
  const [phone, setPhone] = useState(customerProfile.phone);
  const [address, setAddress] = useState(customerProfile.address);
  const [isEditing, setIsEditing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'Cash on Service' | 'Online UPI'>('Cash on Service');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync state if customerProfile changes externally (e.g. location modal confirmed)
  React.useEffect(() => {
    if (customerProfile.address) {
      setAddress(customerProfile.address);
    }
  }, [customerProfile.address]);

  const handleSaveDetails = () => {
    onUpdateProfile({
      ...customerProfile,
      name,
      phone,
      address
    });
    setIsEditing(false);
  };

  const handleConfirm = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      onConfirmBooking(paymentMethod);
    }, 400);
  };

  return (
    <div className="pb-28 animate-in fade-in duration-150 px-5 pt-2">
      {/* Top Professional Card */}
      <div className="bg-white p-3.5 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4 flex items-center gap-3">
        <img
          src={professional.photo}
          alt={professional.name}
          className="w-14 h-14 rounded-full object-cover shrink-0 border border-gray-100 shadow-2xs"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h3 className="text-sm font-bold text-[#111817] truncate">{professional.name}</h3>
            {professional.verified && (
              <span className="flex items-center gap-0.5 text-[10px] font-semibold text-[#075B43] bg-[#075B43]/10 px-1.5 py-0.5 rounded">
                <ShieldCheck className="w-2.5 h-2.5" />
                Verified
              </span>
            )}
          </div>
          <div className="text-xs text-[#66706D] mt-0.5">{professional.distanceKm} km away</div>
          <div className="text-xs font-semibold text-[#075B43] flex items-center gap-1 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#075B43]" />
            <span>Arrives in {professional.arrivalEtaMinutes}</span>
          </div>
        </div>
      </div>

      {/* Service & Price Breakdown Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <div className="text-xs text-[#66706D] font-medium">Service</div>
        <div className="text-base font-bold text-[#111817] mt-0.5">{serviceOption.name}</div>

        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-[#66706D] font-medium">Estimated Price</div>
          <div className="text-xl font-extrabold text-[#111817] mt-0.5">₹{professional.estimatedPrice}</div>
          <div className="text-[11px] text-[#66706D] mt-0.5">
            Final price may vary depending on the work.
          </div>
        </div>
      </div>

      {/* Customer Details Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-sm font-bold text-[#111817]">Your Details</h4>
          <button
            id="toggle-edit-details-btn"
            onClick={() => {
              if (isEditing) handleSaveDetails();
              else setIsEditing(true);
            }}
            className="text-xs font-bold text-[#075B43] flex items-center gap-1 hover:underline"
          >
            {isEditing ? (
              <>
                <Check className="w-3.5 h-3.5" /> Done
              </>
            ) : (
              <>
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </>
            )}
          </button>
        </div>

        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Your Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 p-2 text-xs border rounded-lg focus:border-[#075B43] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full mt-1 p-2 text-xs border rounded-lg focus:border-[#075B43] outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase">Delivery Address in Kadi</label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full mt-1 p-2 text-xs border rounded-lg focus:border-[#075B43] outline-none"
              />
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs font-semibold text-[#111817]">{name}</span>
              <Edit2
                className="w-3 h-3 text-gray-400 cursor-pointer"
                onClick={() => setIsEditing(true)}
              />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <span className="text-xs font-semibold text-[#111817]">{phone}</span>
              <Edit2
                className="w-3 h-3 text-gray-400 cursor-pointer"
                onClick={() => setIsEditing(true)}
              />
            </div>
            <div className="flex items-center justify-between p-2.5 bg-gray-50 rounded-lg border border-gray-100">
              <div className="flex items-center gap-2 overflow-hidden flex-1">
                <MapPin className={`w-3.5 h-3.5 shrink-0 ${address ? 'text-[#075B43]' : 'text-gray-400'}`} />
                <span className={`text-xs truncate max-w-[240px] ${address ? 'text-[#111817]' : 'text-gray-400 font-medium'}`}>
                  {address || 'No service address set'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                {onOpenLocationModal && (
                  <button
                    type="button"
                    onClick={onOpenLocationModal}
                    className="text-[11px] font-bold text-[#075B43] hover:underline px-1 py-0.5"
                  >
                    {address ? 'Map' : 'Set'}
                  </button>
                )}
                <Edit2
                  className="w-3 h-3 text-gray-400 cursor-pointer hover:text-black"
                  onClick={() => setIsEditing(true)}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Payment Method Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-6">
        <h4 className="text-sm font-bold text-[#111817] mb-2.5">Payment Method</h4>
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-[#075B43] flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-[#111817]">{paymentMethod}</div>
              <div className="text-[11px] text-[#66706D]">Pay after the work is completed</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>

      {/* Bottom Sticky Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E7E9E6] z-30">
        <div className="max-w-md mx-auto">
          <button
            id="confirm-booking-btn"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#F5B51B] hover:bg-[#E5A817] active:scale-[0.99] text-[#111817] font-bold text-base rounded-xl transition-all shadow-xs flex items-center justify-center disabled:opacity-75"
          >
            {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
          </button>
        </div>
      </div>
    </div>
  );
};
