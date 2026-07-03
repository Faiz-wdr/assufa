import { useState, useEffect } from 'react';

export const usePWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Detect if app is currently running in standalone display mode
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                          (window.navigator as any).standalone;
    setIsInstalled(isStandalone);

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent browser from automatically presenting the native prompt
      e.preventDefault();
      // Stash the installation event trigger
      setDeferredPrompt(e);
      // Update state to render custom Install prompts/buttons in app UI
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      // Reset installation triggers
      setDeferredPrompt(null);
      setIsInstallable(false);
      setIsInstalled(true);
      console.log('Assufa Dars Attendance was successfully installed!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const installApp = async () => {
    if (!deferredPrompt) {
      console.warn('Install prompt event not available.');
      return;
    }
    
    // Trigger browser installer popup
    deferredPrompt.prompt();
    
    // Await decision
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User prompt installer choice outcome: ${outcome}`);
    
    // Clear prompt state
    setDeferredPrompt(null);
    setIsInstallable(false);
  };

  return {
    isInstallable,
    isInstalled,
    installApp,
  };
};
