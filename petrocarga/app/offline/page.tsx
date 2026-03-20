'use client';

import { useRouter } from 'next/navigation';

/**
 * @component OfflinePage
 * @version 1.0.0
 *
 * @description Página exibida quando o usuário está sem conexão com a internet.
 * Fornece opções para tentar reconectar ou voltar à página anterior,
 * além de informar sobre funcionalidades disponíveis offline.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. DETECÇÃO DE OFFLINE:
 *    - Esta página é exibida quando o Next.js detecta falta de conexão
 *    - Pode ser configurada no arquivo de layout ou via service worker
 *
 * 2. AÇÕES DISPONÍVEIS:
 *    a) TENTAR NOVAMENTE:
 *       - Recarrega a página atual
 *       - Útil quando a conexão é restabelecida
 *
 *    b) VOLTAR:
 *       - Retorna à página anterior no histórico
 *       - Usa router.back() do Next.js
 *
 * 3. INFORMAÇÕES AO USUÁRIO:
 *    - Mensagem clara sobre o status offline
 *    - Dica sobre reservas salvas disponíveis offline
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE CLIENT: Necessário para:
 *   - useRouter (navegação programática)
 *   - window.location.reload (recarregar página)
 *
 * - ESTILOS INLINE: Uso de style para simplicidade (página de fallback)
 *
 * - MENSAGEM OFFLINE: Informa que reservas salvas podem ser acessadas
 *   (funcionalidade de PWA com cache)
 *
 * ----------------------------------------------------------------------------
 * 🔗 FUNCIONALIDADES RELACIONADAS:
 * ----------------------------------------------------------------------------
 *
 * - PWA: Service worker permite acesso offline a dados em cache
 * - next-pwa: Configuração no next.config.js para habilitar offline
 *
 * @example
 * ```tsx
 * // Uso em rota de fallback
 * // next.config.js
 * const withPWA = require('next-pwa')({
 *   dest: 'public',
 *   // ... outras configurações
 * });
 * ```
 */

export default function OfflinePage() {
  const router = useRouter();

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      {/* Título principal */}
      <h1>PetroCarga está Offline</h1>

      {/* Mensagem de status */}
      <p>Parece que você está sem conexão com a internet.</p>

      {/* Botões de ação */}
      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        {/* Botão para tentar novamente (recarregar página) */}
        <button
          onClick={() => window.location.reload()}
          className="btn-primary"
        >
          Tentar Novamente
        </button>

        {/* Botão para voltar à página anterior */}
        <button onClick={() => router.back()} className="btn-secondary">
          Voltar para página anterior
        </button>
      </div>

      {/* Informação adicional sobre funcionalidades offline */}
      <div style={{ marginTop: '20px' }}>
        <p>
          Suas reservas salvas ainda podem ser visualizadas na aba de Reservas.
        </p>
      </div>
    </div>
  );
}
