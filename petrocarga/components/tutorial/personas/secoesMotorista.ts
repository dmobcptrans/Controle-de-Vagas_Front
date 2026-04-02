'use client';

import {
  CalendarPlus,
  ClipboardList,
  AlertCircle,
  User,
  BookOpen,
  Target,
  Bell,
  Car,
  FileText,
} from 'lucide-react';

export const secoesMotorista = [
  {
    id: 'visaogeral',
    titulo: '📋 Visão Geral do Sistema',
    icone: BookOpen,
    descricao:
      'Entenda como o sistema funciona e quais recursos estão disponíveis para você',
    conteudo: [
      'O sistema de gerenciamento de estacionamento foi desenvolvido para facilitar sua experiência como motorista.',
      '',
      'Principais funcionalidades para motoristas:',
      '• Reserva de vagas em poucos cliques',
      '• Consulta de histórico de reservas',
      '• Gerenciamento de veículos cadastrados',
      '• Abertura e acompanhamento de denúncias',
      '• Recebimento de notificações em tempo real',
      '• Geração de comprovantes de reserva',
    ],
  },
  {
    id: 'dashboard',
    titulo: '📊 Menu - Seu Painel de Controle',
    icone: Target,
    descricao: 'Acompanhe suas estatísticas e acesse as principais funções',
    passos: [
      'Cards de Estatísticas: Visualize total de reservas, reservas ativas e suas denúncias',
      'Reservar Vaga: Botão principal para iniciar uma nova reserva',
      'Últimas Reservas: Visualize as 3 reservas mais recentes',
      'Acesso Rápido: Links diretos para Histórico, Denúncias, Meus Veículos e Perfil',
    ],
    dicas: [
      'O card "Ativa agora" mostra quantas reservas você tem em andamento',
      'Clique em "Ver todas" para acessar o histórico completo',
      'O ícone de sino mostra suas notificações não lidas',
    ],
  },
  {
    id: 'reservarvaga',
    titulo: '🚗 Reservar Vaga',
    icone: CalendarPlus,
    descricao: 'Encontre e reserve uma vaga de estacionamento em poucos passos',
    passos: [
      'Busque uma localização digitando rua, bairro ou ponto de referência',
      'Navegue pelo mapa interativo para visualizar as vagas disponíveis',
      'Clique em uma vaga para ver seus detalhes',
      'Selecione a vaga desejada',
      'Preencha os dados da reserva (período, veículo, etc.)',
      'Confirme os detalhes e finalize a reserva',
    ],
    dicas: [
      'Use o campo de busca para encontrar vagas rapidamente',
      'O mapa mostra vagas disponíveis em tempo real',
      'Você pode visualizar detalhes da vaga antes de selecionar',
      'Reservas podem ser canceladas a qualquer momento pelo histórico',
    ],
  },
  {
    id: 'minhasreservas',
    titulo: '📜 Minhas Reservas',
    icone: ClipboardList,
    descricao: 'Gerencie e acompanhe todas as suas reservas',
    passos: [
      'Visualize todas as suas reservas em uma lista organizada',
      'Use os filtros para encontrar reservas por status (Ativa, Concluída, Cancelada)',
      'Clique em uma reserva para ver detalhes completos',
      'Para reservas ativas, você pode realizar o checkout',
      'Gere comprovantes de reserva quando necessário',
      'Reservas futuras podem ser canceladas',
    ],
    dicas: [
      'Reservas ativas aparecem com destaque em verde',
      'Sempre gere o comprovante após finalizar uma reserva',
      'Em caso de problemas, use a funcionalidade de denúncia',
    ],
  },
  {
    id: 'meusveiculos',
    titulo: '🚙 Meus Veículos',
    icone: Car,
    descricao: 'Cadastre e gerencie os veículos da sua frota',
    passos: [
      'Visualize todos os veículos cadastrados',
      'Adicione um novo veículo clicando no botão "Adicionar novo veículo"',
      'Preencha os dados: placa, marca, modelo e tipo do veículo',
      'Informe os dados do proprietário (CPF ou CNPJ)',
      'Edite informações de veículos existentes',
      'Exclua veículos que não são mais utilizados',
    ],
    dicas: [
      'Mantenha seus veículos sempre atualizados',
      'Placa deve estar no formato correto',
      'Para reservas, você pode escolher qual veículo usar',
      'O CPF/CNPJ é necessário para comprovantes',
    ],
  },
  {
    id: 'denuncias',
    titulo: '⚠️ Minhas Denúncias',
    icone: AlertCircle,
    descricao:
      'Registre e acompanhe ocorrências relacionadas ao estacionamento',
    passos: [
      'Acesse sua reserva para fazer o check-in e, caso haja um problema, registre uma denúncia',
      'Preencha os detalhes: tipo, descrição e evidências',
      'Acompanhe o status da sua denúncia',
    ],
    dicas: [
      'Seja o mais específico possível na descrição',
      'Denúncias são tratadas com prioridade',
    ],
  },
  {
    id: 'perfil',
    titulo: '👤 Meu Perfil',
    icone: User,
    descricao: 'Gerencie suas informações pessoais e preferências',
    passos: [
      'Visualize seus dados cadastrais',
      'Edite informações pessoais quando necessário',
      'Gerencie métodos de contato',
    ],
    dicas: [
      'Mantenha seus dados sempre atualizados',
      'Ative notificações para não perder informações importantes',
      'Alterações são salvas automaticamente',
    ],
  },
  {
    id: 'notificacoes',
    titulo: '🔔 Central de Notificações',
    icone: Bell,
    descricao:
      'Receba alertas sobre reservas, denúncias e atualizações importantes',
    passos: [
      'Acesse a central pelo ícone de sino no topo da página',
      'Visualize todas as suas notificações em uma lista organizada',
      'Clique em uma notificação para ver detalhes',
      'Marque notificações como lidas individualmente ou em lote',
      'Exclua notificações que não são mais relevantes',
      'Receba alertas em tempo real sobre suas reservas',
    ],
    dicas: [
      'Notificações são recebidas em tempo real via WebSocket',
      'Reservas próximas ao fim geram alertas automáticos',
      'Denúncias atualizadas geram notificações',
      'Mantenha as notificações organizadas marcando como lidas',
    ],
  },
  {
    id: 'comprovantes',
    titulo: '📄 Comprovantes e Documentos',
    icone: FileText,
    descricao: 'Gere e acesse comprovantes das suas reservas',
    passos: [
      'Acesse o histórico de reservas',
      'Localize a reserva desejada',
      'Clique no botão "Gerar Comprovante"',
      'O comprovante será baixado em formato PDF',
      'Guarde o comprovante para sua referência',
    ],
    dicas: [
      'Sempre gere o comprovante ao finalizar uma reserva',
      'Os comprovantes contêm todas as informações da reserva',
      'Você pode gerar comprovantes de reservas passadas',
      'Use os comprovantes para comprovar sua estadia',
    ],
  },
];
