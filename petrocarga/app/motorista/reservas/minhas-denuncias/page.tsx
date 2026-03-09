'use client';

import { useAuth } from '@/context/AuthContext';
import { getDenunciasByUsuario } from '@/lib/api/denunciaApi';
import DenunciaLista from '@/components/motorista/cards/denuncia/DenunciaLista';

import { Denuncia } from '@/lib/types/denuncias';
import { Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';

export default function MinhasDenuncias() {
  const { user } = useAuth();
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;

    const fetchDenuncias = async () => {
      setLoading(true);

      try {
        const result = await getDenunciasByUsuario(user.id);
        setDenuncias(result ?? []);
      } catch {
        toast.error(
          'Erro ao carregar suas denúncias. Por favor, tente novamente mais tarde.',
        );
        setDenuncias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDenuncias();
  }, [user?.id]);

  if (loading) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-2 text-center">
        <Loader2 className="animate-spin w-6 h-6 text-blue-600" />
        <span className="text-gray-600">Carregando denúncias...</span>
      </div>
    );
  }

  if (!denuncias || denuncias.length === 0) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-500 text-lg">
          Você ainda não possui nenhuma denúncia cadastrada.
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl mx-auto px-4 flex flex-col gap-6">
        <h1 className="text-2xl font-bold text-gray-800 text-center">
          Denúncias
        </h1>

        <DenunciaLista denuncias={denuncias} />
      </div>
    </section>
  );
}
