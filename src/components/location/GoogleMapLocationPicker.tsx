import React, { useState, useEffect, useCallback } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary,
  useApiIsLoaded,
  useApiLoadingStatus,
  APILoadingStatus
} from '@vis.gl/react-google-maps';
import { Crosshair, Loader2, AlertTriangle } from 'lucide-react';

interface GoogleMapLocationPickerProps {
  latitude: number;
  longitude: number;
  onPositionChange: (lat: number, lng: number) => void;
  height?: string;
  isDraggable?: boolean;
}

/**
 * Controller component to handle smooth panning and camera sync
 */
const MapCameraController: React.FC<{ lat: number; lng: number }> = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    map.panTo({ lat, lng });
  }, [map, lat, lng]);

  return null;
};

export const GoogleMapLocationPicker: React.FC<GoogleMapLocationPickerProps> = ({
  latitude,
  longitude,
  onPositionChange,
  height = '240px',
  isDraggable = true
}) => {
  const map = useMap();
  const isApiLoaded = useApiIsLoaded();
  const loadingStatus = useApiLoadingStatus();
  const mapsLib = useMapsLibrary('maps');
  const markerLib = useMapsLibrary('marker');

  const [authError, setAuthError] = useState<string | null>(null);

  // Intercept Google Maps authentication error (gm_authFailure) for diagnostics
  useEffect(() => {
    const prevAuthFailure = (window as any).gm_authFailure;
    (window as any).gm_authFailure = () => {
      const msg =
        'Google Maps authentication failed (gm_authFailure). Please verify in Google Cloud Console that "Maps JavaScript API" is enabled, billing is active, and the API key allows this referrer.';
      console.error('[Google Maps]', msg);
      setAuthError(msg);
      if (typeof prevAuthFailure === 'function') {
        prevAuthFailure();
      }
    };

    // Capture console error emitted by Google Maps API
    const handleWindowError = (event: ErrorEvent) => {
      if (
        event.message &&
        (event.message.includes('Google Maps JavaScript API error') ||
          event.message.includes('ApiNotActivatedMapError') ||
          event.message.includes('RefererNotAllowedMapError') ||
          event.message.includes('BillingNotEnabledMapError'))
      ) {
        console.error('[Google Maps Error Event]', event.message);
        setAuthError(event.message);
      }
    };

    window.addEventListener('error', handleWindowError);

    return () => {
      (window as any).gm_authFailure = prevAuthFailure;
      window.removeEventListener('error', handleWindowError);
    };
  }, []);

  const handleDragEnd = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const newLat = e.latLng.lat();
        const newLng = e.latLng.lng();
        onPositionChange(newLat, newLng);
      }
    },
    [onPositionChange]
  );

  const handleMapClick = useCallback(
    (e: { detail: { latLng: { lat: number; lng: number } | null } }) => {
      if (e.detail.latLng) {
        onPositionChange(e.detail.latLng.lat, e.detail.latLng.lng);
      }
    },
    [onPositionChange]
  );

  const handleRecenter = () => {
    if (map) {
      map.panTo({ lat: latitude, lng: longitude });
      map.setZoom(16);
    }
  };

  // Check whether all required Google Maps libraries have finished loading
  const isReady = isApiLoaded && Boolean(mapsLib) && Boolean(markerLib);
  const isFailed =
    loadingStatus === APILoadingStatus.FAILED ||
    loadingStatus === APILoadingStatus.AUTH_FAILURE ||
    Boolean(authError);

  const customMapId =
    (typeof import.meta !== 'undefined' &&
      (import.meta as { env?: Record<string, string> }).env?.VITE_GOOGLE_MAPS_MAP_ID) ||
    'DEMO_MAP_ID';

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-[#E7E9E6] shadow-2xs bg-gray-100"
      style={{ height }}
    >
      {isFailed ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-amber-50/70 text-center">
          <AlertTriangle className="w-6 h-6 text-amber-600 mb-2" />
          <div className="text-xs font-bold text-gray-800 mb-1">Google Maps Setup Required</div>
          <p className="text-[11px] text-gray-600 max-w-xs leading-relaxed">
            {authError ||
              'Unable to authenticate Google Maps. Please ensure Maps JavaScript API is enabled in your Google Cloud project and billing is active.'}
          </p>
        </div>
      ) : !isReady ? (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50 text-gray-500">
          <Loader2 className="w-6 h-6 text-[#075B43] animate-spin mb-2" />
          <span className="text-xs font-medium text-gray-600">Loading interactive map...</span>
        </div>
      ) : (
        <>
          <Map
            mapId={customMapId}
            defaultCenter={{ lat: latitude, lng: longitude }}
            defaultZoom={16}
            center={{ lat: latitude, lng: longitude }}
            gestureHandling="greedy"
            disableDefaultUI={true}
            zoomControl={true}
            onClick={handleMapClick}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
            className="w-full h-full"
          >
            <MapCameraController lat={latitude} lng={longitude} />

            <AdvancedMarker
              position={{ lat: latitude, lng: longitude }}
              draggable={isDraggable}
              onDragEnd={handleDragEnd}
              title="Drag pin to fine-tune your location"
            >
              <Pin
                background="#075B43"
                glyphColor="#FFFFFF"
                borderColor="#054432"
                scale={1.15}
              />
            </AdvancedMarker>
          </Map>

          {/* Floating Recenter Pill Button */}
          <button
            type="button"
            onClick={handleRecenter}
            className="absolute bottom-3 right-3 z-10 p-2 bg-white/95 hover:bg-white text-gray-700 hover:text-[#075B43] rounded-lg shadow-md border border-gray-200 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
            title="Recenter map"
            aria-label="Recenter map"
          >
            <Crosshair className="w-4 h-4 text-[#075B43]" />
            <span className="hidden sm:inline">Recenter</span>
          </button>

          {/* Subtle interaction tip */}
          <div className="absolute top-2 left-2 z-10 bg-black/60 backdrop-blur-xs text-white text-[11px] font-medium px-2.5 py-1 rounded-md pointer-events-none">
            Tap map or drag pin to adjust
          </div>
        </>
      )}
    </div>
  );
};
