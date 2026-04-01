'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
  CalendarPlus,
  Archive,
  TriangleAlert,
  User,
  Info,
  MapPin,
  Clock,
  Truck,
} from 'lucide-react';
import { getReservasPorUsuario } from '@/lib/api/reservaApi';
import { getDenunciasByUsuario } from '@/lib/api/denunciaApi';
import { useCallback, useEffect, useState } from 'react';
import { ReservaGet } from '@/lib/types/reserva';
import { Denuncia } from '@/lib/types/denuncias';
import toast from 'react-hot-toast';
import { useNotifications } from '@/context/NotificationContext';

const statusConfig = {
  ATIVA: {
    label: 'Ativa',
    className: 'bg-green-100 text-green-900',
  },
  RESERVADA: {
    label: 'Reservada',
    className: 'bg-green-100 text-green-900',
  },
  CONCLUIDA: {
    label: 'Concluída',
    className: 'bg-gray-100 text-gray-600',
  },
  CANCELADA: {
    label: 'Cancelada',
    className: 'bg-gray-100 text-gray-500',
  },
  REMOVIDA: {
    label: 'Removida',
    className: 'bg-gray-100 text-red-600',
  },
} as const;

type StatusKey = keyof typeof statusConfig;

function StatusBadge({ status }: { status: StatusKey }) {
  const { label, className } = statusConfig[status];
  return (
    <span
      className={`text-[10px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${className}`}
    >
      {label}
    </span>
  );
}

const formatarData = (data: string) =>
  new Date(data).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

function SkeletonCard() {
  return (
    <div className="bg-white border border-gray-100 rounded-xl px-4 py-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 rounded-lg flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 bg-gray-100 rounded w-3/4" />
          <div className="h-2.5 bg-gray-100 rounded w-1/2" />
        </div>
        <div className="h-5 w-16 bg-gray-100 rounded-full" />
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [reservas, setReservas] = useState<ReservaGet[]>([]);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  const fetchDados = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [resReservas, resDenuncias] = await Promise.allSettled([
        getReservasPorUsuario(user.id, 0, 100), // Pega até 100 reservas para o dashboard
        getDenunciasByUsuario(user.id),
      ]);

      // CORREÇÃO: extrai o array do objeto paginado
      if (resReservas.status === 'fulfilled') {
        const reservasData = resReservas.value;
        // Se for objeto paginado, pega o content; se for array direto, usa como está
        const reservasArray = Array.isArray(reservasData)
          ? reservasData
          : reservasData?.content || [];
        setReservas(reservasArray);
      } else {
        toast.error('Não foi possível carregar suas reservas.');
        setReservas([]);
      }

      if (resDenuncias.status === 'fulfilled') {
        setDenuncias(resDenuncias.value ?? []);
      } else {
        toast.error('Não foi possível carregar suas denúncias.');
        setDenuncias([]);
      }
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  const primeiroNome = user?.nome?.split(' ')[0] ?? 'Motorista';
  const totalReservas = reservas.length;
  const reservasAtivas = reservas.filter((r) => r.status === 'ATIVA').length;
  const totalDenuncias = denuncias.length;

  const hoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const acoes = [
    {
      href: '/motorista/reservas',
      icon: <Archive className="h-5 w-5" />,
      label: 'Histórico',
      desc: 'Todas as reservas',
      iconClass: 'bg-amber-50 text-amber-700',
    },
    {
      href: '/motorista/reservas/minhas-denuncias',
      icon: <TriangleAlert className="h-5 w-5" />,
      label: 'Denúncias',
      desc: 'Ocorrências',
      iconClass: 'bg-red-50 text-red-700',
    },
    {
      href: '/motorista/veiculos/meus-veiculos',
      icon: <Truck className="h-5 w-5" />,
      label: 'Meu veículo',
      desc: 'Ver cadastro',
      iconClass: 'bg-green-50 text-green-700',
    },
    {
      href: '/motorista/perfil',
      icon: <User className="h-5 w-5" />,
      label: 'Meu perfil',
      desc: 'Dados pessoais',
      iconClass: 'bg-violet-50 text-violet-700',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ── Header ── */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Bem vindo, {primeiroNome}!
          </h1>
          <p className="text-xs text-white/50 capitalize">{hoje}</p>
        </div>
      </header>

      {/* ── Corpo ── */}
      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* CTA flutuante */}
        <div className="-mt-4 mb-5">
          <Link
            href="/motorista/reservar-vaga"
            className="flex items-center justify-between bg-[#071D41] hover:bg-[#0C3D8A] transition-colors rounded-2xl px-5 py-4 border-l-4 border-[#FFCD07]"
          >
            <div>
              <p className="text-white font-semibold text-[15px] mb-0.5">
                Reservar uma vaga
              </p>
              <p className="text-white/60 text-xs">
                Encontre e reserve sua vaga agora
              </p>
            </div>
            <div className="bg-white/15 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
              <CalendarPlus className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          {[
            { num: totalReservas, label: 'Total de reservas', accent: false },
            { num: reservasAtivas, label: 'Ativa agora', accent: true },
            { num: totalDenuncias, label: 'Denúncias', accent: false },
          ].map(({ num, label, accent }) => (
            <div
              key={label}
              className="bg-white border border-gray-100 rounded-xl py-3 px-2 text-center"
            >
              <p
                className={`text-2xl font-bold ${accent ? 'text-[#168821]' : 'text-[#071D41]'}`}
              >
                {loading ? '—' : num}
              </p>
              <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">
                {label}
              </p>
            </div>
          ))}
        </div>

        {/* Últimas reservas */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Últimas reservas
            </p>
            <Link
              href="/motorista/reservas"
              className="text-xs text-[#1351B4] font-medium hover:underline"
            >
              Ver todas
            </Link>
          </div>

          <div className="flex flex-col gap-1.5">
            {loading ? (
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : reservas.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-200 rounded-xl py-8 text-center">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Archive className="h-5 w-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  Nenhuma reserva encontrada
                </p>
              </div>
            ) : (
              reservas
                .sort(
                  (a, b) =>
                    new Date(b.inicio).getTime() - new Date(a.inicio).getTime(),
                )
                .slice(0, 3)
                .map((r) => (
                  <Link
                    key={r.id}
                    href="/motorista/reservas"
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl shadow-sm hover:shadow-md transition-all border-l-4 border-[#1351B4]"
                  >
                    <div className="flex-1 flex flex-col gap-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {r.logradouro}
                        </p>

                        <StatusBadge status={r.status as StatusKey} />
                      </div>

                      <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {r.cidadeOrigem}
                      </p>

                      <div className="flex flex-wrap gap-3 text-xs text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          Início: {formatarData(r.inicio)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-gray-400" />
                          Fim: {formatarData(r.fim)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </div>

        {/* Acesso rápido */}
        <div className="mb-5">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2.5">
            Acesso rápido
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {acoes.map(({ href, icon, label, desc, iconClass }) => (
              <Link
                key={href}
                href={href}
                className="bg-white border border-gray-100 hover:border-[#1351B4] hover:bg-blue-50/30 rounded-xl p-4 flex flex-col items-center gap-3 transition-colors"
              >
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconClass}`}
                >
                  {icon}
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-gray-800">{label}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tutorial */}
        <Link
          href="/motorista/guia"
          className="flex items-center gap-4 bg-white border border-gray-100 border-l-4 border-l-[#1351B4] rounded-xl p-4 hover:bg-blue-50/30 transition-colors"
        >
          <div className="bg-blue-50 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
            <Info className="h-5 w-5 text-[#1351B4]" />
          </div>
          <div>
            <p className="text-sm font-semibold text-[#071D41]">
              Novo por aqui?
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Veja como usar o sistema em 3 passos simples
            </p>
          </div>
        </Link>
      </main>
    </div>
  );
}
