import DisponibilidadeCalendario from '@/components/gestor/disponibilidade/DisponibilidadeCalendario';

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
    <div className="flex flex-col items-center">
      {/* Título da página */}
      <h1 className="text-2xl font-bold py-4">Disponibilidade de Vagas</h1>

      {/* Container responsivo para o calendário */}
      <div className="w-full max-w-5xl px-2 md:px-4">
        <DisponibilidadeCalendario />
      </div>
    </div>
  );
}
