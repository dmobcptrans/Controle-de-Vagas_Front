'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Info,
  Search,
  CalendarPlus,
  ClipboardList,
  Clock,
  AlertCircle,
  User,
  BookOpen,
  ChevronRight,
  Target,
  Bell,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react';

// Tipagem para as seções
type TutorialSection = {
  id: string;
  title: string;
  icon: React.ElementType;
  description: string;
  content?: string[];
  steps?: string[];
  tips?: string[];
};

// Seções do tutorial com IDs simplificados (sem hífen)
const TUTORIAL_SECTIONS: TutorialSection[] = [
  {
    id: 'visaogeral',
    title: '📋 Visão Geral do Sistema',
    icon: BookOpen,
    description: 'Entenda como o sistema funciona e quais recursos estão disponíveis',
    content: [
      'O sistema de gerenciamento de estacionamento foi desenvolvido para facilitar o trabalho dos agentes no controle de vagas, reservas e atendimento aos motoristas.',
      '',
      'Principais funcionalidades:',
      '• Consulta de reservas por placa',
      '• Realização de reservas rápidas',
      '• Visualização de histórico de reservas',
      '• Gerenciamento de denúncias',
      '• Acompanhamento de status em tempo real'
    ],
  },
  {
    id: 'relatorio',
    title: '📊 Relatório - Seu Painel de Controle',
    icon: Target,
    description: 'Acompanhe suas estatísticas e acesse as principais funções',
    steps: [
      'Cards de Estatísticas: Visualize total de reservas, reservas ativas e denúncias pendentes',
      'Reservar Vaga: Botão principal para iniciar uma nova reserva rápida',
      'Consultar Placa: Acesso rápido para verificar reservas de um veículo',
      'Últimas Reservas: Visualize as 3 reservas mais recentes',
      'Acesso Rápido: Links diretos para Histórico, Denúncias, Consulta e Perfil',
    ],
  },
  {
    id: 'consultaplaca',
    title: '🔍 Consultar Placa',
    icon: Search,
    description: 'Busque todas as reservas associadas a uma placa de veículo',
    steps: [
      'Digite a placa no campo de busca (formato AAA0000 ou AAA0A00)',
      'A placa é automaticamente formatada em maiúsculas',
      'Pressione Enter ou aguarde a busca automática',
      'Visualize o resumo com contagem por status',
      'Explore os cards individuais com detalhes de cada reserva',
      'Clique no card para ver informações completas da reserva',
    ],
    tips: [
      'A placa é convertida automaticamente para maiúsculas',
      'Caracteres especiais como hífen são removidos',
      'Busca funciona com placas Mercosul e padrão',
      'Resultados mostram reservas ativas e finalizadas',
    ],
  },
  {
    id: 'reservarapida',
    title: '🚗 Reserva Rápida',
    icon: CalendarPlus,
    description: 'Crie uma nova reserva de vaga em poucos passos',
    steps: [
      'Busque uma localização digitando rua, bairro ou ponto de referência',
      'Selecione uma vaga no mapa interativo',
      'Preencha os dados da reserva (veículo, período, etc.)',
      'Confirme os detalhes antes de finalizar',
      'A reserva aparecerá no Relatório e no Histórico',
    ],
    tips: [
      'Use o campo de busca para encontrar vagas rapidamente',
      'O mapa mostra vagas disponíveis em tempo real',
      'Você pode visualizar detalhes da vaga antes de selecionar',
      'Reservas podem ser canceladas a qualquer momento',
    ],
  },
  {
    id: 'historicoreservas',
    title: '📜 Histórico de Reservas',
    icon: ClipboardList,
    description: 'Gerencie e acompanhe todas as suas reservas',
    steps: [
      'Filtre por status: Todas, Reservada, Ativa, Concluída, Cancelada, Removida',
      'Busque por placa, logradouro ou bairro no campo de pesquisa',
      'Visualize cards com informações resumidas de cada reserva',
      'Clique no card para ver detalhes completos',
      'Pagine entre os resultados para navegar por todas as reservas',
    ],
    tips: [
      'Use filtros combinados para refinar sua busca',
      'Cards mostram status com cores diferentes para fácil identificação',
      'Reservas ativas têm destaque especial',
      'Você pode cancelar reservas ativas diretamente do card',
    ],
  },
  {
    id: 'denuncias',
    title: '⚠️ Gerenciamento de Denúncias',
    icon: AlertCircle,
    description: 'Acompanhe e responda às denúncias dos motoristas',
    steps: [
      'Visualize denúncias abertas na lista principal',
      'Leia os detalhes da ocorrência',
      'Analise as evidências anexadas pelo motorista',
      'Atualize o status da denúncia (Em análise, Resolvida, etc.)',
      'Adicione observações sobre a resolução',
    ],
    tips: [
      'Denúncias são priorizadas por data de abertura',
      'Sempre documente a resolução com observações claras',
      'O sistema notifica o motorista quando o status muda',
      'Mantenha um registro fotográfico quando necessário',
    ],
  },
  {
    id: 'perfil',
    title: '👤 Meu Perfil',
    icon: User,
    description: 'Gerencie suas informações pessoais e preferências',
    steps: [
      'Visualize seus dados cadastrais',
      'Edite informações quando necessário',
      'Altere sua senha por segurança',
      'Configure notificações para receber alertas importantes',
      'Gerencie preferências de exibição',
    ],
    tips: [
      'Mantenha seus dados sempre atualizados',
      'Use uma senha forte e única',
      'Ative notificações para não perder informações importantes',
      'Alterações são salvas automaticamente',
    ],
  },
  {
    id: 'notificacoes',
    title: '🔔 Sistema de Notificações',
    icon: Bell,
    description: 'Receba alertas sobre reservas, denúncias e atualizações',
    steps: [
      'Notificações aparecem no ícone de sino no topo da página',
      'Clique para expandir e ver todas as notificações',
      'Clique em uma notificação para ser direcionado ao item relacionado',
      'Marque como lidas para organizar seu painel',
    ],
    tips: [
      'Notificações em tempo real mantêm você informado',
      'Reservas próximas ao fim geram alertas automáticos',
      'Novas denúncias têm destaque especial',
      'Mantenha as notificações sempre em dia',
    ],
  },
];

// Componente interno que usa useSearchParams
function TutorialContent() {
  const searchParams = useSearchParams();
  const [activeSection, setActiveSection] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  // Função para rolar até a seção
  const scrollToSection = (sectionId: string, highlight: boolean = true) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });

      // Só define o hash se for diferente do atual
      const currentHash = window.location.hash.replace('#', '');
      if (currentHash !== sectionId) {
        window.location.hash = sectionId;
      }

      if (highlight) {
        element.classList.add('highlight-section');
        setTimeout(() => {
          element.classList.remove('highlight-section');
        }, 2000);
      }

      setMobileMenuOpen(false);
    }
  };

  // Verifica hash na URL ao carregar a página
  useEffect(() => {
    let hash = window.location.hash;
    if (hash) {
      // Remove hashes duplicados se existirem
      if (hash.includes('#') && hash.split('#').length > 2) {
        const cleanHash = hash.split('#').pop() || '';
        window.location.hash = cleanHash;
        hash = `#${cleanHash}`;
      }
      const sectionId = hash.replace('#', '');
      setTimeout(() => {
        scrollToSection(sectionId, true);
        setActiveSection(sectionId);
      }, 100);
    }
  }, []);

  // Observa mudanças no hash da URL
  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash;
      if (hash) {
        // Remove hashes duplicados quando o hash muda
        if (hash.includes('#') && hash.split('#').length > 2) {
          const cleanHash = hash.split('#').pop() || '';
          window.location.hash = cleanHash;
          hash = `#${cleanHash}`;
        }
        const sectionId = hash.replace('#', '');
        scrollToSection(sectionId, true);
        setActiveSection(sectionId);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Índice do Tutorial */}
        <aside className={`lg:w-72 flex-shrink-0 ${mobileMenuOpen ? 'block' : 'hidden lg:block'}`}>
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <h2 className="font-semibold text-gray-800 text-sm">Conteúdo do Tutorial</h2>
              </div>
            </div>
            <nav className="p-2 max-h-[calc(100vh-120px)] overflow-y-auto">
              {TUTORIAL_SECTIONS.map((section) => (
                <button
                  key={section.id}
                  onClick={() => {
                    scrollToSection(section.id, true);
                    setActiveSection(section.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all mb-1 group ${
                    activeSection === section.id
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-600'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <section.icon className={`h-4 w-4 flex-shrink-0 ${
                      activeSection === section.id ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      activeSection === section.id ? 'text-blue-700' : 'text-gray-700'
                    }`}>
                      {section.title}
                    </span>
                  </div>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <main className="flex-1 min-w-0">
          {/* Introdução */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6 border border-blue-100">
            <div className="flex items-start gap-4">
              <div className="bg-blue-600 rounded-xl p-3">
                <Info className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  Bem-vindo ao Guia do Agente!
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Este tutorial foi criado para ajudar você a aproveitar ao máximo todas as funcionalidades 
                  do sistema de gerenciamento de estacionamento. Clique em qualquer seção abaixo para aprender 
                  mais, ou utilize o menu lateral para navegar rapidamente.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 text-xs bg-white/80 rounded-full px-3 py-1 text-gray-600">
                    <Target className="h-3 w-3" /> {TUTORIAL_SECTIONS.length} seções
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-white/80 rounded-full px-3 py-1 text-gray-600">
                    <Clock className="h-3 w-3" /> Leitura de ~10 min
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seções do Tutorial */}
          {TUTORIAL_SECTIONS.map((section) => (
            <section
              key={section.id}
              id={section.id}
              className="scroll-mt-20 mb-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300"
            >
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleSection(section.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="bg-blue-50 rounded-xl p-2.5 flex-shrink-0">
                      <section.icon className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-800 mb-1">
                        {section.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {section.description}
                      </p>
                    </div>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                    expandedSections[section.id] ? 'rotate-180' : ''
                  }`} />
                </div>
              </div>

              <div className={`border-t border-gray-100 transition-all duration-300 ${
                expandedSections[section.id] ? 'block' : 'hidden'
              }`}>
                <div className="p-5 space-y-4">
                  {/* Conteúdo textual da seção */}
                  {section.content && (
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {section.content.map((line, idx) => (
                        <p key={idx} className={line.startsWith('•') ? 'ml-4' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Steps da seção */}
                  {section.steps && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                        Passo a Passo
                      </h4>
                      <ul className="space-y-2">
                        {section.steps.map((step, idx) => (
                          <li key={idx} className="text-sm text-gray-600 flex items-start gap-2">
                            <span className="text-blue-600 font-medium mt-0.5">{idx + 1}.</span>
                            <span className="leading-relaxed">{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Dicas da seção */}
                  {section.tips && (
                    <div className="bg-blue-50 rounded-lg p-4">
                      <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        💡 Dicas
                      </h4>
                      <ul className="space-y-1">
                        {section.tips.map((tip, idx) => (
                          <li key={idx} className="text-xs text-blue-700 flex items-start gap-2">
                            <span>•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            </section>
          ))}

          {/* Call to Action Final */}
          <div className="bg-gradient-to-r from-blue-800 to-blue-900 rounded-2xl p-6 text-center">
            <h3 className="text-white font-bold text-lg mb-2">
              Pronto para começar?
            </h3>
            <p className="text-blue-100 text-sm mb-4">
              Agora que você conhece todas as funcionalidades, explore o sistema e faça suas primeiras reservas!
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href="/agente/dashboard"
                className="inline-flex items-center gap-2 bg-white text-blue-800 px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-50 transition-colors"
              >
                Ir para o Relatório
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href="/agente/reserva-rapida"
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
              >
                <CalendarPlus className="h-4 w-4" />
                Fazer uma reserva
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Estilos para o destaque da seção */}
      <style jsx global>{`
        .highlight-section {
          animation: highlight-pulse 0.5s ease-in-out 3;
          box-shadow: 0 0 0 3px rgba(19, 81, 180, 0.3);
          border-radius: 12px;
        }

        @keyframes highlight-pulse {
          0% {
            box-shadow: 0 0 0 0 rgba(19, 81, 180, 0.4);
          }
          70% {
            box-shadow: 0 0 0 6px rgba(19, 81, 180, 0);
          }
          100% {
            box-shadow: 0 0 0 0 rgba(19, 81, 180, 0);
          }
        }

        .scroll-mt-20 {
          scroll-margin-top: 80px;
        }
      `}</style>
    </div>
  );
}

// Componente principal com Suspense
export default function TutorialPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
                Guia do Agente
              </h1>
              <p className="text-xs text-white/50">
                Aprenda a usar todas as funcionalidades do sistema
              </p>
            </div>
            {/* Botão menu mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <Suspense fallback={
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">Carregando tutorial...</p>
          </div>
        </div>
      }>
        <TutorialContent />
      </Suspense>
    </div>
  );
}