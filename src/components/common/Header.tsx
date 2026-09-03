import React, { useState } from 'react';
import { ArrowLeft, Menu, MapPin, X, Phone, ShieldCheck, HelpCircle, FileText, ChevronRight } from 'lucide-react';
import { KaamWalaLogo } from './KaamWalaLogo';
import { LocationArea } from '../../types';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  selectedLocation?: LocationArea;
  onOpenLocationModal?: () => void;
  rightAction?: React.ReactNode;
  onNavigateTab?: (tab: 'home' | 'bookings' | 'help' | 'profile') => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  selectedLocation,
  onOpenLocationModal,
  rightAction,
  onNavigateTab
}) => {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 bg-white border-b border-[#E7E9E6] px-4 py-3 flex items-center justify-between min-h-[58px]">
        {showBack ? (
          <div className="flex items-center gap-3 w-full">
            <button
              id="header-back-btn"
              onClick={onBack}
              className="p-1 -ml-1 text-[#111817] hover:text-[#075B43] rounded-full active:bg-gray-100 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.2]" />
            </button>
            <h1 className="text-[17px] font-bold text-[#111817] truncate flex-1">
              {title}
            </h1>
            {rightAction && (
              <div className="flex items-center">
                {rightAction}
              </div>
            )}
          </div>
        ) : (
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col">
              <KaamWalaLogo size="md" />
              <button
                id="header-location-pill"
                onClick={onOpenLocationModal}
                className="flex items-center gap-1 text-[11px] text-[#66706D] font-medium hover:text-[#075B43] transition-colors mt-0.5 text-left"
              >
                <MapPin className="w-3 h-3 text-[#075B43] shrink-0" />
                <span className="truncate max-w-[140px] text-[#111817]">
                  {selectedLocation ? `${selectedLocation.name}, Kadi` : 'Kadi, Gujarat'}
                </span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                id="header-menu-btn"
                onClick={() => setMenuOpen(true)}
                className="p-2 text-[#111817] hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Open navigation menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Slide-out Menu Drawer */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative ml-auto w-full max-w-xs bg-white h-full shadow-2xl z-10 flex flex-col p-5">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <KaamWalaLogo size="md" showSubtitle />
              <button
                onClick={() => setMenuOpen(false)}
                className="p-1 text-gray-500 hover:text-black rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Kadi Desk contact */}
            <div className="mt-4 p-3 bg-[#FAFAF7] border border-[#E7E9E6] rounded-xl">
              <div className="text-xs text-[#66706D] font-medium">Kadi Operations Desk</div>
              <div className="text-sm font-bold text-[#075B43] flex items-center gap-1.5 mt-0.5">
                <Phone className="w-3.5 h-3.5" /> +91 98251 00000
              </div>
              <div className="text-[11px] text-gray-500 mt-1">
                Mon - Sun: 7:00 AM - 9:00 PM
              </div>
            </div>

            <div className="mt-4 space-y-1">
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateTab?.('home');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-left font-medium text-sm text-[#111817]"
              >
                <span>Find a Service</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateTab?.('bookings');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-left font-medium text-sm text-[#111817]"
              >
                <span>My Bookings</span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateTab?.('help');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-left font-medium text-sm text-[#111817]"
              >
                <span className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-[#075B43]" />
                  Help & FAQs
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  onNavigateTab?.('profile');
                }}
                className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 text-left font-medium text-sm text-[#111817]"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-[#075B43]" />
                  Verified Guarantee
                </span>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            </div>

            <div className="mt-auto pt-4 border-t border-gray-100 text-xs text-[#66706D] space-y-1">
              <div className="font-medium text-[#111817]">KaamWala Hyperlocal Services</div>
              <div>Operating exclusively in Kadi, Gujarat 382715</div>
              <div className="text-[10px] text-gray-400 mt-2">Version 1.0.4 • Supabase Ready</div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
