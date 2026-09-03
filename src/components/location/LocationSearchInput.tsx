import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, MapPin, Loader2 } from 'lucide-react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';
import { extractAddressComponents } from '../../services/locationService';

interface PlaceResultData {
  latitude: number;
  longitude: number;
  formattedAddress: string;
  locality?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

interface LocationSearchInputProps {
  onSelectPlace: (place: PlaceResultData) => void;
  placeholder?: string;
  onError?: (message: string) => void;
  biasCoordinates?: { latitude: number; longitude: number } | null;
  biasRadiusMeters?: number;
}

export const LocationSearchInput: React.FC<LocationSearchInputProps> = ({
  onSelectPlace,
  placeholder = 'Search area, society, landmark, or street...',
  onError,
  biasCoordinates,
  biasRadiusMeters = 35000
}) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Array<{ id: string; title: string; subtitle: string; raw: any }>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const placesLib = useMapsLibrary('places');
  const geocodingLib = useMapsLibrary('geocoding');
  const sessionTokenRef = useRef<any>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Initialize session token when places library is available
  useEffect(() => {
    const places = placesLib || (typeof window !== 'undefined' ? (window as any).google?.maps?.places : null);
    if (places?.AutocompleteSessionToken && !sessionTokenRef.current) {
      sessionTokenRef.current = new places.AutocompleteSessionToken();
    }
  }, [placesLib]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debouncing and dynamic location bias
  const fetchSuggestions = useCallback(
    async (input: string) => {
      if (!input.trim() || input.length < 2) {
        setSuggestions([]);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);

      try {
        const places = placesLib || (typeof window !== 'undefined' ? (window as any).google?.maps?.places : null);

        // Build dynamic geographic location bias using customer's current coordinates
        const hasValidCoordinates =
          biasCoordinates &&
          typeof biasCoordinates.latitude === 'number' &&
          typeof biasCoordinates.longitude === 'number' &&
          !isNaN(biasCoordinates.latitude) &&
          !isNaN(biasCoordinates.longitude);

        // Google Places API specifies radius in meters between 0.0 and 50000.0 (inclusive)
        const safeRadius = Math.min(50000, Math.max(1000, biasRadiusMeters || 35000));

        // Circular location bias favors places within this area without restricting outside searches
        const locationBias = hasValidCoordinates
          ? {
              center: {
                lat: biasCoordinates.latitude,
                lng: biasCoordinates.longitude
              },
              radius: safeRadius
            }
          : undefined;

        // Origin enables geodesic distance calculations from customer's coordinates
        const origin = hasValidCoordinates
          ? {
              lat: biasCoordinates.latitude,
              lng: biasCoordinates.longitude
            }
          : undefined;

        // Modern Places API (New): AutocompleteSuggestion
        if (places?.AutocompleteSuggestion?.fetchAutocompleteSuggestions) {
          if (!sessionTokenRef.current && places.AutocompleteSessionToken) {
            sessionTokenRef.current = new places.AutocompleteSessionToken();
          }

          const request: any = {
            input,
            sessionToken: sessionTokenRef.current,
            internalUsageAttributionIds: ['gmp_mcp_codeassist_v1_aistudio']
          };

          if (locationBias) {
            request.locationBias = locationBias;
          }
          if (origin) {
            request.origin = origin;
          }

          const response = await places.AutocompleteSuggestion.fetchAutocompleteSuggestions(request);

          const items = (response.suggestions || [])
            .filter((s: any) => s.placePrediction)
            .map((s: any, idx: number) => {
              const pred = s.placePrediction;
              return {
                id: pred.placeId || `pred-${idx}`,
                title: pred.mainText?.text || pred.text?.text || 'Address',
                subtitle: pred.secondaryText?.text || '',
                raw: s
              };
            });

          setSuggestions(items);
          setIsOpen(items.length > 0);
        } else if (places?.AutocompleteService) {
          // Fallback to AutocompleteService
          const service = new places.AutocompleteService();
          const legacyRequest: any = {
            input,
            sessionToken: sessionTokenRef.current
          };

          if (locationBias) {
            legacyRequest.locationBias = locationBias;
          }
          if (origin) {
            legacyRequest.origin = origin;
          }

          service.getPlacePredictions(legacyRequest, (predictions: any, status: any) => {
            const placesServiceStatus =
              (window as any).google?.maps?.places?.PlacesServiceStatus || { OK: 'OK' };
            if (status === placesServiceStatus.OK && predictions) {
              const items = predictions.map((p: any) => ({
                id: p.place_id,
                title: p.structured_formatting?.main_text || p.description,
                subtitle: p.structured_formatting?.secondary_text || '',
                raw: p
              }));
              setSuggestions(items);
              setIsOpen(items.length > 0);
            } else {
              setSuggestions([]);
              setIsOpen(false);
            }
          });
        }
      } catch (err: any) {
        console.warn('Place autocomplete lookup notice:', err?.message);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [placesLib, biasCoordinates?.latitude, biasCoordinates?.longitude, biasRadiusMeters]
  );

  const handleInputChange = (val: string) => {
    setQuery(val);
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (!val.trim()) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 280);
  };

  const handleSelectSuggestion = async (item: { id: string; title: string; subtitle: string; raw: any }) => {
    setIsLoading(true);
    setIsOpen(false);
    setQuery(`${item.title}${item.subtitle ? ', ' + item.subtitle : ''}`);

    try {
      // 1. Try modern Place.fetchFields
      if (item.raw?.placePrediction?.toPlace) {
        const place = item.raw.placePrediction.toPlace();
        await place.fetchFields({
          fields: ['displayName', 'formattedAddress', 'location', 'addressComponents']
        });

        const lat = place.location?.lat();
        const lng = place.location?.lng();

        if (typeof lat === 'number' && typeof lng === 'number') {
          const parsed = extractAddressComponents(
            (place.addressComponents || []).map((c: any) => ({
              long_name: c.longText,
              short_name: c.shortText,
              types: c.types
            }))
          );

          onSelectPlace({
            latitude: lat,
            longitude: lng,
            formattedAddress: place.formattedAddress || `${item.title}, ${item.subtitle}`,
            locality: parsed.locality,
            city: parsed.city,
            state: parsed.state,
            pincode: parsed.pincode
          });

          // Reset session token after selection
          const places = placesLib || (typeof window !== 'undefined' ? (window as any).google?.maps?.places : null);
          if (places?.AutocompleteSessionToken) {
            sessionTokenRef.current = new places.AutocompleteSessionToken();
          }
          setIsLoading(false);
          return;
        }
      }

      // 2. Geocoding fallback by placeId
      const geocoder = geocodingLib
        ? new geocodingLib.Geocoder()
        : typeof window !== 'undefined' && (window as any).google?.maps?.Geocoder
        ? new (window as any).google.maps.Geocoder()
        : null;

      if (geocoder) {
        geocoder.geocode({ placeId: item.id }, (results: any, status: any) => {
          setIsLoading(false);
          const okStatus = (window as any).google?.maps?.GeocoderStatus?.OK || 'OK';
          if (status === okStatus && results && results[0]) {
            const res = results[0];
            const lat = res.geometry.location.lat();
            const lng = res.geometry.location.lng();
            const parsed = extractAddressComponents(res.address_components as any);

            onSelectPlace({
              latitude: lat,
              longitude: lng,
              formattedAddress: res.formatted_address || `${item.title}, ${item.subtitle}`,
              locality: parsed.locality,
              city: parsed.city,
              state: parsed.state,
              pincode: parsed.pincode
            });
          } else {
            onError?.("Could not load details for this place. Please try another search.");
          }
        });
      } else {
        setIsLoading(false);
      }
    } catch (err: any) {
      setIsLoading(false);
      console.warn('Failed to resolve selected place:', err);
      onError?.("Unable to resolve selected location coordinates.");
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          id="location-search-input"
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-[#E7E9E6] rounded-xl focus:outline-none focus:border-[#075B43] focus:bg-white transition-all text-[#111817] placeholder:text-gray-400"
          autoComplete="off"
        />
        {isLoading ? (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#075B43] animate-spin" />
        ) : query ? (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full"
            aria-label="Clear search input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        ) : null}
      </div>

      {/* Autocomplete Dropdown List */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white border border-[#E7E9E6] rounded-xl shadow-xl z-50 max-h-60 overflow-y-auto divide-y divide-gray-100">
          {suggestions.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelectSuggestion(item)}
              className="w-full px-3.5 py-2.5 flex items-start gap-2.5 text-left hover:bg-gray-50 transition-colors"
            >
              <MapPin className="w-4 h-4 text-[#075B43] shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-[#111817] truncate">{item.title}</div>
                {item.subtitle && (
                  <div className="text-xs text-[#66706D] truncate">{item.subtitle}</div>
                )}
              </div>
            </button>
          ))}

          {suggestions.length === 0 && !isLoading && (
            <div className="px-4 py-3 text-xs text-gray-500 text-center">
              No matching location found.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
