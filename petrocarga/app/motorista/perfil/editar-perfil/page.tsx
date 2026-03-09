'use client';

import EditarMotorista from '@/components/motorista/editar/edicao-perfil';
import { Motorista } from '@/lib/types/motorista';
import { ArrowLeft, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/components/hooks/useAuth';
import { useEffect, useState } from 'react';
import { getMotoristaByUserId } from '@/lib/api/motoristaApi';

export default function EditarMotoristaPage() {
  const { user } = useAuth();
  const params = useParams() as { id: string };
  const router = useRouter();

  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const handleEdicaoSuccess = () => {
    router.push('/motorista/perfil');
  };

  useEffect(() => {
    if (!user?.id) {
      setError('Usuário não autenticado.');
      setLoading(false);
      return;
    }
    const userId = user.id;
    if (!userId) return;

    async function fetchMotorista() {
      setLoading(true);
      setError('');

      try {
        const result = await getMotoristaByUserId(userId);

        if (result.error) {
          setError(result.motorista);
          setMotorista(null);
        } else {
          const m = result.motorista;
          if (!m) {
            setError('Motorista não encontrado.');
          } else {
            setMotorista(m);
          }
        }
      } catch (err) {
        setError('Erro ao buscar perfil do motorista.');
      } finally {
        setLoading(false);
      }
    }

    fetchMotorista();
  }, [user?.id, params.id]);

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando perfil do motorista...</span>
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
            href="/motorista/perfil"
            className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base font-medium w-full"
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
          {/* Cabeçalho Aprimorado para Motorista */}
          <div className="mb-8 sm:mb-10 lg:mb-12 relative">
            {/* Fundo decorativo sutil - cor diferente para motorista */}
            <div className="absolute inset-0 -top-4 sm:-top-6 -mx-4 sm:-mx-6 lg:-mx-8 h-40 sm:h-48 bg-gradient-to-br from-orange-50/30 via-white to-yellow-50/30 rounded-b-2xl sm:rounded-b-3xl pointer-events-none" />

            <div className="relative">
              {/* Botão de voltar com posicionamento absoluto em telas maiores */}
              <div className="flex justify-between items-start mb-6 sm:mb-0">
                <Link
                  href="/motorista/perfil"
                  className="inline-flex items-center text-gray-600 hover:text-gray-900 group transition-all duration-200 text-sm sm:text-base bg-white/80 backdrop-blur-sm sm:bg-transparent px-3 py-2 sm:px-0 sm:py-0 rounded-lg sm:rounded-none border border-gray-200 sm:border-none"
                >
                  <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
                  <span className="font-medium group-hover:text-orange-600">
                    Voltar para perfil
                  </span>
                </Link>

                {/* Indicador de etapa (opcional para telas grandes) */}
                <div className="hidden sm:flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                  <span>Editando perfil de motorista</span>
                </div>
              </div>

              {/* Conteúdo centralizado com destaque */}
              <div className="text-center pt-4 sm:pt-8 lg:pt-12 pb-6 sm:pb-8">
                {/* Ícone decorativo - específico para motorista */}
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
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>

                {/* Título principal */}
                <h1 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 tracking-tight mb-3">
                  Edição de Perfil
                </h1>

                {/* Descrição específica para motorista */}
                <p className="text-gray-600 text-base sm:text-lg lg:text-xl max-w-xl mx-auto px-4 leading-relaxed">
                  Atualize suas informações de condução, documentos e
                  disponibilidade
                </p>

                {/* Indicador de progresso (opcional) */}
                <div className="mt-6 sm:mt-8 flex justify-center">
                  <div className="flex items-center gap-1 sm:gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-600"></div>
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
            {motorista ? (
              <div className="p-3 xs:p-4 sm:p-6 lg:p-8">
                {/* Passe a função de callback para o componente filho */}
                <EditarMotorista
                  motorista={motorista}
                  onSuccess={handleEdicaoSuccess}
                />
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
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0zM21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-2">
                  Motorista não encontrado
                </h3>
                <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
                  Não foi possível carregar as informações do motorista.
                </p>
                <Link
                  href="/motorista/perfil"
                  className="inline-flex items-center justify-center px-4 py-2 sm:px-5 sm:py-2.5 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm sm:text-base font-medium"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar para perfil
                </Link>
              </div>
            )}
          </div>

          {/* Rodapé informativo específico para motorista */}
          <div className="mt-4 xs:mt-5 sm:mt-6 md:mt-8 p-3 xs:p-4 sm:p-6 bg-orange-50 rounded-lg border border-orange-100">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
              <div className="flex-shrink-0">
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-500"
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
                <h4 className="font-medium text-orange-900 text-xs xs:text-sm sm:text-base">
                  Informação importante para motoristas
                </h4>
                <p className="text-orange-700 text-xs sm:text-sm mt-0.5 sm:mt-1 leading-relaxed">
                  Certifique-se de manter seus documentos de habilitação e
                  veículo sempre atualizados. Informações incorretas podem
                  afetar sua elegibilidade para viagens.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
