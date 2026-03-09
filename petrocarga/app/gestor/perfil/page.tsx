'use client';

import { useAuth } from '@/components/hooks/useAuth';
import { Gestor } from '@/lib/types/gestor';
import { getGestorByUserId } from '@/lib/api/gestorApi';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  Fingerprint,
  Loader2,
  Mail,
  Phone,
  UserIcon,
  Edit,
} from 'lucide-react';
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';

export default function PerfilGestor() {
  const [gestor, setGestor] = useState<Gestor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user?.id) return;
    const fetchGestor = async () => {
      setLoading(true);
      setError(null);

      try {
        const resultado = await getGestorByUserId(user.id);
        if (resultado.error) {
          setError(resultado.message || 'Erro ao buscar perfil');
        } else {
          setGestor(resultado.gestor);
        }
      } catch (err) {
        setError('Erro ao carregar informações do perfil. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    fetchGestor();
  }, [user]);

  // Estado de carregamento
  if (loading) {
    return (
      <main className="container mx-auto px-4 py-8 flex items-center justify-center min-h-[calc(100vh-4rem)]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  // Estado de erro
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

  // Se não houver gestor
  if (!gestor) {
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
            Olá, {gestor.nome}!
          </CardTitle>
          <CardDescription className="text-sm sm:text-base px-2">
            Este é o seu perfil. Aqui você pode ver suas informações e atualizar
            seus dados conforme necessário.
          </CardDescription>
        </CardHeader>

        <div className="px-4 sm:px-6 pb-6 space-y-6">
          {/* Grid de informações responsivo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Nome */}
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <UserIcon className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Nome</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                  {gestor.nome}
                </p>
              </div>
            </div>

            {/* Telefone */}
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Phone className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Telefone</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {gestor.telefone}
                </p>
              </div>
            </div>

            {/* CPF */}
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Fingerprint className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">CPF</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {gestor.cpf}
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start sm:items-center space-x-3 p-4 bg-gray-50 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5 sm:mt-0" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base sm:text-lg font-semibold text-gray-900 break-all">
                  {gestor.email}
                </p>
              </div>
            </div>
          </div>

          {/* Botão de Ação */}
          <div className="flex justify-center pt-6">
            <Link
              href={`/gestor/perfil/editar-perfil`}
              className="flex items-center justify-center gap-2 px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition text-sm sm:text-base w-full sm:w-auto min-w-[150px] font-medium"
            >
              <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
              <span>Editar Perfil</span>
            </Link>
          </div>
        </div>
      </Card>
    </main>
  );
}
