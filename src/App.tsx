import React, { useState, useEffect } from 'react';
import type { VaultSettings } from './types';
import { vaultDB } from './services/db';
import { sound } from './services/sound';
import { applyDisguise } from './utils/favicon';
import { usePWAInstall } from './utils/usePWAInstall';
import { Calculator } from './components/Calculator';
import { VaultDashboard } from './components/VaultDashboard';
import { OnboardingModal } from './components/OnboardingModal';
import { RecoveryModal } from './components/RecoveryModal';
import { InstallModal } from './components/InstallModal';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<VaultSettings | null>(null);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);

  const { isInstalled, isIOS, triggerInstall } = usePWAInstall();

  // Load initial settings
  useEffect(() => {
    const init = async () => {
      const loaded = await vaultDB.getSettings();
      setSettings(loaded);
      sound.setEnabled(loaded.soundEnabled);
      applyDisguise(loaded.disguise);

      // Apply initial theme
      if (loaded.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }

      // Check if first-time user
      if (!loaded.isConfigured) {
        setIsOnboardingOpen(true);
      }
    };
    init();
  }, []);

  // Update theme and disguise whenever settings change
  useEffect(() => {
    if (!settings) return;

    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    applyDisguise(settings.disguise);
  }, [settings?.theme, settings?.disguise]);

  // Auto-lock when app is minimized, tab hidden, or device backgrounded
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        if (settings?.autoLockOnMinimize !== false) {
          setIsUnlocked(false);
        }
      }
    };

    const handlePageHide = () => {
      if (settings?.autoLockOnMinimize !== false) {
        setIsUnlocked(false);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pagehide', handlePageHide);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [settings?.autoLockOnMinimize]);

  const handleUpdateSettings = async (updated: Partial<VaultSettings>) => {
    if (!settings) return;
    const newSettings = { ...settings, ...updated };
    setSettings(newSettings);
    await vaultDB.saveSettings(newSettings);
    sound.setEnabled(newSettings.soundEnabled);
  };

  const handleToggleTheme = () => {
    if (!settings) return;
    const nextTheme = settings.theme === 'dark' ? 'light' : 'dark';
    handleUpdateSettings({ theme: nextTheme });
    sound.playClick();
  };

  const handleOnboardingComplete = async (updated: Partial<VaultSettings>) => {
    await handleUpdateSettings(updated);
    setIsOnboardingOpen(false);
  };

  const handleTriggerNativeInstall = async () => {
    await triggerInstall();
  };

  if (!settings) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors duration-200">
      {isUnlocked ? (
        <VaultDashboard
          settings={settings}
          onLock={() => setIsUnlocked(false)}
          onUpdateSettings={handleUpdateSettings}
          onToggleTheme={handleToggleTheme}
          onOpenInstall={() => setIsInstallModalOpen(true)}
        />
      ) : (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-100 dark:bg-slate-950">
          <Calculator
            settings={settings}
            onUnlock={() => setIsUnlocked(true)}
            onOpenRecovery={() => setIsRecoveryOpen(true)}
            onToggleTheme={handleToggleTheme}
            onOpenInstall={() => setIsInstallModalOpen(true)}
          />

          {/* Discreet footer hint */}
          <footer className="mt-4 text-center">
            <p className="text-[11px] text-slate-400 dark:text-slate-600 font-mono">
              Press <span className="font-bold text-slate-500 dark:text-slate-400">=</span> to calculate or verify passcode
            </p>
          </footer>
        </div>
      )}

      {/* First-time onboarding / Passcode selector wizard */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onComplete={handleOnboardingComplete}
      />

      {/* Emergency recovery modal */}
      <RecoveryModal
        isOpen={isRecoveryOpen}
        settings={settings}
        onClose={() => setIsRecoveryOpen(false)}
        onSuccessUnlock={() => {
          setIsRecoveryOpen(false);
          setIsUnlocked(true);
        }}
        onResetPin={(newPin) => handleUpdateSettings({ permanentPin: newPin })}
      />

      {/* PWA Download / Installation modal */}
      <InstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        onTriggerNativeInstall={handleTriggerNativeInstall}
        isIOS={isIOS}
        isInstalled={isInstalled}
      />
    </div>
  );
};

export default App;
