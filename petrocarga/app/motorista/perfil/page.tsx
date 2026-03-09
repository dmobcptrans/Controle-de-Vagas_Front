'use client';

import { buttonVariants } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useAuth } from '@/components/hooks/useAuth';
import { deleteMotorista, getMotoristaByUserId } from '@/lib/api/motoristaApi';
import { Motorista } from '@/lib/types/motorista';
import { cn } from '@/lib/utils';
import {
  UserIcon,
  Mail,
  Phone,
  FileText,
  Trash2,
  Fingerprint,
  IdCardIcon,
  Loader2,
  Edit,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function PerfilMotorista() {
  const [motorista, setMotorista] = useState<Motorista | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalAberto, setModalAberto] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;
    const fetchMotorista = async () => {
      setLoading(true);
      setError(null);

      try {
        const resultado = await getMotoristaByUserId(user.id);
        if (resultado.error) {
          setError(resultado.message || 'Erro ao buscar perfil');
        } else {
          setMotorista(resultado.motorista);
        }
      } catch {
        setError('Erro ao carregar informações do perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchMotorista();
  }, [user]);

  const handleExcluir = async () => {
    if (!user) return;

    try {
      const resultado = await deleteMotorista(user.id);

      if (resultado?.error) {
        // Sem alert
      } else {
        setModalAberto(false);
        await logout();
        router.push('/');
      }
    } catch {
      // Sem alert e sem console.error
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando perfil...</span>
      </div>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-red-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Erro ao carregar perfil
          </h2>
          <p className="text-gray-600 mb-4 break-words">{error}</p>
          <button
            onClick={() => router.push('/autorizacao/login')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition w-full sm:w-auto"
          >
            Fazer Login
          </button>
        </div>
      </main>
    );
  }

  if (!motorista) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <p className="text-gray-600">Nenhum dado encontrado.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-3 sm:px-4 py-4 md:py-8 min-h-[calc(100vh-4rem)]">
      <Card className="w-full max-w-4xl mx-auto shadow-sm md:shadow-lg">
        <CardHeader className="space-y-3 text-center pb-6 px-4 sm:px-6">
          <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center shadow-lg">
            <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Olá, {motorista.usuario.nome}!
          </CardTitle>
          <CardDescription className="text-sm sm:text-base px-2">
            Este é o seu perfil. Aqui você pode ver suas informações e atualizar
            seus dados conforme necessário.
          </CardDescription>
        </CardHeader>

        <div className="px-4 sm:px-6 pb-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {motorista.usuario.nome}
                </p>
              </div>
            </div>

            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {motorista.usuario.telefone}
                </p>
              </div>
            </div>

            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <IdCardIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">
                  Número da CNH
                </p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {motorista.numeroCnh}
                </p>
              </div>
            </div>

            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">Tipo da CNH</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {motorista.tipoCnh}
                </p>
              </div>
            </div>

            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Fingerprint className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">CPF</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {motorista.usuario.cpf}
                </p>
              </div>
            </div>

            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg col-span-1 sm:col-span-2 lg:col-span-1">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {motorista.usuario.email}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-6">
            <Link
              href={`/motorista/perfil/editar-perfil`}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'flex items-center justify-center gap-2 px-8 py-3 h-12 bg-blue-500 hover:bg-blue-600 text-white text-sm sm:text-base w-full sm:w-auto min-w-[150px] font-medium',
              )}
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Editar Perfil</span>
            </Link>

            <button
              onClick={() => setModalAberto(true)}
              className={cn(
                buttonVariants({ variant: 'destructive' }),
                'flex items-center justify-center gap-2 px-8 py-3 h-12 text-sm sm:text-base w-full sm:w-auto min-w-[150px] font-medium',
              )}
            >
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Excluir Conta</span>
            </button>
          </div>
        </div>
      </Card>

      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
            onClick={() => setModalAberto(false)}
          />
          <div className="relative bg-white rounded-xl sm:rounded-2xl p-5 sm:p-6 w-full max-w-sm sm:max-w-md md:max-w-lg shadow-2xl transform transition-all duration-300 scale-95 sm:scale-100 animate-scaleIn">
            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3">
              Confirmar exclusão
            </h3>
            <p className="text-sm sm:text-base text-gray-600 mb-6">
              Tem certeza que deseja excluir sua conta? Esta ação não pode ser
              desfeita e todos os seus dados serão permanentemente removidos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setModalAberto(false)}
                className="px-6 py-3 h-11 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition text-sm sm:text-base order-2 sm:order-1 min-w-[120px] font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                className="px-6 py-3 h-11 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm sm:text-base order-1 sm:order-2 min-w-[120px] font-medium"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
