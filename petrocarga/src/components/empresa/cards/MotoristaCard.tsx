'use client';

import { useState } from 'react';
import Link from 'next/link';
import { User, Building2, Unlink, ArrowRight, Loader2, Car } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '@/components/ui/button';
import { MotoristaEmpresa } from '@/lib/types/personas/empresa';

interface MotoristaCardProps {
  motorista: MotoristaEmpresa;
  onDesvincular: (motorista: MotoristaEmpresa) => void | Promise<void>;
}

// ==================== HELPERS ====================

function formatarCnpj(cnpj: string) {
  return cnpj.replace(
    /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
    '$1.$2.$3/$4-$5',
  );
}

// ==================== COMPONENTE ====================

export function MotoristaCard({
  motorista,
  onDesvincular,
}: MotoristaCardProps) {
  const [modalAberto, setModalAberto] = useState(false);
  const [isDesvinculando, setIsDesvinculando] = useState(false);

  const handleDesvincular = async () => {
    try {
      setIsDesvinculando(true);
      await onDesvincular(motorista);
      setModalAberto(false);
    } finally {
      setIsDesvinculando(false);
    }
  };

  return (
    <article
      className={cn(
        'flex flex-col bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow border-l-4 gap-4 w-full',
        'sm:flex-row sm:justify-between',
        'max-sm:gap-3 max-sm:p-3',
        motorista.ativo ? 'border-green-500' : 'border-gray-300',
      )}
    >
      {/* ==================== CONTEÚDO PRINCIPAL ==================== */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        {/* Header: nome + status (desktop) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-800 truncate leading-tight flex items-center gap-2">
            <User className="w-4 h-4 text-gray-400 shrink-0" />
            {motorista.nome || 'Nome não informado'}
          </h3>

          <div className="flex items-center">
            {/* Desktop: bolinha */}
            <span
              className={cn(
                'hidden sm:block h-3 w-3 rounded-full',
                motorista.ativo ? 'bg-green-500' : 'bg-gray-400',
              )}
              title={motorista.ativo ? 'Ativo' : 'Inativo'}
            />

            {/* Mobile: texto */}
            <span
              className={cn(
                'sm:hidden px-2 py-0.5 rounded-full text-xs font-semibold',
                motorista.ativo
                  ? 'bg-green-100 text-green-900'
                  : 'bg-gray-100 text-gray-600',
              )}
            >
              {motorista.ativo ? 'ATIVO' : 'INATIVO'}
            </span>
          </div>
        </div>

        {/* Empresa */}
        <p className="text-sm sm:text-base text-gray-500 flex items-center gap-1 truncate leading-tight">
          <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
          {motorista.empresaRazaoSocial}
        </p>

        {/* CNPJ */}
        <div className="flex flex-col sm:flex-row sm:flex-wrap gap-1 sm:gap-3 text-xs sm:text-sm text-gray-600">
          <span className="flex items-center gap-1 truncate">
            CNPJ: {formatarCnpj(motorista.empresaCnpj)}
          </span>
        </div>
      </div>

      {/* ==================== AÇÕES ==================== */}
      <div className="flex flex-col items-stretch sm:items-end gap-2 mt-2 sm:mt-0 w-full sm:w-auto">
        {/* Status (mobile) */}
        <span
          className={cn(
            'sm:hidden px-3 py-1 rounded-full text-xs font-semibold shadow-sm text-center',
            motorista.ativo
              ? 'bg-green-100 text-green-900'
              : 'bg-gray-100 text-gray-600',
          )}
        >
          {motorista.ativo ? 'ATIVO' : 'INATIVO'}
        </span>

        <div className="flex flex-col  sm:items-center gap-2 mt-2 w-full sm:w-auto">
          {/* Ver mais */}
          <Link
            href={`/empresas/motoristas/${motorista.id}`}
            className={cn(
              buttonVariants({ variant: 'default' }),
              'text-sm w-full sm:w-auto text-center flex items-center justify-center gap-2 py-2',
            )}
          >
            <Car className="w-4 h-4" />
          </Link>
        </div>
        {/* Desvincular */}
        <button
          onClick={() => setModalAberto(true)}
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'text-sm w-full sm:w-auto text-center flex items-center justify-center gap-2 py-2 text-red-600',
          )}
        >
          <Unlink className="w-4 h-4" />
        </button>
      </div>

      {/* ==================== MODAL DE DESVINCULAÇÃO ==================== */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-3 sm:px-0">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => !isDesvinculando && setModalAberto(false)}
          />
          <div className="relative bg-white rounded-2xl p-6 w-96 max-w-full shadow-2xl">
            <h3 className="text-xl font-semibold text-gray-800 mb-3 text-center">
              Desvincular motorista
            </h3>
            <p className="text-gray-600 mb-6 text-center">
              Tem certeza que deseja desvincular{' '}
              <span className="font-medium">{motorista.nome}</span> da empresa?
              Esta ação não pode ser desfeita.
            </p>
            <div className="flex justify-center gap-3 w-full">
              <button
                onClick={() => setModalAberto(false)}
                disabled={isDesvinculando}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition disabled:opacity-70 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
              <button
                onClick={handleDesvincular}
                disabled={isDesvinculando}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isDesvinculando ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Desvinculando...
                  </>
                ) : (
                  'Desvincular'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
