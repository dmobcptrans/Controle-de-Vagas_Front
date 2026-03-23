interface SelecionarOpcao {
  value: string;
  label: string;
}

interface SelecaoCustomizadaProps {
  id: string;
  name: string;
  options: SelecionarOpcao[];
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
}

/**
 * @component SelecaoCustomizada
 * @version 1.0.0
 * 
 * @description Componente de select customizado com estilo padronizado.
 * Oferece suporte a placeholder, opções dinâmicas e controle de valor.
 * 
 * ----------------------------------------------------------------------------
 * 📋 PROPRIEDADES:
 * ----------------------------------------------------------------------------
 * 
 * @property {string} id - ID do elemento select (obrigatório)
 * @property {string} name - Nome do campo (obrigatório)
 * @property {SelecionarOpcao[]} options - Lista de opções { value, label }
 * @property {string} [placeholder] - Texto placeholder (opção desabilitada)
 * @property {string} [value] - Valor controlado (para estado controlado)
 * @property {string} [defaultValue] - Valor padrão (para estado não controlado)
 * @property {(value: string) => void} [onChange] - Callback quando valor muda
 * 
 * ----------------------------------------------------------------------------
 * 🎨 COMPORTAMENTO:
 * ----------------------------------------------------------------------------
 * 
 * - PLACEHOLDER: Opção vazia desabilitada com texto informativo
 * - ESTADO CONTROLADO: Usa `value` + `onChange`
 * - ESTADO NÃO CONTROLADO: Usa `defaultValue`
 * - ESTILOS: Largura w-45, bordas arredondadas, padding
 * 
 * ----------------------------------------------------------------------------
 * 🔗 COMPONENTES RELACIONADOS:
 * ----------------------------------------------------------------------------
 * 
 * - FormItem: Componente pai para formulários
 * 
 * @example
 * ```tsx
 * // Estado controlado
 * const [tipo, setTipo] = useState('');
 * 
 * <SelecaoCustomizada
 *   id="tipo"
 *   name="tipo"
 *   value={tipo}
 *   onChange={setTipo}
 *   placeholder="Selecione o tipo"
 *   options={[
 *     { value: 'paralela', label: 'Paralela' },
 *     { value: 'perpendicular', label: 'Perpendicular' },
 *   ]}
 * />
 * 
 * // Estado não controlado
 * <SelecaoCustomizada
 *   id="area"
 *   name="area"
 *   defaultValue="vermelha"
 *   options={[
 *     { value: 'vermelha', label: 'Vermelha' },
 *     { value: 'amarela', label: 'Amarela' },
 *   ]}
 * />
 * ```
 */

export default function SelecaoCustomizada({
  id,
  name,
  options,
  placeholder,
  value,
  defaultValue,
  onChange,
}: SelecaoCustomizadaProps) {
  return (
    <select
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      onChange={(e) => onChange?.(e.target.value)}
      className="flex h-10 w-45 rounded-sm border border-gray-400 text-sm md:text-base"
    >
      {/* Placeholder como opção desabilitada */}
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      
      {/* Opções dinâmicas */}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          className="bg-white text-gray-900 py-2"
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}