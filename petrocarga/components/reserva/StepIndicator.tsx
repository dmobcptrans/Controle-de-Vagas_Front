interface StepIndicatorProps {
  step: number;
  isReservaRapida?: boolean;
}

/**
 * Etapas do fluxo de reserva
 */
const stepsMotorista = [
  { number: 1, label: 'Escolher dia' },
  { number: 2, label: 'Informações' },
  { number: 3, label: 'Selecionar início' },
  { number: 4, label: 'Selecionar fim' },
  { number: 5, label: 'Confirmar reserva' },
];

const stepsRapida = [
  { number: 1, label: 'Informações' },
  { number: 2, label: 'Status' },
  { number: 3, label: 'Selecionar fim' },
  { number: 4, label: 'Confirmar reserva' },
];

/**
 * @component StepIndicator
 * @version 1.0.0
 * 
 * @description Indicador visual de progresso para o fluxo de reserva.
 * Exibe 5 etapas com bolinhas numeradas e barra de progresso animada.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {number} step - Etapa atual (1 a 5)
 * 
 * ----------------------------------------------------------------------------
 * 🎨 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * 1. BOLINHA DA ETAPA ATUAL:
 *    - Fundo azul (bg-blue-600)
 *    - Borda azul (border-blue-600)
 *    - Texto branco
 * 
 * 2. BOLINHAS DE ETAPAS COMPLETADAS:
 *    - Fundo verde (bg-green-600)
 *    - Borda verde (border-green-600)
 *    - Texto branco
 * 
 * 3. BOLINHAS DE ETAPAS FUTURAS:
 *    - Fundo branco (bg-white)
 *    - Borda cinza (border-gray-300)
 *    - Texto cinza (text-gray-600)
 * 
 * 4. BARRA DE PROGRESSO:
 *    - Cinza: fundo (bg-gray-300)
 *    - Azul: progresso (bg-blue-600)
 *    - Largura calculada: ((step - 1) / 4) * 100%
 *    - Animação: transition-all duration-300
 * 
 * ----------------------------------------------------------------------------
 * 🧠 DECISÕES TÉCNICAS:
 * ----------------------------------------------------------------------------
 * 
 * - LAYOUT: Bolinhas sobrepostas à barra (z-index)
 * - CÁLCULO: ratio = (step - 1) / 4 (progresso de 0% a 100%)
 * - RESPONSIVIDADE: Labels em texto pequeno (text-[10px] sm:text-xs)
 * - LABEL TRUNCATE: max-w-[70px] com break-words
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - ReservaComponent: Formulário de reserva que usa este indicador
 * - ReservaAgente: Versão agente da reserva
 * 
 * @example
 * ```tsx
 * <StepIndicator step={step} />
 * ```
 */

export default function StepIndicator({ step, isReservaRapida = false }: StepIndicatorProps) {
  const currentSteps = isReservaRapida ? stepsRapida : stepsMotorista;
  const totalSteps = currentSteps.length;
  const segments = totalSteps - 1;
  const ratio = segments > 0 ? (step - 1) / segments : 0;

  return (
    <div className="relative mb-4 w-full">

      {/* ==================== LINHA DE PROGRESSO (FUNDO) ==================== */}
      <div className="absolute top-5 left-0 right-0 px-5">
        <div className="relative w-full">
          {/* Linha de fundo (cinza) */}
          <div className="h-1 bg-gray-300 rounded-full w-full"></div>

          {/* Linha de progresso (azul) - largura dinâmica */}
          <div
            className="absolute left-0 top-0 h-1 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      </div>

      {/* ==================== BOLINHAS E LABELS ==================== */}
      <div className="flex justify-between w-full relative z-10">
        {currentSteps.map((s) => {
          const isCurrent = step === s.number;
          const isCompleted = step > s.number;

          return (
            <div
              key={s.number}
              className="flex flex-col items-center text-center w-full"
            >
              {/* Bolinha */}
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold border-4 relative z-20
                ${isCurrent
                    ? 'bg-blue-600 border-blue-600 text-white'
                    : isCompleted
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'bg-white border-gray-300 text-gray-600'
                  }`}
              >
                {s.number}
              </div>

              {/* Label */}
              <span className="mt-2 text-[10px] sm:text-xs max-w-[70px] break-words">
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}