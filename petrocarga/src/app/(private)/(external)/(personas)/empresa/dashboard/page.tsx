'use client';

import { useAuth } from '@/features/usuarios/auth/service/useAuth';
import { useDenuncias } from '@/features/denuncias/hooks/useDenuncia';
import { useReservas } from '@/features/reserva/reservas/hooks/useReserva';

import PageHeader from '@/components/ui/pageHeader';
import { CTA } from '@/components/ui/CTA/CTA';
import { AcessoRapido } from '@/features/dashboard/components/AcessoRapido';

import { DashboardStats } from '@/features/dashboard/components/DashboardStats';
import { UltimasReservas } from '@/features/dashboard/components/UltimasReservas';
import { DashboardTutorial } from '@/features/dashboard/components/DashboardTutorial';

import { UltimosMotoristas } from '@/features/dashboard/components/UltimosMotoristas';
import { CalendarPlus } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();

  const {
    reservas,
    loading: loadingReservas,
  } = useReservas(user?.id);

  const {
    denuncias,
    loading: loadingDenuncias,
  } = useDenuncias(user?.id);

  const loading =
    loadingReservas || loadingDenuncias;

  const primeiroNome =
    user?.nome?.split(' ')[0] ?? 'Empresa';

  const totalReservas =
    reservas.length;

  const reservasAtivas =
    reservas.filter(
      (reserva) => reserva.status === 'ATIVA',
    ).length;

  const totalDenuncias =
    denuncias.length;

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      <PageHeader
        title={
          <>
            Bem-vindo,{' '}
            <span className="font-bold">
              {primeiroNome}
            </span>
            !
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
            icon={
              <CalendarPlus className="h-5 w-5 text-white" />
            }
          />
        </div>

        <DashboardStats
          totalReservas={totalReservas}
          reservasAtivas={reservasAtivas}
          totalDenuncias={totalDenuncias}
          loading={loading}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          <div className="lg:col-span-2">
            <UltimasReservas
              reservas={reservas}
              loading={loading}
            />
          </div>

          <div className="lg:col-span-1">
            <UltimosMotoristas />
          </div>
        </div>

        {user?.permissao && (
          <AcessoRapido
            permissao={user.permissao}
          />
        )}

        <DashboardTutorial />
      </main>
    </div>
  );
}