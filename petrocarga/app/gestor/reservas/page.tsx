import CalendarioReservas from '@/components/gestor/calendario/CalendarioReservasGestor';

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
    <div className="flex flex-col items-center">
      {/* Título da página */}
      <h1 className="text-2xl font-bold p-4">Gerenciar Reservas</h1>

      {/* Container responsivo para o calendário */}
      <div className="w-full max-w-5xl px-2 md:px-4">
        <CalendarioReservas />
      </div>
    </div>
  );
}
