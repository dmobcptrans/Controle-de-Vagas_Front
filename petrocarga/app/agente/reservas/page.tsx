
import CalendarioReservas from '@/components/gestor/calendario/CalendarioReservasGestor';
import CalendarioInfoCTA from '@/components/ui/CTA/CalendarioInfoCTA';
import { CalendarioMesProvider } from '@/context/CalendarioMesContext';
import { Info } from 'lucide-react';
import Link from 'next/dist/client/link';

/**
 * @component Reserva
 * @version 1.0.0
 *
 * @description Página de gerenciamento de reservas para gestores.
 * Componente container que exibe um calendário interativo com todas as reservas do sistema.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. ESTRUTURA DA PÁGINA:
 *    - Título centralizado "Gerenciar Reservas"
 *    - Container responsivo com largura máxima
 *    - Componente CalendarioReservas como conteúdo principal
 *
 * 2. FUNCIONALIDADES (via CalendarioReservas):
 *    - Visualização de reservas em formato calendário
 *    - Filtros por data, status ou motorista
 *    - Ações de gerenciamento (check-in, check-out, cancelamento)
 *    - Visualização de detalhes da reserva
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE SIMPLES: Não precisa de 'use client' porque:
 *   - Não usa hooks ou interatividade própria
 *   - Apenas renderiza um título e importa um componente cliente
 *   - O componente filho (CalendarioReservas) já é 'use client'
 *
 * - SEPARAÇÃO DE RESPONSABILIDADES:
 *   - Esta página: estrutura e layout
 *   - CalendarioReservas: lógica de calendário, filtros e ações
 *
 * - LAYOUT RESPONSIVO:
 *   - px-2 em mobile, px-4 em desktop para padding lateral
 *   - max-w-5xl para limitar largura em telas grandes
 *   - flex-col para empilhamento vertical
 *   - items-center para centralização horizontal
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - CalendarioReservas: Componente de calendário com todas as reservas
 *
 * @example
 * ```tsx
 * // Uso em rota de gestor
 * <Reserva />
 * ```
 *
 * @see /src/components/gestor/calendario/CalendarioReservasGestor.tsx
 */

export default function Reserva() {
  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Header ── */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Gerenciar Reservas!
          </h1>
          <p className="text-xs text-white/50 capitalize">informações em tempo real</p>
        </div>
      </header>

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        <CalendarioMesProvider>
          <div className='-mt-4 mb-5'>
            {/* CTA dinâmico de info calendario */}
            <CalendarioInfoCTA
            />
          </div>

          {/* Container responsivo para o calendário */}
          <div className="w-full max-w-5xl px-2 md:px-4 mb-5">
            <CalendarioReservas />
          </div>
        </CalendarioMesProvider>
         {/* Tutorial */}
        <Link
          href="/gestor/tutorial#reservas"
          className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors"
        >
          <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-[#1351B4]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#071D41]">
              Novo por aqui?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Veja como usar o sistema em 3 passos simples
            </p>
          </div>
        </Link>
      </main>


    </div>
  );
}
