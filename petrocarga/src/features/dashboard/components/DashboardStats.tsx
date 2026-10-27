import React from 'react';

interface DashboardStatsProps {
  totalReservas: number;
  reservasAtivas: number;
  totalDenuncias: number;
  loading: boolean;
}

export function DashboardStats({
  totalReservas,
  reservasAtivas,
  totalDenuncias,
  loading,
}: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-2.5 mb-5">
      <div className="bg-white border border-gray-100 rounded-xl py-3 px-2 text-center">
        <p className="text-2xl font-bold text-[#071D41]">
          {loading ? '—' : totalReservas}
        </p>

        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
          Total de reservas
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl py-3 px-2 text-center">
        <p className="text-2xl font-bold text-[#168821]">
          {loading ? '—' : reservasAtivas}
        </p>

        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
          Ativa agora
        </p>
      </div>

      <div className="bg-white border border-gray-100 rounded-xl py-3 px-2 text-center">
        <p className="text-2xl font-bold text-[#071D41]">
          {loading ? '—' : totalDenuncias}
        </p>

        <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
          Denúncias
        </p>
      </div>
    </div>
  );
}