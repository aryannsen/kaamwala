import React from 'react';
import {
  Wrench,
  Zap,
  Hammer,
  Paintbrush,
  Wind,
  Sparkles,
  Droplets,
  Tv,
  HardHat,
  HelpCircle,
  Shield,
  Clock,
  CheckCircle2,
  LucideIcon
} from 'lucide-react';

// Static mapping dictionary from database icon strings to Lucide icon components
// Prevents dynamic code execution of arbitrary names
const ICON_REGISTRY: Record<string, LucideIcon> = {
  // Direct name matches
  wrench: Wrench,
  zap: Zap,
  hammer: Hammer,
  paintbrush: Paintbrush,
  wind: Wind,
  sparkles: Sparkles,
  droplets: Droplets,
  tv: Tv,
  hardhat: HardHat,
  shield: Shield,
  clock: Clock,
  checkcircle2: CheckCircle2,

  // Common aliases and category slugs
  plumbing: Wrench,
  pipe: Wrench,
  tap: Wrench,
  water_leak: Wrench,

  electrical: Zap,
  electrician: Zap,
  fan: Zap,
  wire: Zap,
  light: Zap,

  carpentry: Hammer,
  carpenter: Hammer,
  furniture: Hammer,
  wood: Hammer,

  painting: Paintbrush,
  painter: Paintbrush,
  paint: Paintbrush,

  ac: Wind,
  ac_repair: Wind,
  cooling: Wind,
  hvac: Wind,

  cleaning: Sparkles,
  deep_cleaning: Sparkles,
  cleaner: Sparkles,
  housekeeping: Sparkles,

  ro: Droplets,
  ro_water: Droplets,
  purifier: Droplets,
  water_purifier: Droplets,

  appliance: Tv,
  appliance_repair: Tv,
  refrigerator: Tv,
  washing_machine: Tv,

  mason: HardHat,
  mason_labour: HardHat,
  labour: HardHat,
  construction: HardHat,

  other: HelpCircle,
  other_services: HelpCircle,
  general: HelpCircle,
  handyman: HelpCircle
};

export function renderCategoryIcon(
  iconKey?: string | null,
  className = 'w-6 h-6',
  fallbackIcon?: LucideIcon
): React.ReactElement {
  if (!iconKey) {
    const Fallback = fallbackIcon || HelpCircle;
    return <Fallback className={className} />;
  }

  // Normalize key: lowercase, strip underscores/hyphens/spaces
  const cleanKey = iconKey.toLowerCase().replace(/[\s\-_]/g, '');
  const IconComponent = ICON_REGISTRY[cleanKey] || ICON_REGISTRY[iconKey.toLowerCase()] || fallbackIcon || HelpCircle;

  return <IconComponent className={className} />;
}

// Preset visual color palettes for categories if database doesn't specify colors
export const DEFAULT_CATEGORY_STYLES: Record<string, { bgTint: string; iconColor: string }> = {
  plumbing: { bgTint: '#EFF6FF', iconColor: '#2563EB' },
  electrical: { bgTint: '#FEF9C3', iconColor: '#CA8A04' },
  carpentry: { bgTint: '#FFEDD5', iconColor: '#EA580C' },
  painting: { bgTint: '#FEF3C7', iconColor: '#D97706' },
  ac_repair: { bgTint: '#E0F2FE', iconColor: '#0284C7' },
  cleaning: { bgTint: '#F3E8FF', iconColor: '#9333EA' },
  ro_water: { bgTint: '#ECFEFF', iconColor: '#0891B2' },
  appliance_repair: { bgTint: '#F1F5F9', iconColor: '#475569' },
  mason_labour: { bgTint: '#FEF2F2', iconColor: '#DC2626' },
  other_services: { bgTint: '#F4F4F5', iconColor: '#52525B' }
};

export function getCategoryStyle(categoryKey: string, dbBgTint?: string | null, dbIconColor?: string | null) {
  if (dbBgTint && dbIconColor) {
    return { bgTint: dbBgTint, iconColor: dbIconColor };
  }

  const normalized = categoryKey.toLowerCase().replace(/[\s\-]/g, '_');
  const matched = DEFAULT_CATEGORY_STYLES[normalized];
  if (matched) {
    return {
      bgTint: dbBgTint || matched.bgTint,
      iconColor: dbIconColor || matched.iconColor
    };
  }

  return {
    bgTint: dbBgTint || '#F4F4F5',
    iconColor: dbIconColor || '#075B43'
  };
}
