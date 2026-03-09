'use client';

import EditarAgente from '@/components/agente/editar/edicao-perfil';
import { useAuth } from '@/components/hooks/useAuth';
import { getAgenteByUserId } from '@/lib/api/agenteApi';
import { Agente } from '@/lib/types/agente';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function EditarAgentePerfil() {
  const { user } = useAuth();
  const params = useParams() as { id: string };
  const router = useRouter();

  const [agente, setAgente] = useState<Agente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  // Função para redirecionar após edição bem-sucedida
  const handleEdicaoSuccess = () => {
    router.push('/agente/perfil');
  };

  useEffect(() => {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }
    const userId = user.id;
    if (!userId) return;

    async function fetchAgente() {
      setLoading(true);
      setError('');

      try {
        const result = await getAgenteByUserId(userId);

        if (result.error) {
          setError(result.agente);
          setAgente(null);
        } else {
          const m = result.agente;
          if (!m) {
            setError('Agente não encontrado.');
          } else {
            setAgente(m);
          }
        }
      } catch (err) {
        setError('Erro ao buscar perfil do agente.');
      } finally {
        setLoading(false);
      }
    }

    fetchAgente();
  }, [user?.id, params.id]);

  if (loading) {
    return (
      <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh] gap-3 text-center">
        <Loader2 className="animate-spin w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-gray-500" />
        <span className="text-gray-600 text-sm sm:text-base">
          Carregando perfil...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 sm:p-6 md:p-8 flex flex-col items-center justify-center min-h-[60vh]">
        <div className="max-w-md w-full p-4 sm:p-6 bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200">
          <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-red-100 flex items-center justify-center">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
            Ocorreu um erro
          </h3>
          <p className="text-red-600 mb-4 sm:mb-6 text-sm sm:text-base break-words">
            {error}
          </p>
          <Link
            href="/agente/perfil"
            className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium w-full"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para perfil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto px-3 xs:px-4 sm:px-5 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        {/* Container principal */}
        <div className="max-w-5xl mx-auto">
          {/* Cabeçalho Aprimorado */}
          <div className="mb-8 sm:mb-10 lg:mb-12 relative">
            {/* Fundo decorativo sutil */}
            <div className="absolute inset-0 -top-4 sm:-top-6 -mx-4 sm:-mx-6 lg:-mx-8 h-40 sm:h-48 bg-gradient-to-br from-blue-50/30 via-white to-purple-50/30 rounded-b-2xl sm:rounded-b-3xl pointer-events-none" />

            <div className="relative">
              {/* Botão de voltar com posicionamento absoluto em telas maiores */}
              <div className="flex justify-between items-start mb-6 sm:mb-0">
                <Link
                  href="/agente/perfil"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 group transition-all duration-200 text-sm sm:text-base bg-white/80 backdrop-blur-sm sm:bg-transparent px-3 py-2 sm:px-0 sm:py-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="font-medium group-hover:text-blue-600">
                    Voltar para perfil
                  </span>
                </Link>
              </div>

              {/* Conteúdo */}
              <div className="text-center pt-4 sm:pt-8 lg:pt-12 pb-6 sm:pb-8">
                {/* Ícone decorativo */}
                <div className="flex justify-center mb-4 sm:mb-6">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center border-4 border-white shadow-sm">
                    <svg
                      className="w-6 h-6 sm:w-7 sm:h-7 lg:w-8 lg:h-8 text-blue-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Título principal */}
                <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                  Edição de Perfil
                </h1>

                {/* Descrição */}
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-xl mx-auto px-4 leading-relaxed">
                  Revise e atualize suas informações pessoais, de contato e
                  preferências
                </p>

                {/* Indicador de progresso (opcional) */}
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="w-8 sm:w-12 h-1 bg-blue-300"></div>
                    <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                    <div className="w-8 sm:w-12 h-1 bg-gray-200"></div>
                    <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {agente ? (
              <div className="p-3 xs:p-4 sm:p-6 lg:p-8">
                {/* Passe a função de callback para o componente filho */}
                <EditarAgente agente={agente} onSuccess={handleEdicaoSuccess} />
              </div>
            ) : (
              <div className="p-4 sm:p-6 md:p-8 text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 mx-auto mb-3 sm:mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Agente não encontrado
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Não foi possível carregar as informações do agente.
                </p>
                <Link
                  href="/agente/perfil"
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para perfil
                </Link>
              </div>
            )}
          </div>

          {/* Rodapé informativo */}
          <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 p-3 xs:p-4 sm:p-6 bg-blue-50 rounded-lg border border-blue-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-blue-900 text-xs xs:text-sm sm:text-base">
                  Informação importante
                </h4>
                <p className="text-blue-700 text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed">
                  As alterações feitas aqui serão refletidas imediatamente no
                  seu perfil. Certifique-se de que todas as informações estão
                  corretas antes de salvar.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
