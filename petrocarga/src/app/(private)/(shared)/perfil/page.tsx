'use client';

import { buttonVariants } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/hooks/useAuth';
import {
  deleteMotorista,
  getMotoristaByUserId,
} from '@/services/api/motoristaApi';
import { deleteAgente, getAgenteByUserId } from '@/services/api/agenteApi';
import { deleteGestor, getGestorByUserId } from '@/services/api/gestorApi';
import { Motorista } from '@/lib/types/personas/motorista';
import { Agente } from '@/lib/types/personas/agente';
import { Gestor } from '@/lib/types/personas/gestor';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  UserIcon,
  Mail,
  Phone,
  FileText,
  Trash2,
  Fingerprint,
  IdCardIcon,
  Loader2,
  Edit,
  Info,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { PushNotificationToggle } from '@/components/notification/PushNotificationToggle';
import ModalConfirmacaoExclusao from '@/components/modal/confirmacaoExclusao';
import toast from 'react-hot-toast';
import { CtaProfileIcon } from '@/components/ui/CTA/CtaProfileIcon';

/**
 * @component Perfil
 * @version 2.0.0
 *
 * @description Página de perfil universal.
 * Funciona para MOTORISTA, AGENTE, GESTOR e ADMIN, usando `user.permissao`
 * (vindo do useAuth) para decidir qual API chamar e quais campos exibir.
 *
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 *
 * 1. AUTENTICAÇÃO:
 *    - Hook useAuth obtém usuário logado (inclui `permissao`)
 *
 * 2. RESOLUÇÃO DE PERSONA:
 *    - PERSONA_CONFIG mapeia cada `permissao` para: label de exibição,
 *      função de busca e função de exclusão da API correspondente.
 *
 * 3. BUSCA DE DADOS:
 *    - useEffect dispara fetchPerfil na montagem, usando a config da persona
 *    - Cada API pode retornar o objeto em uma chave diferente (motorista,
 *      agente, gestor, admin) — normalizamos tudo para `perfil`.
 *
 * 4. ESTADOS DE UI:
 *    a) LOADING INICIAL
 *    b) ERRO DE AUTENTICAÇÃO/BUSCA (inclui permissão desconhecida)
 *    c) PERFIL NÃO ENCONTRADO
 *    d) SUCESSO — grid de informações comuns + campos específicos de
 *       MOTORISTA (CNH) quando aplicável.
 *
 * 5. EXCLUSÃO DE CONTA:
 *    - Modal de confirmação → chama a função de exclusão certa para a persona
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - CAMPOS COMUNS (nome, telefone, email, cpf): lidos com fallback duplo,
 *   pois algumas APIs aninham em `perfil.usuario.*` (caso do Motorista) e
 *   outras podem retornar plano (`perfil.nome`, etc — como o objeto de
 *   `user` do useAuth). Isso evita quebrar caso o formato do Agente/Gestor/
 *   Admin seja diferente do Motorista.
 * - CAMPOS ESPECÍFICOS DE MOTORISTA (CNH): só renderizados quando
 *   `permissao === 'MOTORISTA'`.
 *
 * @see /services/api/motoristaApi.ts
 * @see /services/api/agenteApi.ts
 * @see /services/api/gestorApi.ts
 * @see /services/api/adminApi.ts
 */

type Permissao = 'MOTORISTA' | 'AGENTE' | 'GESTOR' ;

type Perfil = Motorista | Agente | Gestor;

interface FetchPerfilResultado {
  error?: boolean;
  message?: string;
  perfil?: Perfil | null;
}

interface PersonaConfig {
  label: string;
  fetchPerfil: (userId: string) => Promise<FetchPerfilResultado>;
  deletePerfil: (userId: string) => Promise<{ error?: boolean; message?: string } | void>;
}

// --------------------------------------------------------------------------
// CONFIGURAÇÃO POR PERSONA
// --------------------------------------------------------------------------
// Se a chave de retorno de alguma API for diferente do que está aqui
// (ex: getAgenteByUserId não retorna `resultado.agente`), ajuste apenas
// a linha correspondente abaixo.
const PERSONA_CONFIG: Record<Permissao, PersonaConfig> = {
  MOTORISTA: {
    label: 'Motorista',
    fetchPerfil: async (userId) => {
      const resultado = await getMotoristaByUserId(userId);
      return { error: resultado.error, message: resultado.message, perfil: resultado.motorista };
    },
    deletePerfil: (userId) => deleteMotorista(userId),
  },
  AGENTE: {
    label: 'Agente',
    fetchPerfil: async (userId) => {
      const resultado = await getAgenteByUserId(userId);
      return { error: resultado.error, message: resultado.message, perfil: resultado.agente };
    },
    deletePerfil: (userId) => deleteAgente(userId),
  },
  GESTOR: {
    label: 'Gestor',
    fetchPerfil: async (userId) => {
      const resultado = await getGestorByUserId(userId);
      return { error: resultado.error, message: resultado.message, perfil: resultado.gestor };
    },
    deletePerfil: (userId) => deleteGestor(userId),
  },
};

// --------------------------------------------------------------------------
// HELPERS DE LEITURA NORMALIZADA
// --------------------------------------------------------------------------
// Cobrem tanto o formato aninhado (perfil.usuario.nome, como no Motorista)
// quanto um formato plano (perfil.nome), para não quebrar caso os outros
// tipos não aninhem em `usuario`.
function getCampo(perfil: Perfil | null, campo: 'nome' | 'telefone' | 'email' | 'cpf' | 'id'): string {
  if (!perfil) return '';
  const aninhado = (perfil as unknown as { usuario?: Record<string, string> }).usuario;
  const plano = perfil as unknown as Record<string, string>;
  return (aninhado?.[campo] ?? plano?.[campo] ?? '') as string;
}

function isMotorista(perfil: Perfil | null): perfil is Motorista {
  return !!perfil && 'numeroCnh' in perfil;
}

export default function Perfil() {
  // --------------------------------------------------------------------------
  // ESTADOS
  // --------------------------------------------------------------------------

  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  const permissao = user?.permissao as Permissao | undefined;
  const config = permissao ? PERSONA_CONFIG[permissao] : undefined;

  // --------------------------------------------------------------------------
  // EFEITO DE BUSCA
  // --------------------------------------------------------------------------

  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    if (!config) {
      setLoading(false);
      setError('Não foi possível identificar o tipo de perfil do usuário.');
      return;
    }

    const fetchPerfil = async () => {
      setLoading(true);
      setError(null);

      try {
        const resultado = await config.fetchPerfil(user.id);
        if (resultado.error) {
          setError(resultado.message || 'Erro ao buscar perfil');
        } else {
          setPerfil(resultado.perfil ?? null);
        }
      } catch {
        setError('Erro ao carregar informações do perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerfil();
  }, [user?.id, config]);

  // --------------------------------------------------------------------------
  // HANDLER DE EXCLUSÃO
  // --------------------------------------------------------------------------

  const handleExcluir = async () => {
    if (!user || !config) return;

    try {
      const resultado = await config.deletePerfil(user.id);

      if (resultado && 'error' in resultado && resultado.error) {
        toast.error(resultado.message || 'Erro ao excluir conta.');
        return;
      }

      setModalAberto(false);
      await logout();
      router.push('/');
    } catch {
      toast.error('Erro ao excluir conta. Tente novamente.');
    }
  };

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO CONDICIONAL
  // --------------------------------------------------------------------------

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro ao carregar perfil
          </h2>
          <p className="text-gray-600 mb-4 break-words">{error}</p>
          <button
            onClick={() => router.push('/autorizacao/login')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl transition w-full sm:w-auto"
          >
            Fazer Login
          </button>
        </div>
      </main>
    );
  }

  if (!loading && !perfil) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado encontrado.</p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------------------------------
  // CAMPOS NORMALIZADOS
  // --------------------------------------------------------------------------

  const nome = getCampo(perfil, 'nome');
  const telefone = getCampo(perfil, 'telefone');
  const email = getCampo(perfil, 'email');
  const cpf = getCampo(perfil, 'cpf');
  const usuarioId = getCampo(perfil, 'id') || user?.id || '';
  const primeiroNome = nome.split(' ')[0];
  const mostrarCamposCnh = isMotorista(perfil);

  // --------------------------------------------------------------------------
  // RENDERIZAÇÃO
  // --------------------------------------------------------------------------

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Header ── */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            {loading ? 'Seu Perfil!' : `Seu Perfil, ${primeiroNome}!`}
          </h1>

          <p className="text-xs text-white/50 capitalize">
            Aqui você pode ver suas informações e atualizar seus dados.
          </p>
        </div>
      </header>

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* CTA flutuante */}
        <div className="-mt-4 mb-2 flex justify-center">
          <CtaProfileIcon />
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="animate-spin w-7 h-7 text-blue-600" />
            <span className="text-gray-500 text-sm">Carregando perfil...</span>
          </div>
        ) : (
          <>
            <Card className="w-full max-w-4xl mx-auto shadow-sm md:shadow-lg">
              <div className="px-4 sm:px-6 pb-6 space-y-6">
                {/* Grid de informações */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {/* Card: Nome */}
                  <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                    <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">Nome</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                        {nome}
                      </p>
                    </div>
                  </div>

                  {/* Card: Telefone */}
                  <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                    <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">Telefone</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900">
                        {telefone}
                      </p>
                    </div>
                  </div>

                  {/* Cards específicos de MOTORISTA: Número e Tipo da CNH */}
                  {mostrarCamposCnh && (
                    <>
                      <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                        <IdCardIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-500">
                            Número da CNH
                          </p>
                          <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                            {(perfil as Motorista).numeroCnh}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-500">
                            Tipo da CNH
                          </p>
                          <p className="text-base sm:text-lg font-semibold text-gray-900">
                            {(perfil as Motorista).tipoCnh}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Card: CPF */}
                  <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl">
                    <Fingerprint className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-500">CPF</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                        {cpf}
                      </p>
                    </div>
                  </div>

                  {/* Card: Email (ocupa espaço especial no tablet) */}
                  <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-2xl col-span-1 sm:col-span-2 lg:col-span-1">
                    <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-gray-500">Email</p>
                      <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                        {email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Toggle de notificações push */}
                <section>
                  <PushNotificationToggle usuarioId={usuarioId} />
                </section>

                {/* Botões de ação */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6">
                  {/* Botão Editar Perfil */}
                  <Link
                    href="/perfil/editar-perfil"
                    className={cn(
                      buttonVariants({ variant: 'default' }),
                      'flex items-center justify-center gap-2 px-8 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base w-full sm:w-auto min-w-[150px] font-medium',
                    )}
                  >
                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Editar Perfil</span>
                  </Link>

                  {/* Botão Excluir Conta */}
                  <button
                    onClick={() => setModalAberto(true)}
                    className={cn(
                      buttonVariants({ variant: 'destructive' }),
                      'flex items-center justify-center gap-2 px-8 py-3 h-12 bg-red-500 hover:bg-red-600 text-sm sm:text-base w-full sm:w-auto min-w-[150px] font-medium',
                    )}
                  >
                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span>Desativar Conta</span>
                  </button>
                </div>
              </div>
            </Card>

            {/* Modal */}
            <ModalConfirmacaoExclusao
              isOpen={modalAberto}
              onClose={() => setModalAberto(false)}
              onConfirm={handleExcluir}
              mensagem='Deseja mesmo desativar sua conta? Para reativar, basta ir em "Ativa Conta" no login.'
            />

            {/* Tutorial */}
            <Link
              href="/tutorial#perfil"
              className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors mt-6"
            >
              <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
                <Info className="h-5 w-5 text-[#1351B4]" />
              </div>

              <div>
                <p className="text-sm font-semibold text-[#071D41]">
                  Seus dados estão corretos?
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Aprenda a manter seu perfil sempre atualizado
                </p>
              </div>
            </Link>
          </>
        )}
      </main>
    </div>
  );
}