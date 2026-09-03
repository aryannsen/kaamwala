import React from 'react';
import { CustomerLocation, LocationArea } from '../../types';
import { LocationModal as ModernLocationModal } from '../location/LocationModal';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLocation?: LocationArea | CustomerLocation | null;
  currentLocation?: CustomerLocation | null;
  onSelectLocation?: (location: LocationArea) => void;
  onConfirmLocation?: (location: CustomerLocation) => void;
}

export const LocationModal: React.FC<LocationModalProps> = ({
  isOpen,
  onClose,
  selectedLocation,
  currentLocation,
  onSelectLocation,
  onConfirmLocation
}) => {
  // Normalize location input
  const resolvedCurrentLocation: CustomerLocation | null =
    currentLocation ||
    (selectedLocation && 'formattedAddress' in selectedLocation
      ? (selectedLocation as CustomerLocation)
      : selectedLocation && 'name' in selectedLocation
      ? {
          latitude: 23.3032,
          longitude: 72.3312,
          formattedAddress: `${selectedLocation.name}, Kadi, Gujarat ${selectedLocation.pincode || ''}`,
          locality: selectedLocation.name,
          city: selectedLocation.taluka || 'Kadi',
          state: 'Gujarat',
          pincode: selectedLocation.pincode,
          source: 'search'
        }
      : null);

  const handleConfirm = (loc: CustomerLocation) => {
    if (onConfirmLocation) {
      onConfirmLocation(loc);
    }
    if (onSelectLocation) {
      onSelectLocation({
        id: 'loc-custom',
        name: loc.locality || loc.city || loc.formattedAddress.split(',')[0],
        taluka: loc.city || 'Kadi',
        district: 'Mehsana',
        pincode: loc.pincode || '382715'
      });
    }
  };

  return (
    <ModernLocationModal
      isOpen={isOpen}
      onClose={onClose}
      currentLocation={resolvedCurrentLocation}
      onConfirmLocation={handleConfirm}
    />
  );
};
