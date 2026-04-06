'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import {
  Info,
  BookOpen,
  ChevronRight,
  Target,
  Clock,
  ChevronDown,
} from 'lucide-react';
import { PropsTutorial } from '@/lib/types/tutorial';

// Configurações de cores por persona
const coresPadrao = {
  corHeader: 'bg-blue-800',
  corAtivoSidebar: 'bg-blue-50',
  bordaAtivoSidebar: 'border-blue-600',
  textoAtivoSidebar: 'text-blue-700',
  corFundoIcone: 'bg-blue-50',
  corIcone: 'text-blue-600',
  gradienteDe: 'from-blue-50',
  gradienteAte: 'to-indigo-50',
  corBorda: 'border-blue-100',
  botaoPrimario: 'bg-blue-600 hover:bg-blue-700',
  botaoSecundario: 'bg-white text-blue-800',
  hoverBotaoSecundario: 'hover:bg-blue-50',
};

// Componente interno que usa useSearchParams
function ConteudoTutorial({
  secoes,
  tituloBoasVindas,
  descricaoBoasVindas,
  tituloCTA,
  descricaoCTA,
  linkBotaoPrimario,
  textoBotaoPrimario,
  iconeBotaoPrimario: IconeBotaoPrimario,
  linkBotaoSecundario,
  textoBotaoSecundario,
  iconeBotaoSecundario: IconeBotaoSecundario,
}: PropsTutorial) {
  const [secaoAtiva, setSecaoAtiva] = useState<string | null>(null);
  const [menuMobileAberto, setMenuMobileAberto] = useState(false);
  const [secoesExpandidas, setSecoesExpandidas] = useState<
    Record<string, boolean>
  >({});

  const cores = coresPadrao;

  // Função para rolar até a seção
  const rolarAteSecao = (idSecao: string, destacar: boolean = true) => {
    const elemento = document.getElementById(idSecao);
    if (elemento) {
      const offset = 80;
      const posicaoElemento = elemento.getBoundingClientRect().top;
      const posicaoComOffset = posicaoElemento + window.pageYOffset - offset;

      window.scrollTo({
        top: posicaoComOffset,
        behavior: 'smooth',
      });

      const hashAtual = window.location.hash.replace('#', '');
      if (hashAtual !== idSecao) {
        window.location.hash = idSecao;
      }

      if (destacar) {
        elemento.classList.add('secao-destacada');
        setTimeout(() => {
          elemento.classList.remove('secao-destacada');
        }, 2000);
      }

      setMenuMobileAberto(false);
    }
  };

  // Verifica hash na URL ao carregar a página
  useEffect(() => {
    let hash = window.location.hash;
    if (hash) {
      if (hash.includes('#') && hash.split('#').length > 2) {
        const hashLimpo = hash.split('#').pop() || '';
        window.location.hash = hashLimpo;
        hash = `#${hashLimpo}`;
      }
      const idSecao = hash.replace('#', '');
      setTimeout(() => {
        rolarAteSecao(idSecao, true);
        setSecaoAtiva(idSecao);
      }, 100);
    }
  }, []);

  // Observa mudanças no hash da URL
  useEffect(() => {
    const handleHashChange = () => {
      let hash = window.location.hash;
      if (hash) {
        if (hash.includes('#') && hash.split('#').length > 2) {
          const hashLimpo = hash.split('#').pop() || '';
          window.location.hash = hashLimpo;
          hash = `#${hashLimpo}`;
        }
        const idSecao = hash.replace('#', '');
        rolarAteSecao(idSecao, true);
        setSecaoAtiva(idSecao);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const alternarSecao = (idSecao: string) => {
    setSecoesExpandidas((prev) => ({
      ...prev,
      [idSecao]: !prev[idSecao],
    }));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-6">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar - Índice do Tutorial */}
        <aside
          className={`lg:w-72 flex-shrink-0 ${menuMobileAberto ? 'block' : 'hidden lg:block'}`}
        >
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm sticky top-24 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gray-50">
              <div className="flex items-center gap-2">
                <BookOpen className={`h-4 w-4 ${cores.corIcone}`} />
                <h2 className="font-semibold text-gray-800 text-sm">
                  Conteúdo do Tutorial
                </h2>
              </div>
            </div>
            <nav className="p-2 max-h-[calc(100vh-120px)] overflow-y-auto">
              {secoes.map((secao) => (
                <button
                  key={secao.id}
                  onClick={() => {
                    rolarAteSecao(secao.id, true);
                    setSecaoAtiva(secao.id);
                  }}
                  className={`w-full text-left px-3 py-2.5 rounded-lg transition-all mb-1 group ${
                    secaoAtiva === secao.id
                      ? `${cores.corAtivoSidebar} ${cores.textoAtivoSidebar} border-l-4 ${cores.bordaAtivoSidebar}`
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <secao.icone
                      className={`h-4 w-4 flex-shrink-0 ${
                        secaoAtiva === secao.id
                          ? cores.corIcone
                          : 'text-gray-400'
                      }`}
                    />
                    <span
                      className={`text-sm font-medium ${
                        secaoAtiva === secao.id
                          ? cores.textoAtivoSidebar
                          : 'text-gray-700'
                      }`}
                    >
                      {secao.titulo}
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
          <div
            className={`bg-gradient-to-r ${cores.gradienteDe} ${cores.gradienteAte} rounded-2xl p-6 mb-6 border ${cores.corBorda}`}
          >
            <div className="flex items-start gap-4">
              <div className={`${cores.botaoPrimario} rounded-xl p-3`}>
                <Info className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-800 mb-2">
                  {tituloBoasVindas}
                </h2>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {descricaoBoasVindas}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="inline-flex items-center gap-1 text-xs bg-white/80 rounded-full px-3 py-1 text-gray-600">
                    <Target className="h-3 w-3" /> {secoes.length} seções
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs bg-white/80 rounded-full px-3 py-1 text-gray-600">
                    <Clock className="h-3 w-3" /> Leitura de ~10 min
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Seções do Tutorial */}
          {secoes.map((secao) => (
            <section
              key={secao.id}
              id={secao.id}
              className="scroll-mt-20 mb-8 bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden transition-all duration-300"
            >
              <div
                className="p-5 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => alternarSecao(secao.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={`${cores.corFundoIcone} rounded-xl p-2.5 flex-shrink-0`}
                    >
                      <secao.icone className={`h-5 w-5 ${cores.corIcone}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-base font-bold text-gray-800 mb-1">
                        {secao.titulo}
                      </h3>
                      <p className="text-sm text-gray-500">{secao.descricao}</p>
                    </div>
                  </div>
                  <ChevronDown
                    className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${
                      secoesExpandidas[secao.id] ? 'rotate-180' : ''
                    }`}
                  />
                </div>
              </div>

              <div
                className={`border-t border-gray-100 transition-all duration-300 ${
                  secoesExpandidas[secao.id] ? 'block' : 'hidden'
                }`}
              >
                <div className="p-5 space-y-4">
                  {/* Conteúdo textual da seção */}
                  {secao.conteudo && (
                    <div className="text-sm text-gray-700 leading-relaxed">
                      {secao.conteudo.map((linha, idx) => (
                        <p
                          key={idx}
                          className={linha.startsWith('•') ? 'ml-4' : ''}
                        >
                          {linha}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Passos da seção */}
                  {secao.passos && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <ChevronRight className={`h-4 w-4 ${cores.corIcone}`} />
                        Passo a Passo
                      </h4>
                      <ul className="space-y-2">
                        {secao.passos.map((passo, idx) => (
                          <li
                            key={idx}
                            className="text-sm text-gray-600 flex items-start gap-2"
                          >
                            <span
                              className={`${cores.corIcone} font-medium mt-0.5`}
                            >
                              {idx + 1}.
                            </span>
                            <span className="leading-relaxed">{passo}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Dicas da seção */}
                  {secao.dicas && (
                    <div className={`${cores.corFundoIcone} rounded-lg p-4`}>
                      <h4
                        className={`text-sm font-semibold ${cores.corIcone} mb-2 flex items-center gap-2`}
                      >
                        <Info className="h-4 w-4" />
                        💡 Dicas
                      </h4>
                      <ul className="space-y-1">
                        {secao.dicas.map((dica, idx) => (
                          <li
                            key={idx}
                            className={`text-xs ${cores.corIcone} flex items-start gap-2`}
                          >
                            <span>•</span>
                            <span>{dica}</span>
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
          <div
            className={`bg-gradient-to-r from-gray-800 to-gray-900 rounded-2xl p-6 text-center`}
          >
            <h3 className="text-white font-bold text-lg mb-2">{tituloCTA}</h3>
            <p className="text-gray-300 text-sm mb-4">{descricaoCTA}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                href={linkBotaoSecundario}
                className={`inline-flex items-center gap-2 ${cores.botaoSecundario} px-4 py-2 rounded-lg font-medium text-sm ${cores.hoverBotaoSecundario} transition-colors`}
              >
                {IconeBotaoSecundario && (
                  <IconeBotaoSecundario className="h-4 w-4" />
                )}
                {textoBotaoSecundario}
                <ChevronRight className="h-4 w-4" />
              </Link>
              <Link
                href={linkBotaoPrimario}
                className={`inline-flex items-center gap-2 ${cores.botaoPrimario} text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors`}
              >
                {IconeBotaoPrimario && (
                  <IconeBotaoPrimario className="h-4 w-4" />
                )}
                {textoBotaoPrimario}
              </Link>
            </div>
          </div>
        </main>
      </div>

      {/* Estilos para o destaque da seção */}
      <style jsx global>{`
        .secao-destacada {
          animation: destaque-pulso 0.5s ease-in-out 3;
          box-shadow: 0 0 0 3px rgba(19, 81, 180, 0.3);
          border-radius: 12px;
        }

        @keyframes destaque-pulso {
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

// Componente principal do Tutorial
export function Tutorial(props: PropsTutorial) {
  const cores = coresPadrao;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* Header */}
      <header
        className={`${cores.corHeader} px-4 pt-1 pb-7 sm:px-8 sticky top-0 z-40`}
      >
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
                {props.tituloHeader}
              </h1>
              <p className="text-xs text-white/50">{props.subtituloHeader}</p>
            </div>
          </div>
        </div>
      </header>

      <Suspense
        fallback={
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">Carregando tutorial...</p>
            </div>
          </div>
        }
      >
        <ConteudoTutorial {...props} />
      </Suspense>
    </div>
  );
}
