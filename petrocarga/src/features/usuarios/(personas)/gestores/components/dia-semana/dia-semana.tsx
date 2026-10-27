import React, { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { OperacoesVaga } from '@/features/vaga/vagas/types/vaga';
import { Plus, Trash2 } from 'lucide-react';

interface DiaSemanaProps {
  name?: string;
  operacoesVaga?: OperacoesVaga[];
  /** Avisa o formulário se há intervalo inválido (vazio, fim <= início ou sobreposto). */
  onValidChange?: (valid: boolean) => void;
}

/**
 * @component DiaSemana
 * @version 2.0.0
 *
 * @description Seleção de dias da semana com VÁRIOS intervalos de horário
 * por dia. Cada intervalo vira um item de `operacoesVaga`, repetindo o
 * mesmo `codigoDiaSemana`:
 *
 *   { codigoDiaSemana: 2, horaInicio: "00:00", horaFim: "11:00" },
 *   { codigoDiaSemana: 2, horaInicio: "17:00", horaFim: "23:00" }
 *
 * ----------------------------------------------------------------------------
 * 🧠 MUDANÇAS EM RELAÇÃO À v1:
 * ----------------------------------------------------------------------------
 *
 * - DiaConfig: { ativo, horaInicio, horaFim } → { ativo, intervalos[] }
 * - getInitialConfig(): em vez de `find` (só pegava o 1º registro do dia),
 *   usa `filter` e carrega todos os intervalos daquele dia.
 * - hiddenValue: gera um item por intervalo (ordenados por horaInicio).
 * - Validação por intervalo, com mensagem inline e callback onValidChange.
 * - Compatível com o uso anterior: `name` e `operacoesVaga` continuam iguais.
 */

type Intervalo = { horaInicio: string; horaFim: string };

type DiaConfig = {
  ativo: boolean;
  intervalos: Intervalo[];
};

type DiasConfig = {
  [key: string]: DiaConfig;
};

const INTERVALO_PADRAO: Intervalo = { horaInicio: '00:00', horaFim: '13:00' };

/** Retorna uma mensagem de erro (ou null) por intervalo do dia. */
function validarIntervalos(intervalos: Intervalo[]): (string | null)[] {
  return intervalos.map((atual, i) => {
    if (!atual.horaInicio || !atual.horaFim) return 'Preencha início e fim';
    if (atual.horaFim <= atual.horaInicio)
      return 'O fim deve ser depois do início';

    const sobrepoe = intervalos.some(
      (outro, j) =>
        j !== i &&
        outro.horaInicio &&
        outro.horaFim &&
        atual.horaInicio < outro.horaFim &&
        outro.horaInicio < atual.horaFim,
    );
    return sobrepoe ? 'Sobrepõe outro horário deste dia' : null;
  });
}

export default function DiaSemana({
  name = 'diaSemana',
  operacoesVaga = [],
  onValidChange,
}: DiaSemanaProps) {
  // ==================== CONSTANTES ====================
  const diasDaSemana = [
    { id: 'dom', label: 'Domingo', value: '1', abrev: 'Dom', enum: 'DOMINGO' },
    { id: 'seg', label: 'Segunda-feira', value: '2', abrev: 'Seg', enum: 'SEGUNDA' },
    { id: 'ter', label: 'Terça-feira', value: '3', abrev: 'Ter', enum: 'TERCA' },
    { id: 'qua', label: 'Quarta-feira', value: '4', abrev: 'Qua', enum: 'QUARTA' },
    { id: 'qui', label: 'Quinta-feira', value: '5', abrev: 'Qui', enum: 'QUINTA' },
    { id: 'sex', label: 'Sexta-feira', value: '6', abrev: 'Sex', enum: 'SEXTA' },
    { id: 'sab', label: 'Sábado', value: '7', abrev: 'Sáb', enum: 'SABADO' },
  ];

  // ==================== CONFIGURAÇÃO INICIAL ====================
  const getInitialConfig = () => {
    const config: DiasConfig = {};

    diasDaSemana.forEach((dia) => {
      // filter (e não find): um dia pode ter vários intervalos
      const operacoesDoDia = operacoesVaga
        .filter(
          (op) =>
            op.diaSemanaAsEnum === dia.enum ||
            String(op.codigoDiaSemana) === dia.value,
        )
        .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio));

      if (operacoesDoDia.length > 0) {
        config[dia.value] = {
          ativo: true,
          intervalos: operacoesDoDia.map((op) => ({
            horaInicio: op.horaInicio.slice(0, 5),
            horaFim: op.horaFim.slice(0, 5),
          })),
        };
      } else {
        config[dia.value] = {
          ativo: false,
          intervalos: [{ ...INTERVALO_PADRAO }],
        };
      }
    });

    return config;
  };

  const [diasConfig, setDiasConfig] = useState<DiasConfig>(() =>
    getInitialConfig(),
  );

  // ==================== VALIDAÇÃO ====================
  const erros = useMemo(() => {
    const resultado: Record<string, (string | null)[]> = {};
    Object.entries(diasConfig).forEach(([dia, config]) => {
      resultado[dia] = config.ativo ? validarIntervalos(config.intervalos) : [];
    });
    return resultado;
  }, [diasConfig]);

  const valido = useMemo(
    () => Object.values(erros).every((lista) => lista.every((e) => !e)),
    [erros],
  );

  useEffect(() => {
    onValidChange?.(valido);
  }, [valido, onValidChange]);

  // ==================== HANDLERS ====================
  const handleDayToggle = (dayValue: string) => {
    setDiasConfig((prev) => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        ativo: !prev[dayValue].ativo,
      },
    }));
  };

  const handleHorarioChange = (
    dayValue: string,
    indice: number,
    tipo: keyof Intervalo,
    valor: string,
  ) => {
    setDiasConfig((prev) => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        intervalos: prev[dayValue].intervalos.map((intervalo, i) =>
          i === indice ? { ...intervalo, [tipo]: valor } : intervalo,
        ),
      },
    }));
  };

  const handleAdicionarIntervalo = (dayValue: string) => {
    setDiasConfig((prev) => {
      const atuais = prev[dayValue].intervalos;
      const ultimoFim = atuais[atuais.length - 1]?.horaFim ?? '';
      // Sugere começar onde o último intervalo terminou
      const horaInicio = ultimoFim && ultimoFim < '23:59' ? ultimoFim : '';

      return {
        ...prev,
        [dayValue]: {
          ...prev[dayValue],
          intervalos: [...atuais, { horaInicio, horaFim: '' }],
        },
      };
    });
  };

  const handleRemoverIntervalo = (dayValue: string, indice: number) => {
    setDiasConfig((prev) => {
      const restantes = prev[dayValue].intervalos.filter((_, i) => i !== indice);
      return {
        ...prev,
        [dayValue]: {
          // Remover o último intervalo desmarca o dia
          ativo: restantes.length > 0,
          intervalos:
            restantes.length > 0 ? restantes : [{ ...INTERVALO_PADRAO }],
        },
      };
    });
  };

  // ==================== VALOR HIDDEN (JSON) ====================
  const hiddenValue = useMemo(() => {
    return JSON.stringify(
      Object.entries(diasConfig)
        .filter(([, config]) => config.ativo)
        .flatMap(([dia, config]) =>
          [...config.intervalos]
            .sort((a, b) => a.horaInicio.localeCompare(b.horaInicio))
            .map((intervalo) => ({
              codigoDiaSemana: Number(dia),
              horaInicio: intervalo.horaInicio,
              horaFim: intervalo.horaFim,
            })),
        ),
    );
  }, [diasConfig]);

  return (
    <div className="w-full space-y-2 md:space-y-3">
      {diasDaSemana.map((dia) => (
        <div
          key={dia.id}
          className="border border-gray-300 rounded-md p-3 md:p-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex flex-col gap-3">
            {/* ==================== CHECKBOX + LABEL ==================== */}
            <div className="flex items-center space-x-2">
              <Checkbox
                className="border border-gray-500 flex-shrink-0"
                id={dia.id}
                checked={diasConfig[dia.value].ativo}
                onCheckedChange={() => handleDayToggle(dia.value)}
              />
              <Label
                htmlFor={dia.id}
                className="text-sm md:text-base font-medium cursor-pointer select-none"
              >
                <span className="md:hidden">{dia.abrev}</span>
                <span className="hidden md:inline">{dia.label}</span>
              </Label>
            </div>

            {/* ==================== INTERVALOS DE HORÁRIO (se ativo) ==================== */}
            {diasConfig[dia.value].ativo && (
              <div className="flex flex-col gap-3 pl-0 sm:pl-6">
                {diasConfig[dia.value].intervalos.map((intervalo, i) => {
                  const erro = erros[dia.value]?.[i];

                  return (
                    <div key={i} className="flex flex-col gap-1">
                      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
                        <div className="flex-1">
                          <label
                            htmlFor={`${dia.id}-inicio-${i}`}
                            className="text-xs md:text-sm text-gray-600 mb-1 block"
                          >
                            Início
                          </label>
                          <Input
                            className="rounded-sm border-gray-400 w-full text-sm md:text-base"
                            type="time"
                            id={`${dia.id}-inicio-${i}`}
                            value={intervalo.horaInicio}
                            onChange={(e) =>
                              handleHorarioChange(
                                dia.value,
                                i,
                                'horaInicio',
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <div className="flex-1">
                          <label
                            htmlFor={`${dia.id}-fim-${i}`}
                            className="text-xs md:text-sm text-gray-600 mb-1 block"
                          >
                            Fim
                          </label>
                          <Input
                            className="rounded-sm border-gray-400 w-full text-sm md:text-base"
                            type="time"
                            id={`${dia.id}-fim-${i}`}
                            value={intervalo.horaFim}
                            onChange={(e) =>
                              handleHorarioChange(
                                dia.value,
                                i,
                                'horaFim',
                                e.target.value,
                              )
                            }
                          />
                        </div>

                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="self-end flex-shrink-0"
                          aria-label={`Remover horário ${i + 1} de ${dia.label}`}
                          onClick={() => handleRemoverIntervalo(dia.value, i)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      {erro && (
                        <span className="text-xs text-red-600">{erro}</span>
                      )}
                    </div>
                  );
                })}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-fit rounded-sm"
                  onClick={() => handleAdicionarIntervalo(dia.value)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Adicionar horário
                </Button>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* ==================== CAMPO HIDDEN PARA SUBMIT ==================== */}
      <input type="hidden" name={name} value={hiddenValue} />
    </div>
  );
}