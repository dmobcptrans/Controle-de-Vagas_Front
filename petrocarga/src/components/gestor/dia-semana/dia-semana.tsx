import React, { useState, useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { OperacoesVaga } from '@/lib/types/vaga';

interface DiaSemanaProps {
  name?: string;
  operacoesVaga?: OperacoesVaga[];
}

/**
 * @component DiaSemana
 * @version 1.0.0
 * 
 * @description Componente de seleção de dias da semana com horários para operação de vagas.
 * Permite ativar/desativar dias e definir horários de início e fim.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {string} [name='diaSemana'] - Nome do campo hidden para envio do JSON
 * @property {OperacoesVaga[]} [operacoesVaga=[]] - Lista de operações existentes para pré-carregamento
 * 
 * ----------------------------------------------------------------------------
 * 📋 FUNCIONALIDADES:
 * ----------------------------------------------------------------------------
 * 
 * 1. LISTA DE DIAS:
 *    - Domingo, Segunda-feira, Terça-feira, Quarta-feira, Quinta-feira, Sexta-feira, Sábado
 *    - Abreviação para mobile (Dom, Seg, Ter, Qua, Qui, Sex, Sáb)
 * 
 * 2. CHECKBOX:
 *    - Ativa/desativa o dia
 *    - Quando desativado, os inputs de horário são ocultados
 * 
 * 3. HORÁRIOS:
 *    - Input type="time" para início e fim
 *    - Formato HH:MM
 * 
 * 4. VALOR HIDDEN:
 *    - Gera JSON com os dias ativos e seus horários
 *    - Compatível com a action atualizarVaga
 *    - Formato: [{ codigoDiaSemana, horaInicio, horaFim }]
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - CONFIGURAÇÃO INICIAL: getInitialConfig() pré-carrega operações existentes
 * - ESTADO LOCAL: diasConfig gerencia ativo/horários de cada dia
 * - MEMO: hiddenValue recalcula apenas quando diasConfig muda
 * - RESPONSIVIDADE: labels com abreviação em mobile, texto completo em desktop
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - Checkbox: Componente de checkbox do shadcn/ui
 * - Label: Componente de label do shadcn/ui
 * - Input: Componente de input do shadcn/ui
 * 
 * @example
 * ```tsx
 * // Criação de nova vaga (sem horários pré-definidos)
 * <DiaSemana name="diaSemana" />
 * 
 * // Edição de vaga existente (com horários pré-carregados)
 * <DiaSemana
 *   name="diaSemana"
 *   operacoesVaga={vaga.operacoesVaga}
 * />
 * ```
 */

export default function DiaSemana({
  name = 'diaSemana',
  operacoesVaga = [],
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

  type DiaConfig = {
    ativo: boolean;
    horaInicio: string;
    horaFim: string;
  };

  type DiasConfig = {
    [key: string]: DiaConfig;
  };

  // ==================== CONFIGURAÇÃO INICIAL ====================
  const getInitialConfig = () => {
    const config: DiasConfig = {};

    diasDaSemana.forEach((dia) => {
      const operacao = operacoesVaga.find(
        (op) => op.diaSemanaAsEnum === dia.enum,
      );

      if (operacao) {
        config[dia.value] = {
          ativo: true,
          horaInicio: operacao.horaInicio.slice(0, 5),
          horaFim: operacao.horaFim.slice(0, 5),
        };
      } else {
        config[dia.value] = {
          ativo: false,
          horaInicio: '00:00',
          horaFim: '13:00',
        };
      }
    });

    return config;
  };

  const [diasConfig, setDiasConfig] = useState<DiasConfig>(() =>
    getInitialConfig(),
  );

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
    tipo: 'horaInicio' | 'horaFim',
    valor: string,
  ) => {
    setDiasConfig((prev) => ({
      ...prev,
      [dayValue]: {
        ...prev[dayValue],
        [tipo]: valor,
      },
    }));
  };

  // ==================== VALOR HIDDEN (JSON) ====================
  const hiddenValue = useMemo(() => {
    return JSON.stringify(
      Object.entries(diasConfig)
        .filter(([, config]) => config.ativo)
        .map(([dia, config]) => ({
          codigoDiaSemana: Number(dia),
          horaInicio: config.horaInicio,
          horaFim: config.horaFim,
        })),
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

            {/* ==================== CAMPOS DE HORÁRIO (se ativo) ==================== */}
            {diasConfig[dia.value].ativo && (
              <div className="flex flex-col sm:flex-row gap-3 pl-0 sm:pl-6">
                <div className="flex-1">
                  <label
                    htmlFor={`${dia.id}-inicio`}
                    className="text-xs md:text-sm text-gray-600 mb-1 block"
                  >
                    Início
                  </label>
                  <Input
                    className="rounded-sm border-gray-400 w-full text-sm md:text-base"
                    type="time"
                    id={`${dia.id}-inicio`}
                    value={diasConfig[dia.value].horaInicio}
                    onChange={(e) =>
                      handleHorarioChange(
                        dia.value,
                        'horaInicio',
                        e.target.value,
                      )
                    }
                  />
                </div>

                <div className="flex-1">
                  <label
                    htmlFor={`${dia.id}-fim`}
                    className="text-xs md:text-sm text-gray-600 mb-1 block"
                  >
                    Fim
                  </label>
                  <Input
                    className="rounded-sm border-gray-400 w-full text-sm md:text-base"
                    type="time"
                    id={`${dia.id}-fim`}
                    value={diasConfig[dia.value].horaFim}
                    onChange={(e) =>
                      handleHorarioChange(dia.value, 'horaFim', e.target.value)
                    }
                  />
                </div>
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