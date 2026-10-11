import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Calculator as CalcIcon, 
  Clock, 
  StickyNote, 
  CloudSun, 
  Sun, 
  Moon, 
  Delete, 
  HelpCircle,
  ShieldAlert,
  Download
} from 'lucide-react';
import type { VaultSettings } from '../types';
import { verifyPasscode, EMERGENCY_RECOVERY_CODE } from '../utils/security';
import { sound } from '../services/sound';
import { DISGUISE_PROFILES } from '../utils/favicon';

interface CalculatorProps {
  settings: VaultSettings;
  onUnlock: () => void;
  onOpenRecovery: () => void;
  onToggleTheme: () => void;
  onOpenInstall?: () => void;
}

export const Calculator: React.FC<CalculatorProps> = ({
  settings,
  onUnlock,
  onOpenRecovery,
  onToggleTheme,
  onOpenInstall,
}) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(false);
  const [rawInputBuffer, setRawInputBuffer] = useState('');
  const [showHelperTooltip, setShowHelperTooltip] = useState(false);
  const percentLongPressTimer = useRef<number | null>(null);

  const disguise = DISGUISE_PROFILES[settings.disguise] || DISGUISE_PROFILES.calculator;

  const handleDigit = useCallback((digit: string) => {
    sound.playClick(1.0);
    setRawInputBuffer((prev) => prev + digit);

    setDisplay((current) => {
      if (overwrite || current === '0') {
        setOverwrite(false);
        return digit;
      }
      if (current.length >= 14) return current; // prevent overflow
      return current + digit;
    });
  }, [overwrite]);

  const handleDecimal = useCallback(() => {
    sound.playClick(1.0);
    setRawInputBuffer((prev) => prev + '.');

    setDisplay((current) => {
      if (overwrite) {
        setOverwrite(false);
        return '0.';
      }
      if (current.includes('.')) return current;
      return current + '.';
    });
  }, [overwrite]);

  const handleClear = useCallback(() => {
    sound.playClick(0.85);
    setDisplay('0');
    setEquation('');
    setPrevValue(null);
    setOperation(null);
    setOverwrite(false);
    setRawInputBuffer('');
  }, []);

  const handleBackspace = useCallback(() => {
    sound.playClick(0.9);
    setRawInputBuffer((prev) => prev.slice(0, -1));
    setDisplay((current) => {
      if (current.length <= 1 || current === 'Error') return '0';
      return current.slice(0, -1);
    });
  }, []);

  const handleToggleSign = useCallback(() => {
    sound.playClick(0.95);
    setDisplay((current) => {
      if (current === '0' || current === 'Error') return current;
      const val = parseFloat(current);
      return (-val).toString();
    });
  }, []);

  const handlePercentage = useCallback(() => {
    sound.playClick(1.05);
    setDisplay((current) => {
      const val = parseFloat(current);
      if (isNaN(val)) return '0';
      return (val / 100).toString();
    });
  }, []);

  const handleOperation = useCallback((op: string) => {
    sound.playClick(1.1);
    const current = parseFloat(display);

    if (isNaN(current)) return;

    if (prevValue === null) {
      setPrevValue(current);
      setEquation(`${current} ${op}`);
    } else if (operation) {
      const result = computeResult(prevValue, current, operation);
      setPrevValue(result);
      setDisplay(result.toString());
      setEquation(`${result} ${op}`);
    }

    setOperation(op);
    setOverwrite(true);
    setRawInputBuffer(''); // reset secret PIN input on math operator
  }, [display, prevValue, operation]);

  const computeResult = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×': return a * b;
      case '÷': return b === 0 ? 0 : a / b;
      default: return b;
    }
  };

  const handleEqual = useCallback(() => {
    // 1. Check Secret Unlock Passcode!
    const candidatePin = rawInputBuffer || display;

    // Check emergency code first
    if (candidatePin === EMERGENCY_RECOVERY_CODE) {
      sound.playUnlock();
      onOpenRecovery();
      handleClear();
      return;
    }

    // Check secret PIN
    if (verifyPasscode(candidatePin, settings)) {
      sound.playUnlock();
      onUnlock();
      handleClear();
      return;
    }

    // 2. Otherwise execute standard arithmetic calculation
    sound.playClick(1.15);

    const current = parseFloat(display);
    if (prevValue !== null && operation) {
      const result = computeResult(prevValue, current, operation);
      const rounded = Math.round(result * 1e10) / 1e10;
      setEquation(`${prevValue} ${operation} ${current} =`);
      setDisplay(rounded.toString());
      setPrevValue(null);
      setOperation(null);
      setOverwrite(true);
      setRawInputBuffer('');
    } else {
      setEquation(`${display} =`);
      setOverwrite(true);
      setRawInputBuffer('');
    }
  }, [display, prevValue, operation, rawInputBuffer, settings, onUnlock, onOpenRecovery, handleClear]);

  // Physical Keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDecimal();
      } else if (e.key === '+' || e.key === '-') {
        e.preventDefault();
        handleOperation(e.key);
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperation('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperation('÷');
      } else if (e.key === '%' && !e.shiftKey) {
        e.preventDefault();
        handlePercentage();
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEqual();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleDigit, handleDecimal, handleOperation, handlePercentage, handleEqual, handleBackspace, handleClear]);

  const renderDisguiseIcon = () => {
    switch (settings.disguise) {
      case 'clock': return <Clock className="w-5 h-5 text-sky-400" />;
      case 'notes': return <StickyNote className="w-5 h-5 text-amber-400" />;
      case 'weather': return <CloudSun className="w-5 h-5 text-yellow-400" />;
      default: return <CalcIcon className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto p-4 sm:p-6 transition-all duration-300">
      {/* Disguise App Bar */}
      <div className="flex items-center justify-between mb-4 px-2">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-slate-200 dark:bg-slate-800 shadow-sm">
            {renderDisguiseIcon()}
          </div>
          <div>
            <h1 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-tight">
              {disguise.headerBrand}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              v2.4 Pro
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {/* PWA Download / Install App button */}
          {onOpenInstall && (
            <button
              onClick={onOpenInstall}
              title="Download / Install App"
              className="p-2 rounded-xl text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 transition"
            >
              <Download className="w-4 h-4" />
            </button>
          )}

          {/* Subtle Help / Password Hint trigger */}
          <button
            onClick={() => setShowHelperTooltip(!showHelperTooltip)}
            title="Calculator Info"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Theme Switcher */}
          <button
            onClick={onToggleTheme}
            title="Toggle Light/Dark Theme"
            className="p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            {settings.theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-600" />
            )}
          </button>
        </div>
      </div>

      {/* Helper notice if toggled */}
      {showHelperTooltip && (
        <div className="mb-4 p-3 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-950 dark:text-indigo-200 animate-slide-up space-y-1">
          <div className="flex items-center gap-1.5 font-semibold text-indigo-600 dark:text-indigo-400">
            <ShieldAlert className="w-4 h-4" />
            <span>Vault Passcode Reminder</span>
          </div>
          <p>
            {settings.authMode === 'time'
              ? `Currently using Dynamic Time PIN. Enter the current time (e.g. ${new Date().getHours().toString().padStart(2, '0')}${new Date().getMinutes().toString().padStart(2, '0')}) and press '=' to unlock.`
              : `Currently using Permanent PIN. Enter your secret passcode and press '=' to unlock.`}
          </p>
          <div className="pt-1 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Forgot code? Enter <strong>112233=</strong></span>
            <button 
              onClick={() => { setShowHelperTooltip(false); onOpenRecovery(); }}
              className="text-indigo-600 dark:text-indigo-400 underline font-medium"
            >
              Recover
            </button>
          </div>
        </div>
      )}

      {/* Main Calculator Body */}
      <div className="rounded-3xl p-5 shadow-2xl transition-all duration-300 border bg-white/80 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800 backdrop-blur-xl">
        {/* Digital Screen Display */}
        <div className="rounded-2xl p-4 mb-5 text-right bg-slate-100/90 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-end min-h-[96px] overflow-hidden">
          <div className="text-xs font-mono text-slate-400 dark:text-slate-500 h-5 truncate tracking-wide">
            {equation}
          </div>
          <div 
            className={`font-mono font-medium tracking-tight truncate transition-all ${
              display.length > 9 ? 'text-3xl' : display.length > 7 ? 'text-4xl' : 'text-5xl'
            } text-slate-900 dark:text-white`}
          >
            {display}
          </div>
        </div>

        {/* 4x5 Keypad Grid */}
        <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
          {/* Row 1 */}
          <button
            onClick={handleClear}
            className="calc-btn text-rose-500 dark:text-rose-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            AC
          </button>
          <button
            onClick={handleToggleSign}
            className="calc-btn text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            ±
          </button>
          <button
            onClick={handlePercentage}
            onMouseDown={() => {
              percentLongPressTimer.current = window.setTimeout(() => {
                onOpenRecovery();
              }, 1200);
            }}
            onMouseUp={() => {
              if (percentLongPressTimer.current) clearTimeout(percentLongPressTimer.current);
            }}
            onTouchStart={() => {
              percentLongPressTimer.current = window.setTimeout(() => {
                onOpenRecovery();
              }, 1200);
            }}
            onTouchEnd={() => {
              if (percentLongPressTimer.current) clearTimeout(percentLongPressTimer.current);
            }}
            title="Long press to trigger recovery"
            className="calc-btn text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            %
          </button>
          <button
            onClick={() => handleOperation('÷')}
            className={`calc-btn ${operation === '÷' ? 'bg-amber-500 text-white' : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50'}`}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button onClick={() => handleDigit('7')} className="calc-btn calc-digit">7</button>
          <button onClick={() => handleDigit('8')} className="calc-btn calc-digit">8</button>
          <button onClick={() => handleDigit('9')} className="calc-btn calc-digit">9</button>
          <button
            onClick={() => handleOperation('×')}
            className={`calc-btn ${operation === '×' ? 'bg-amber-500 text-white' : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50'}`}
          >
            ×
          </button>

          {/* Row 3 */}
          <button onClick={() => handleDigit('4')} className="calc-btn calc-digit">4</button>
          <button onClick={() => handleDigit('5')} className="calc-btn calc-digit">5</button>
          <button onClick={() => handleDigit('6')} className="calc-btn calc-digit">6</button>
          <button
            onClick={() => handleOperation('-')}
            className={`calc-btn ${operation === '-' ? 'bg-amber-500 text-white' : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50'}`}
          >
            -
          </button>

          {/* Row 4 */}
          <button onClick={() => handleDigit('1')} className="calc-btn calc-digit">1</button>
          <button onClick={() => handleDigit('2')} className="calc-btn calc-digit">2</button>
          <button onClick={() => handleDigit('3')} className="calc-btn calc-digit">3</button>
          <button
            onClick={() => handleOperation('+')}
            className={`calc-btn ${operation === '+' ? 'bg-amber-500 text-white' : 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50'}`}
          >
            +
          </button>

          {/* Row 5 */}
          <button
            onClick={handleBackspace}
            title="Backspace"
            className="calc-btn text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700"
          >
            <Delete className="w-5 h-5 mx-auto" />
          </button>
          <button onClick={() => handleDigit('0')} className="calc-btn calc-digit">0</button>
          <button onClick={handleDecimal} className="calc-btn calc-digit">.</button>
          <button
            onClick={handleEqual}
            title="Calculate or Unlock Secret Vault"
            className="calc-btn bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-2xl shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
