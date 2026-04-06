'use client';

import { Tutorial } from '@/components/tutorial/tutorial';
import { secoesMotorista } from '@/components/tutorial/personas/secoesMotorista';
import { CalendarPlus, ChevronRight } from 'lucide-react';

export default function PaginaTutorialMotorista() {
  return (
    <Tutorial
      secoes={secoesMotorista}
      persona="motorista"
      linkVoltar="/motorista/dashboard"
      textoLinkVoltar="Dashboard"
      tituloHeader="Guia do Motorista"
      subtituloHeader="Aprenda a usar todas as funcionalidades do sistema"
      tituloBoasVindas="Bem-vindo ao Guia do Motorista!"
      descricaoBoasVindas="Este tutorial foi criado para ajudar você a aproveitar ao máximo todas as funcionalidades do sistema de estacionamento. Clique em qualquer seção abaixo para aprender mais, ou utilize o menu lateral para navegar rapidamente."
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
