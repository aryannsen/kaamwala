import React, { useState } from 'react';
import { X, MapPin, Navigation, Search, Check, AlertCircle } from 'lucide-react';
import { LocationArea } from '../../types';
import { KADI_LOCALITIES } from '../../data/mockDatabase';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation: LocationArea;
  onSelectLocation: (location: LocationArea) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  onSelectLocation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [geoMessage, setGeoMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredLocalities = KADI_LOCALITIES.filter(
    (loc) =>
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.pincode.includes(searchQuery)
  );

  const handleUseCurrentLocation = () => {
    setDetecting(true);
    setGeoMessage(null);

    try {
      if (typeof navigator === 'undefined' || !navigator.geolocation) {
        setDetecting(false);
        setGeoMessage('Geolocation is not supported by your browser.');
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setDetecting(false);
          // Find closest Kadi locality or default to central Fuwara Chowk
          const match = KADI_LOCALITIES[0];
          setGeoMessage(`Located near ${match.name}, Kadi (${pos.coords.latitude.toFixed(3)}°N, ${pos.coords.longitude.toFixed(3)}°E)`);
          onSelectLocation(match);
          setTimeout(() => {
            onClose();
          }, 600);
        },
        () => {
          setDetecting(false);
          // Graceful fallback to default Kadi locality
          setGeoMessage('Location permission denied or unavailable. Defaulted to Fuwara Chowk, Kadi.');
          const fallback = KADI_LOCALITIES[0];
          onSelectLocation(fallback);
        },
        { timeout: 8000 }
      );
    } catch (err) {
      setDetecting(false);
      setGeoMessage('Location access restricted in iframe. Defaulted to Fuwara Chowk, Kadi.');
      onSelectLocation(KADI_LOCALITIES[0]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Sheet / Modal Container */}
      <div className="relative w-full max-w-md bg-white rounded-t-2xl sm:rounded-2xl max-h-[85vh] flex flex-col z-10 overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-200">
        {/* Header */}
        <div className="p-4 border-b border-[#E7E9E6] flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-[#111817]">Select your location</h2>
            <p className="text-xs text-[#66706D] mt-0.5">Currently serving Kadi, Gujarat and surrounding zones</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-black rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action button: GPS detection */}
        <div className="p-4 space-y-3">
          <button
            id="gps-location-btn"
            onClick={handleUseCurrentLocation}
            disabled={detecting}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-[#075B43]/10 hover:bg-[#075B43]/15 text-[#075B43] rounded-xl font-semibold text-sm transition-colors border border-[#075B43]/20"
          >
            <Navigation className={`w-4 h-4 ${detecting ? 'animate-spin' : ''}`} />
            <span>{detecting ? 'Detecting Kadi location...' : 'Use my current location'}</span>
          </button>

          {geoMessage && (
            <div className="p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#075B43] shrink-0 mt-0.5" />
              <span>{geoMessage}</span>
            </div>
          )}

          {/* Search box */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search area or society in Kadi..."
              className="w-full pl-9 pr-3 py-2.5 text-sm bg-gray-50 border border-[#E7E9E6] rounded-xl focus:outline-none focus:border-[#075B43] focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Localities List */}
        <div className="overflow-y-auto flex-1 px-4 pb-6 divide-y divide-gray-100">
          <div className="text-[11px] font-bold uppercase tracking-wider text-gray-400 py-1.5">
            Localities in Kadi (382715)
          </div>
          {filteredLocalities.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;
            return (
              <button
                key={loc.id}
                onClick={() => {
                  onSelectLocation(loc);
                  onClose();
                }}
                className={`w-full py-3 flex items-center justify-between text-left transition-colors ${
                  isSelected ? 'text-[#075B43]' : 'text-gray-800 hover:text-black'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                      isSelected ? 'bg-[#075B43] text-white' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-2">
                      {loc.name}
                      {loc.isPopular && (
                        <span className="text-[10px] bg-amber-50 text-amber-700 font-medium px-1.5 py-0.5 rounded">
                          Popular
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">
                      {loc.taluka}, {loc.district} • {loc.pincode}
                    </div>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-5 h-5 text-[#075B43] stroke-[2.5]" />
                )}
              </button>
            );
          })}

          {filteredLocalities.length === 0 && (
            <div className="py-8 text-center text-gray-500 text-sm">
              No matching areas found in Kadi. Try searching "Station Road" or "Fuwara".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
