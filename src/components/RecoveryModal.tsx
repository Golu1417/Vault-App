import React, { useState } from 'react';
import { X, ShieldAlert, KeyRound, CheckCircle2, AlertCircle } from 'lucide-react';
import type { VaultSettings } from '../types';
import { sound } from '../services/sound';
import { getCurrentTimePin } from '../utils/security';

interface RecoveryModalProps {
  isOpen: boolean;
  settings: VaultSettings;
  onClose: () => void;
  onSuccessUnlock: () => void;
  onResetPin: (newPin: string) => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  settings,
  onClose,
  onSuccessUnlock,
  onResetPin,
}) => {
  const [answer, setAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const [newPin, setNewPin] = useState('');

  if (!isOpen) return null;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedAnswer = answer.trim().toLowerCase();
    const targetAnswer = (settings.securityAnswer || '').trim().toLowerCase();

    if (!cleanedAnswer) {
      setError('Please enter your recovery answer.');
      sound.playError();
      return;
    }

    if (cleanedAnswer === targetAnswer) {
      sound.playUnlock();
      setIsVerified(true);
    } else {
      setError('Incorrect answer. Please try again.');
      sound.playError();
    }
  };

  const handleSaveNewPinAndUnlock = () => {
    if (settings.authMode === 'permanent') {
      if (!/^\d{4,6}$/.test(newPin)) {
        setError('Please enter a 4-6 digit numeric PIN.');
        sound.playError();
        return;
      }
      onResetPin(newPin);
    }
    sound.playUnlock();
    onSuccessUnlock();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in text-slate-800 dark:text-slate-100">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Emergency Vault Recovery
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Answer security question to recover vault access
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

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!isVerified ? (
          <form onSubmit={handleVerify} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1">
                Your Security Question:
              </span>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                {settings.securityQuestion || 'What is your favorite color?'}
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Your Answer
              </label>
              <input
                type="text"
                autoFocus
                placeholder="Type your answer..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition"
            >
              <KeyRound className="w-4 h-4" />
              <span>Verify Answer</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                  Identity Verified!
                </h4>
                <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">
                  {settings.authMode === 'time'
                    ? `You are currently using Dynamic Time PIN. Right now, the time PIN is ${getCurrentTimePin(settings.timeFormat)}.`
                    : `Your current permanent PIN was: ${settings.permanentPin}. You can set a new PIN below or proceed directly to the vault.`}
                </p>
              </div>
            </div>

            {settings.authMode === 'permanent' && (
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Set New 4-6 Digit PIN (Optional)
                </label>
                <input
                  type="password"
                  maxLength={6}
                  placeholder="Leave blank to keep current PIN"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center font-mono tracking-widest text-base"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleSaveNewPinAndUnlock}
              className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25 transition"
            >
              <span>Unlock Vault Now</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
