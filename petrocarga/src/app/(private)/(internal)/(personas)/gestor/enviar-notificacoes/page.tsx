'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
// Importamos a tipagem correta da API
import { getMotoristas } from '@/services/api/motoristaApi';
import {
  enviarNotificacaoParaUsuario,
  enviarNotificacaoPorPermissao,
} from '@/services/api/notificacaoApi';
import {
  Loader2,
  Send,
  Users,
  Bell,
  Menu,
  Filter,
  Check,
  X,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Motorista } from '@/lib/types/personas/motorista';
import { Header } from '@/components/ui/Header/Header';

// --------------------------------------------------------------------------
// COMPONENTE DE PAGINAÇÃO
// --------------------------------------------------------------------------
function PaginationControls({
  currentPage,
  totalPages,
  totalElements,
  currentPageSize,
  onPageChange,
  isLoading,
}: {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  currentPageSize: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}) {
  const startItem = currentPage * currentPageSize + 1;
  const endItem = Math.min((currentPage + 1) * currentPageSize, totalElements);

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages =
      typeof window !== 'undefined' && window.innerWidth < 640 ? 3 : 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 2) {
        for (let i = 0; i < 3; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      } else if (currentPage >= totalPages - 3) {
        pages.push(0);
        pages.push('...');
        for (let i = totalPages - 3; i < totalPages; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push('...');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(totalPages - 1);
      }
    }
    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex flex-col items-center gap-3 mt-4 px-2 pb-2">
      <div className="text-xs sm:text-sm text-gray-600 text-center">
        Mostrando {startItem} - {endItem} de {totalElements} motoristas
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1 sm:gap-2">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 0 || isLoading}
          className="p-1 sm:px-2 sm:py-1 flex items-center text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {getPageNumbers().map((page, index) => (
          <button
            key={index}
            onClick={() =>
              typeof page === 'number' ? onPageChange(page) : null
            }
            disabled={page === '...' || isLoading}
            className={`min-w-[32px] px-2 py-1 text-sm border rounded-md transition-colors ${
              page === currentPage
                ? 'bg-blue-600 border-blue-600 text-white'
                : page === '...'
                  ? 'border-transparent text-gray-400 cursor-default'
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page !== '...' ? Number(page) + 1 : page}
          </button>
        ))}

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages - 1 || isLoading}
          className="p-1 sm:px-2 sm:py-1 flex items-center text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function EnviarNotificacoesPage() {
  // --------------------------------------------------------------------------
  // HOOKS E ESTADOS (Agora utilizando MotoristaEmpresa[])
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [conteudoAberto, setConteudoAberto] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [modoEnvio, setModoEnvio] = useState<'INDIVIDUAL' | 'GRUPO'>(
    'INDIVIDUAL',
  );
  const [busca, setBusca] = useState('');
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState<
    'RESERVA' | 'VAGA' | 'VEICULO' | 'MOTORISTA' | 'SISTEMA'
  >('SISTEMA');
  const [motoristasSelecionados, setMotoristasSelecionados] = useState<
    string[]
  >([]);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{
    sucesso: boolean;
    enviadas: number;
    erros: number;
  } | null>(null);

  // --------------------------------------------------------------------------
  // EFEITO INICIAL (CARREGAR MOTORISTAS)
  // --------------------------------------------------------------------------

  const fetchMotoristas = async (page = 0) => {
    console.log('Buscando página', page);
    setLoading(true);

    try {
      const response = await getMotoristas({
        ativo: true,
        pagina: page,
      });

      if (!response.error) {
        setMotoristas(response.motoristas.content);
        setCurrentPage(response.motoristas.pagina);
        setTotalPages(response.motoristas.totalPaginas);
        setTotalElements(response.motoristas.totalElementos);
        setPageSize(response.motoristas.tamanhoPagina);
      }
    } catch {
      toast.error(
        'Erro ao carregar motoristas. Por favor, tente novamente mais tarde.',
      );
      setMotoristas([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    fetchMotoristas(0);
  }, [user?.id]);

  const handlePageChange = (page: number) => {
    console.log('Mudando para página', page);

    if (page !== currentPage && page >= 0 && page < totalPages) {
      fetchMotoristas(page);
    }
  };

  // --------------------------------------------------------------------------
  // FILTRO DE MOTORISTAS (Acesso direto a .nome e .email)
  // --------------------------------------------------------------------------

  const motoristasFiltrados = useMemo(() => {
    if (!busca.trim()) return motoristas;

    const termoBusca = busca.toLowerCase().trim();
    return motoristas.filter(
      (motorista) =>
        motorista.usuario.nome.toLowerCase().includes(termoBusca) ||
        motorista.usuario.email.toLowerCase().includes(termoBusca),
    );
  }, [motoristas, busca]);

  // --------------------------------------------------------------------------
  // FUNÇÕES DE SELEÇÃO
  // --------------------------------------------------------------------------

  const toggleMotorista = (id: string) => {
    setMotoristasSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id],
    );
  };

  const deselecionarTodos = () => setMotoristasSelecionados([]);

  const selecionarTodosFiltrados = () => {
    setMotoristasSelecionados(motoristasFiltrados.map((m) => m.id));
  };

  // --------------------------------------------------------------------------
  // HANDLERS DE ENVIO
  // --------------------------------------------------------------------------

  const handleEnvioIndividual = async () => {
    if (
      !titulo.trim() ||
      !mensagem.trim() ||
      motoristasSelecionados.length === 0
    ) {
      toast.error(
        'Preencha título, mensagem e selecione pelo menos um motorista',
      );
      return;
    }

    setEnviando(true);
    setResultado(null);

    try {
      const resultados = await Promise.all(
        motoristasSelecionados.map(async (usuarioId) => {
          const formData = new FormData();
          formData.append('usuarioId', usuarioId);
          formData.append('titulo', titulo);
          formData.append('mensagem', mensagem);
          formData.append('tipo', tipo);
          return await enviarNotificacaoParaUsuario(formData);
        }),
      );

      const enviadas = resultados.filter((r) => !r.error).length;
      const erros = resultados.filter((r) => r.error).length;

      setResultado({
        sucesso: true,
        enviadas: enviadas,
        erros: erros,
      });

      if (erros === 0) {
        setTitulo('');
        setMensagem('');
        setMotoristasSelecionados([]);
        setBusca('');
        toast.success(`${enviadas} notificação(ões) enviada(s) com sucesso!`);
      } else {
        toast.error(`${erros} erro(s) ao enviar notificações.`);
      }
    } catch {
      toast.error('Erro ao enviar notificações');
      setResultado({
        sucesso: false,
        enviadas: 0,
        erros: motoristasSelecionados.length,
      });
    } finally {
      setEnviando(false);
    }
  };

  const handleEnvioGrupo = async () => {
    if (!titulo.trim() || !mensagem.trim()) {
      toast.error('Preencha título e mensagem');
      return;
    }

    setEnviando(true);
    setResultado(null);

    try {
      const formData = new FormData();
      formData.append('permissao', 'MOTORISTA');
      formData.append('titulo', titulo);
      formData.append('mensagem', mensagem);
      formData.append('tipo', tipo);

      const result = await enviarNotificacaoPorPermissao(formData);

      if (result.error) {
        setResultado({ sucesso: false, enviadas: 0, erros: 1 });
        toast.error(
          result.message || 'Erro ao enviar notificação para o grupo',
        );
      } else {
        setResultado({ sucesso: true, enviadas: totalElements, erros: 0 });
        setTitulo('');
        setMensagem('');
        toast.success('Notificação enviada para todos os motoristas!');
      }
    } catch {
      setResultado({ sucesso: false, enviadas: 0, erros: 1 });
      toast.error('Erro ao enviar notificação para o grupo');
    } finally {
      setEnviando(false);
    }
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <Header
        title="Enviar Notificações aos Motoristas"
        subtitle="Envie notificações para motoristas individualmente ou para todos de uma vez"
      />
      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* CTA: conteúdo da notificação */}
        <div className="-mt-4 mb-5 max-w-4xl mx-auto">
          <div
            className="bg-[#071D41] rounded-2xl border-l-4 border-[#FFCD07] overflow-hidden"
            style={{ boxShadow: '0 4px 16px rgba(7,29,65,0.18)' }}
          >
            {/* Barra principal */}
            <div className="px-5 py-4">
              <div className="flex items-center gap-3">
                {/* Preview do título */}
                <div className="relative flex-1">
                  <div className="flex items-center gap-2 rounded-xl px-3 py-2.5 transition-all">
                    <Bell
                      className="h-4 w-4"
                      style={{ color: 'rgba(255,255,255,.45)' }}
                    />
                    <span className="font-semibold text-[15px] mb-0.5 text-white">
                      Clique para criar uma mensagem
                    </span>
                  </div>
                </div>

                {/* Botão abrir/fechar */}
                <button
                  onClick={() => setConteudoAberto(!conteudoAberto)}
                  className="relative cursor-pointer h-11 w-11 rounded-xl flex items-center justify-center transition-all duration-300"
                  style={{
                    background: conteudoAberto
                      ? 'rgba(255,205,7,.18)'
                      : 'rgba(255,255,255,.10)',
                    border: conteudoAberto
                      ? '1.5px solid rgba(255,205,7,.5)'
                      : '1.5px solid rgba(255,255,255,.12)',
                  }}
                >
                  <Plus
                    className={`h-5 w-5 text-white transition-transform duration-300 ${
                      conteudoAberto ? 'rotate-90' : ''
                    }`}
                  />

                  {(titulo || mensagem) && (
                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-[#FFCD07]" />
                  )}
                </button>
              </div>
            </div>

            {/* Drawer interno */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden ${
                conteudoAberto
                  ? 'max-h-[700px] opacity-100'
                  : 'max-h-0 opacity-0'
              }`}
            >
              <div className="border-t border-white/10 px-5 py-5 space-y-5">
                {/* Título */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-white/50 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex: Nova reserva disponível"
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition-all bg-white/10 border border-white/[.12] focus:bg-white/15 focus:border-[#FFCD07]/60"
                  />
                </div>

                {/* Mensagem */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-white/50 mb-2">
                    Mensagem *
                  </label>
                  <textarea
                    value={mensagem}
                    onChange={(e) => setMensagem(e.target.value)}
                    rows={4}
                    placeholder="Digite sua mensagem aqui..."
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white placeholder:text-white/35 outline-none transition-all resize-none bg-white/10 border border-white/[.12] focus:bg-white/15 focus:border-[#FFCD07]/60"
                  />
                </div>

                {/* Tipo de notificação */}
                <div>
                  <label className="block text-xs uppercase tracking-wide text-white/50 mb-2">
                    Tipo de Notificação
                  </label>
                  <select
                    value={tipo}
                    onChange={(e) =>
                      setTipo(
                        e.target.value as
                          | 'RESERVA'
                          | 'VAGA'
                          | 'VEICULO'
                          | 'MOTORISTA'
                          | 'SISTEMA',
                      )
                    }
                    className="w-full rounded-xl px-3 py-2.5 text-sm text-white outline-none transition-all bg-white/10 border border-white/[.12] focus:bg-white/15 focus:border-[#FFCD07]/60"
                  >
                    <option className="bg-[#071D41]" value="SISTEMA">
                      Sistema
                    </option>
                    <option className="bg-[#071D41]" value="RESERVA">
                      Reserva
                    </option>
                    <option className="bg-[#071D41]" value="VAGA">
                      Vaga
                    </option>
                    <option className="bg-[#071D41]" value="VEICULO">
                      Veículo
                    </option>
                    <option className="bg-[#071D41]" value="MOTORISTA">
                      Motorista
                    </option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          {/* Card de seleção de destinatários */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Destinatários (Motoristas)
            </h2>

            <div className="space-y-4 mb-6">
              {/* Escolha do modo de envio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolha o modo de envio:
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Botão modo INDIVIDUAL */}
                  <button
                    onClick={() => setModoEnvio('INDIVIDUAL')}
                    className={`p-3 border rounded-lg transition-colors flex flex-col items-center justify-center gap-2 ${
                      modoEnvio === 'INDIVIDUAL'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Enviar Individualmente
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      Escolha motoristas específicos
                    </span>
                  </button>

                  {/* Botão modo GRUPO */}
                  <button
                    onClick={() => setModoEnvio('GRUPO')}
                    className={`p-3 border rounded-lg transition-colors flex flex-col items-center justify-center gap-2 ${
                      modoEnvio === 'GRUPO'
                        ? 'bg-green-50 border-green-300 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Users className="h-5 w-5" />
                    <span className="text-sm font-medium">
                      Enviar para Todos
                    </span>
                    <span className="text-xs text-gray-500 text-center">
                      Todos os motoristas ({totalElements})
                    </span>
                  </button>
                </div>
              </div>

              {/* MODO INDIVIDUAL - Busca e lista de motoristas */}
              {modoEnvio === 'INDIVIDUAL' && (
                <div className="space-y-4">
                  {/* Campo de busca */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={busca}
                      onChange={(e) => setBusca(e.target.value)}
                      placeholder="Buscar motorista na página atual..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {busca && (
                      <button
                        onClick={() => setBusca('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      </button>
                    )}
                  </div>

                  {/* Controles de seleção */}
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <span className="text-sm text-gray-600">
                        {motoristasFiltrados.length} motorista(s) listados
                        {busca && ` para "${busca}"`}
                      </span>
                      {busca && motoristasFiltrados.length === 0 && (
                        <p className="text-xs text-red-600">
                          Nenhum motorista encontrado na página atual
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={selecionarTodosFiltrados}
                        disabled={motoristasFiltrados.length === 0}
                        className="text-sm px-3 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Selecionar todos da página
                      </button>
                      <button
                        type="button"
                        onClick={deselecionarTodos}
                        className="text-sm px-3 py-1 bg-gray-50 text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        Limpar seleção
                      </button>
                    </div>
                  </div>

                  {/* Lista de motoristas */}
                  <div className="border border-gray-200 rounded-lg flex flex-col">
                    {loading ? (
                      <div className="flex justify-center items-center py-10">
                        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
                      </div>
                    ) : (
                      <>
                        <div className="overflow-hidden max-h-60 overflow-y-auto">
                          {motoristasFiltrados.map((motorista) => (
                            <div
                              key={motorista.id}
                              className={`px-4 py-3 border-b border-gray-100 flex items-center gap-3 hover:bg-gray-50 cursor-pointer ${
                                motoristasSelecionados.includes(motorista.id)
                                  ? 'bg-blue-50'
                                  : ''
                              }`}
                              onClick={() => toggleMotorista(motorista.id)}
                            >
                              <div
                                className={`w-5 h-5 rounded border flex items-center justify-center flex-shrink-0 ${
                                  motoristasSelecionados.includes(motorista.id)
                                    ? 'bg-blue-500 border-blue-500'
                                    : 'border-gray-300'
                                }`}
                              >
                                {motoristasSelecionados.includes(
                                  motorista.id,
                                ) && <Check className="w-3 h-3 text-white" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 truncate">
                                  {motorista.usuario.nome}
                                </div>
                                <div className="text-sm text-gray-500 flex items-center gap-2">
                                  <span className="truncate">
                                    {motorista.usuario.email}
                                  </span>
                                  <span className="px-2 py-0.5 text-xs bg-blue-100 text-blue-800 rounded-full">
                                    MOTORISTA
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Paginação */}
                        {totalPages > 1 && (
                          <div className="border-t border-gray-200 bg-gray-50/50">
                            <PaginationControls
                              currentPage={currentPage}
                              totalPages={totalPages}
                              totalElements={totalElements}
                              currentPageSize={pageSize}
                              onPageChange={handlePageChange}
                              isLoading={loading}
                            />
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {/* Resumo da seleção */}
                  {motoristasSelecionados.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-blue-700">
                            Motoristas selecionados:
                          </span>
                          <span className="text-sm text-blue-600 ml-2">
                            {motoristasSelecionados.length} no total
                          </span>
                        </div>
                        <span className="font-bold text-blue-700">
                          {motoristasSelecionados.length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dica */}
                  {totalElements > pageSize && (
                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                      💡 <strong>Dica:</strong> Suas seleções serão mantidas
                      mesmo navegando pelas páginas.
                    </div>
                  )}
                </div>
              )}

              {/* MODO GRUPO */}
              {modoEnvio === 'GRUPO' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Users className="h-6 w-6 text-green-600" />
                    <div>
                      <h4 className="font-medium text-green-800">
                        Envio para todos os motoristas
                      </h4>
                      <p className="text-sm text-green-600 mt-1">
                        Esta notificação será enviada para todos os{' '}
                        {totalElements} motoristas cadastrados no sistema.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Botão de envio */}
            <button
              onClick={
                modoEnvio === 'GRUPO' ? handleEnvioGrupo : handleEnvioIndividual
              }
              disabled={
                enviando ||
                !titulo.trim() ||
                !mensagem.trim() ||
                (modoEnvio === 'INDIVIDUAL' &&
                  motoristasSelecionados.length === 0)
              }
              className={`w-full px-4 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-colors ${
                modoEnvio === 'GRUPO'
                  ? 'bg-green-600 text-white'
                  : 'bg-blue-600 text-white'
              }`}
            >
              {enviando ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {modoEnvio === 'GRUPO'
                    ? 'Enviando para todos...'
                    : 'Enviando...'}
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  {modoEnvio === 'GRUPO'
                    ? `Enviar para todos os motoristas (${totalElements})`
                    : `Enviar para ${motoristasSelecionados.length} motorista(s)`}
                </>
              )}
            </button>
          </div>
        </div>

        {/* COLUNA DIREITA (1/3) - RESUMO */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    Total de Motoristas
                  </span>
                  <span className="font-bold text-2xl text-blue-700">
                    {totalElements}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Motoristas disponíveis para receber notificações
                </p>
              </div>

              <div
                className={`p-4 rounded-lg border ${
                  modoEnvio === 'GRUPO'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-blue-50 border-blue-200 text-blue-800'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {modoEnvio === 'GRUPO' ? (
                    <Users className="h-4 w-4" />
                  ) : (
                    <Filter className="h-4 w-4" />
                  )}
                  <span className="font-medium">
                    {modoEnvio === 'GRUPO'
                      ? 'Modo: Envio em Grupo'
                      : 'Modo: Seleção Individual'}
                  </span>
                </div>
                <p className="text-sm">
                  {modoEnvio === 'GRUPO'
                    ? 'Enviando para todos os motoristas'
                    : `Selecionados: ${motoristasSelecionados.length} motorista(s)`}
                </p>
              </div>

              {resultado && (
                <div
                  className={`p-4 rounded-lg border ${
                    resultado.sucesso
                      ? 'bg-green-50 border-green-200 text-green-800'
                      : 'bg-red-50 border-red-200 text-red-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium mb-1">
                    {resultado.sucesso ? (
                      <>
                        <Check className="h-4 w-4" />
                        Sucesso!
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4" />
                        {modoEnvio === 'GRUPO'
                          ? 'Erro no envio'
                          : 'Envio parcial'}
                      </>
                    )}
                  </div>
                  <div className="text-sm">
                    {modoEnvio === 'GRUPO' ? (
                      <p>
                        {resultado.sucesso
                          ? `Notificação enviada para todos os ${resultado.enviadas} motoristas`
                          : 'Não foi possível enviar a notificação para o grupo'}
                      </p>
                    ) : (
                      <>
                        <p>
                          <strong>{resultado.enviadas}</strong> notificação(ões)
                          enviada(s)
                        </p>
                        {resultado.erros > 0 && (
                          <p className="mt-1">
                            <strong>{resultado.erros}</strong> erro(s)
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">
                  Dicas de uso:
                </h4>
                <ul className="text-sm text-gray-600 space-y-1.5">
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      Use <strong>Enviar para Todos</strong> para comunicados
                      gerais
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      Use <strong>Enviar Individualmente</strong> para mensagens
                      específicas
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
