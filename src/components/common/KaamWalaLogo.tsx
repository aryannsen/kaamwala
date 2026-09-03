import React from 'react';

interface KaamWalaLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
}

export const KaamWalaLogo: React.FC<KaamWalaLogoProps> = ({ size = 'md', showSubtitle = false }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-7 h-7',
    lg: 'w-9 h-9'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl'
  };

  return (
    <div className="flex items-center gap-2">
      {/* Brand Hexagon Symbol with tool mark */}
      <div className={`relative ${iconSizes[size]} bg-[#075B43] rounded-lg flex items-center justify-center shadow-xs text-white`}>
        <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {/* Stylized K and wrench gesture */}
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>

      <div className="flex flex-col">
        <div className="flex items-center leading-none">
          <span className={`font-extrabold tracking-tight text-[#075B43] ${textSizes[size]}`}>
            KAAM<span className="text-[#F5B51B]">WALA</span>
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[10px] text-[#66706D] tracking-wide mt-0.5 font-medium">
            Ghar ka koi bhi kaam
          </span>
        )}
      </div>
    </div>
  );
};
