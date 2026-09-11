import {
  Archive,
  TriangleAlert,
  Truck,
  User as UserIcon,
} from 'lucide-react';

export const motoristaActions = [
  {
    href: '/minhas-reservas',
    icon: Archive,
    label: 'Histórico',
    desc: 'Todas as reservas',
    iconClass: 'bg-amber-50 text-amber-700',
  },
  {
    href: '/minhas-denuncias',
    icon: TriangleAlert,
    label: 'Denúncias',
    desc: 'Ocorrências',
    iconClass: 'bg-red-50 text-red-700',
  },
  {
    href: '/meus-veiculos',
    icon: Truck,
    label: 'Meu veículo',
    desc: 'Ver cadastro',
    iconClass: 'bg-green-50 text-green-700',
  },
  {
    href: '/perfil',
    icon: UserIcon,
    label: 'Meu perfil',
    desc: 'Dados pessoais',
    iconClass: 'bg-violet-50 text-violet-700',
  },
];

export const empresaActions = [
  {
    href: '/minhas-reservas',
    icon: Archive,
    label: 'Histórico',
    desc: 'Todas as reservas',
    iconClass: 'bg-amber-50 text-amber-700',
  },
  {
    href: '/minhas-denuncias',
    icon: TriangleAlert,
    label: 'Denúncias',
    desc: 'Ocorrências',
    iconClass: 'bg-red-50 text-red-700',
  },
  {
    href: '/meus-veiculos',
    icon: Truck,
    label: 'Meu veículo',
    desc: 'Ver cadastro',
    iconClass: 'bg-green-50 text-green-700',
  },
  {
    href: '/perfil',
    icon: UserIcon,
    label: 'Meu perfil',
    desc: 'Dados pessoais',
    iconClass: 'bg-violet-50 text-violet-700',
  },
];

export const gestorActions = [
  {
    href: '/minhas-reservas',
    icon: Archive,
    label: 'Histórico',
    desc: 'Todas as reservas',
    iconClass: 'bg-amber-50 text-amber-700',
  },
  {
    href: '/minhas-denuncias',
    icon: TriangleAlert,
    label: 'Denúncias',
    desc: 'Ocorrências',
    iconClass: 'bg-red-50 text-red-700',
  },
  {
    href: '/meus-veiculos',
    icon: Truck,
    label: 'Meu veículo',
    desc: 'Ver cadastro',
    iconClass: 'bg-green-50 text-green-700',
  },
  {
    href: '/perfil',
    icon: UserIcon,
    label: 'Meu perfil',
    desc: 'Dados pessoais',
    iconClass: 'bg-violet-50 text-violet-700',
  },
];

export const agenteActions = [
  {
    href: '/agente/lista-reserva',
    icon: Archive,
    label: 'Histórico',
    desc: 'Todas as reservas',
    iconClass: 'bg-amber-50 text-amber-700',
  },
  {
    href: '/denuncias',
    icon: TriangleAlert,
    label: 'Denúncias',
    desc: 'Ocorrências',
    iconClass: 'bg-red-50 text-red-700',
  },
  {
    href: '/consulta',
    icon: Truck,
    label: 'Consultar placa',
    desc: 'Veículos e infrações',
    iconClass: 'bg-green-50 text-green-700',
  },
  {
    href: '/perfil',
    icon: UserIcon,
    label: 'Meu perfil',
    desc: 'Dados pessoais',
    iconClass: 'bg-violet-50 text-violet-700',
  },
];

export const acessoRapidoActions = {
  MOTORISTA: motoristaActions,
  EMPRESA: empresaActions,
  GESTOR: gestorActions,
  AGENTE: agenteActions,
};