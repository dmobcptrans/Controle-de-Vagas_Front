'use client';

import { Tutorial } from '@/components/tutorial/tutorial';
import { secoesMotorista } from '@/components/tutorial/personas/secoesMotorista';
import { CalendarPlus, ChevronRight } from 'lucide-react';

/**
 * @component PaginaTutorialMotorista
 * @version 1.0.0
 *
 * @description Página de tutorial interativo para motoristas.
 * Exibe um guia completo com seções organizadas sobre as funcionalidades do sistema.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 *
 * 1. TUTORIAL INTERATIVO:
 *    - Componente Tutorial reutilizável
 *    - Seções específicas para motoristas (secoesMotorista)
 *    - Navegação por menu lateral e cards
 *
 * 2. HEADER PERSONALIZADO:
 *    - Título: "Guia do Motorista"
 *    - Subtítulo: "Aprenda a usar todas as funcionalidades do sistema"
 *    - Link de volta para o Dashboard
 *
 * 3. SEÇÃO DE BOAS-VINDAS:
 *    - Título e descrição introdutória
 *    - Incentivo à navegação pelo tutorial
 *
 * 4. CALL-TO-ACTION (CTA):
 *    - Botão primário: "Fazer uma reserva" (com ícone CalendarPlus)
 *    - Botão secundário: "Ir para o Menu" (com ícone ChevronRight)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - COMPONENTE REUTILIZÁVEL: Tutorial é usado por diferentes personas
 * - SEÇÕES POR PERSONA: secoesMotorista contém conteúdo específico para motoristas
 * - BOTÕES DE AÇÃO: Facilitam navegação pós-tutorial
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Tutorial: Componente reutilizável de tutorial
 * - secoesMotorista: Configuração de seções para motoristas
 * - /motorista/dashboard: Dashboard do motorista (retorno)
 * - /motorista/reservar-vaga: Página de reserva (CTA)
 *
 * @example
 * ```tsx
 * // Uso em rota de motorista
 * <PaginaTutorialMotorista />
 * ```
 *
 * @see /src/components/tutorial/tutorial.tsx - Componente base
 * @see /src/components/tutorial/personas/secoesMotorista.ts - Configuração de seções
 */

export default function PaginaTutorialMotorista() {
  return (
    <Tutorial
      // ==================== CONFIGURAÇÃO DE PERSONA ====================
      secoes={secoesMotorista}
      persona="motorista"
      // ==================== NAVEGAÇÃO ====================
      linkVoltar="/motorista/dashboard"
      textoLinkVoltar="Dashboard"
      // ==================== HEADER ====================
      tituloHeader="Guia do Motorista"
      subtituloHeader="Aprenda a usar todas as funcionalidades do sistema"
      // ==================== SEÇÃO DE BOAS-VINDAS ====================
      tituloBoasVindas="Bem-vindo ao Guia do Motorista!"
      descricaoBoasVindas="Este tutorial foi criado para ajudar você a aproveitar ao máximo todas as funcionalidades do sistema de estacionamento. Clique em qualquer seção abaixo para aprender mais, ou utilize o menu lateral para navegar rapidamente."
      // ==================== CALL-TO-ACTION ====================
      tituloCTA="Pronto para começar?"
      descricaoCTA="Agora que você conhece todas as funcionalidades, faça sua primeira reserva e aproveite o estacionamento!"
      linkBotaoPrimario="/motorista/reservar-vaga"
      textoBotaoPrimario="Fazer uma reserva"
      iconeBotaoPrimario={CalendarPlus}
      linkBotaoSecundario="/motorista/dashboard"
      textoBotaoSecundario="Ir para o Menu"
      iconeBotaoSecundario={ChevronRight}
    />
  );
}
