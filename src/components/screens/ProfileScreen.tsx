import React, { useState } from 'react';
import { User, Phone, MapPin, Globe, Shield, FileText, Lock, LogOut, Check, Plus } from 'lucide-react';
import { CustomerProfile } from '../../types';

interface ProfileScreenProps {
  profile: CustomerProfile;
  onUpdateProfile: (profile: CustomerProfile) => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({ profile, onUpdateProfile }) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'English' | 'ગુજરાતી' | 'हिंदी'>('English');
  const [showAddressInput, setShowAddressInput] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newAddress, setNewAddress] = useState('');

  const handleAddAddress = () => {
    if (!newLabel || !newAddress) return;
    const updated = {
      ...profile,
      savedAddresses: [
        ...profile.savedAddresses,
        {
          id: `addr-${Date.now()}`,
          label: newLabel,
          address: newAddress,
          isDefault: false
        }
      ]
    };
    onUpdateProfile(updated);
    setNewLabel('');
    setNewAddress('');
    setShowAddressInput(false);
  };

  return (
    <div className="pb-24 animate-in fade-in duration-150 px-5 pt-3">
      {/* Profile Header Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4 flex items-center gap-3.5">
        <div className="w-14 h-14 rounded-full bg-[#075B43] text-white flex items-center justify-center font-bold text-xl shrink-0 shadow-xs">
          {profile?.name ? profile.name.charAt(0) : 'U'}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-[#111817] truncate">{profile?.name || 'Customer'}</h2>
          <div className="text-xs text-[#66706D] flex items-center gap-1 mt-0.5">
            <Phone className="w-3 h-3 text-gray-400" />
            <span>+91 {profile?.phone || '98765 43210'}</span>
          </div>
          <div className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-1 font-semibold">
            Kadi Verified Customer
          </div>
        </div>
      </div>

      {/* Saved Addresses Section */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Saved Addresses in Kadi
          </h3>
          <button
            onClick={() => setShowAddressInput(!showAddressInput)}
            className="text-xs font-bold text-[#075B43] flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Add
          </button>
        </div>

        {showAddressInput && (
          <div className="mb-3 p-3 bg-gray-50 rounded-xl border border-gray-200 space-y-2">
            <input
              type="text"
              placeholder="Label (e.g. Home, Shop, Mother's House)"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              className="w-full p-2 text-xs border rounded-lg bg-white focus:border-[#075B43] outline-none"
            />
            <input
              type="text"
              placeholder="Full Address in Kadi (Society/Street)"
              value={newAddress}
              onChange={(e) => setNewAddress(e.target.value)}
              className="w-full p-2 text-xs border rounded-lg bg-white focus:border-[#075B43] outline-none"
            />
            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setShowAddressInput(false)}
                className="px-2.5 py-1 text-xs text-gray-500 hover:text-black"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                className="px-3 py-1 bg-[#075B43] text-white text-xs font-bold rounded-lg"
              >
                Save
              </button>
            </div>
          </div>
        )}

        <div className="space-y-2.5">
          {(!profile.savedAddresses || profile.savedAddresses.length === 0) && (
            <div className="text-xs text-gray-500 py-3 text-center">
              No saved addresses yet. Add your home or workplace address.
            </div>
          )}
          {profile.savedAddresses?.map((addr) => (
            <div
              key={addr.id}
              className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 flex items-start gap-2.5"
            >
              <MapPin className="w-4 h-4 text-[#075B43] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-[#111817] flex items-center gap-1.5">
                  <span>{addr.label}</span>
                  {addr.isDefault && (
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">
                      Default
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-[#66706D] mt-0.5 line-clamp-2">
                  {addr.address}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Language Preference */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2.5 flex items-center gap-1.5">
          <Globe className="w-3.5 h-3.5 text-gray-400" />
          <span>Language / ભાષા / भाषा</span>
        </h3>
        <div className="grid grid-cols-3 gap-2">
          {(['English', 'ગુજરાતી', 'हिंदी'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedLanguage(lang)}
              className={`py-2 px-2 text-xs font-bold rounded-xl border transition-all ${
                selectedLanguage === lang
                  ? 'bg-[#075B43] text-white border-[#075B43]'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-gray-300'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Legal & Policies */}
      <div className="bg-white rounded-xl border border-[#E7E9E6] shadow-2xs overflow-hidden divide-y divide-gray-100 text-xs">
        <div className="p-3.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center gap-2.5 font-medium text-gray-800">
            <Shield className="w-4 h-4 text-gray-500" />
            <span>Customer Protection & Safety</span>
          </div>
        </div>
        <div className="p-3.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center gap-2.5 font-medium text-gray-800">
            <FileText className="w-4 h-4 text-gray-500" />
            <span>Terms of Service</span>
          </div>
        </div>
        <div className="p-3.5 flex items-center justify-between hover:bg-gray-50 cursor-pointer">
          <div className="flex items-center gap-2.5 font-medium text-gray-800">
            <Lock className="w-4 h-4 text-gray-500" />
            <span>Privacy Policy</span>
          </div>
        </div>
      </div>

      <div className="text-center mt-6 text-[11px] text-gray-400">
        KaamWala Hyperlocal Services Pvt. Ltd. • Kadi, Gujarat
      </div>
    </div>
  );
};
