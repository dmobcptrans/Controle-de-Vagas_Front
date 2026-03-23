interface TimeSelectionProps {
  times: string[];
  reserved: string[];
  selected: string | null;
  onSelect: (time: string) => void;
  onBack?: () => void;
  color?: 'blue' | 'green';
}

/**
 * @component TimeSelection
 * @version 1.0.0
 * 
 * @description Componente de seleção de horário em grid 3 colunas.
 * Exibe horários disponíveis, reservados e permite seleção.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {string[]} times - Lista de horários disponíveis (ex: ["08:00", "09:00"])
 * @property {string[]} reserved - Lista de horários já reservados (não selecionáveis)
 * @property {string | null} selected - Horário atualmente selecionado
 * @property {(time: string) => void} onSelect - Callback ao selecionar um horário
 * @property {() => void} [onBack] - Callback para voltar (botão opcional)
 * @property {'blue' | 'green'} [color='blue'] - Cor de destaque (azul ou verde)
 * 
 * ----------------------------------------------------------------------------
 * 🎨 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. HORÁRIOS DISPONÍVEIS:
 *    - Botões clicáveis
 *    - Cor de hover conforme prop color
 * 
 * 2. HORÁRIOS RESERVADOS:
 *    - Botões desabilitados
 *    - Estilo: bg-gray-300, cursor-not-allowed
 * 
 * 3. HORÁRIO SELECIONADO:
 *    - Destaque com cor sólida (bg-blue-600 ou bg-green-600)
 *    - Texto branco
 * 
 * 4. BOTÃO VOLTAR:
 *    - Exibido apenas se onBack for fornecido
 *    - Estilo: bg-gray-200, rounded
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - GRID: 3 colunas para layout responsivo
 * - CORES DINÂMICAS: hoverClass e selectedClass baseadas na prop color
 * - DESABILITADO: Botões reservados não são clicáveis
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - DaySelection: Seleção de dia
 * - EditTimeForm: Formulário de edição de horários
 * 
 * @example
 * ```tsx
 * // Seleção de horário inicial (azul)
 * <TimeSelection
 *   times={availableTimes}
 *   reserved={reservedTimesStart}
 *   selected={startHour}
 *   onSelect={setStartHour}
 *   onBack={() => setStep(2)}
 *   color="blue"
 * />
 * 
 * // Seleção de horário final (verde)
 * <TimeSelection
 *   times={availableTimes}
 *   reserved={reservedTimesEnd}
 *   selected={endHour}
 *   onSelect={setEndHour}
 *   onBack={() => setStep(3)}
 *   color="green"
 * />
 * ```
 */

export default function TimeSelection({
  times,
  reserved,
  selected,
  onSelect,
  onBack,
  color = 'blue',
}: TimeSelectionProps) {
  const hoverClass =
    color === 'blue'
      ? 'hover:bg-blue-500 hover:text-white'
      : 'hover:bg-green-500 hover:text-white';
  const selectedClass =
    color === 'blue' ? 'bg-blue-600 text-white' : 'bg-green-600 text-white';

  return (
    <div className="w-full">
      <p className="font-semibold mb-3">Escolha o horário:</p>

      <div className="grid grid-cols-3 gap-3 w-full">
        {times.map((time) => {
          const disabled = reserved.includes(time);
          const isSelected = selected === time;

          return (
            <button
              key={time}
              disabled={disabled}
              onClick={() => onSelect(time)}
              className={`p-2 rounded border text-center transition
              ${
                disabled
                  ? 'bg-gray-300 cursor-not-allowed text-gray-500'
                  : `cursor-pointer ${hoverClass}`
              }
              ${isSelected ? selectedClass : ''}`}
            >
              {time}
            </button>
          );
        })}
      </div>

      {onBack && (
        <button onClick={onBack} className="mt-4 px-3 py-1 bg-gray-200 rounded">
          Voltar
        </button>
      )}
    </div>
  );
}