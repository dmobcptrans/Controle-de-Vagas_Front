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
  CarIcon,
} from 'lucide-react';
import { getReservasRapidas } from '@/lib/api/reservaApi';
import { getDenuncias } from '@/lib/api/denunciaApi';
import { useCallback, useEffect, useState } from 'react';
import { Denuncia } from '@/lib/types/denuncias';
import toast from 'react-hot-toast';
import { useNotifications } from '@/context/NotificationContext';
import { ReservaRapida } from '@/lib/types/reservaRapida';

/**
 * Configuração de cores e rótulos para cada status de reserva rápida
 */
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

/**
 * @component StatusBadge
 * @description Badge visual para exibir o status da reserva
 */
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

/**
 * @component SkeletonCard
 * @description Placeholder animado para carregamento das reservas
 */
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

/**
 * @component Dashboard
 * @version 1.0.0
 *
 * @description Página principal (dashboard) do agente.
 * Exibe resumo de reservas rápidas, estatísticas, últimas reservas e acesso rápido.
 *
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 *
 * 1. HEADER:
 *    - Saudação personalizada com nome do agente
 *    - Data atual formatada
 *
 * 2. ESTATÍSTICAS (3 cards):
 *    - Total de reservas rápidas
 *    - Reservas ativas no momento
 *    - Total de denúncias abertas
 *
 * 3. CTA CONSULTA DE PLACA:
 *    - Card destacado para consulta de placa
 *
 * 4. ÚLTIMAS RESERVAS:
 *    - Mostra as 3 reservas mais recentes
 *    - Exibe logradouro, bairro, horários e placa
 *    - Link "Ver todas" para página completa
 *
 * 5. ACESSO RÁPIDO (4 cards):
 *    - Histórico de reservas
 *    - Denúncias
 *    - Consultar placa
 *    - Meu perfil
 *
 * 6. NOTIFICAÇÕES:
 *    - Contador de não lidas (para badge)
 *
 * 7. TUTORIAL:
 *    - Link para página de tutorial
 *
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 *
 * - BUSCA PARALELA: Promise.allSettled para carregar reservas e denúncias
 * - TRATAMENTO DE PAGINAÇÃO: API retorna objeto com content (array)
 * - FALLBACK: Valores padrão quando não há dados
 * - LOADING: Skeleton cards durante carregamento
 * - NOTIFICAÇÕES: Contexto para contagem de não lidas
 *
 * ----------------------------------------------------------------------------
 * 🎨 CORES DOS STATUS:
 * ----------------------------------------------------------------------------
 *
 * | Status     | Label       | Cor                           |
 * |------------|-------------|-------------------------------|
 * | ATIVA      | Ativa       | 🟢 Verde (bg-green-100)       |
 * | RESERVADA  | Reservada   | 🟢 Verde (bg-green-100)       |
 * | CONCLUIDA  | Concluída   | ⚪ Cinza (bg-gray-100)         |
 * | CANCELADA  | Cancelada   | ⚪ Cinza (bg-gray-100)         |
 * | REMOVIDA   | Removida    | 🔴 Vermelho (bg-gray-100)      |
 *
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 *
 * - useAuth: Hook de autenticação
 * - getReservasRapidas: API de reservas rápidas
 * - getDenuncias: API de denúncias
 * - useNotifications: Contexto de notificações
 *
 * @example
 * ```tsx
 * <Dashboard />
 * ```
 */

export default function Dashboard() {
  const { user } = useAuth();
  const { notifications } = useNotifications();
  const [reservas, setReservas] = useState<ReservaRapida[]>([]);
  const [denuncias, setDenuncias] = useState<Denuncia[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter((n) => !n.lida).length;

  // ==================== BUSCA DE DADOS ====================
  const fetchDados = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [resReservas, resDenuncias] = await Promise.allSettled([
        getReservasRapidas(user.id, 0, 100),
        getDenuncias('ABERTA'),
      ]);

      // Tratamento de reservas rápidas (suporta paginação)
      if (resReservas.status === 'fulfilled') {
        const reservasData = resReservas.value;
        const reservasArray = Array.isArray(reservasData)
          ? reservasData
          : reservasData?.content || [];
        setReservas(reservasArray);
      } else {
        toast.error('Não foi possível carregar suas reservas.');
        setReservas([]);
      }

      // Tratamento de denúncias
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

  // ==================== DADOS DERIVADOS ====================
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

  // ==================== AÇÕES DE ACESSO RÁPIDO ====================
  const acoes = [
    {
      href: '/agente/lista-reserva',
      icon: <Archive className="h-5 w-5" />,
      label: 'Histórico',
      desc: 'Todas as reservas',
      iconClass: 'bg-amber-50 text-amber-700',
    },
    {
      href: '/agente/denuncias',
      icon: <TriangleAlert className="h-5 w-5" />,
      label: 'Denúncias',
      desc: 'Ocorrências',
      iconClass: 'bg-red-50 text-red-700',
    },
    {
      href: '/agente/consulta',
      icon: <Truck className="h-5 w-5" />,
      label: 'Consultar placa',
      desc: 'Veículos e infrações',
      iconClass: 'bg-green-50 text-green-700',
    },
    {
      href: '/agente/perfil',
      icon: <User className="h-5 w-5" />,
      label: 'Meu perfil',
      desc: 'Dados pessoais',
      iconClass: 'bg-violet-50 text-violet-700',
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f0]">
      {/* ==================== HEADER ==================== */}
      <header className="bg-blue-800 px-4 pt-1 pb-7 sm:px-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">
            Bem vindo, {primeiroNome}!
          </h1>
          <p className="text-xs text-white/50 capitalize">{hoje}</p>
        </div>
      </header>

      {/* ==================== CORPO PRINCIPAL ==================== */}
      <main className="px-4 sm:px-8 pb-16 max-w-4xl mx-auto">
        {/* CTA principal - Reservar vaga rápida */}
        <div className="-mt-4 mb-5">
          <Link
            href="/agente/reserva-rapida"
            className="flex items-center justify-between bg-[#071D41] hover:bg-[#0C3D8A] transition-colors rounded-2xl px-5 py-4 border-l-4 border-[#FFCD07]"
          >
            <div>
              <p className="text-white font-semibold text-[15px] mb-0.5">
                Reservar uma vaga
              </p>
              <p className="text-white/60 text-xs">
                Encontre e faça uma reserva rápida
              </p>
            </div>
            <div className="bg-white/15 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
              <CalendarPlus className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>

        {/* ==================== CARDS DE ESTATÍSTICAS ==================== */}
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

        {/* ==================== CTA CONSULTA DE PLACA ==================== */}
        <div className="mb-5">
          <Link
            href="/agente/consulta"
            className="flex items-center justify-between bg-white hover:bg-black/10 transition-colors rounded-2xl px-5 py-4 border-l-4 border-green-700 shadow-sm"
          >
            <div>
              <p className="text-black font-semibold text-[15px] mb-0.5">
                Consultar placa
              </p>
              <p className="text-gray-500 text-xs">
                Verifique veículos e possíveis infrações
              </p>
            </div>
            <div className="bg-green-700 rounded-xl w-11 h-11 flex items-center justify-center flex-shrink-0">
              <Truck className="h-5 w-5 text-white" />
            </div>
          </Link>
        </div>

        {/* ==================== ÚLTIMAS RESERVAS ==================== */}
        <div className="mb-5">
          <div className="flex items-center justify-between mb-2.5">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Últimas reservas
            </p>
            <Link
              href="/agente/lista-reserva"
              className="text-xs text-[#1351B4] font-medium hover:underline"
            >
              Ver todas
            </Link>
          </div>

          <div className="flex flex-col gap-1.5">
            {loading ? (
              // Estado de loading
              <>
                <SkeletonCard />
                <SkeletonCard />
                <SkeletonCard />
              </>
            ) : reservas.length === 0 ? (
              // Estado vazio
              <div className="bg-white border border-dashed border-gray-200 rounded-xl py-8 text-center">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Archive className="h-5 w-5 text-gray-300" />
                </div>
                <p className="text-sm text-gray-400">
                  Nenhuma reserva encontrada
                </p>
              </div>
            ) : (
              // Lista das 3 reservas mais recentes
              reservas
                .sort(
                  (a, b) =>
                    new Date(b.inicio).getTime() - new Date(a.inicio).getTime(),
                )
                .slice(0, 3)
                .map((r) => (
                  <Link
                    key={r.id}
                    href="/agente/lista-reserva"
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
                        {r.bairro}
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

                      <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
                        <CarIcon className="h-3 w-3 text-gray-400" />
                        {r.placa}
                      </p>
                    </div>
                  </Link>
                ))
            )}
          </div>
        </div>

        {/* ==================== ACESSO RÁPIDO ==================== */}
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

        {/* ==================== TUTORIAL ==================== */}
        <Link
          href="/agente/tutorial#relatorio"
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
