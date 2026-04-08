import DisponibilidadeCalendario from '@/components/gestor/disponibilidade/DisponibilidadeCalendario';
import CalendarioInfoCTA from '@/components/ui/CTA/CalendarioInfoCTA';
import { CalendarioMesProvider } from '@/context/CalendarioMesContext';

/**
 * @component DisponibilidadeVagas
 * @version 1.0.0
 *
 * @description Página de visualização da disponibilidade de vagas em formato de calendário.
 * Componente simples que serve como container para o calendário de disponibilidade.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. ESTRUTURA DA PÁGINA:
 *    - Título centralizado "Disponibilidade de Vagas"
 *    - Container responsivo com largura máxima
 *    - Componente DisponibilidadeCalendario como conteúdo principal
 *
 * 2. LAYOUT:
 *    - Flex column para alinhamento vertical
 *    - Items center para centralização horizontal
 *    - Padding responsivo nas laterais
 *    - Largura máxima de 5xl para telas grandes
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE SIMPLES: Não precisa de 'use client' porque:
 *   - Não usa hooks ou interatividade própria
 *   - Apenas renderiza um título e importa um componente cliente
 *   - O componente filho (DisponibilidadeCalendario) já é 'use client'
 *
 * - SEPARAÇÃO DE RESPONSABILIDADES:
 *   - Esta página: estrutura e layout
 *   - DisponibilidadeCalendario: lógica de calendário e interatividade
 *
 * - LAYOUT RESPONSIVO:
 *   - px-2 em mobile, px-4 em desktop para padding lateral
 *   - max-w-5xl para limitar largura em telas grandes
 *   - flex-col para empilhamento vertical
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - DisponibilidadeCalendario: Componente de calendário com vagas disponíveis
 *
 * @example
 * // Uso em rota de gestor
 * <DisponibilidadeVagas />
 *
 * @see /src/components/gestor/disponibilidade/DisponibilidadeCalendario.tsx
 */

export default function DisponibilidadeVagas() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Header ── */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Gerenciar Disponibilidade!
          </h1>
          <p className="text-xs text-white/50 capitalize">
            agendamento de vagas
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        <CalendarioMesProvider>
          <div className="-mt-4 mb-5">
            {/* CTA dinâmico de info calendario */}
            <CalendarioInfoCTA />
          </div>

          {/* Container responsivo para o calendário */}
          <div className="w-full max-w-5xl px-2 md:px-4 mb-5">
            <DisponibilidadeCalendario />
          </div>
        </CalendarioMesProvider>
      </main>
    </div>
  );
}
