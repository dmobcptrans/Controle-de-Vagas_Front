'use client';

import { deleteGestor } from '@/lib/api/gestorApi';
import { Gestor } from '@/lib/types/gestor';
import { cn } from '@/lib/utils';
import { Mail, Phone, Trash2, UserCircle } from 'lucide-react';
import router from 'next/router';
import { useState } from 'react';
import toast from 'react-hot-toast';

interface GestorCardProps {
  gestor: Gestor;
}

export default function GestorCard({ gestor }: GestorCardProps) {
  const [modalExcluirAberto, setModalExcluirAberto] = useState(false);

  const handleExcluir = async () => {
    try {
      await deleteGestor(gestor.id);
      router.back();
    } catch {
      toast.error('Erro ao excluir gestor. Tente novamente.');
    }
  };

  return (
    <>
      <article
        className={cn(
          'bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden',
          'hover:shadow-md transition-shadow',
        )}
      >
        {/* Header com nome e badge */}
        <div className="px-5 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <UserCircle className="w-9 h-9 text-yellow-500 flex-shrink-0" />
              <div className="min-w-0">
                <h3 className="text-base font-semibold text-gray-800 truncate">
                  {gestor.nome}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                  <p className="text-sm text-gray-600 truncate">
                    {gestor.email}
                  </p>
                </div>
              </div>
            </div>
            <span className="px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
              Gestor
            </span>
          </div>
        </div>

        {/* Informações do gestor */}
        <div className="px-5 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Telefone */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Telefone
                </span>
              </div>
              <p className="text-sm text-gray-800 font-medium pl-6">
                {gestor.telefone}
              </p>
            </div>

            {/* Espaço vazio ou informação adicional se tiver */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-gray-400" />
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Função
                </span>
              </div>
              <p className="text-sm text-gray-800 font-medium pl-6">Gestor</p>
            </div>
          </div>
        </div>

        {/* Botões */}
        <div className="px-5 pb-5 pt-4 border-t border-gray-100">
          <div className="flex gap-3">
            <button
              onClick={() => setModalExcluirAberto(true)}
              className={cn(
                'flex items-center justify-center gap-2',
                'bg-red-600 hover:bg-red-700 text-white',
                'rounded-lg transition-colors text-sm font-medium',
                'h-10 px-4 py-2.5 flex-1',
              )}
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir</span>
            </button>
          </div>
        </div>
      </article>

      {/* Modal de Confirmação de Exclusão */}
      {modalExcluirAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalExcluirAberto(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-3">
              Confirmar exclusão
            </h3>
            <p className="text-gray-600 mb-6">
              Tem certeza que deseja excluir o gestor{' '}
              <strong>{gestor.nome}</strong>? Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setModalExcluirAberto(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleExcluir}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
