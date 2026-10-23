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

  // Agrupa os horários por período do dia
  const groups = {
    Manhã: times.filter((t) => Number(t.split(':')[0]) < 12),
    Tarde: times.filter((t) => {
      const h = Number(t.split(':')[0]);
      return h >= 12 && h < 18;
    }),
    Noite: times.filter((t) => Number(t.split(':')[0]) >= 18),
  };

  return (
    <div className="w-full h-full flex flex-col">
      <p className="font-semibold mb-3 text-center flex-shrink-0">
        Escolha o horário
      </p>

      {/* Área rolável — só os horários rolam, o resto fica fixo */}
      <div className="flex-1 overflow-y-auto pr-1 -mr-1">
        {Object.entries(groups).map(([label, group]) =>
          group.length > 0 ? (
            <div key={label} className="mb-4">
              <p className="sticky top-0 bg-white/95 backdrop-blur-sm text-xs font-semibold text-gray-500 uppercase tracking-wide py-1 z-10">
                {label}
              </p>
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {group.map((time) => {
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
            </div>
          ) : null
        )}
      </div>

      {/* Botão fixo na parte de baixo */}
       {onBack && (
        <button
          className="w-full sm:w-auto px-4 py-3 bg-gray-200 rounded-xl hover:bg-gray-300 text-sm sm:text-base"
          onClick={onBack}
        >
          Voltar
        </button>
      )}
    </div>
  );
}