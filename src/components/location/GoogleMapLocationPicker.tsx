import React, { useEffect, useCallback } from 'react';
import {
  Map,
  AdvancedMarker,
  Pin,
  useMap,
  useMapsLibrary
} from '@vis.gl/react-google-maps';
import { Crosshair } from 'lucide-react';

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

  return (
    <div
      className="relative w-full rounded-xl overflow-hidden border border-[#E7E9E6] shadow-2xs bg-gray-100"
      style={{ height }}
    >
      <Map
        mapId="DEMO_MAP_ID"
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
        className="absolute bottom-3 right-3 z-10 p-2 bg-white/95 hover:bg-white text-gray-700 hover:text-[#075B43] rounded-lg shadow-md border border-gray-200 active:scale-95 transition-all flex items-center gap-1.5 text-xs font-semibold"
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
    </div>
  );
};
