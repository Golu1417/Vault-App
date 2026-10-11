export type AuthMode = 'permanent' | 'time';

export type DisguiseType = 'calculator' | 'clock' | 'notes' | 'weather';

export type ThemeMode = 'dark' | 'light';

export interface MediaItem {
  id: string;
  name: string;
  type: 'image' | 'video';
  mimeType: string;
  size: number;
  blob: Blob;
  createdAt: number;
  albumId?: string | null;
  isFavorite: boolean;
  isTrash: boolean;
}

export interface Album {
  id: string;
  name: string;
  icon?: string;
  createdAt: number;
}

export interface VaultSettings {
  isConfigured: boolean;
  authMode: AuthMode;
  permanentPin: string;
  securityQuestion: string;
  securityAnswer: string;
  disguise: DisguiseType;
  theme: ThemeMode;
  soundEnabled: boolean;
  timeFormat: '24h' | '12h';
  recoveryPin?: string;
}

export interface DisguiseMeta {
  type: DisguiseType;
  title: string;
  subtitle: string;
  iconName: string;
  faviconSvg: string;
  headerBrand: string;
}
