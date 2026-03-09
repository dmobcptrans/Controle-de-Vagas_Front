'use client';

import { useDenuncias } from '@/components/hooksGerais/useDenuncias';
import { AlertCircle, Loader2 } from 'lucide-react';
import DenunciaLista from '@/components/gestor/denuncia/DenunciaLista';
import { Button } from '@/components/ui/button';

export default function DenunciasGestor() {
  const { denuncias, loading, error, refetch } = useDenuncias();

  if (error) {
    return (
      <div
        className="flex flex-col items-center justify-center min-h-[60vh] p-4 md:p-6 text-center"
        aria-busy="false"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-red-600" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
          Erro ao carregar denúncias
        </h3>
        <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto mb-6">
          {error}
        </p>
        <Button onClick={refetch} variant="outline">
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        className="p-4 md:p-6 flex flex-col items-center justify-center min-h-[60vh] gap-3"
        aria-busy="true"
      >
        <Loader2 className="animate-spin w-6 h-6 md:w-8 md:h-8 text-blue-600" />
        <p className="text-gray-600 text-sm md:text-base">
          Carregando denúncias...
        </p>
      </div>
    );
  }

  if (!denuncias.length) {
    return (
      <div className="p-4 md:p-6 flex flex-col items-center justify-center py-12 md:py-16 text-center min-h-[60vh]">
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gray-100 flex items-center justify-center mb-4">
          <AlertCircle className="w-8 h-8 md:w-10 md:h-10 text-gray-400" />
        </div>
        <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">
          Nenhuma denúncia encontrada
        </h3>
        <p className="text-gray-500 text-sm md:text-base max-w-md mx-auto">
          Nenhuma denúncia encontrada no momento.
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gray-50 py-8">
      <div className="w-full max-w-2xl mx-auto px-4 md:px-6 lg:px-8 flex flex-col gap-6">
        <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-gray-800 text-center">
          Denúncias
        </h1>
        <DenunciaLista denuncias={denuncias} onRefresh={refetch} />
      </div>
    </section>
  );
}
