'use client';

import { Tutorial } from '@/components/tutorial/tutorial';
import { secoesAgente } from '@/components/tutorial/personas/secoesAgente';
import { CalendarPlus, ChevronRight } from 'lucide-react';

/**
 * @component PaginaTutorialAgente
 * @version 1.0.0
 *
 * @description Página de tutorial interativo para agentes.
 * Exibe um guia completo com seções organizadas sobre as funcionalidades do sistema.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 *
 * 1. TUTORIAL INTERATIVO:
 *    - Componente Tutorial reutilizável
 *    - Seções específicas para agentes (secoesAgente)
 *    - Navegação por menu lateral e cards
 *
 * 2. HEADER PERSONALIZADO:
 *    - Título: "Guia do Agente"
 *    - Subtítulo: "Aprenda a usar todas as funcionalidades do sistema"
 *    - Link de volta para o Dashboard
 *
 * 3. SEÇÃO DE BOAS-VINDAS:
 *    - Título e descrição introdutória
 *    - Incentivo à navegação pelo tutorial
 *
 * 4. CALL-TO-ACTION (CTA):
 *    - Botão primário: "Fazer uma reserva" (com ícone CalendarPlus)
 *    - Botão secundário: "Ir para o Dashboard" (com ícone ChevronRight)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE REUTILIZÁVEL: Tutorial é usado por diferentes personas
 * - SEÇÕES POR PERSONA: secoesAgente contém conteúdo específico para agentes
 * - BOTÕES DE AÇÃO: Facilitam navegação pós-tutorial
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Tutorial: Componente reutilizável de tutorial
 * - secoesAgente: Configuração de seções para agentes
 * - /agente: Dashboard do agente (retorno)
 * - /agente/reserva-rapida: Página de reserva rápida (CTA)
 *
 * @example
 * ```tsx
 * // Uso em rota de agente
 * <PaginaTutorialAgente />
 * ```
 *
 * @see /src/components/tutorial/tutorial.tsx - Componente base
 * @see /src/components/tutorial/personas/secoesAgente.ts - Configuração de seções
 */

export default function PaginaTutorialAgente() {
  return (
    <Tutorial
      // ==================== CONFIGURAÇÃO DE PERSONA ====================
      secoes={secoesAgente}
      persona="agente"
      // ==================== NAVEGAÇÃO ====================
      linkVoltar="/agente"
      textoLinkVoltar="Dashboard"
      // ==================== HEADER ====================
      tituloHeader="Guia do Agente"
      subtituloHeader="Aprenda a usar todas as funcionalidades do sistema"
      // ==================== SEÇÃO DE BOAS-VINDAS ====================
      tituloBoasVindas="Bem-vindo ao Guia do Agente!"
      descricaoBoasVindas="Este tutorial foi criado para ajudar você a aproveitar ao máximo todas as funcionalidades do sistema de gerenciamento de estacionamento. Clique em qualquer seção abaixo para aprender mais, ou utilize o menu lateral para navegar rapidamente."
      // ==================== CALL-TO-ACTION ====================
      tituloCTA="Pronto para começar?"
      descricaoCTA="Agora que você conhece todas as funcionalidades, explore o sistema e faça suas primeiras reservas!"
      linkBotaoPrimario="/agente/reserva-rapida"
      textoBotaoPrimario="Fazer uma reserva"
      iconeBotaoPrimario={CalendarPlus}
      linkBotaoSecundario="/agente"
      textoBotaoSecundario="Ir para o Dashboard"
      iconeBotaoSecundario={ChevronRight}
    />
  );
}
