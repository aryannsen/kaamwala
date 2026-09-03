import React from 'react';
import { Home, CalendarCheck, HelpCircle, User } from 'lucide-react';

export type NavTab = 'home' | 'bookings' | 'help' | 'profile';

interface BottomNavigationProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  activeBookingCount?: number;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  activeBookingCount = 0
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'bookings' as NavTab, label: 'Bookings', icon: CalendarCheck, badge: activeBookingCount > 0 ? activeBookingCount : null },
    { id: 'help' as NavTab, label: 'Help', icon: HelpCircle },
    { id: 'profile' as NavTab, label: 'Profile', icon: User }
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E7E9E6] shadow-[0_-2px_10px_rgba(0,0,0,0.03)] pb-safe">
      <div className="max-w-md mx-auto flex items-center justify-around h-15 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`nav-tab-${tab.id}`}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center flex-1 py-1.5 focus:outline-none transition-colors"
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-150 ${
                    isActive ? 'text-[#075B43] stroke-[2.4] scale-105' : 'text-[#8E9794] stroke-[1.8]'
                  }`}
                />
                {tab.badge && (
                  <span className="absolute -top-1 -right-2 bg-[#F5B51B] text-[#111817] font-bold text-[10px] w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium tracking-tight ${
                  isActive ? 'text-[#075B43] font-bold' : 'text-[#66706D]'
                }`}
              >
                {tab.label}
              </span>
              {isActive && (
                <span className="w-4 h-0.5 bg-[#075B43] rounded-full mt-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
