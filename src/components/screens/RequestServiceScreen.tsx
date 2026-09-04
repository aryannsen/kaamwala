import React, { useState } from 'react';
import {
  MapPin,
  Camera,
  X,
  AlertCircle,
  Loader2,
  CheckCircle2,
  Banknote,
  UploadCloud,
  ChevronRight
} from 'lucide-react';
import {
  CustomerLocation,
  CustomerProfile,
  ServiceCategory,
  ServiceOption
} from '../../types';
import { formatPricingDisplay } from '../../services/catalogService';
import {
  submitServiceRequest,
  uploadProblemPhoto,
  CustomerServiceRequest
} from '../../services/requestService';
import { resolveServiceOptionUuid, isValidUuid } from '../../data/serviceCatalogUuids';

interface RequestServiceScreenProps {
  category: ServiceCategory;
  option: ServiceOption;
  customerLocation: CustomerLocation | null;
  onOpenLocationModal: () => void;
  onRequestSubmitted: (request: CustomerServiceRequest) => void;
  customerProfile: CustomerProfile;
  onUpdateProfile: (profile: CustomerProfile) => void;
}

export const RequestServiceScreen: React.FC<RequestServiceScreenProps> = ({
  category,
  option,
  customerLocation,
  onOpenLocationModal,
  onRequestSubmitted,
  customerProfile,
  onUpdateProfile
}) => {
  // 4. Problem Details State
  const [problemDescription, setProblemDescription] = useState('');
  const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploadedPhotoUrl, setUploadedPhotoUrl] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoUploadNotice, setPhotoUploadNotice] = useState<string | null>(null);

  // 5. Customer Details State
  const [customerName, setCustomerName] = useState(customerProfile.name || '');
  const [customerPhone, setCustomerPhone] = useState(
    customerProfile.phone ? customerProfile.phone.replace(/[^0-9]/g, '').slice(-10) : ''
  );
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  // 6. Submission State
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Price formatting
  const priceDisplay = formatPricingDisplay(option) || `Starting from ₹${option.startingPrice || 199}`;

  // Photo Selection Handler
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate size (< 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setPhotoUploadNotice('Photo size should be less than 5MB.');
      return;
    }

    setSelectedPhotoFile(file);
    setPhotoUploadNotice(null);

    // Create local object URL for preview
    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);

    // Upload safely to Supabase Storage
    setIsUploadingPhoto(true);
    const result = await uploadProblemPhoto(file);
    setIsUploadingPhoto(false);

    if (result.url) {
      setUploadedPhotoUrl(result.url);
      setPhotoUploadNotice(null);
    } else if (result.error) {
      // Friendly notice, does not block request
      setPhotoUploadNotice(result.error);
    }
  };

  const handleRemovePhoto = () => {
    setSelectedPhotoFile(null);
    setPhotoPreview(null);
    setUploadedPhotoUrl(null);
    setPhotoUploadNotice(null);
  };

  // Mobile Validation (10 digits Indian mobile)
  const validatePhone = (val: string): boolean => {
    const digitsOnly = val.replace(/[^0-9]/g, '');
    if (digitsOnly.length !== 10) {
      setPhoneError('Please enter a valid 10-digit mobile number.');
      return false;
    }
    if (!/^[6-9]\d{9}$/.test(digitsOnly)) {
      setPhoneError('Mobile number should start with 6, 7, 8, or 9.');
      return false;
    }
    setPhoneError(null);
    return true;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '').slice(0, 10);
    setCustomerPhone(raw);
    if (phoneError && raw.length === 10) {
      validatePhone(raw);
    }
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCustomerName(e.target.value);
    if (nameError && e.target.value.trim().length > 0) {
      setNameError(null);
    }
  };

  // 6. Request Service Button Click
  const handleRequestService = async () => {
    let isValid = true;
    setSubmitError(null);

    // Check location
    if (!customerLocation || !customerLocation.formattedAddress) {
      setLocationError('Please confirm your service address in Kadi.');
      isValid = false;
    } else {
      setLocationError(null);
    }

    // Check name
    if (!customerName.trim()) {
      setNameError('Please enter your name.');
      isValid = false;
    } else {
      setNameError(null);
    }

    // Check phone
    if (!validatePhone(customerPhone)) {
      isValid = false;
    }

    if (!isValid || !customerLocation) return;

    setIsSubmitting(true);

    try {
      // Update profile locally
      onUpdateProfile({
        ...customerProfile,
        name: customerName.trim(),
        phone: customerPhone.trim(),
        address: customerLocation.formattedAddress
      });

      // Ensure the service_option_id passed to create_service_request is strictly the actual UUID, not a slug
      const actualOptionUuid = resolveServiceOptionUuid(option.id);
      if (!isValidUuid(actualOptionUuid)) {
        setSubmitError('Invalid service option selected. Please select a service again.');
        setIsSubmitting(false);
        return;
      }

      // Submit to Supabase via requestService
      const result = await submitServiceRequest({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        location: customerLocation,
        serviceOptionId: actualOptionUuid,
        serviceOptionName: option.name,
        categoryName: category.name,
        problemDescription: problemDescription.trim() || undefined,
        photoUrl: uploadedPhotoUrl || undefined,
        estimatedMinPrice: option.estimatedPriceMin || option.startingPrice || 199,
        estimatedMaxPrice: option.estimatedPriceMax || option.startingPrice || 399
      });

      if (result.success && result.request) {
        onRequestSubmitted(result.request);
      } else {
        setSubmitError(result.supabaseError || 'Failed to submit request. Please try again.');
      }
    } catch (err: any) {
      console.warn('Submission exception:', err);
      setSubmitError(err?.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-32 animate-in fade-in duration-150 px-5 pt-3">
      {/* Service Summary Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#075B43] bg-[#075B43]/10 px-2 py-0.5 rounded">
              {category.name}
            </span>
            <h2 className="text-base font-bold text-[#111817] mt-1.5">{option.name}</h2>
          </div>
          <div className="text-right">
            <div className="text-xs text-[#66706D] font-medium">Estimated</div>
            <div className="text-base font-extrabold text-[#111817]">{priceDisplay}</div>
          </div>
        </div>

        {option.description && (
          <p className="text-xs text-[#66706D] mt-2 pt-2 border-t border-gray-100">
            {option.description}
          </p>
        )}

        {option.includes && option.includes.length > 0 && (
          <div className="mt-3 pt-2.5 border-t border-gray-100 space-y-1.5">
            <div className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Includes:</div>
            {option.includes.slice(0, 2).map((item, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#075B43] shrink-0" />
                <span className="line-clamp-1">{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 1. Service Address Card */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#111817]">
            <MapPin className="w-4 h-4 text-[#075B43]" />
            <span>Service Address</span>
          </div>
          <button
            id="change-location-btn"
            type="button"
            onClick={onOpenLocationModal}
            className="text-xs font-bold text-[#075B43] hover:underline cursor-pointer"
          >
            {customerLocation ? 'Change' : 'Set Address'}
          </button>
        </div>

        {customerLocation ? (
          <div className="text-xs text-[#111817] bg-gray-50 p-2.5 rounded-lg border border-gray-100 leading-relaxed font-medium">
            {customerLocation.formattedAddress}
            {customerLocation.source === 'gps' && (
              <span className="block mt-1 text-[11px] text-emerald-700 font-normal">
                ✓ GPS coordinates captured
              </span>
            )}
          </div>
        ) : (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 p-3 rounded-xl text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">No location selected</div>
              <div className="text-[11px] text-amber-800 mt-0.5">
                Please set your address in Kadi so our team can visit your home.
              </div>
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-[#075B43] bg-white px-2.5 py-1 rounded border border-[#075B43] hover:bg-emerald-50"
              >
                Set Doorstep Address
              </button>
            </div>
          </div>
        )}

        {locationError && (
          <p className="text-xs text-red-600 mt-1.5 font-medium">{locationError}</p>
        )}
      </div>

      {/* 4. Tell us about the problem */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <h3 className="text-sm font-bold text-[#111817] mb-1">Tell us about the problem</h3>
        <p className="text-xs text-[#66706D] mb-3">
          Optional details to help the technician prepare before visiting.
        </p>

        {/* Description textarea */}
        <textarea
          id="problem-description-input"
          value={problemDescription}
          onChange={(e) => setProblemDescription(e.target.value)}
          placeholder="Describe what needs to be fixed... (optional)"
          rows={3}
          className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E7E9E6] rounded-xl text-xs sm:text-sm text-[#111817] focus:outline-none focus:ring-2 focus:ring-[#075B43] focus:border-transparent transition-all placeholder:text-gray-400 resize-none"
        />

        {/* Optional Photo Upload */}
        <div className="mt-3.5 pt-3 border-t border-gray-100">
          <div className="text-xs font-semibold text-gray-700 mb-2">Add a photo (optional)</div>

          {photoPreview ? (
            <div className="relative inline-block rounded-xl overflow-hidden border border-gray-200 shadow-2xs">
              <img
                src={photoPreview}
                alt="Problem preview"
                className="w-24 h-24 object-cover"
              />
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="absolute top-1 right-1 p-1 bg-black/60 text-white rounded-full hover:bg-black transition-colors"
                title="Remove photo"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              {isUploadingPhoto && (
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px] font-semibold">
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                  Uploading...
                </div>
              )}
            </div>
          ) : (
            <div>
              <label
                htmlFor="photo-upload-input"
                className="inline-flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-dashed border-gray-300 rounded-xl text-xs font-medium cursor-pointer transition-colors"
              >
                <Camera className="w-4 h-4 text-gray-500" />
                <span>Choose photo</span>
                <input
                  id="photo-upload-input"
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />
              </label>
              <span className="text-[11px] text-gray-400 ml-2">PNG, JPG up to 5MB</span>
            </div>
          )}

          {photoUploadNotice && (
            <div className="mt-2 text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-200">
              {photoUploadNotice}
            </div>
          )}
        </div>
      </div>

      {/* 5. Customer Details */}
      <div className="bg-white p-4 rounded-xl border border-[#E7E9E6] shadow-2xs mb-4">
        <h3 className="text-sm font-bold text-[#111817] mb-1">Customer Details</h3>
        <p className="text-xs text-[#66706D] mb-3">
          No account or password needed. We will call you to confirm your visit.
        </p>

        <div className="space-y-3">
          {/* Name */}
          <div>
            <label htmlFor="customer-name-input" className="block text-xs font-semibold text-gray-700 mb-1">
              Your Full Name <span className="text-red-500">*</span>
            </label>
            <input
              id="customer-name-input"
              type="text"
              value={customerName}
              onChange={handleNameChange}
              placeholder="e.g. Aryan Verma"
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-[#E7E9E6] rounded-xl text-sm text-[#111817] focus:outline-none focus:ring-2 focus:ring-[#075B43] focus:border-transparent transition-all placeholder:text-gray-400"
            />
            {nameError && (
              <p className="text-xs text-red-600 mt-1 font-medium">{nameError}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div>
            <label htmlFor="customer-phone-input" className="block text-xs font-semibold text-gray-700 mb-1">
              Mobile Number <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">
                +91
              </span>
              <input
                id="customer-phone-input"
                type="tel"
                maxLength={10}
                value={customerPhone}
                onChange={handlePhoneChange}
                placeholder="9876543210"
                className="w-full pl-12 pr-3.5 py-2.5 bg-gray-50 border border-[#E7E9E6] rounded-xl text-sm text-[#111817] focus:outline-none focus:ring-2 focus:ring-[#075B43] focus:border-transparent transition-all placeholder:text-gray-400 font-mono"
              />
            </div>
            {phoneError ? (
              <p className="text-xs text-red-600 mt-1 font-medium">{phoneError}</p>
            ) : (
              <p className="text-[11px] text-[#66706D] mt-1">
                Technician will call this number before arrival.
              </p>
            )}
          </div>

          {/* Cash on Service Notice */}
          <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-900 mt-3">
            <Banknote className="w-4 h-4 text-[#075B43] shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Payment Method: Cash on Service</div>
              <div className="text-[11px] text-emerald-800 mt-0.5">
                No online payment required now. Pay directly after your service is completed.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Global Submission Error (if any) */}
      {submitError && (
        <div className="bg-red-50 border border-red-200 p-3.5 rounded-xl text-xs text-red-800 mb-4 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <span>{submitError}</span>
        </div>
      )}

      {/* 6. Sticky Request Service Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-[#E7E9E6] shadow-lg max-w-lg mx-auto z-40">
        <button
          id="request-service-submit-btn"
          type="button"
          onClick={handleRequestService}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 bg-[#075B43] hover:bg-[#054432] active:bg-[#043426] text-white rounded-xl font-bold text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:bg-gray-400 min-h-[48px]"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Submitting Request...</span>
            </>
          ) : (
            <>
              <span>Request Service</span>
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
