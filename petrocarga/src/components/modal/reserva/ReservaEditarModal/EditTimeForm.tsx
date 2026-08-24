import TimeSelection from '../../../reserva/TimeSelection';

interface EditTimeFormProps {
  step: number;
  availableTimes: string[];
  reservedTimesStart: string[];
  reservedTimesEnd: string[];
  startHour: string | null;
  endHour: string | null;

  onSelectStart: (t: string) => void;
  onSelectEnd: (t: string) => void;

  onBackToStart: () => void; // 👈 NOVO
  onBack: () => void;
}

/**
 * @component EditTimeForm
 * @version 1.0.0
 * 
 * @description Componente de formulário para edição de horários em duas etapas.
 * Gerencia a seleção de horário inicial e final com validação automática.
 * 
 * ----------------------------------------------------------------------------
 * 📋 FLUXO COMPLETO:
 * ----------------------------------------------------------------------------
 * 
 * ETAPA 3 (step === 3) - SELEÇÃO DO HORÁRIO INICIAL:
 *    - Exibe TimeSelection para escolha do horário de início
 *    - Botão "Voltar" chama onBack
 *    - Ao selecionar, chama onSelectStart e avança para etapa 4
 * 
 * ETAPA 4 (step === 4) - SELEÇÃO DO HORÁRIO FINAL:
 *    - Exibe TimeSelection com horários filtrados (apenas posteriores ao início)
 *    - Filtro: horários > startHour (via toMinutes)
 *    - Botão "Voltar" chama onBackToStart (volta para etapa 3)
 *    - Ao selecionar, chama onSelectEnd
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - FILTRO AUTOMÁTICO: toMinutes() converte string para minutos para comparação
 * - DOIS BOTÕES DE VOLTAR:
 *   - onBack: retorna da etapa 3 para etapa 2
 *   - onBackToStart: retorna da etapa 4 para etapa 3
 * - RENDERIZAÇÃO CONDICIONAL: Exibe componente baseado no step
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - TimeSelection: Componente de seleção de horário
 * 
 * @example
 * ```tsx
 * <EditTimeForm
 *   step={step}
 *   availableTimes={availableTimes}
 *   reservedTimesStart={reservedTimesStart}
 *   reservedTimesEnd={reservedTimesEnd}
 *   startHour={startHour}
 *   endHour={endHour}
 *   onSelectStart={(t) => setStartHour(t)}
 *   onSelectEnd={(t) => setEndHour(t)}
 *   onBackToStart={() => setStep(3)}
 *   onBack={() => setStep(2)}
 * />
 * ```
 */

export function EditTimeForm({
  step,
  availableTimes,
  reservedTimesStart,
  reservedTimesEnd,
  startHour,
  endHour,
  onSelectStart,
  onSelectEnd,
  onBackToStart,
  onBack,
}: EditTimeFormProps) {
  
  /**
   * @function toMinutes
   * @description Converte string de hora para minutos
   * @param h - Hora no formato "HH:MM"
   * @returns Total de minutos desde meia-noite
   */
  const toMinutes = (h: string) => {
    const [hh, mm] = h.split(':').map(Number);
    return hh * 60 + mm;
  };

  return (
    <div className="w-full flex flex-col">
      
      {/* ==================== ETAPA 3: HORÁRIO INICIAL ==================== */}
      {step === 3 && (
        <div className="w-full">
          <TimeSelection
            times={availableTimes}
            reserved={reservedTimesStart}
            selected={startHour}
            onSelect={onSelectStart}
            onBack={onBack}
            color="blue"
          />
        </div>
      )}

      {/* ==================== ETAPA 4: HORÁRIO FINAL ==================== */}
      {step === 4 && startHour && (
        <div className="w-full">
          <TimeSelection
            // Filtra apenas horários posteriores ao início
            times={availableTimes.filter(
              (t) => toMinutes(t) > toMinutes(startHour),
            )}
            reserved={reservedTimesEnd}
            selected={endHour}
            onSelect={onSelectEnd}
            onBack={onBackToStart}
            color="blue"
          />
        </div>
      )}
    </div>
  );
}