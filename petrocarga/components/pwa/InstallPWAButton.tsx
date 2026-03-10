'use client';

import { Download, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

// Define a interface para o evento beforeinstallprompt
interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallPWAButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    function handler(e: Event): void {
      // Faz o type cast para o tipo específico
      const promptEvent = e as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setPrompt(promptEvent);
    }

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  async function handleInstall(): Promise<void> {
    if (!prompt) return;
    setLoading(true);
    await prompt.prompt();
    const { outcome } = await prompt.userChoice;
    if (outcome === 'accepted') setPrompt(null);
    setLoading(false);
  }

  if (!prompt) return null;

  return (
    <button
      onClick={handleInstall}
      className="
        flex items-center gap-2
        px-4 py-2
        bg-gray-500/20
        text-gray-700
        text-sm font-medium
        rounded-md
        border border-gray-300
        backdrop-blur
        hover:bg-gray-500/30
        transition-all
        active:scale-95
      "
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}

      {loading ? 'Instalando...' : 'Instalar app'}
    </button>
  );
}
