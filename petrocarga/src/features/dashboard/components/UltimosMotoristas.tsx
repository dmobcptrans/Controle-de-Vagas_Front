'use client';

import Link from 'next/link';
import { User } from 'lucide-react';

import { MotoristaDaEmpresa } from '@/features/usuarios/(personas)/motoristas/hooks/useMotorista';

interface UltimosMotoristasProps {
  usuarioId?: string;
}

function SkeletonMotorista() {
  return (
    <div className="bg-gray-50/60 border border-gray-100 rounded-xl p-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-200 rounded-lg shrink-0" />

        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-3/4" />
          <div className="h-2.5 bg-gray-200 rounded w-1/2" />
        </div>

        <div className="w-2 h-2 bg-gray-200 rounded-full" />
      </div>
    </div>
  );
}

export function UltimosMotoristas({
  usuarioId,
}: UltimosMotoristasProps) {
  const {
    motoristas,
    loading,
  } = MotoristaDaEmpresa(usuarioId);

  const ultimosMotoristas = motoristas.slice(0, 4);

  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[#1351B4]/10 rounded-lg flex items-center justify-center">
            <User className="h-3.5 w-3.5 text-[#1351B4]" />
          </div>

          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
            Motoristas
          </p>
        </div>

        <Link
          href="/empresa/motoristas"
          className="text-xs text-[#1351B4] font-medium hover:underline"
        >
          Ver todos
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {loading ? (
          <>
            <SkeletonMotorista />
            <SkeletonMotorista />
            <SkeletonMotorista />
          </>
        ) : ultimosMotoristas.length === 0 ? (
          <div className="bg-gray-50/60 border border-dashed border-gray-200 rounded-xl py-8 text-center">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mx-auto mb-2 shadow-sm">
              <User className="h-5 w-5 text-gray-300" />
            </div>

            <p className="text-sm text-gray-400">
              Nenhum motorista cadastrado
            </p>
          </div>
        ) : (
          ultimosMotoristas.map((motorista) => (
            <Link
              key={motorista.id}
              href={`/empresa/motoristas/${motorista.id}`}
              className="group flex items-center gap-3 bg-gray-50/60 hover:bg-gray-50 p-3 rounded-xl transition-all border border-gray-100"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-800 truncate">
                  {motorista.nome}
                </p>

                <p className="text-xs text-gray-500 truncate">
                  {motorista.ativo ? 'Ativo' : 'Inativo'}
                </p>
              </div>

              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  motorista.ativo
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
                title={
                  motorista.ativo
                    ? 'Ativo'
                    : 'Inativo'
                }
              />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}