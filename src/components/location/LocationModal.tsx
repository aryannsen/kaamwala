import React, { useState, useEffect } from 'react';
import {
  X,
  Navigation,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Building2,
  Home
} from 'lucide-react';
import { CustomerLocation, LocationArea } from '../../types';
import { saveAddressToSupabase } from '../../services/locationService';
import { KADI_LOCALITIES } from '../../data/mockDatabase';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: CustomerLocation | null;
  onConfirmLocation: (location: CustomerLocation) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onConfirmLocation
}) => {
  const [addressLine, setAddressLine] = useState('');
  const [locality, setLocality] = useState('');
  const [city, setCity] = useState('Kadi');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('382715');

  // GPS coordinates captured via navigator.geolocation
  const [gpsCoords, setGpsCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);

  // Initialize fields from existing currentLocation when opening
  useEffect(() => {
    if (isOpen) {
      if (currentLocation) {
        setAddressLine(currentLocation.formattedAddress?.split(',')[0] || '');
        setLocality(currentLocation.locality || '');
        setCity(currentLocation.city || 'Kadi');
        setState(currentLocation.state || 'Gujarat');
        setPincode(currentLocation.pincode || '382715');
        if (currentLocation.latitude && currentLocation.longitude) {
          setGpsCoords({
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude
          });
        }
      } else {
        setAddressLine('');
        setLocality('');
        setCity('Kadi');
        setState('Gujarat');
        setPincode('382715');
        setGpsCoords(null);
      }
      setStatusMessage(null);
    }
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  // 1. "Use my current location" using browser Geolocation API ONLY
  const handleUseCurrentLocation = () => {
    setIsDetectingGps(true);
    setStatusMessage(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setIsDetectingGps(false);
      setStatusMessage({
        type: 'error',
        text: 'Geolocation is not supported by your browser. Please enter your address manually.'
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setGpsCoords({ latitude: lat, longitude: lng });
        setIsDetectingGps(false);
        setStatusMessage({
          type: 'success',
          text: `Current GPS coordinates detected (${lat.toFixed(4)}°N, ${lng.toFixed(4)}°E). Please enter your flat/house & street below.`
        });
      },
      (error) => {
        setIsDetectingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setStatusMessage({
            type: 'error',
            text: 'Location permission was denied. You can easily enter your address manually below.'
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: "Your current location couldn't be detected right now. Please enter your address below."
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  // 2. Quick locality selection preset
  const handleSelectLocalityPreset = (loc: LocationArea) => {
    setLocality(loc.name);
    setCity(loc.taluka || 'Kadi');
    setPincode(loc.pincode || '382715');
    setStatusMessage({
      type: 'info',
      text: `Selected ${loc.name}. Please enter your house / flat number.`
    });
  };

  // Compute combined formatted address preview
  const formattedPreview = [
    addressLine.trim(),
    locality.trim(),
    city.trim(),
    `${state.trim()} ${pincode.trim()}`
  ]
    .filter(Boolean)
    .join(', ');

  const canConfirm = Boolean(addressLine.trim() || locality.trim());

  // 3. Confirm location and save to Supabase customer_addresses
  const handleConfirm = async () => {
    if (!canConfirm) return;
    setIsSaving(true);

    try {
      const fullAddress = formattedPreview || `${locality || city || 'Kadi'}, Gujarat`;

      const confirmedLocation: CustomerLocation = {
        latitude: gpsCoords?.latitude ?? 0,
        longitude: gpsCoords?.longitude ?? 0,
        formattedAddress: fullAddress,
        locality: locality.trim() || undefined,
        city: city.trim() || 'Kadi',
        state: state.trim() || 'Gujarat',
        pincode: pincode.trim() || '382715',
        source: gpsCoords ? 'gps' : 'search',
        confirmedAt: new Date().toISOString()
      };

      // Save to Supabase customer_addresses and local storage
      await saveAddressToSupabase(confirmedLocation);

      onConfirmLocation(confirmedLocation);
      onClose();
    } catch (err) {
      console.warn('Error saving location:', err);
      const fallbackLoc: CustomerLocation = {
        latitude: gpsCoords?.latitude ?? 0,
        longitude: gpsCoords?.longitude ?? 0,
        formattedAddress: formattedPreview,
        locality: locality.trim() || undefined,
        city: city.trim() || 'Kadi',
        state: state.trim() || 'Gujarat',
        pincode: pincode.trim() || '382715',
        source: gpsCoords ? 'gps' : 'search'
      };
      onConfirmLocation(fallbackLoc);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Modal Sheet Container */}
      <div className="relative w-full max-w-lg bg-white rounded-t-2xl sm:rounded-2xl max-h-[92vh] flex flex-col z-10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#E7E9E6] flex items-center justify-between bg-white shrink-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#111817]">Select your location</h2>
            <p className="text-xs text-[#66706D] mt-0.5">
              Service address for doorstep visits in Kadi & surrounding areas
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-4">
          {/* Action 1: Use my current location (Browser Geolocation API) */}
          <button
            id="gps-location-btn"
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetectingGps}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[#075B43] hover:bg-[#054432] active:bg-[#043426] text-white rounded-xl font-semibold text-sm transition-all shadow-2xs cursor-pointer min-h-[44px]"
          >
            {isDetectingGps ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Navigation className="w-4 h-4 text-white" />
            )}
            <span>
              {isDetectingGps ? 'Detecting your GPS location...' : 'Use my current location'}
            </span>
          </button>

          {/* Status Message / GPS info banner */}
          {statusMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 transition-all ${
                statusMessage.type === 'error'
                  ? 'bg-rose-50 border-rose-200 text-rose-800'
                  : statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-blue-50 border-blue-200 text-blue-900'
              }`}
            >
              <AlertCircle
                className={`w-4 h-4 shrink-0 mt-0.5 ${
                  statusMessage.type === 'error'
                    ? 'text-rose-600'
                    : statusMessage.type === 'success'
                    ? 'text-emerald-700'
                    : 'text-blue-600'
                }`}
              />
              <span className="leading-snug">{statusMessage.text}</span>
            </div>
          )}

          {/* GPS Coordinates Badge (if captured) */}
          {gpsCoords && (
            <div className="flex items-center justify-between px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800">
              <span className="flex items-center gap-1.5 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
                GPS Coordinates Acquired
              </span>
              <span className="font-mono text-[11px] text-emerald-700">
                {gpsCoords.latitude.toFixed(4)}°N, {gpsCoords.longitude.toFixed(4)}°E
              </span>
            </div>
          )}

          {/* Manual Address Input Fields */}
          <div className="space-y-3 pt-1">
            <div>
              <label htmlFor="address-line-input" className="block text-xs font-semibold text-gray-700 mb-1">
                House / Flat / Building / Street <span className="text-red-500">*</span>
              </label>
              <input
                id="address-line-input"
                type="text"
                value={addressLine}
                onChange={(e) => setAddressLine(e.target.value)}
                placeholder="e.g. Flat 302, Gokul Heights, Station Road"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E7E9E6] rounded-xl text-sm text-[#111817] focus:outline-none focus:ring-2 focus:ring-[#075B43] focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>

            <div>
              <label htmlFor="locality-input" className="block text-xs font-semibold text-gray-700 mb-1">
                Locality / Area <span className="text-red-500">*</span>
              </label>
              <input
                id="locality-input"
                type="text"
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                placeholder="e.g. Swastik Society, Fuwara Chowk"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E7E9E6] rounded-xl text-sm text-[#111817] focus:outline-none focus:ring-2 focus:ring-[#075B43] focus:border-transparent transition-all placeholder:text-gray-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="city-input" className="block text-xs font-semibold text-gray-700 mb-1">
                  City / Taluka
                </label>
                <input
                  id="city-input"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Kadi"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E7E9E6] rounded-xl text-sm text-[#111817] focus:outline-none focus:ring-2 focus:ring-[#075B43] focus:border-transparent transition-all placeholder:text-gray-400"
                />
              </div>

              <div>
                <label htmlFor="pincode-input" className="block text-xs font-semibold text-gray-700 mb-1">
                  Pincode
                </label>
                <input
                  id="pincode-input"
                  type="text"
                  maxLength={6}
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  placeholder="382715"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E7E9E6] rounded-xl text-sm text-[#111817] focus:outline-none focus:ring-2 focus:ring-[#075B43] focus:border-transparent transition-all placeholder:text-gray-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Quick Popular Localities in Kadi */}
          <div className="pt-2">
            <div className="text-xs font-semibold text-[#66706D] mb-2 flex items-center gap-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>Popular Localities in Kadi</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {KADI_LOCALITIES.slice(0, 6).map((loc) => (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => handleSelectLocalityPreset(loc)}
                  className={`px-2.5 py-1.5 text-xs rounded-lg border font-medium transition-colors cursor-pointer ${
                    locality === loc.name
                      ? 'bg-[#075B43] text-white border-[#075B43]'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-700 border-[#E7E9E6]'
                  }`}
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Footer Card */}
        <div className="p-4 border-t border-[#E7E9E6] bg-gray-50 shrink-0 space-y-3">
          {formattedPreview ? (
            <div className="bg-white p-3 rounded-xl border border-[#E7E9E6] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#075B43] bg-[#075B43]/10 px-2 py-0.5 rounded">
                  {gpsCoords ? 'GPS Verified Address' : 'Doorstep Address'}
                </span>
                {gpsCoords && (
                  <span className="text-[11px] text-gray-400 font-mono">
                    {gpsCoords.latitude.toFixed(4)}°N, {gpsCoords.longitude.toFixed(4)}°E
                  </span>
                )}
              </div>
              <div className="text-sm font-bold text-[#111817] mt-1.5 leading-snug line-clamp-2">
                {formattedPreview}
              </div>
            </div>
          ) : (
            <div className="text-center py-1.5 text-xs text-gray-500">
              Enter your address details or tap &ldquo;Use my current location&rdquo; above.
            </div>
          )}

          <button
            id="confirm-location-btn"
            type="button"
            onClick={handleConfirm}
            disabled={!canConfirm || isSaving}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] ${
              canConfirm && !isSaving
                ? 'bg-[#075B43] hover:bg-[#054432] text-white shadow-md active:scale-98 cursor-pointer'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving Address...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Confirm Location</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
