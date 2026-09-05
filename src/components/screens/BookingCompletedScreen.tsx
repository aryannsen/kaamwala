import React, { useState } from 'react';
import { Star, FileText, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Booking } from '../../types';
import { CompletedWorkerGraphic } from '../common/Illustrations';
import { InvoiceModal } from '../common/InvoiceModal';
import { submitServiceReview } from '../../services/requestService';

interface BookingCompletedScreenProps {
  booking: Booking;
  onSubmitReview: (rating: number, comment: string, tags: string[]) => void;
  onHome: () => void;
}

export const BookingCompletedScreen: React.FC<BookingCompletedScreenProps> = ({
  booking,
  onSubmitReview,
  onHome
}) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('Great service! Arrived quickly and solved the leak cleanly.');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Professional behaviour',
    'On-time arrival'
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);

  const availableTags = [
    'Professional behaviour',
    'On-time arrival',
    'Quality of work',
    'Pricing transparency'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async () => {
    if (rating < 1 || rating > 5) {
      setSubmitError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      if (booking.id && booking.customerPhone) {
        const res = await submitServiceReview(
          booking.id,
          booking.customerPhone,
          rating,
          comment
        );
        if (!res.success) {
          setSubmitError(res.error || 'Failed to submit review.');
          setIsSubmitting(false);
          return;
        }
      }

      onSubmitReview(rating, comment, selectedTags);
      setSubmitted(true);
      setTimeout(() => {
        onHome();
      }, 1500);
    } catch (err: any) {
      setSubmitError(err?.message || 'Network error submitting review.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="pb-24 animate-in fade-in duration-150 px-5 pt-2">
      {/* Friendly Professional Graphic */}
      <div className="flex flex-col items-center justify-center my-2">
        <CompletedWorkerGraphic className="w-44 h-44" />
      </div>

      {/* Main Completed Heading */}
      <div className="text-center mb-4">
        <h2 className="text-xl font-extrabold text-[#111817]">Work Completed!</h2>
        <p className="text-xs text-[#66706D] mt-0.5">How was your experience?</p>
      </div>

      {/* 5-Star Interactive Rating matching reference */}
      <div className="flex items-center justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = (hoverRating || rating) >= star;
          return (
            <button
              key={star}
              type="button"
              id={`star-rating-${star}`}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              onClick={() => setRating(star)}
              className="p-1 text-2xl focus:outline-none transform hover:scale-110 transition-transform"
              aria-label={`${star} star`}
            >
              <Star
                className={`w-7 h-7 ${
                  filled
                    ? 'fill-[#F5B51B] text-[#F5B51B]'
                    : 'fill-none text-gray-300'
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Experience Tags */}
      <div className="flex flex-wrap gap-1.5 justify-center mb-4">
        {availableTags.map((tag) => {
          const isSelected = selectedTags.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggleTag(tag)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                isSelected
                  ? 'bg-[#075B43] text-white border-[#075B43]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300'
              }`}
            >
              {tag}
            </button>
          );
        })}
      </div>

      {/* Written Feedback Textarea */}
      <div className="mb-4">
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience (optional)..."
          rows={3}
          className="w-full p-3 bg-white border border-[#E7E9E6] rounded-xl text-xs text-[#111817] focus:outline-none focus:border-[#075B43] resize-none shadow-2xs"
        />
      </div>

      {/* Error banner if any */}
      {submitError && (
        <div className="mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      {submitted ? (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-center text-xs font-bold flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Review submitted! Redirecting to Home...</span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Submit Review CTA (Dark Green) */}
          <button
            id="submit-review-btn"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="w-full py-3.5 px-4 bg-[#075B43] hover:bg-[#064635] disabled:bg-gray-300 active:scale-[0.99] text-white font-bold text-sm rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {isSubmitting && <RefreshCw className="w-4 h-4 animate-spin" />}
            <span>{isSubmitting ? 'Submitting Review...' : 'Submit Review'}</span>
          </button>

          {/* View Invoice Button */}
          <button
            id="view-invoice-btn"
            onClick={() => setShowInvoice(true)}
            className="w-full py-2.5 text-center text-xs font-bold text-[#075B43] hover:underline flex items-center justify-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>View Invoice</span>
          </button>
        </div>
      )}

      {/* Invoice Modal */}
      <InvoiceModal
        booking={booking}
        isOpen={showInvoice}
        onClose={() => setShowInvoice(false)}
      />
    </div>
  );
};
