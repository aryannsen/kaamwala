import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Navigation,
  MapPin,
  Check,
  AlertCircle,
  Loader2,
  Building2,
  Crosshair
} from 'lucide-react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { CustomerLocation, LocationArea } from '../../types';
import {
  reverseGeocodeCoordinates,
  saveAddressToSupabase,
  extractAddressComponents
} from '../../services/locationService';
import { GoogleMapLocationPicker } from './GoogleMapLocationPicker';
import { LocationSearchInput } from './LocationSearchInput';
import { KADI_LOCALITIES } from '../../data/mockDatabase';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: CustomerLocation | null;
  onConfirmLocation: (location: CustomerLocation) => void;
}

// Default geographic center for Kadi, Gujarat service area (used only for initial camera view if no location chosen)
const KADI_CENTER = {
  lat: 23.3032,
  lng: 72.3312
};

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onConfirmLocation
}) => {
  const apiKey = (
    (typeof import.meta !== 'undefined' &&
      (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_API_KEY) ||
    ''
  ).trim();

  // Temporary staging state before customer taps [Confirm Location]
  const [stagedLocation, setStagedLocation] = useState<CustomerLocation | null>(null);
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'info' | 'error' | 'success'; text: string } | null>(null);
  const [mapLoadError, setMapLoadError] = useState<string | null>(null);

  // Initialize staged location whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setStagedLocation(currentLocation || null);
      setStatusMessage(null);
      setMapLoadError(null);
    }
  }, [isOpen, currentLocation]);

  if (!isOpen) return null;

  // 1. "Use my current location" flow (Geolocation API + Reverse Geocode)
  const handleUseCurrentLocation = () => {
    setIsDetectingGps(true);
    setStatusMessage(null);

    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setIsDetectingGps(false);
      setStatusMessage({
        type: 'error',
        text: "Your current location couldn't be detected. Search for your location instead."
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        setIsDetectingGps(false);
        setIsGeocoding(true);

        try {
          // Reverse geocode real coordinates using Google Geocoding API
          const geoRes = await reverseGeocodeCoordinates(lat, lng);
          const newLoc: CustomerLocation = {
            latitude: lat,
            longitude: lng,
            formattedAddress: geoRes.formattedAddress,
            locality: geoRes.locality,
            city: geoRes.city,
            state: geoRes.state,
            pincode: geoRes.pincode,
            source: 'gps'
          };

          setStagedLocation(newLoc);
          setStatusMessage({
            type: 'success',
            text: 'Current location found. Please confirm below.'
          });
        } catch (err: any) {
          console.warn('Reverse geocoding error:', err);
          // Still provide accurate GPS coordinates if geocoding service is busy
          const fallbackLoc: CustomerLocation = {
            latitude: lat,
            longitude: lng,
            formattedAddress: `Location at ${lat.toFixed(5)}, ${lng.toFixed(5)}`,
            locality: 'Kadi Service Zone',
            city: 'Kadi',
            state: 'Gujarat',
            source: 'gps'
          };
          setStagedLocation(fallbackLoc);
          setStatusMessage({
            type: 'info',
            text: 'Current GPS coordinates detected. Adjust pin on map if needed.'
          });
        } finally {
          setIsGeocoding(false);
        }
      },
      (error) => {
        setIsDetectingGps(false);
        if (error.code === error.PERMISSION_DENIED) {
          setStatusMessage({
            type: 'error',
            text: 'Location permission was denied. You can search for your address manually.'
          });
        } else {
          setStatusMessage({
            type: 'error',
            text: "Your current location couldn't be detected. Search for your location instead."
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

  // 2. Search selection flow (Places API Autocomplete)
  const handleSelectPlace = (place: {
    latitude: number;
    longitude: number;
    formattedAddress: string;
    locality?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }) => {
    const newLoc: CustomerLocation = {
      latitude: place.latitude,
      longitude: place.longitude,
      formattedAddress: place.formattedAddress,
      locality: place.locality,
      city: place.city,
      state: place.state,
      pincode: place.pincode,
      source: 'search'
    };

    setStagedLocation(newLoc);
    setStatusMessage({
      type: 'success',
      text: 'Location selected. Verify on the map and confirm.'
    });
  };

  // 3. Map pin drag or click adjustment
  const handleMapPositionChange = async (lat: number, lng: number) => {
    setIsGeocoding(true);
    try {
      const geoRes = await reverseGeocodeCoordinates(lat, lng);
      setStagedLocation({
        latitude: lat,
        longitude: lng,
        formattedAddress: geoRes.formattedAddress,
        locality: geoRes.locality,
        city: geoRes.city,
        state: geoRes.state,
        pincode: geoRes.pincode,
        source: 'map'
      });
    } catch {
      setStagedLocation((prev) => ({
        latitude: lat,
        longitude: lng,
        formattedAddress: prev?.formattedAddress || `Pin Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
        locality: prev?.locality,
        city: prev?.city,
        state: prev?.state,
        pincode: prev?.pincode,
        source: 'map'
      }));
    } finally {
      setIsGeocoding(false);
    }
  };

  // 4. Quick locality pick (Geocodes chosen Kadi landmark)
  const handleSelectLocalityPreset = (loc: LocationArea) => {
    // Reverse geocode or set known Kadi landmark
    const newLoc: CustomerLocation = {
      latitude: KADI_CENTER.lat,
      longitude: KADI_CENTER.lng,
      formattedAddress: `${loc.name}, Kadi, Gujarat ${loc.pincode}`,
      locality: loc.name,
      city: loc.taluka,
      state: 'Gujarat',
      pincode: loc.pincode,
      source: 'search'
    };
    setStagedLocation(newLoc);
    setStatusMessage({
      type: 'info',
      text: `Selected ${loc.name}. Fine-tune with the map pin if needed.`
    });
  };

  // 5. Final Confirmation -> Supabase + App state
  const handleConfirm = async () => {
    if (!stagedLocation) return;
    setIsSaving(true);

    try {
      const confirmed: CustomerLocation = {
        ...stagedLocation,
        confirmedAt: new Date().toISOString()
      };

      // Save to Supabase customer_addresses and local storage
      await saveAddressToSupabase(confirmed);

      // Notify parent app
      onConfirmLocation(confirmed);
      onClose();
    } catch (err) {
      console.warn('Error confirming location:', err);
      if (stagedLocation) {
        onConfirmLocation(stagedLocation);
      }
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const activeLat = stagedLocation?.latitude ?? KADI_CENTER.lat;
  const activeLng = stagedLocation?.longitude ?? KADI_CENTER.lng;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Sheet / Modal Container */}
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
            className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto flex-1 p-4 space-y-3.5">
          {/* Action 1: Use my current location (GPS) */}
          <button
            id="gps-location-btn"
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isDetectingGps || isGeocoding}
            className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[#075B43] hover:bg-[#054432] active:bg-[#043426] text-white rounded-xl font-semibold text-sm transition-all shadow-2xs cursor-pointer min-h-[44px]"
          >
            {isDetectingGps || isGeocoding ? (
              <Loader2 className="w-4 h-4 animate-spin text-white" />
            ) : (
              <Navigation className="w-4 h-4 text-white" />
            )}
            <span>
              {isDetectingGps
                ? 'Detecting your GPS location...'
                : isGeocoding
                ? 'Resolving address details...'
                : 'Use my current location'}
            </span>
          </button>

          {/* Action 2: Search Location (Google Places Autocomplete) */}
          {apiKey ? (
            <APIProvider
              apiKey={apiKey}
              libraries={['places', 'marker', 'geocoding']}
              onLoad={() => setMapLoadError(null)}
              onError={() =>
                setMapLoadError('Map couldn\'t be loaded right now. Please try again or search for your address.')
              }
            >
              <div className="space-y-3.5">
                <div>
                  <label htmlFor="location-search-input" className="block text-xs font-semibold text-gray-700 mb-1.5">
                    Search area or address
                  </label>
                  <LocationSearchInput
                    onSelectPlace={handleSelectPlace}
                    onError={(msg) => setStatusMessage({ type: 'error', text: msg })}
                  />
                </div>

                {/* Status / Alert Banner */}
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

                {mapLoadError && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>{mapLoadError}</span>
                  </div>
                )}

                {/* Interactive Google Map with live marker */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-gray-700">Map View</span>
                    {stagedLocation && (
                      <span className="text-[11px] text-[#075B43] font-medium flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#075B43] animate-pulse" />
                        Pin Active
                      </span>
                    )}
                  </div>

                  <GoogleMapLocationPicker
                    latitude={activeLat}
                    longitude={activeLng}
                    onPositionChange={handleMapPositionChange}
                    height="220px"
                    isDraggable={true}
                  />
                </div>
              </div>
            </APIProvider>
          ) : (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 space-y-1">
              <div className="font-semibold">Google Maps Platform Key Required</div>
              <div>Please set VITE_GOOGLE_MAPS_API_KEY to activate interactive maps and places search.</div>
            </div>
          )}

          {/* Quick Popular Localities in Kadi */}
          <div className="pt-1">
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
                  className="px-2.5 py-1.5 text-xs bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg border border-[#E7E9E6] font-medium transition-colors"
                >
                  {loc.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Confirmation Footer Card */}
        <div className="p-4 border-t border-[#E7E9E6] bg-gray-50 shrink-0 space-y-3">
          {stagedLocation ? (
            <div className="bg-white p-3 rounded-xl border border-[#E7E9E6] shadow-2xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold tracking-wider uppercase text-[#075B43] bg-[#075B43]/10 px-2 py-0.5 rounded">
                  {stagedLocation.source === 'gps'
                    ? 'Current GPS Location'
                    : stagedLocation.source === 'search'
                    ? 'Searched Address'
                    : 'Map Pin Location'}
                </span>
                <span className="text-[11px] text-gray-400 font-mono">
                  {stagedLocation.latitude.toFixed(4)}°N, {stagedLocation.longitude.toFixed(4)}°E
                </span>
              </div>

              <div className="text-sm font-bold text-[#111817] mt-1.5 leading-snug line-clamp-2">
                {stagedLocation.formattedAddress}
              </div>

              {(stagedLocation.locality || stagedLocation.city) && (
                <div className="text-xs text-[#66706D] mt-0.5">
                  {[stagedLocation.locality, stagedLocation.city, stagedLocation.state, stagedLocation.pincode]
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-2 text-xs text-gray-500">
              No location selected yet. Tap &ldquo;Use my current location&rdquo; or search above.
            </div>
          )}

          <button
            id="confirm-location-btn"
            type="button"
            onClick={handleConfirm}
            disabled={!stagedLocation || isSaving || isGeocoding}
            className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all min-h-[44px] ${
              stagedLocation && !isSaving && !isGeocoding
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
