'use client';

import { Tutorial } from '@/components/tutorial/tutorial';
import { secoesAgente } from '@/components/tutorial/personas/secoesAgente';
import { CalendarPlus, ChevronRight } from 'lucide-react';

export default function PaginaTutorialAgente() {
  return (
    <Tutorial
      secoes={secoesAgente}
      persona="agente"
      linkVoltar="/agente"
      textoLinkVoltar="Dashboard"
      tituloHeader="Guia do Agente"
      subtituloHeader="Aprenda a usar todas as funcionalidades do sistema"
      tituloBoasVindas="Bem-vindo ao Guia do Agente!"
      descricaoBoasVindas="Este tutorial foi criado para ajudar você a aproveitar ao máximo todas as funcionalidades do sistema de gerenciamento de estacionamento. Clique em qualquer seção abaixo para aprender mais, ou utilize o menu lateral para navegar rapidamente."
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
