import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Clock, 
  KeyRound, 
  ArrowRight, 
  HelpCircle, 
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import type { AuthMode, VaultSettings } from '../types';
import { getCurrentTimePin } from '../utils/security';
import { sound } from '../services/sound';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (updated: Partial<VaultSettings>) => void;
}

const SECURITY_QUESTIONS = [
  'What is your favorite color?',
  'What is the name of your first pet?',
  'What city were you born in?',
  'What was your childhood nickname?',
  'What was your first school name?'
];

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedMode, setSelectedMode] = useState<AuthMode>('time');
  const [permanentPin, setPermanentPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Live updating current time for preview
  const [currentTimeDisplay, setCurrentTimeDisplay] = useState('');
  const [currentTimePin, setCurrentTimePin] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeDisplay(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setCurrentTimePin(getCurrentTimePin('24h'));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) return null;

  const handleStep1Next = () => {
    setError(null);
    if (selectedMode === 'permanent') {
      if (!/^\d{4,6}$/.test(permanentPin)) {
        setError('Please enter a 4 to 6 digit numerical PIN.');
        sound.playError();
        return;
      }
      if (permanentPin !== confirmPin) {
        setError('PINs do not match. Please re-enter.');
        sound.playError();
        return;
      }
    }
    sound.playClick();
    setStep(2);
  };

  const handleFinish = () => {
    if (!securityAnswer.trim()) {
      setError('Please provide an answer for your recovery security question.');
      sound.playError();
      return;
    }

    try {
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    sound.playUnlock();

    onComplete({
      isConfigured: true,
      authMode: selectedMode,
      permanentPin: selectedMode === 'permanent' ? permanentPin : '1234',
      securityQuestion,
      securityAnswer: securityAnswer.trim().toLowerCase(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden relative">
        {/* Glow decoration */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Welcome to Calculator Vault
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Configure your secret access method to conceal your photos & videos
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {step === 1 ? (
          <div className="space-y-4">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Choose how you want to unlock the vault from the calculator:
            </p>

            {/* Option A: Dynamic Time-based Password */}
            <div
              onClick={() => { setSelectedMode('time'); setError(null); }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedMode === 'time'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500 dark:text-amber-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-slate-900 dark:text-white text-sm">
                        Dynamic Time-based Password
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-500 dark:bg-amber-500/20 dark:text-amber-300">
                        Smart & Changing
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Your passcode automatically updates with the current time!
                    </p>
                  </div>
                </div>
                {selectedMode === 'time' && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                )}
              </div>

              {/* Dynamic Time Demonstration Card */}
              <div className="mt-3.5 p-3 rounded-xl bg-slate-100/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs">
                <div className="flex items-center justify-between font-mono">
                  <span className="text-slate-500 dark:text-slate-400">
                    Current Time: <strong>{currentTimeDisplay}</strong>
                  </span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-bold bg-indigo-100 dark:bg-indigo-950 px-2 py-0.5 rounded-md">
                    Passcode: {currentTimePin}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                  Example: If it's <strong>1:53 PM</strong>, type <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-indigo-500 font-mono">1353=</code>. If it's <strong>11:06 AM</strong>, type <code className="bg-slate-200 dark:bg-slate-700 px-1 py-0.5 rounded text-indigo-500 font-mono">1106=</code>.
                </p>
              </div>
            </div>

            {/* Option B: Constant Permanent Password */}
            <div
              onClick={() => { setSelectedMode('permanent'); setError(null); }}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                selectedMode === 'permanent'
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/30 shadow-md ring-2 ring-indigo-500/20'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                    <KeyRound className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-slate-900 dark:text-white text-sm">
                      Constant Permanent Password
                    </span>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      Set a fixed 4 to 6 digit code that stays the same forever.
                    </p>
                  </div>
                </div>
                {selectedMode === 'permanent' && (
                  <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0 mt-1" />
                )}
              </div>

              {selectedMode === 'permanent' && (
                <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-700 grid grid-cols-2 gap-3 animate-slide-up">
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Set 4-6 Digit PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="e.g. 2580"
                      value={permanentPin}
                      onChange={(e) => setPermanentPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded-xl text-center font-mono text-base tracking-widest bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                      Confirm PIN
                    </label>
                    <input
                      type="password"
                      maxLength={6}
                      placeholder="Repeat PIN"
                      value={confirmPin}
                      onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3 py-2 rounded-xl text-center font-mono text-base tracking-widest bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={handleStep1Next}
              className="w-full py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition mt-2"
            >
              <span>Next: Security Recovery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="space-y-4 animate-slide-up">
            <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-white mb-1">
                <HelpCircle className="w-4 h-4 text-indigo-500" />
                <span>Emergency Backup Recovery</span>
              </div>
              If you ever forget your PIN or get locked out, enter <strong className="font-mono text-indigo-600 dark:text-indigo-400">112233=</strong> in the calculator to answer your security question and regain access.
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Security Question
              </label>
              <select
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {SECURITY_QUESTIONS.map((q) => (
                  <option key={q} value={q}>{q}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                Your Answer
              </label>
              <input
                type="text"
                placeholder="Type your secret answer"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>
                To unlock anytime: enter your passcode on the calculator and press <strong>=</strong>
              </span>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/25 transition"
              >
                <Lock className="w-4 h-4" />
                <span>Complete Setup & Launch Vault</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
