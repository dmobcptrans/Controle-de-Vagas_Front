'use client';

import { useState } from 'react';
import { ChevronDown, Clock3, Hourglass, Ruler } from 'lucide-react';
import type { VagaResponse } from '@/features/vaga/vagas/types/vaga';

interface Props {
  vaga: VagaResponse;
  onNext: () => void;
}

const DIAS_SEMANA = [
  { key: 'DOMINGO', label: 'Domingo' },
  { key: 'SEGUNDA', label: 'Segunda' },
  { key: 'TERCA', label: 'Terça' },
  { key: 'QUARTA', label: 'Quarta' },
  { key: 'QUINTA', label: 'Quinta' },
  { key: 'SEXTA', label: 'Sexta' },
  { key: 'SABADO', label: 'Sábado' },
] as const;

// Tempo máximo de permanência (em horas) por cor da vaga
const TEMPO_MAXIMO_POR_AREA: Record<
  string,
  { label: string; horas: number; dot: string }
> = {
  VERMELHA: { label: 'Vermelha', horas: 1, dot: 'bg-red-500' },
  AMARELA: { label: 'Amarela', horas: 2, dot: 'bg-yellow-400' },
  AZUL: { label: 'Azul', horas: 4, dot: 'bg-blue-500' },
  BRANCA: { label: 'Branca', horas: 6, dot: 'bg-white border border-gray-300' },
};

const hhmm = (t: string) => t.slice(0, 5);

const formatHorario = (inicio: string, fim: string) =>
  hhmm(inicio) === '00:00' && hhmm(fim) === '23:59'
    ? '24h'
    : `${hhmm(inicio)} - ${hhmm(fim)}`;

type Operacao = VagaResponse['operacoesVaga'][number];

// ============================================================================
// COMPONENTE AUXILIAR: Card de informação (mesmo estilo do OptionCard)
// ============================================================================
function InfoCard({
  icon,
  title,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle?: React.ReactNode;
}) {
  return (
    <div className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 text-left">
      <div className="w-10 h-10 shrink-0 rounded-lg flex items-center justify-center border bg-gray-50 border-gray-100 text-gray-500">
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 tracking-wide truncate">
          {title}
        </p>
        {subtitle && (
          <div className="text-xs text-gray-500 truncate">{subtitle}</div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================
export default function InfoVaga({ vaga, onNext }: Props) {
  const [abertos, setAbertos] = useState<Record<string, boolean>>({});

  // agrupa os intervalos por dia da semana, ordenados por horário de início
  const operacoesPorDia = vaga.operacoesVaga.reduce<Record<string, Operacao[]>>(
    (acc, op) => {
      (acc[op.diaSemanaAsEnum] ??= []).push(op);
      return acc;
    },
    {},
  );
  Object.values(operacoesPorDia).forEach((ops) =>
    ops.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)),
  );

  const toggle = (key: string) =>
    setAbertos((prev) => ({ ...prev, [key]: !prev[key] }));

  const tempoMaximo = TEMPO_MAXIMO_POR_AREA[vaga.area];

  return (
    <div className="flex flex-col gap-3 sm:gap-4 justify-center w-full max-w-xl mx-auto px-2 sm:px-0">
      <p className="font-semibold mb-2 sm:mb-3 text-center text-base sm:text-lg">
        Informações da vaga
      </p>

      {/* ==================== CARACTERÍSTICAS ==================== */}
      {/* ==================== CARACTERÍSTICAS ==================== */}
      <div className="flex items-stretch w-full rounded-full border border-gray-200 bg-white overflow-hidden">
        {/* Comprimento */}
        <div className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5">
          <Ruler className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-gray-400" />
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {vaga.comprimento} m
            </p>
            <p className="text-[11px] sm:text-xs text-gray-500 truncate">
              Comprimento
            </p>
          </div>
        </div>

        {/* Divisor */}
        <div className="w-px bg-gray-200 my-2" />

        {/* Tempo máximo */}
        <div className="flex-1 min-w-0 flex items-center justify-center gap-2 px-3 sm:px-5 py-2.5">
          <Hourglass className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 text-gray-400" />
          <div className="min-w-0 leading-tight">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {tempoMaximo ? `${tempoMaximo.horas}h` : '—'}
            </p>
            <p className="flex items-center gap-1 text-[11px] sm:text-xs text-gray-500 truncate">
              Máx.
              {tempoMaximo && (
                <>
                  <span
                    className={`h-2 w-2 shrink-0 rounded-full ${tempoMaximo.dot}`}
                  />
                  {tempoMaximo.label}
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* ==================== HORÁRIOS DE FUNCIONAMENTO ==================== */}
      <div>
        <label className="flex items-center gap-2 font-semibold mb-2 text-sm sm:text-base">
          <Clock3 className="w-4 h-4 text-gray-500" />
          Horários de funcionamento:
        </label>

        <div className="space-y-2">
          {DIAS_SEMANA.map(({ key, label }) => {
            const ops = operacoesPorDia[key] ?? [];

            // dia sem operação
            if (ops.length === 0) {
              return (
                <div
                  key={key}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/60 text-sm text-gray-400"
                >
                  <span className="font-medium">{label}</span>
                  <span className="text-xs">Indisponível</span>
                </div>
              );
            }

            // dia com um único intervalo
            if (ops.length === 1) {
              return (
                <div
                  key={key}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-200 text-sm"
                >
                  <span className="font-semibold text-gray-900">{label}</span>
                  <span className="text-gray-600">
                    {formatHorario(ops[0].horaInicio, ops[0].horaFim)}
                  </span>
                </div>
              );
            }

            // dia com vários intervalos -> gaveta
            const aberto = !!abertos[key];
            return (
              <div
                key={key}
                className={`w-full rounded-xl border transition-all overflow-hidden ${
                  aberto
                    ? 'border-blue-500 bg-blue-50/60 ring-1 ring-blue-500'
                    : 'border-gray-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggle(key)}
                  aria-expanded={aberto}
                  className={`w-full flex items-center justify-between gap-2 p-3 text-sm text-left transition-all ${
                    aberto ? '' : 'hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <span className="font-semibold text-gray-900">{label}</span>

                  <span className="flex items-center gap-2 text-xs text-gray-500">
                    {ops.length} horários
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        aberto ? 'rotate-180 text-blue-600' : ''
                      }`}
                    />
                  </span>
                </button>

                {aberto && (
                  <div className="px-3 pb-3 space-y-1.5">
                    {ops.map((op) => (
                      <div
                        key={op.id}
                        className="flex items-center justify-between rounded-lg bg-white border border-blue-100 px-3 py-2 text-sm"
                      >
                        <span className="text-gray-500 text-xs">Horário</span>
                        <span className="font-medium text-gray-800">
                          {formatHorario(op.horaInicio, op.horaFim)}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ==================== BOTÕES ==================== */}


        <button
          className="w-full sm:w-auto px-4 cursor-pointer py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={onNext}
        >
          Próximo
        </button>
      </div>
  );
}
