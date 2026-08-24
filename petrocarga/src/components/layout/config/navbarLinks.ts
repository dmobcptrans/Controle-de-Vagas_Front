export const NAVBAR_LINKS = {
  GESTOR: [
    { href: '/gestor/relatorio', label: 'Relatório' },
    { href: '/gestor/visualizar-vagas', label: 'Visualizar Vagas' },
    { href: '/gestor/registrar-vagas', label: 'Registrar Vagas' },
    { href: '/gestor/guia', label: 'Guia' },
  ],

  MOTORISTA: [
    { href: '/reservar-vaga', label: 'Reservar Vaga' },
    { href: '/historico', label: 'Histórico' },
  ],

  AGENTE: [
    { href: '/agente/home', label: 'Home' },
    { href: '/agente/ver-vagas', label: 'Vagas Registradas' },
  ],

  ADMIN: [
    { href: '/admin/usuarios', label: 'Gerenciar Usuários' },
    { href: '/admin/config', label: 'Configurações' },
  ],
  EMPRESA: [
    { href: '/empresa/home', label: 'Home' },
    { href: '/empresa/relatorio', label: 'Relatório' },
  ],
} as const;
