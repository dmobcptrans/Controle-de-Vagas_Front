'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { getMotoristas } from '@/lib/api/motoristaApi';
import {
  enviarNotificacaoParaUsuario,
  enviarNotificacaoPorPermissao,
} from '@/lib/api/notificacaoApi';
import { Motorista } from '@/lib/types/motorista';
import {
  Loader2,
  Send,
  Users,
  Bell,
  Filter,
  Check,
  X,
  Search,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function EnviarNotificacoesPage() {
  const { user } = useAuth();
  const [motoristas, setMotoristas] = useState<Motorista[]>([]);
  const [loading, setLoading] = useState(true);

  // Modo de envio (apenas motoristas)
  const [modoEnvio, setModoEnvio] = useState<'INDIVIDUAL' | 'GRUPO'>(
    'INDIVIDUAL',
  );

  // Filtro de busca (apenas para modo individual)
  const [busca, setBusca] = useState('');

  // Formulário
  const [titulo, setTitulo] = useState('');
  const [mensagem, setMensagem] = useState('');
  const [tipo, setTipo] = useState<
    'RESERVA' | 'VAGA' | 'VEICULO' | 'MOTORISTA' | 'SISTEMA'
  >('SISTEMA');

  // Seleção de motoristas (apenas para modo individual)
  const [motoristasSelecionados, setMotoristasSelecionados] = useState<
    string[]
  >([]);
  const [enviando, setEnviando] = useState(false);
  const [resultado, setResultado] = useState<{
    enviadas: number;
    erros: number;
  } | null>(null);

  useEffect(() => {
    if (!user?.id) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const motoristasRes = await getMotoristas();
        if (!motoristasRes.error) {
          setMotoristas(motoristasRes.motoristas || []);
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

    fetchData();
  }, [user]);

  // Filtra motoristas com base na busca
  const motoristasFiltrados = useMemo(() => {
    if (!busca.trim()) return motoristas;

    const termoBusca = busca.toLowerCase().trim();
    return motoristas.filter(
      (motorista) =>
        motorista.usuario.nome.toLowerCase().includes(termoBusca) ||
        motorista.usuario.email.toLowerCase().includes(termoBusca),
    );
  }, [motoristas, busca]);

  const toggleMotorista = (id: string) => {
    setMotoristasSelecionados((prev) =>
      prev.includes(id)
        ? prev.filter((userId) => userId !== id)
        : [...prev, id],
    );
  };

  const deselecionarTodos = () => {
    setMotoristasSelecionados([]);
  };

  // Selecionar todos os motoristas filtrados
  const selecionarTodosFiltrados = () => {
    const ids = motoristasFiltrados.map((m) => m.usuario.id);
    setMotoristasSelecionados(ids);
  };

  const handleEnvioIndividual = async () => {
    if (
      !titulo.trim() ||
      !mensagem.trim() ||
      motoristasSelecionados.length === 0
    ) {
      alert('Preencha título, mensagem e selecione pelo menos um motorista');
      return;
    }

    setEnviando(true);
    setResultado(null);

    let enviadas = 0;
    let erros = 0;

    try {
      // Envia notificação para cada motorista selecionado
      for (const usuarioId of motoristasSelecionados) {
        const formData = new FormData();
        formData.append('usuarioId', usuarioId);
        formData.append('titulo', titulo);
        formData.append('mensagem', mensagem);
        formData.append('tipo', tipo);

        const result = await enviarNotificacaoParaUsuario(formData);

        if (result.error) {
          console.error(`Erro para motorista ${usuarioId}:`, result.message);
          erros++;
        } else {
          enviadas++;
        }
      }

      setResultado({ enviadas, erros });

      // Limpa o formulário se tudo foi enviado com sucesso
      if (erros === 0) {
        setTitulo('');
        setMensagem('');
        setMotoristasSelecionados([]);
        setBusca(''); // Limpa a busca também
      }
    } catch (err) {
      console.error(err);
      alert('Erro ao enviar notificações');
    } finally {
      setEnviando(false);
    }
  };

  const handleEnvioGrupo = async () => {
    if (!titulo.trim() || !mensagem.trim()) {
      alert('Preencha título e mensagem');
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
        setResultado({ enviadas: 0, erros: 1 });
        alert(`Erro: ${result.message}`);
      } else {
        setResultado({ enviadas: 1, erros: 0 }); // 1 grupo enviado
        setTitulo('');
        setMensagem('');
        setBusca(''); // Limpa a busca também
      }
    } catch (err) {
      console.error(err);
      setResultado({ enviadas: 0, erros: 1 });
      alert('Erro ao enviar notificação para o grupo');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Bell className="h-8 w-8 text-blue-600" />
          Enviar Notificações para Motoristas
        </h1>
        <p className="text-gray-600">
          Envie notificações para motoristas individualmente ou para todos de
          uma vez
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulário */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Conteúdo da Notificação
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Título *
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ex: Nova reserva disponível"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mensagem *
                </label>
                <textarea
                  value={mensagem}
                  onChange={(e) => setMensagem(e.target.value)}
                  rows={4}
                  placeholder="Digite sua mensagem aqui..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="SISTEMA">Sistema</option>
                  <option value="RESERVA">Reserva</option>
                  <option value="VAGA">Vaga</option>
                  <option value="VEICULO">Veículo</option>
                  <option value="MOTORISTA">Motorista</option>
                </select>
              </div>
            </div>
          </div>

          {/* Destinatários */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Destinatários (Motoristas)
            </h2>

            <div className="space-y-4 mb-6">
              {/* Modo de envio */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Escolha o modo de envio:
                </label>
                <div className="grid grid-cols-2 gap-3">
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
                      Todos os motoristas ({motoristas.length})
                    </span>
                  </button>
                </div>
              </div>

              {/* Modo INDIVIDUAL - Lista de motoristas */}
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
                      placeholder="Buscar motorista por nome ou email..."
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
                        {motoristasFiltrados.length} motorista(s) encontrado(s)
                        {busca && ` para "${busca}"`}
                      </span>
                      {busca && motoristasFiltrados.length === 0 && (
                        <p className="text-xs text-red-600">
                          Nenhum motorista encontrado com este termo
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
                        Selecionar todos
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
                  <div className="border border-gray-200 rounded-lg overflow-hidden max-h-60 overflow-y-auto">
                    {motoristasFiltrados.map((motorista) => (
                      <div
                        key={motorista.usuario.id}
                        className={`px-4 py-3 border-b border-gray-100 flex items-center gap-3 hover:bg-gray-50 cursor-pointer ${
                          motoristasSelecionados.includes(motorista.usuario.id)
                            ? 'bg-blue-50'
                            : ''
                        }`}
                        onClick={() => toggleMotorista(motorista.usuario.id)}
                      >
                        <div
                          className={`w-5 h-5 rounded border flex items-center justify-center ${
                            motoristasSelecionados.includes(
                              motorista.usuario.id,
                            )
                              ? 'bg-blue-500 border-blue-500'
                              : 'border-gray-300'
                          }`}
                        >
                          {motoristasSelecionados.includes(
                            motorista.usuario.id,
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
                        {motoristasSelecionados.includes(
                          motorista.usuario.id,
                        ) && (
                          <div className="text-blue-500">
                            <Check className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Contador de selecionados */}
                  {motoristasSelecionados.length > 0 && (
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-sm font-medium text-blue-700">
                            Motoristas selecionados:
                          </span>
                          <span className="text-sm text-blue-600 ml-2">
                            {motoristasSelecionados.length} de{' '}
                            {motoristas.length} total
                          </span>
                        </div>
                        <span className="font-bold text-blue-700">
                          {motoristasSelecionados.length}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Dica de busca */}
                  {motoristas.length > 5 && (
                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-600">
                      💡 <strong>Dica:</strong> Use a busca para encontrar
                      motoristas específicos mais rapidamente
                    </div>
                  )}
                </div>
              )}

              {/* Modo GRUPO - Informação */}
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
                        {motoristas.length} motoristas cadastrados no sistema.
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
              className={`w-full px-4 py-3 rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
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
                    ? `Enviar para todos os motoristas (${motoristas.length})`
                    : `Enviar para ${motoristasSelecionados.length} motorista(s)`}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Painel lateral */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo</h3>

            <div className="space-y-4">
              {/* Estatísticas */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-gray-700">
                    Total de Motoristas
                  </span>
                  <span className="font-bold text-2xl text-blue-700">
                    {motoristas.length}
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Motoristas disponíveis para receber notificações
                </p>
              </div>

              {/* Modo atual */}
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

              {/* Resultado do envio */}
              {resultado && (
                <div
                  className={`p-4 rounded-lg border ${
                    resultado.erros > 0
                      ? 'bg-red-50 border-red-200 text-red-800'
                      : 'bg-green-50 border-green-200 text-green-800'
                  }`}
                >
                  <div className="flex items-center gap-2 font-medium mb-1">
                    {resultado.erros > 0 ? (
                      <>
                        <X className="h-4 w-4" />
                        {modoEnvio === 'GRUPO'
                          ? 'Erro no envio'
                          : 'Envio parcial'}
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        Sucesso!
                      </>
                    )}
                  </div>
                  <div className="text-sm">
                    {modoEnvio === 'GRUPO' ? (
                      <p>Notificação enviada para todos os motoristas</p>
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

              {/* Dicas */}
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
                  <li className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-1.5 flex-shrink-0" />
                    <span>
                      <strong>Busque por nome ou email</strong> para encontrar
                      motoristas mais rapidamente
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
