import React, { useState } from 'react';
import { 
  X, 
  Settings as SettingsIcon, 
  Clock, 
  KeyRound, 
  Calculator, 
  StickyNote, 
  CloudSun, 
  Sun, 
  Moon, 
  Volume2, 
  VolumeX, 
  Shield, 
  Trash2,
  CheckCircle2,
  Save,
  AlertTriangle,
  Download,
  Lock
} from 'lucide-react';
import type { VaultSettings, AuthMode, DisguiseType, ThemeMode } from '../types';
import { getCurrentTimePin } from '../utils/security';
import { sound } from '../services/sound';

interface SettingsModalProps {
  isOpen: boolean;
  settings: VaultSettings;
  onClose: () => void;
  onSave: (updated: Partial<VaultSettings>) => void;
  onClearAllData: () => void;
  onOpenInstall?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSave,
  onClearAllData,
  onOpenInstall,
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>(settings.authMode);
  const [permanentPin, setPermanentPin] = useState(settings.permanentPin);
  const [disguise, setDisguise] = useState<DisguiseType>(settings.disguise);
  const [theme, setTheme] = useState<ThemeMode>(settings.theme);
  const [soundEnabled, setSoundEnabled] = useState(settings.soundEnabled);
  const [timeFormat, setTimeFormat] = useState<'24h' | '12h'>(settings.timeFormat || '24h');
  const [securityQuestion, setSecurityQuestion] = useState(settings.securityQuestion);
  const [securityAnswer, setSecurityAnswer] = useState(settings.securityAnswer);
  const [autoLockOnMinimize, setAutoLockOnMinimize] = useState(settings.autoLockOnMinimize !== false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSave = () => {
    sound.playClick();
    onSave({
      authMode,
      permanentPin: permanentPin || '1234',
      disguise,
      theme,
      soundEnabled,
      timeFormat,
      autoLockOnMinimize,
      securityQuestion,
      securityAnswer: securityAnswer.trim().toLowerCase(),
    });
    setSavedNotice(true);
    setTimeout(() => {
      setSavedNotice(false);
      onClose();
    }, 600);
  };

  const disguiseOptions: { id: DisguiseType; title: string; subtitle: string; icon: React.ReactNode }[] = [
    {
      id: 'calculator',
      title: 'Calculator',
      subtitle: 'Standard Digital Calculator',
      icon: <Calculator className="w-5 h-5 text-indigo-500" />,
    },
    {
      id: 'clock',
      title: 'Clock',
      subtitle: 'World Clock & Timer',
      icon: <Clock className="w-5 h-5 text-sky-500" />,
    },
    {
      id: 'notes',
      title: 'Notes',
      subtitle: 'Quick Notes & Memos',
      icon: <StickyNote className="w-5 h-5 text-amber-500" />,
    },
    {
      id: 'weather',
      title: 'Weather',
      subtitle: 'Weather Forecast & Radar',
      icon: <CloudSun className="w-5 h-5 text-yellow-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-lg max-h-[90vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <SettingsIcon className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Vault Settings
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Security, passcode type, disguise icons, themes & PWA
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Section 1: Access Passcode Type */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span>Unlock Passcode Method</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              {/* Dynamic Time PIN */}
              <button
                type="button"
                onClick={() => setAuthMode('time')}
                className={`p-3.5 rounded-2xl border-2 text-left transition ${
                  authMode === 'time'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <Clock className="w-5 h-5 text-amber-500" />
                  {authMode === 'time' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">
                  Dynamic Time PIN
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Updates every minute
                </div>
              </button>

              {/* Permanent PIN */}
              <button
                type="button"
                onClick={() => setAuthMode('permanent')}
                className={`p-3.5 rounded-2xl border-2 text-left transition ${
                  authMode === 'permanent'
                    ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <KeyRound className="w-5 h-5 text-indigo-500" />
                  {authMode === 'permanent' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-white">
                  Permanent PIN
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                  Fixed static password
                </div>
              </button>
            </div>

            {authMode === 'time' ? (
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs">
                <div className="flex items-center justify-between font-mono mb-2">
                  <span className="text-slate-500 dark:text-slate-400">Current Time Code:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                    {getCurrentTimePin(timeFormat)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>Format:</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setTimeFormat('24h')}
                      className={`px-2 py-0.5 rounded font-mono ${timeFormat === '24h' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      24-Hour (1353)
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimeFormat('12h')}
                      className={`px-2 py-0.5 rounded font-mono ${timeFormat === '12h' ? 'bg-indigo-600 text-white' : 'bg-slate-200 dark:bg-slate-700'}`}
                    >
                      12-Hour (0153)
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 text-xs space-y-2">
                <label className="block text-slate-700 dark:text-slate-300 font-medium">
                  Enter 4-6 Digit Permanent PIN:
                </label>
                <input
                  type="password"
                  maxLength={6}
                  value={permanentPin}
                  onChange={(e) => setPermanentPin(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 2580"
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-mono tracking-widest text-center text-base"
                />
              </div>
            )}
          </div>

          {/* Section 2: App Disguise & Icon Switching */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-1.5">
              <span>App Icon & Disguise Name</span>
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
              Change the disguise icon, browser title, and header styling:
            </p>

            <div className="grid grid-cols-2 gap-3">
              {disguiseOptions.map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => setDisguise(opt.id)}
                  className={`p-3 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                    disguise === opt.id
                      ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                      {opt.icon}
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-900 dark:text-white">
                        {opt.title}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[80px]">
                        {opt.subtitle}
                      </div>
                    </div>
                  </div>
                  {disguise === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: PWA Download / Installation */}
          {onOpenInstall && (
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
                Download & Install PWA
              </h4>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstall();
                }}
                className="w-full p-3.5 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/50 dark:bg-indigo-950/30 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/40 flex items-center justify-between transition text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-600 text-white">
                    <Download className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                      Install as Standalone App
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      Install onto your phone or PC for 1-click offline access
                    </span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 px-2 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60">
                  Install
                </span>
              </button>
            </div>
          )}

          {/* Section 4: Theme & Sound Preferences */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3">
              Appearance & Sound
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  {theme === 'dark' ? (
                    <Moon className="w-5 h-5 text-indigo-400" />
                  ) : (
                    <Sun className="w-5 h-5 text-amber-500" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      {theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
                    </div>
                    <div className="text-[10px] text-slate-400">Click to toggle</div>
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !soundEnabled;
                  setSoundEnabled(nextVal);
                  sound.setEnabled(nextVal);
                  if (nextVal) sound.playClick();
                }}
                className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/50 transition text-left"
              >
                <div className="flex items-center gap-2.5">
                  {soundEnabled ? (
                    <Volume2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <VolumeX className="w-5 h-5 text-slate-400" />
                  )}
                  <div>
                    <div className="text-xs font-semibold text-slate-900 dark:text-white">
                      Keypad Clicks
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {soundEnabled ? 'Enabled' : 'Muted'}
                    </div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 5: Auto-Lock on Minimize / Background */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Privacy & Auto-Lock
            </h4>
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-850">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition ${autoLockOnMinimize ? 'bg-indigo-500/10 text-indigo-500' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'}`}>
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                    Auto-Lock on Minimize
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Immediately returns to calculator when minimized or switching apps
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAutoLockOnMinimize(!autoLockOnMinimize)}
                className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${autoLockOnMinimize ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}`}
              >
                <div className={`w-4 h-4 rounded-full bg-white transition-transform absolute top-1 ${autoLockOnMinimize ? 'right-1' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Section 6: Security Question Backup */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Recovery Question
            </h4>
            <div className="space-y-2 text-xs">
              <input
                type="text"
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                placeholder="Question"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
              <input
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                placeholder="Answer"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Danger Zone: Wipe All Media */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
            {showClearConfirm ? (
              <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 space-y-2">
                <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-semibold text-xs">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Permanently wipe all photos, videos & settings?</span>
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowClearConfirm(false)}
                    className="flex-1 py-1.5 px-3 rounded-lg border border-slate-300 dark:border-slate-700 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onClearAllData();
                      setShowClearConfirm(false);
                      onClose();
                    }}
                    className="flex-1 py-1.5 px-3 rounded-lg bg-rose-600 text-white text-xs font-medium hover:bg-rose-500"
                  >
                    Yes, Wipe Everything
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setShowClearConfirm(true)}
                className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs font-medium hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center gap-2 transition"
              >
                <Trash2 className="w-4 h-4" />
                <span>Reset Vault & Clear All Data</span>
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="py-2.5 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/25 transition"
          >
            <Save className="w-4 h-4" />
            <span>{savedNotice ? 'Saved!' : 'Save Changes'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
