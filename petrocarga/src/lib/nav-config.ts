import {
  CarIcon,
  Archive,
  CalendarPlus,
  TriangleAlert,
  User,
  Info,
  BarChart,
  Calendar,
  CalendarClock,
  SquareParking,
  MapPlus,
  Car,
  IdCard,
  UserPlus,
  Bell,
  Clock,
} from 'lucide-react';

/**
 * ============================================================================
 * NAV CONFIG — fonte única de verdade para os links da navbar
 * ============================================================================
 * Cada NavLink carrega tudo que a navbar precisa pra se renderizar
 * (desktop dropdown + card mobile), e uma lista de `roles` que podem vê-lo.
 *
 * Pra adicionar um link novo: cria um objeto aqui, adiciona a role certa.
 * Pra restringir um link: tira a role da lista `roles`.
 * A navbar (Navbar.tsx) NUNCA precisa ser tocada pra isso.
 * ============================================================================
 */

export type NavLink = {
  key: string;
  href: string;
  label: string;
  description: string; // usado no card mobile
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  roles: string[]; // quais roles enxergam esse link
};

export type NavGroup = {
  key: string;
  title: string; // label do dropdown desktop / título da seção mobile
  standalone?: boolean; // true = vira link direto na navbar desktop (sem dropdown)
  links: NavLink[];
};

/**
 * Todas as roles existentes no sistema.
 */
export const ROLES = {
  MOTORISTA: 'MOTORISTA',
  EMPRESA: 'EMPRESA',
  AGENTE: 'AGENTE',
  GESTOR: 'GESTOR',
  ADMIN: 'ADMIN',
} as const;

export const navGroups: NavGroup[] = [
  // ==========================================
  // 1. INÍCIO / VISÃO GERAL
  // ==========================================
  {
    key: 'dashboard-group',
    title: 'Início',
    standalone: true, // Vira link direto no desktop e um card simples no mobile
    links: [
      {
        key: 'dashboard-motorista',
        href: '/motorista/dashboard',
        label: 'Painel Geral',
        description: 'Seu resumo e atividades',
        icon: BarChart,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.MOTORISTA],
      },
      {
        key: 'dashboard-empresa',
        href: '/empresa/dashboard',
        label: 'Painel Geral',
        description: 'Visão geral da empresa',
        icon: BarChart,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.EMPRESA],
      },
      {
        key: 'dashboard-agente',
        href: '/agente/dashboard',
        label: 'Painel de Operações',
        description: 'Resumo das atividades de campo',
        icon: BarChart,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.AGENTE],
      },
      {
        key: 'dashboard-gestor',
        href: '/gestor/dashboard',
        label: 'Relatório Gerencial',
        description: 'Métricas e análise do sistema',
        icon: Archive,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN],
      },
    ],
  },

  // ==========================================
  // 2. OPERAÇÃO DE VAGAS & RESERVAS
  // ==========================================
  {
    key: 'gestao-vagas-reservas',
    title: 'Vagas & Reservas',
    links: [
      // Ações do Motorista/Empresa
      {
        key: 'reservar-vaga',
        href: '/reservar-vaga',
        label: 'Reservar Vaga',
        description: 'Solicitar uma nova reserva',
        icon: CalendarPlus,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.MOTORISTA, ROLES.EMPRESA],
      },
      {
        key: 'minhas-reservas',
        href: '/minhas-reservas',
        label: 'Minhas Reservas',
        description: 'Histórico',
        icon: Archive,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-700',
        roles: [ROLES.MOTORISTA, ROLES.EMPRESA],
      },
      // Ações do Agente
      {
        key: 'reserva-rapida',
        href: '/agente/reserva-rapida',
        label: 'Reservar',
        description: 'Faça Reservas agora',
        icon: Clock,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.AGENTE],
      },
      {
        key: 'lista-reservas-agente',
        href: '/agente/lista-reserva',
        label: 'Suas Reservas',
        description: 'Reservas criadas por você',
        icon: Calendar,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.AGENTE],
      },
      // Ações do Gestor/Admin
      {
        key: 'visualizar-vagas',
        href: '/gestor/visualizar-vagas',
        label: 'Visualizar Vagas',
        description: 'Mapa e status das vagas',
        icon: SquareParking,
        iconBg: 'bg-amber-100',
        iconColor: 'text-amber-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN],
      },
      {
        key: 'adicionar-vaga',
        href: '/gestor/adicionar-vagas',
        label: 'Adicionar Vaga',
        description: 'Cadastrar novo espaço no sistema',
        icon: MapPlus,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN],
      },
      {
        key: 'disponibilidade',
        href: '/gestor/disponibilidade-vagas',
        label: 'Disponibilidade',
        description: 'Grade de horários das vagas',
        icon: Calendar,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN],
      },
      {
        key: 'reservas-geral',
        href: '/reservas',
        label: 'Painel de Reservas',
        description: 'Controle geral de agendamentos',
        icon: CalendarClock,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN, ROLES.AGENTE],
      },
    ],
  },

  // ==========================================
  // 3. FISCALIZAÇÃO & CADASTROS
  // ==========================================
  {
    key: 'cadastros-e-equipe',
    title: 'Cadastros & Consultas',
    links: [
      {
        key: 'consultar-reservas',
        href: '/consulta',
        label: 'Consultar Placa',
        description: 'Verificar situação de veículo',
        icon: Car,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN, ROLES.AGENTE],
      },
      {
        key: 'meus-veiculos',
        href: '/meus-veiculos',
        label: 'Meus Veículos',
        description: 'Gerenciar frota ou veículo pessoal',
        icon: CarIcon,
        iconBg: 'bg-green-100',
        iconColor: 'text-green-700',
        roles: [ROLES.MOTORISTA, ROLES.EMPRESA],
      },
      {
        key: 'consultar-motoristas',
        href: '/gestor/motoristas',
        label: 'Lista de Motoristas',
        description: 'Base de condutores cadastrados',
        icon: IdCard,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN],
      },
      {
        key: 'meus-motoristas-empresa',
        href: '/empresa/motoristas',
        label: 'Meus Motoristas',
        description: 'Gerenciar condutores',
        icon: IdCard,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.EMPRESA],
      },
      {
        key: 'consultar-agentes',
        href: '/gestor/agentes',
        label: 'Gerenciar Agentes',
        description: 'Lista e cadastro de fiscais',
        icon: User,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN],
      },
      {
        key: 'consultar-gestores',
        href: '/gestor/gestores',
        label: 'Gerenciar Gestores',
        description: 'Administradores do sistema',
        icon: User,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.ADMIN, ROLES.GESTOR], // Ajustado para englobar visualização
      },
    ],
  },

  // ==========================================
  // 4. COMUNICAÇÃO & OCORRÊNCIAS
  // ==========================================
  {
    key: 'comunicacao-alertas',
    title: 'Alertas & Avisos',
    links: [
      {
        key: 'enviar-notificacao',
        href: '/gestor/enviar-notificacoes',
        label: 'Enviar Notificação',
        description: 'Disparar avisos para os usuários',
        icon: Bell,
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN],
      },
      {
        key: 'denuncias-recebidas',
        href: '/denuncias',
        label: 'Denúncias Recebidas',
        description: 'Análise de infrações relatadas',
        icon: TriangleAlert,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-700',
        roles: [ROLES.GESTOR, ROLES.ADMIN, ROLES.AGENTE],
      },
      {
        key: 'minhas-denuncias',
        href: '/minhas-denuncias',
        label: 'Minhas Ocorrências',
        description: 'Histórico de infrações ou relatos',
        icon: TriangleAlert,
        iconBg: 'bg-red-100',
        iconColor: 'text-red-700',
        roles: [ROLES.MOTORISTA, ROLES.EMPRESA],
      },
    ],
  },

  // ==========================================
  // 5. CONTA E SUPORTE
  // ==========================================
  {
    key: 'suporte-perfil',
    title: 'Minha Conta',
    links: [
      {
        key: 'perfil',
        href: '/perfil',
        label: 'Meu Perfil',
        description: 'Alterar seus dados e senha',
        icon: User,
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-700',
        roles: [ROLES.MOTORISTA, ROLES.EMPRESA, ROLES.AGENTE, ROLES.GESTOR],
      },
      {
        key: 'tutorial-externo',
        href: '/tutorial',
        label: 'Tutorial',
        description: 'Tutoriais e guias de uso',
        icon: Info,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-700',
        roles: [ROLES.MOTORISTA, ROLES.EMPRESA],
      },
      {
        key: 'tutorial-agente',
        href: '/agente/tutorial',
        label: 'Tutorial',
        description: 'Instruções de fiscalização',
        icon: Info,
        iconBg: 'bg-indigo-100',
        iconColor: 'text-indigo-700',
        roles: [ROLES.AGENTE],
      },
    ],
  },
];

/**
 * Filtra os grupos/links de acordo com a role do usuário logado.
 * Grupos que ficam sem nenhum link visível são removidos inteiramente.
 */
export function getNavGroupsForRole(role?: string): NavGroup[] {
  if (!role) return [];

  return navGroups
    .map((group) => ({
      ...group,
      links: group.links.filter((link) => link.roles.includes(role)),
    }))
    .filter((group) => group.links.length > 0);
}
