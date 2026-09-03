import React from 'react';
import { ShieldCheck, Clock, CheckCircle2, ThumbsUp, DollarSign } from 'lucide-react';

/**
 * Clean Vector Faucet Illustration matching Screen 4 of the reference image.
 */
export const TapGraphic: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        {/* Soft circle background */}
        <circle cx="100" cy="100" r="85" fill="#F4F6F5" />
        
        {/* Tap Wall Mounting Flange */}
        <path d="M40 78H52V112H40C37.7909 112 36 110.209 36 108V82C36 79.7909 37.7909 78 40 78Z" fill="#9CA3AF" />
        
        {/* Horizontal Pipe Body */}
        <path d="M52 84H110C116.627 84 122 89.3726 122 96V108H52V84Z" fill="url(#metalGradient1)" />
        <rect x="52" y="86" width="60" height="3" fill="#E5E7EB" opacity="0.8" />

        {/* Vertical Spout Curve */}
        <path
          d="M102 96C102 96 118 97 124 104C130 111 130 128 130 134H114C114 128 113 118 108 114C104 110 98 110 98 110V96H102Z"
          fill="url(#metalGradient2)"
        />
        
        {/* Spout Aerator Tip */}
        <path d="M112 134H132V142C132 143.105 131.105 144 130 144H114C112.895 144 112 143.105 112 142V134Z" fill="#6B7280" />
        <rect x="115" y="141" width="14" height="2" rx="1" fill="#4B5563" />

        {/* Tap Handle Assembly (Top Cross Handle) */}
        <rect x="80" y="66" width="12" height="18" rx="2" fill="url(#metalGradient1)" />
        <circle cx="86" cy="62" r="6" fill="#6B7280" />
        {/* Handle crossbar */}
        <path d="M62 60H110C111.657 60 113 58.6569 113 57C113 55.3431 111.657 54 110 54H62C60.3431 54 59 55.3431 59 57C59 58.6569 60.3431 60 62 60Z" fill="url(#metalGradient3)" />
        <circle cx="86" cy="57" r="4" fill="#374151" />

        {/* Dripping Water Droplets */}
        <path
          d="M122 153C122 153 117 160 117 164C117 166.761 119.239 169 122 169C124.761 169 127 166.761 127 164C127 160 122 153 122 153Z"
          fill="#38BDF8"
        />
        <circle cx="122" cy="177" r="2.5" fill="#38BDF8" opacity="0.8" />
        <circle cx="122" cy="184" r="1.5" fill="#38BDF8" opacity="0.6" />

        {/* Gradients */}
        <defs>
          <linearGradient id="metalGradient1" x1="52" y1="84" x2="52" y2="108" gradientUnits="userSpaceOnUse">
            <stop stopColor="#D1D5DB" />
            <stop offset="0.3" stopColor="#F3F4F6" />
            <stop offset="0.7" stopColor="#9CA3AF" />
            <stop offset="1" stopColor="#6B7280" />
          </linearGradient>
          <linearGradient id="metalGradient2" x1="100" y1="96" x2="130" y2="134" gradientUnits="userSpaceOnUse">
            <stop stopColor="#E5E7EB" />
            <stop offset="0.5" stopColor="#9CA3AF" />
            <stop offset="1" stopColor="#4B5563" />
          </linearGradient>
          <linearGradient id="metalGradient3" x1="59" y1="54" x2="113" y2="60" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9CA3AF" />
            <stop offset="0.5" stopColor="#F9FAFB" />
            <stop offset="1" stopColor="#6B7280" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

/**
 * Friendly KaamWala Professional with thumbs-up matching Screen 9 ("Work Completed!")
 */
export const CompletedWorkerGraphic: React.FC<{ className?: string }> = ({ className = 'w-48 h-48' }) => {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <svg
        viewBox="0 0 200 200"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Soft warm circular background */}
        <circle cx="100" cy="100" r="75" fill="#FEF9C3" opacity="0.6" />

        {/* Green Verified Circle Check badge over shoulder */}
        <g transform="translate(130, 48)">
          <circle cx="16" cy="16" r="16" fill="#10B981" />
          <path d="M10 16.5L14 20.5L22 12" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </g>

        {/* Worker Torso / Uniform in Forest Green */}
        <path
          d="M50 178C50 148 70 142 100 142C130 142 150 148 150 178V180H50V178Z"
          fill="#075B43"
        />
        {/* Collar */}
        <path d="M88 142L100 156L112 142H88Z" fill="#064635" />

        {/* Neck */}
        <rect x="92" y="124" width="16" height="20" rx="3" fill="#F6C8A4" />

        {/* Head */}
        <ellipse cx="100" cy="98" rx="22" ry="24" fill="#F6C8A4" />
        
        {/* Smile */}
        <path d="M94 107C94 111 106 111 106 107" stroke="#8A4A28" strokeWidth="2" strokeLinecap="round" />
        
        {/* Eyes */}
        <circle cx="92" cy="95" r="2.5" fill="#374151" />
        <circle cx="108" cy="95" r="2.5" fill="#374151" />
        {/* Eyebrows */}
        <path d="M88 89C90 87 95 87 96 89" stroke="#5C3317" strokeWidth="2" strokeLinecap="round" />
        <path d="M104 89C105 87 110 87 112 89" stroke="#5C3317" strokeWidth="2" strokeLinecap="round" />

        {/* KaamWala Green Cap */}
        <path
          d="M74 85C74 72 85 64 100 64C115 64 126 72 126 85H74Z"
          fill="#075B43"
        />
        {/* Cap visor */}
        <path
          d="M72 85H128C132 85 133 88 128 90C118 94 82 94 72 90C67 88 68 85 72 85Z"
          fill="#064635"
        />

        {/* Thumbs Up Hand */}
        <g transform="translate(42, 118)">
          <path
            d="M18 16V28C18 31 15 34 12 34C9 34 6 31 6 28V16H18Z"
            fill="#F6C8A4"
          />
          {/* Thumb */}
          <path
            d="M14 18C14 18 18 14 18 8C18 4 15 2 12 2C9 2 9 6 9 8L9 16"
            stroke="#F6C8A4"
            strokeWidth="5"
            strokeLinecap="round"
          />
          {/* Fist fingers */}
          <circle cx="18" cy="18" r="3" fill="#E8B08B" />
          <circle cx="18" cy="23" r="3" fill="#E8B08B" />
          <circle cx="18" cy="28" r="3" fill="#E8B08B" />
        </g>
      </svg>
    </div>
  );
};

/**
 * Trust indicator row matching reference image Screen 1 and Screen 4
 */
export const TrustRow: React.FC<{ variant?: 'home' | 'detail' }> = ({ variant = 'home' }) => {
  if (variant === 'detail') {
    return (
      <div className="flex items-center justify-between py-3 border-y border-[#E7E9E6] text-[11px] text-[#66706D] font-medium">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-[#075B43]" />
          <span>No hidden charges</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-4 h-4 text-[#075B43]" />
          <span>On-time arrival</span>
        </div>
        <div className="flex items-center gap-1.5">
          <ThumbsUp className="w-4 h-4 text-[#075B43]" />
          <span>Satisfaction assured</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 py-3 px-2 bg-white rounded-xl border border-[#E7E9E6] text-center shadow-2xs">
      <div className="flex flex-col items-center justify-center p-1">
        <ShieldCheck className="w-4 h-4 text-[#075B43] mb-1 stroke-[2.2]" />
        <span className="text-[11px] font-bold text-[#111817] leading-tight">
          Trusted<br />Professionals
        </span>
      </div>
      <div className="flex flex-col items-center justify-center p-1 border-x border-[#E7E9E6]">
        <Clock className="w-4 h-4 text-[#075B43] mb-1 stroke-[2.2]" />
        <span className="text-[11px] font-bold text-[#111817] leading-tight">
          On-time<br />Service
        </span>
      </div>
      <div className="flex flex-col items-center justify-center p-1">
        <DollarSign className="w-4 h-4 text-[#075B43] mb-1 stroke-[2.2]" />
        <span className="text-[11px] font-bold text-[#111817] leading-tight">
          Transparent<br />Pricing
        </span>
      </div>
    </div>
  );
};
