import {
  Search,
  CalendarPlus,
  ClipboardList,
  AlertCircle,
  User,
  BookOpen,
  Target,
  Bell,
  CalendarDays,
} from 'lucide-react';

/**
 * @module secoesAgente
 * @description Configuração das seções do tutorial para a persona Agente.
 * Cada seção contém título, ícone, descrição e conteúdo/passos/dicas.
 *
 * ----------------------------------------------------------------------------
 * 📋 ESTRUTURA DE CADA SEÇÃO:
 * ----------------------------------------------------------------------------
 *
 * @property {string} id - Identificador único da seção (usado para âncoras)
 * @property {string} titulo - Título da seção (pode incluir emojis)
 * @property {LucideIcon} icone - Ícone Lucide para representar a seção
 * @property {string} descricao - Breve descrição do conteúdo da seção
 * @property {string[]} [conteudo] - Texto descritivo (para visão geral)
 * @property {string[]} [passos] - Lista de passos (para tutoriais práticos)
 * @property {string[]} [dicas] - Lista de dicas e boas práticas
 *
 * ----------------------------------------------------------------------------
 * 📋 SEÇÕES DISPONÍVEIS:
 * ----------------------------------------------------------------------------
 *
 * 1. visaoGeral - Visão geral do sistema
 * 2. relatorio - Dashboard e painel de controle
 * 3. consultaPlaca - Consulta de reservas por placa
 * 4. reservaRapida - Criação de reservas rápidas
 * 5. historicoReservas - Histórico e gerenciamento de reservas
 * 6. reservas - Calendário de reservas
 * 7. denuncias - Gerenciamento de denúncias
 * 8. perfil - Gerenciamento do perfil
 * 9. notificacoes - Sistema de notificações
 *
 * ----------------------------------------------------------------------------
 * 🎨 ÍCONES POR SEÇÃO:
 * ----------------------------------------------------------------------------
 *
 * | Seção               | Ícone            | Cor/Significado           |
 * |---------------------|------------------|----------------------------|
 * | Visão Geral         | BookOpen         | 📖 Informações gerais      |
 * | Relatório           | Target           | 🎯 Dashboard e metas       |
 * | Consulta Placa      | Search           | 🔍 Busca                   |
 * | Reserva Rápida      | CalendarPlus     | 📅 Criar reserva           |
 * | Histórico Reservas  | ClipboardList    | 📋 Lista e gerenciamento   |
 * | Reservas (Calendário)| CalendarDays    | 📆 Visualização mensal     |
 * | Denúncias           | AlertCircle      | ⚠️ Alertas                 |
 * | Perfil              | User             | 👤 Usuário                 |
 * | Notificações        | Bell             | 🔔 Alertas                 |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - Tutorial: Componente que renderiza estas seções
 * - secoesMotorista: Configuração para persona Motorista
 *
 * @example
 * ```tsx
 * // Uso no componente Tutorial
 * <Tutorial secoes={secoesAgente} persona="agente" />
 * ```
 */

export const secoesAgente = [
  {
    id: 'visaogeral',
    titulo: '📋 Visão Geral do Sistema',
    icone: BookOpen,
    descricao:
      'Entenda como o sistema funciona e quais recursos estão disponíveis',
    conteudo: [
      'O sistema de gerenciamento de estacionamento foi desenvolvido para facilitar o trabalho dos agentes no controle de vagas, reservas e atendimento aos motoristas.',
      '',
      'Principais funcionalidades:',
      '• Consulta de reservas por placa',
      '• Realização de reservas rápidas',
      '• Visualização de histórico de reservas',
      '• Gerenciamento de denúncias',
      '• Acompanhamento de status em tempo real',
    ],
  },
  {
    id: 'relatorio',
    titulo: '📊 Relatório - Seu Painel de Controle',
    icone: Target,
    descricao: 'Acompanhe suas estatísticas e acesse as principais funções',
    passos: [
      'Cards de Estatísticas: Visualize total de reservas, reservas ativas e denúncias pendentes',
      'Reservar Vaga: Botão principal para iniciar uma nova reserva rápida',
      'Consultar Placa: Acesso rápido para verificar reservas de um veículo',
      'Últimas Reservas: Visualize as 3 reservas mais recentes',
      'Acesso Rápido: Links diretos para Histórico, Denúncias, Consulta e Perfil',
    ],
  },
  {
    id: 'consultaplaca',
    titulo: '🔍 Consultar Placa',
    icone: Search,
    descricao: 'Busque todas as reservas associadas a uma placa de veículo',
    passos: [
      'Digite a placa no campo de busca (formato AAA0000 ou AAA0A00)',
      'A placa é automaticamente formatada em maiúsculas',
      'Pressione Enter ou aguarde a busca automática',
      'Visualize o resumo com contagem por status',
      'Explore os cards individuais com detalhes de cada reserva',
      'Clique no card para ver informações completas da reserva',
    ],
    dicas: [
      'A placa é convertida automaticamente para maiúsculas',
      'Caracteres especiais como hífen são removidos',
      'Busca funciona com placas Mercosul e padrão',
      'Resultados mostram reservas ativas e finalizadas',
    ],
  },
  {
    id: 'reservarapida',
    titulo: '🚗 Reserva Rápida',
    icone: CalendarPlus,
    descricao: 'Crie uma nova reserva de vaga em poucos passos',
    passos: [
      'Busque uma localização digitando rua, bairro ou ponto de referência',
      'Selecione uma vaga no mapa interativo',
      'Preencha os dados da reserva (veículo, período, etc.)',
      'Confirme os detalhes antes de finalizar',
      'A reserva aparecerá no Relatório e no Histórico',
    ],
    dicas: [
      'Use o campo de busca para encontrar vagas rapidamente',
      'O mapa mostra vagas disponíveis em tempo real',
      'Você pode visualizar detalhes da vaga antes de selecionar',
      'Reservas podem ser canceladas a qualquer momento',
    ],
  },
  {
    id: 'historicoreservas',
    titulo: '📜 Histórico de Reservas',
    icone: ClipboardList,
    descricao: 'Gerencie e acompanhe todas as suas reservas',
    passos: [
      'Filtre por status: Todas, Reservada, Ativa, Concluída, Cancelada, Removida',
      'Busque por placa, logradouro ou bairro no campo de pesquisa',
      'Visualize cards com informações resumidas de cada reserva',
      'Clique no card para ver detalhes completos',
      'Pagine entre os resultados para navegar por todas as reservas',
    ],
    dicas: [
      'Use filtros combinados para refinar sua busca',
      'Cards mostram status com cores diferentes para fácil identificação',
      'Reservas ativas têm destaque especial',
      'Você pode cancelar reservas ativas diretamente do card',
    ],
  },
  {
    id: 'reservas',
    titulo: '📅 Calendário de Reservas',
    icone: CalendarDays,
    descricao:
      'Visualize todas as reservas em um formato de calendário intuitivo',
    passos: [
      'Acesse a página "Reservas" pelo menu lateral',
      'Navegue entre os meses usando os botões de navegação',
      'Visualize as reservas organizadas por dia no calendário',
      'Clique em um dia para ver as reservas daquela data',
      'Clique em uma reserva para ver detalhes e realizar ações',
      'Realize check-in, check-out ou cancelamento diretamente pelo calendário',
    ],
    dicas: [
      'O calendário mostra todas as reservas do sistema em tempo real',
      'Use os botões de navegação para ver meses anteriores ou futuros',
      'Reservas ativas aparecem com destaque visual diferente',
      'O calendário é atualizado automaticamente quando novas reservas são criadas',
      'Você pode filtrar reservas por status para focar no que é importante',
    ],
  },
  {
    id: 'denuncias',
    titulo: '⚠️ Gerenciamento de Denúncias',
    icone: AlertCircle,
    descricao: 'Acompanhe e responda às denúncias dos motoristas',
    passos: [
      'Visualize denúncias abertas na lista principal',
      'Leia os detalhes da ocorrência',
      'Analise as evidências anexadas pelo motorista',
      'Atualize o status da denúncia (Em análise, Resolvida, etc.)',
      'Adicione observações sobre a resolução',
    ],
    dicas: [
      'Denúncias são priorizadas por data de abertura',
      'Sempre documente a resolução com observações claras',
      'O sistema notifica o motorista quando o status muda',
      'Mantenha um registro fotográfico quando necessário',
    ],
  },
  {
    id: 'perfil',
    titulo: '👤 Meu Perfil',
    icone: User,
    descricao: 'Gerencie suas informações pessoais e preferências',
    passos: [
      'Visualize seus dados cadastrais',
      'Edite informações quando necessário',
      'Altere sua senha por segurança',
      'Configure notificações para receber alertas importantes',
      'Gerencie preferências de exibição',
    ],
    dicas: [
      'Mantenha seus dados sempre atualizados',
      'Use uma senha forte e única',
      'Ative notificações para não perder informações importantes',
      'Alterações são salvas automaticamente',
    ],
  },
  {
    id: 'notificacoes',
    titulo: '🔔 Sistema de Notificações',
    icone: Bell,
    descricao: 'Receba alertas sobre reservas, denúncias e atualizações',
    passos: [
      'Notificações aparecem no ícone de sino no topo da página',
      'Clique para expandir e ver todas as notificações',
      'Clique em uma notificação para ser direcionado ao item relacionado',
      'Marque como lidas para organizar seu painel',
    ],
    dicas: [
      'Notificações em tempo real mantêm você informado',
      'Reservas próximas ao fim geram alertas automáticos',
      'Novas denúncias têm destaque especial',
      'Mantenha as notificações sempre em dia',
    ],
  },
];
