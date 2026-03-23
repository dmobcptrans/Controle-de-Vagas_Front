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

/**
 * @component InstallPWAButton
 * @version 1.0.0
 * 
 * @description Botão para instalação do aplicativo como Progressive Web App (PWA).
 * Aparece apenas quando o navegador suporta a instalação e dispara o evento beforeinstallprompt.
 * 
 * ----------------------------------------------------------------------------
 * 📋 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. DETECÇÃO DE INSTALAÇÃO:
 *    - Escuta o evento 'beforeinstallprompt' do navegador
 *    - Evento é disparado quando o app é instalável
 * 
 * 2. EXIBIÇÃO DO BOTÃO:
 *    - Só aparece se o evento beforeinstallprompt foi disparado
 *    - Retorna null se não houver prompt disponível
 * 
 * 3. INSTALAÇÃO:
 *    - Ao clicar, chama prompt() do evento
 *    - Aguarda a escolha do usuário (accepted/dismissed)
 *    - Se aceito, limpa o prompt (não mostra novamente)
 * 
 * 4. ESTADOS:
 *    - loading: desabilita botão durante instalação
 *    - Ícone muda para spinner durante loading
 *    - Texto alterna para "Instalando..."
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - TIPAGEM FORTE: Interface BeforeInstallPromptEvent estende Event
 * - PREVENÇÃO: event.preventDefault() no handler inicial
 * - CLEANUP: Remove event listener na desmontagem
 * - ESTILOS: Backdrop blur, transições, escala ativa
 * 
 * ----------------------------------------------------------------------------
 * 🔗 TECNOLOGIAS RELACIONADAS:
 * ----------------------------------------------------------------------------
 * 
 * - PWA: Progressive Web App
 * - Service Worker: Gerencia cache offline
 * - Web App Manifest: Arquivo manifest.json
 * 
 * @example
 * ```tsx
 * // Uso em navbar ou footer
 * <InstallPWAButton />
 * ```
 * 
 * @see /public/manifest.json - Configuração do PWA
 * @see next.config.js - Configuração do next-pwa
 */

export function InstallPWAButton() {
  const [prompt, setPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // ==================== EVENT LISTENER ====================
  useEffect(() => {
    function handler(e: Event): void {
      // Type cast para o tipo específico do evento
      const promptEvent = e as BeforeInstallPromptEvent;
      promptEvent.preventDefault();
      setPrompt(promptEvent);
    }

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  // ==================== HANDLER DE INSTALAÇÃO ====================
  async function handleInstall(): Promise<void> {
    if (!prompt) return;
    
    setLoading(true);
    await prompt.prompt();
    
    const { outcome } = await prompt.userChoice;
    
    if (outcome === 'accepted') setPrompt(null);
    
    setLoading(false);
  }

  // Só exibe o botão se o navegador suportar instalação
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
      {/* Ícone dinâmico (spinner ou download) */}
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}

      {/* Texto dinâmico */}
      {loading ? 'Instalando...' : 'Instalar app'}
    </button>
  );
}