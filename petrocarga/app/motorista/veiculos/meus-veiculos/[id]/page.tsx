'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/components/hooks/useAuth';
import { getVeiculosUsuario } from '@/lib/api/veiculoApi';
import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { Veiculo } from '@/lib/types/veiculo';
import VeiculoDetalhes from '@/components/motorista/cards/veiculo-card';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/button';

/**
 * @component EditarVeiculoPage
 * @version 1.0.0
 *
 * @description Página de edição de veículo para motoristas.
 * Gerencia carregamento dos dados do veículo via ID da URL e renderiza o formulário de edição.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado
 *    - Se não houver user.id, não carrega veículos
 *
 * 2. PARÂMETROS DA URL:
 *    - useParams captura o ID do veículo da rota dinâmica
 *    - ID é usado para filtrar o veículo na lista do usuário
 *
 * 3. CARREGAMENTO DE VEÍCULOS:
 *    - useEffect dispara fetchVeiculo na montagem
 *    - useCallback memoiza função com base no user.id e params.id
 *    - Busca TODOS os veículos do usuário e filtra pelo ID
 *
 * 4. CALLBACK DE ATUALIZAÇÃO:
 *    - handleVeiculoAtualizado recebe dados do componente filho
 *    - Atualiza estado local e dispara toast de sucesso
 *    - Recarrega dados para garantir consistência
 *
 * 5. ESTADOS DE UI (4 ESTADOS):
 *
 *    a) LOADING:
 *       - Spinner centralizado
 *       - Mensagem "Carregando veículo..."
 *
 *    b) ERRO (geral):
 *       - Falha na API
 *       - Ícone de alerta vermelho
 *       - Botões: "Tentar novamente" e "Voltar"
 *
 *    c) VEÍCULO NÃO ENCONTRADO:
 *       - Mesma UI do erro
 *       - Mensagem "Veículo não encontrado"
 *
 *    d) SUCESSO:
 *       - Link "Voltar para meus veículos"
 *       - Layout em duas colunas (desktop)
 *       - VeiculoDetalhes na coluna principal
 *       - Sidebar com informações úteis (desktop)
 *       - Botão de atualizar (mobile)
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - FILTRAGEM LOCAL: Busca todos veículos e filtra por ID em vez de API específica
 *   (simplifica, mas pode ser menos eficiente com muitos veículos)
 *
 * - CALLBACK DE ATUALIZAÇÃO: Permite que o componente filho notifique mudanças
 *
 * - LAYOUT RESPONSIVO:
 *   - Desktop: grid 3 colunas (2 para detalhes, 1 para sidebar sticky)
 *   - Mobile: empilhamento com botão de atualizar
 *
 * - SIDEBAR INFORMATIVA: Dicas úteis e resumo das informações do veículo
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - VeiculoDetalhes: Formulário de edição (filho)
 * - useAuth: Hook de autenticação
 * - getVeiculosUsuario: API de listagem
 * - /motorista/veiculos/meus-veiculos: Página de listagem (retorno)
 *
 * @example
 * ```tsx
 * // Uso em rota dinâmica: /motorista/veiculos/editar/123
 * <EditarVeiculoPage />
 * ```
 *
 * @see /src/components/motorista/cards/veiculo-card.tsx - Formulário de edição
 * @see /src/lib/api/veiculoApi.ts - Função getVeiculosUsuario
 */

export default function EditarVeiculoPage() {
  // --------------------------------------------------------------------------
  // HOOKS E PARÂMETROS
  // --------------------------------------------------------------------------

  const { user } = useAuth();
  const params = useParams() as { id: string };

  const [veiculo, setVeiculo] = useState<Veiculo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // --------------------------------------------------------------------------
  // FUNÇÃO DE BUSCA
  // --------------------------------------------------------------------------

  const fetchVeiculo = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await getVeiculosUsuario(user.id);

      if (result.error) {
        toast.error(result.message || 'Erro ao buscar veículo');
        setError(result.message);
        setVeiculo(null);
      } else {
        const v = result.veiculos.find((v) => v.id === params.id);
        if (!v) {
          setError('Veículo não encontrado.');
        } else {
          setVeiculo(v);
        }
      }
    } catch {
      toast.error('Erro ao carregar os dados do veículo. Tente novamente.');
      setError('Erro ao buscar veículo.');
    } finally {
      setLoading(false);
    }
  }, [user?.id, params.id]);

  // --------------------------------------------------------------------------
  // EFEITO INICIAL
  // --------------------------------------------------------------------------

  useEffect(() => {
    fetchVeiculo();
  }, [fetchVeiculo]);

  // --------------------------------------------------------------------------
  // CALLBACK DE ATUALIZAÇÃO
  // --------------------------------------------------------------------------

  const handleVeiculoAtualizado = (veiculoAtualizado: Veiculo) => {
    setVeiculo(veiculoAtualizado);
    toast.success('Veículo atualizado com sucesso!');
    fetchVeiculo(); // Recarrega para garantir consistência
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-gray-500" />
        <span className="text-gray-600">Carregando veículo...</span>
      </div>
    );
  }

  if (error || !veiculo) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          {error || 'Veículo não encontrado'}
        </h3>
        <div className="flex flex-col sm:flex-row gap-3 mt-4">
          <Button onClick={fetchVeiculo} variant="outline">
            Tentar novamente
          </Button>
          <Link href="/motorista/veiculos/meus-veiculos">
            <Button variant="ghost">Voltar para todos os veículos</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex flex-col items-center w-full min-h-screen bg-gray-50">
      <div className="w-full max-w-4xl lg:max-w-6xl">
        {/* Link de retorno */}
        <div className="mb-6 sm:mb-8">
          <Link
            href="/motorista/veiculos/meus-veiculos"
            className="text-muted-foreground hover:text-foreground inline-flex items-center px-3 py-2 sm:px-4 sm:py-2 bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="text-sm sm:text-base">
              Voltar para meus veículos
            </span>
          </Link>
        </div>

        {/* Layout principal (desktop: 2 colunas + sidebar) */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna principal - Formulário */}
          <div className="lg:col-span-2">
            <VeiculoDetalhes
              veiculo={veiculo}
              onVeiculoAtualizado={handleVeiculoAtualizado}
            />
          </div>

          {/* Sidebar informativa (desktop) */}
          <div className="hidden lg:block">
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                Informações Úteis
              </h3>
              <ul className="space-y-3 text-sm text-gray-600 mb-6">
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Placa deve estar sempre atualizada</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Documentos devem estar em dia</span>
                </li>
                <li className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                  <span>Verifique regularmente os dados</span>
                </li>
              </ul>

              {/* Resumo do veículo */}
              <div className="pt-4 border-t border-gray-200">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Status do veículo
                </h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Placa:</span>
                    <span className="text-sm font-mono font-medium text-gray-800">
                      {veiculo.placa}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Tipo:</span>
                    <span className="text-sm font-medium text-gray-800">
                      {veiculo.tipo}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botão de atualizar (mobile) */}
        <div className="lg:hidden mt-6">
          <button
            onClick={fetchVeiculo}
            className="w-full py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-all duration-200 font-medium flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Atualizar dados do veículo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
