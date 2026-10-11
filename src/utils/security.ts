import type { VaultSettings } from '../types';

/**
 * Returns formatted 4-digit time PIN for a given date.
 * E.g., for 13:53 (1:53 PM) in 24h -> "1353"
 *       for 11:06 in 24h -> "1106"
 */
export function getTimePinForDate(date: Date, format: '24h' | '12h' = '24h'): string {
  let hours: number;
  if (format === '12h') {
    hours = date.getHours() % 12 || 12;
  } else {
    hours = date.getHours();
  }

  const minutes = date.getMinutes();
  const hh = hours.toString().padStart(2, '0');
  const mm = minutes.toString().padStart(2, '0');
  return `${hh}${mm}`;
}

export function getCurrentTimePin(format: '24h' | '12h' = '24h'): string {
  return getTimePinForDate(new Date(), format);
}

/**
 * Checks whether the given input matches the dynamic time-based PIN.
 * Supports a +/- 1 minute tolerance window so a user is not locked out
 * if the clock ticks over mid-entry.
 */
export function isValidTimePin(input: string, format: '24h' | '12h' = '24h'): boolean {
  const cleaned = input.trim();
  const now = new Date();

  // Current minute
  const currentPin = getTimePinForDate(now, format);
  if (cleaned === currentPin) return true;

  // 1 minute ago
  const prevMin = new Date(now.getTime() - 60 * 1000);
  if (cleaned === getTimePinForDate(prevMin, format)) return true;

  // 1 minute ahead (in case device clock is slightly off)
  const nextMin = new Date(now.getTime() + 60 * 1000);
  if (cleaned === getTimePinForDate(nextMin, format)) return true;

  return false;
}

/**
 * Verifies passcode against current vault settings
 */
export function verifyPasscode(input: string, settings: VaultSettings): boolean {
  const cleaned = input.trim();
  if (!cleaned) return false;

  if (settings.authMode === 'time') {
    return isValidTimePin(cleaned, settings.timeFormat);
  } else {
    return cleaned === settings.permanentPin;
  }
}

/**
 * Emergency recovery code to open security questions
 */
export const EMERGENCY_RECOVERY_CODE = '112233';
