import React from 'react';
import { X, Download, Smartphone, Monitor, Share, PlusSquare, CheckCircle2 } from 'lucide-react';
import { sound } from '../services/sound';

interface InstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTriggerNativeInstall: () => Promise<void>;
  isIOS: boolean;
  isInstalled: boolean;
}

export const InstallModal: React.FC<InstallModalProps> = ({
  isOpen,
  onClose,
  onTriggerNativeInstall,
  isIOS,
  isInstalled,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-indigo-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Download / Install App
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Install as a standalone native app on your device
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

        {isInstalled ? (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                App Already Installed!
              </h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                Calculator Vault is running in standalone app mode on your device.
              </p>
            </div>
          </div>
        ) : isIOS ? (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              To install on your iPhone or iPad:
            </p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <Share className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white block">Step 1</span>
                  Tap the <strong>Share</strong> button in Safari toolbar
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/60 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                  <PlusSquare className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white block">Step 2</span>
                  Scroll down and tap <strong>"Add to Home Screen"</strong>
                </div>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-[11px] text-amber-800 dark:text-amber-300">
              It will be saved on your home screen with the Calculator icon and run without any browser address bar!
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-300">
              Install Calculator Vault directly to your desktop or mobile home screen for fast 1-tap access and full offline privacy:
            </p>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <Smartphone className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
                <span className="text-xs font-semibold block text-slate-900 dark:text-white">Mobile Home Screen</span>
                <span className="text-[10px] text-slate-400">Android & iOS</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-center">
                <Monitor className="w-5 h-5 text-indigo-500 mx-auto mb-1.5" />
                <span className="text-xs font-semibold block text-slate-900 dark:text-white">Desktop App</span>
                <span className="text-[10px] text-slate-400">Windows, Mac, Linux</span>
              </div>
            </div>

            <button
              onClick={async () => {
                sound.playClick();
                await onTriggerNativeInstall();
                onClose();
              }}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Install to Device Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
