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
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
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
