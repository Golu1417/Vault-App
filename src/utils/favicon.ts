import type { DisguiseType, DisguiseMeta } from '../types';

export const DISGUISE_PROFILES: Record<DisguiseType, DisguiseMeta> = {
  calculator: {
    type: 'calculator',
    title: 'Calculator',
    subtitle: 'Standard Digital Calculator',
    iconName: 'Calculator',
    headerBrand: 'Calculator',
    faviconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="22" fill="#2563eb"/>
      <rect x="20" y="18" width="60" height="20" rx="6" fill="#1e293b"/>
      <circle cx="32" cy="55" r="7" fill="#ffffff"/>
      <circle cx="50" cy="55" r="7" fill="#ffffff"/>
      <circle cx="68" cy="55" r="7" fill="#f59e0b"/>
      <circle cx="32" cy="75" r="7" fill="#ffffff"/>
      <circle cx="50" cy="75" r="7" fill="#ffffff"/>
      <circle cx="68" cy="75" r="7" fill="#10b981"/>
    </svg>`,
  },
  clock: {
    type: 'clock',
    title: 'Clock',
    subtitle: 'World Clock & Timer',
    iconName: 'Clock',
    headerBrand: 'World Clock',
    faviconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="22" fill="#0f172a"/>
      <circle cx="50" cy="50" r="34" fill="none" stroke="#38bdf8" stroke-width="6"/>
      <line x1="50" y1="50" x2="50" y2="28" stroke="#ffffff" stroke-width="5" stroke-linecap="round"/>
      <line x1="50" y1="50" x2="68" y2="50" stroke="#f43f5e" stroke-width="4" stroke-linecap="round"/>
      <circle cx="50" cy="50" r="4" fill="#ffffff"/>
    </svg>`,
  },
  notes: {
    type: 'notes',
    title: 'Notes',
    subtitle: 'Quick Notes & Memos',
    iconName: 'StickyNote',
    headerBrand: 'Notes & Memos',
    faviconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="22" fill="#f59e0b"/>
      <rect x="22" y="20" width="56" height="60" rx="8" fill="#ffffff"/>
      <line x1="32" y1="35" x2="68" y2="35" stroke="#f59e0b" stroke-width="4" stroke-linecap="round"/>
      <line x1="32" y1="48" x2="68" y2="48" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
      <line x1="32" y1="61" x2="54" y2="61" stroke="#94a3b8" stroke-width="4" stroke-linecap="round"/>
    </svg>`,
  },
  weather: {
    type: 'weather',
    title: 'Weather',
    subtitle: 'Live Forecast & Radar',
    iconName: 'CloudSun',
    headerBrand: 'Weather Forecast',
    faviconSvg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="22" fill="#0284c7"/>
      <circle cx="62" cy="38" r="16" fill="#facc15"/>
      <path d="M30 68 a14 14 0 0 1 2-27 a20 20 0 0 1 36 2 a16 16 0 0 1 -2 25 z" fill="#ffffff"/>
    </svg>`,
  },
};

/**
 * Apply the selected disguise to document title and dynamic favicon
 */
export function applyDisguise(disguiseType: DisguiseType) {
  const meta = DISGUISE_PROFILES[disguiseType] || DISGUISE_PROFILES.calculator;

  // 1. Update Title
  document.title = meta.title;

  // 2. Update Favicon Link
  const faviconLink = document.getElementById('dynamic-favicon') as HTMLLinkElement | null;
  if (faviconLink) {
    const encoded = encodeURIComponent(meta.faviconSvg);
    faviconLink.href = `data:image/svg+xml,${encoded}`;
  }
}
