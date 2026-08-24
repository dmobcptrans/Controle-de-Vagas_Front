'use client';

import EditarMotorista from '@/components/motorista/editar/edicao-perfil';
import EditarGestor from '@/components/gestor/editar/edicao-perfil';
import EditarAgente from '@/components/agente/editar/edicao-perfil';
import EditarEmpresa from '@/components/empresa/editar/edicao-perfil';

import { Motorista } from '@/lib/types/personas/motorista';
import { Agente } from '@/lib/types/personas/agente';
import { Gestor } from '@/lib/types/personas/gestor';
import { Empresa } from '@/lib/types/personas/empresa';

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle,
  Info,
  Loader2,
  ShieldCheck,
  UserX,
  Building2,
} from 'lucide-react';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/hooks/useAuth';
import { useEffect, useState } from 'react';

import { getMotoristaByUserId } from '@/services/api/motoristaApi';
import { getAgenteByUserId } from '@/services/api/agenteApi';
import { getGestorByUserId } from '@/services/api/gestorApi';
import { getEmpresaByUsuarioId } from '@/services/api/empresaApi';

/**
 * Permissões que possuem edição de perfil.
 */
type Permissao = 'MOTORISTA' | 'AGENTE' | 'GESTOR' | 'EMPRESA';

/**
 * Dados possíveis retornados pelas APIs.
 */
type Dados = Motorista | Agente | Gestor | Empresa;

interface FetchResultado {
  error?: boolean;
  message?: string;
  dados?: Dados | null;
}

interface PersonaConfig {
  fetchDados: (userId: string) => Promise<FetchResultado>;

  renderForm: (
    dados: Dados,
    onSuccess: () => void,
  ) => React.ReactNode | null;
}

interface PersonaTema {
  label: string;
  corGradiente: string;
  corBotao: string;
  corCardInfo: string;
  corTextoInfo: string;
  corTextoInfoDescricao: string;
  corIconeInfo: string;
  IconeSucesso: typeof CheckCircle;
  corIconeSucesso: string;
  corFundoIconeSucesso: string;
  tituloInfo: string;
  descricaoInfo: string;
  descricaoPagina: string;
}

// --------------------------------------------------------------------------
// CONFIGURAÇÃO POR PERSONA
// --------------------------------------------------------------------------

const PERSONA_CONFIG: Record<Permissao, PersonaConfig> = {
  MOTORISTA: {
    fetchDados: async (userId) => {
      const resultado = await getMotoristaByUserId(userId);

      return {
        error: resultado.error,
        message: resultado.message,
        dados: resultado.motorista,
      };
    },

    renderForm: (dados, onSuccess) => (
      <EditarMotorista
        motorista={dados as Motorista}
        onSuccess={onSuccess}
      />
    ),
  },

  AGENTE: {
    fetchDados: async (userId) => {
      const resultado = await getAgenteByUserId(userId);

      return {
        error: resultado.error,
        message: resultado.message,
        dados: resultado.agente,
      };
    },

    renderForm: (dados, onSuccess) => (
      <EditarAgente
        agente={dados as Agente}
        onSuccess={onSuccess}
      />
    ),
  },

  GESTOR: {
    fetchDados: async (userId) => {
      const resultado = await getGestorByUserId(userId);

      return {
        error: resultado.error,
        message: resultado.message,
        dados: resultado.gestor,
      };
    },

    renderForm: (dados, onSuccess) => (
      <EditarGestor
        gestor={dados as Gestor}
        onSuccess={onSuccess}
      />
    ),
  },

  EMPRESA: {
    fetchDados: async (userId) => {
      const resultado = await getEmpresaByUsuarioId(userId);

      return {
        error: resultado.error,
        message: resultado.message,
        dados: resultado.empresa,
      };
    },

    renderForm: (dados, onSuccess) => (
      <EditarEmpresa
        empresa={dados as Empresa}
        onSuccess={onSuccess}
      />
    ),
  },
};

// --------------------------------------------------------------------------
// TEMA VISUAL POR PERSONA
// --------------------------------------------------------------------------

const PERSONA_TEMAS: Record<Permissao, PersonaTema> = {
  MOTORISTA: {
    label: 'motorista',
    corGradiente:
      'from-orange-50/30 via-white to-yellow-50/30',
    corBotao: 'bg-orange-600 hover:bg-orange-700',
    corCardInfo:
      'bg-orange-50 border-orange-100',
    corTextoInfo:
      'text-orange-900',
    corTextoInfoDescricao:
      'text-orange-700',
    corIconeInfo:
      'text-orange-500',
    IconeSucesso:
      CheckCircle,
    corIconeSucesso:
      'text-blue-600',
    corFundoIconeSucesso:
      'from-blue-100 to-purple-100',
    tituloInfo:
      'Informação importante para motoristas',
    descricaoInfo:
      'Certifique-se de manter seus documentos de habilitação e veículo sempre atualizados. Informações incorretas podem afetar sua elegibilidade para viagens.',
    descricaoPagina:
      'Atualize suas informações de condução, documentos e disponibilidade',
  },

  AGENTE: {
    label: 'agente',
    corGradiente:
      'from-emerald-50/30 via-white to-teal-50/30',
    corBotao:
      'bg-emerald-600 hover:bg-emerald-700',
    corCardInfo:
      'bg-emerald-50 border-emerald-100',
    corTextoInfo:
      'text-emerald-900',
    corTextoInfoDescricao:
      'text-emerald-700',
    corIconeInfo:
      'text-emerald-500',
    IconeSucesso:
      CheckCircle,
    corIconeSucesso:
      'text-emerald-600',
    corFundoIconeSucesso:
      'from-emerald-100 to-teal-100',
    tituloInfo:
      'Informação importante para agentes',
    descricaoInfo:
      'Mantenha seus dados de contato sempre atualizados para garantir a comunicação com motoristas e gestores.',
    descricaoPagina:
      'Atualize suas informações de contato e atuação',
  },

  GESTOR: {
    label: 'gestor',
    corGradiente:
      'from-purple-50/30 via-white to-indigo-50/30',
    corBotao:
      'bg-purple-600 hover:bg-purple-700',
    corCardInfo:
      'bg-purple-50 border-purple-100',
    corTextoInfo:
      'text-purple-900',
    corTextoInfoDescricao:
      'text-purple-700',
    corIconeInfo:
      'text-purple-500',
    IconeSucesso:
      ShieldCheck,
    corIconeSucesso:
      'text-purple-600',
    corFundoIconeSucesso:
      'from-purple-100 to-indigo-100',
    tituloInfo:
      'Informação importante para gestores',
    descricaoInfo:
      'Mantenha seus dados atualizados para garantir o acesso correto às ferramentas de gestão.',
    descricaoPagina:
      'Atualize suas informações de gestão e contato',
  },

  EMPRESA: {
    label: 'empresa',
    corGradiente:
      'from-blue-50/30 via-white to-cyan-50/30',
    corBotao:
      'bg-blue-600 hover:bg-blue-700',
    corCardInfo:
      'bg-blue-50 border-blue-100',
    corTextoInfo:
      'text-blue-900',
    corTextoInfoDescricao:
      'text-blue-700',
    corIconeInfo:
      'text-blue-500',
    IconeSucesso:
      Building2,
    corIconeSucesso:
      'text-blue-600',
    corFundoIconeSucesso:
      'from-blue-100 to-cyan-100',
    tituloInfo:
      'Informação importante para empresas',
    descricaoInfo:
      'Mantenha os dados da empresa e do responsável sempre atualizados para garantir o correto funcionamento das reservas e dos vínculos com motoristas e veículos.',
    descricaoPagina:
      'Atualize os dados da empresa, responsável e documentos',
  },
};

// --------------------------------------------------------------------------
// COMPONENTE
// --------------------------------------------------------------------------

export default function EditarPerfilPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [dados, setDados] = useState<Dados | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const permissao = user?.permissao as Permissao | undefined;

  const config = permissao
    ? PERSONA_CONFIG[permissao]
    : undefined;

  const tema = permissao
    ? PERSONA_TEMAS[permissao]
    : PERSONA_TEMAS.MOTORISTA;

  // --------------------------------------------------------------------------
  // BUSCA DOS DADOS
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }

    if (!config) {
      setError(
        'Não foi possível identificar o tipo de perfil do usuário.',
      );
      setLoading(false);
      return;
    }

    async function fetchDados() {
      setLoading(true);
      setError('');

      try {
        const resultado = await config!.fetchDados(user!.id);

        if (resultado.error) {
          setError(
            resultado.message ||
              `Erro ao buscar perfil de ${tema.label}.`,
          );

          setDados(null);
        } else if (!resultado.dados) {
          setError(
            `Perfil de ${tema.label} não encontrado.`,
          );

          setDados(null);
        } else {
          setDados(resultado.dados);
        }
      } catch {
        setError(
          `Erro ao buscar perfil de ${tema.label}.`,
        );

        setDados(null);
      } finally {
        setLoading(false);
      }
    }

    fetchDados();
  }, [user?.id, config, tema.label]);

  // --------------------------------------------------------------------------
  // LOADING
  // --------------------------------------------------------------------------

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">
          Carregando perfil...
        </span>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // ERRO
  // --------------------------------------------------------------------------

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-500" />
          </div>

          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Ocorreu um erro
          </h3>

          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base break-words">
            {error}
          </p>

          <Link
            href="/perfil"
            className={`inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 text-white rounded-lg transition-colors text-sm sm:text-base font-medium w-full ${tema.corBotao}`}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para perfil
          </Link>
        </div>
      </div>
    );
  }

  // --------------------------------------------------------------------------
  // FORMULÁRIO
  // --------------------------------------------------------------------------

  const formulario = dados
    ? config?.renderForm(
        dados,
        () => router.push('/perfil'),
      )
    : null;

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <div className="max-w-5xl mx-auto">

          {/* HEADER */}
          <div className="mb-8 sm:mb-10 lg:mb-12 relative">
            <div
              className={`absolute inset-0 -top-4 sm:-top-6 -mx-4 sm:-mx-6 lg:-mx-8 h-40 sm:h-48 bg-gradient-to-br ${tema.corGradiente} rounded-b-2xl sm:rounded-b-3xl pointer-events-none`}
            />

            <div className="relative">

              {/* VOLTAR */}
              <div className="flex justify-between items-start mb-6 sm:mb-0">
                <Link
                  href="/perfil"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 group transition-all duration-200 text-sm sm:text-base bg-white/80 backdrop-blur-sm sm:bg-transparent px-3 py-2 sm:px-0 sm:py-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />

                  <span className="font-medium">
                    Voltar para perfil
                  </span>
                </Link>

                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-blue-600" />

                  <span>
                    Editando perfil de {tema.label}
                  </span>
                </div>
              </div>

              {/* TÍTULO */}
              <div className="text-center pt-4 sm:pt-8 lg:pt-12 pb-6 sm:pb-8">
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br ${tema.corFundoIconeSucesso} flex items-center justify-center border-4 border-white shadow-sm`}
                  >
                    <tema.IconeSucesso
                      className={`w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 ${tema.corIconeSucesso}`}
                    />
                  </div>
                </div>

                <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                  Edição de Perfil
                </h1>

                <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-xl mx-auto px-4 leading-relaxed">
                  {tema.descricaoPagina}
                </p>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {!dados || !formulario ? (
              <div className="p-4 sm:p-6 md:p-8 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <UserX className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-400" />
                </div>

                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  {!dados
                    ? `${tema.label.charAt(0).toUpperCase()}${tema.label.slice(1)} não encontrado`
                    : 'Edição ainda não disponível'}
                </h3>

                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  {!dados
                    ? `Não foi possível carregar as informações de ${tema.label}.`
                    : `A edição de perfil para ${tema.label} ainda não está disponível nesta versão.`}
                </p>

                <Link
                  href="/perfil"
                  className={`inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 text-white rounded-lg transition-colors text-sm sm:text-base font-medium ${tema.corBotao}`}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para perfil
                </Link>
              </div>
            ) : (
              <div className="p-3 xs:p-4 sm:p-6 lg:p-8">
                {formulario}
              </div>
            )}
          </div>

          {/* INFORMAÇÃO */}
          <div
            className={`mt-4 xs:mt-5 sm:mt-6 md:mt-8 p-3 xs:p-4 sm:p-6 rounded-lg border ${tema.corCardInfo}`}
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <Info
                  className={`w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 ${tema.corIconeInfo}`}
                />
              </div>

              <div className="flex-1">
                <h4
                  className={`font-medium text-xs xs:text-sm sm:text-base ${tema.corTextoInfo}`}
                >
                  {tema.tituloInfo}
                </h4>

                <p
                  className={`text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed ${tema.corTextoInfoDescricao}`}
                >
                  {tema.descricaoInfo}
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}