'use client';

import { CalendarPlus } from 'lucide-react';

import { useAuth } from '@/features/usuarios/auth/service/useAuth';

import { useDenuncias } from '@/features/denuncias/hooks/useDenuncias';
import { useReservas } from '@/features/reserva/reservas/hooks/useReservas';

import PageHeader from '@/components/ui/pageHeader';
import { CTA } from '@/components/ui/CTA/CTA';

import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { UltimasReservas } from '@/features/dashboard/components/UltimasReservas';
import { AcessoRapido } from '@/features/dashboard/components/AcessoRapido';
import { DashboardTutorial } from '@/features/dashboard/components/DashboardTutorial';
import { ReservaPorUsuarioResponse } from '@/features/reserva/reservas/types/reservas';
import { useEffect } from 'react';

export default function Dashboard() {
  const { user } = useAuth();

  const { buscarPorUsuario: buscarReservas, reservas, loading: loadingReservas } = useReservas<ReservaPorUsuarioResponse>({usuarioId: user?.id});

  const {
    buscarPorUsuario,
    denuncias,
    loading: loadingDenuncias,
  } = useDenuncias({ buscarAutomaticamente: false });

  useEffect(() => {
    if (user?.id) {
      buscarPorUsuario(user.id);
      buscarReservas();
    }
  }, [user?.id, buscarPorUsuario, buscarReservas]);

  const loading = loadingReservas || loadingDenuncias;

  const primeiroNome = user?.nome?.split(' ')[0] ?? 'Motorista';

  const totalReservas = reservas.length;

  const reservasAtivas = reservas.filter(
    (reserva) => reserva.status === 'ATIVA',
  ).length;

  const totalDenuncias = denuncias.length;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <PageHeader
        title={
          <>
            Bem-vindo, <span className="font-bold">{primeiroNome}</span>!
          </>
        }
        showCurrentDate
      />

      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        <div className="-mt-4 mb-5">
          <CTA
            href="/reservar-vaga"
            title="Reservar uma vaga"
            description="Encontre e faça uma reserva rápida"
            icon={<CalendarPlus className="h-5 w-5 text-white" />}
          />
        </div>

        <DashboardStats
          totalReservas={totalReservas}
          reservasAtivas={reservasAtivas}
          totalDenuncias={totalDenuncias}
          loading={loading}
        />

        <UltimasReservas reservas={reservas} loading={loading} />

        <AcessoRapido permissao={user?.permissao} />

        <DashboardTutorial />
      </main>
    </div>
  );
}
