import React from 'react';

{
  /* Definição dos tipos para as opções e propriedades do componente */
}
interface SelecionarOpcao {
  value: string;
  label: string;
}

{
  /* Definição das propriedades esperadas pelo componente */
}
interface SelecaoCustomizadaProps {
  id: string;
  name: string;
  options: SelecionarOpcao[];
  placeholder?: string;
  defaultValue?: string;
}

{
  /* Componente de seleção customizada */
}
export default function SelecaoCustomizada({
  id,
  name,
  options,
  placeholder,
  defaultValue,
}: SelecaoCustomizadaProps) {
  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue}
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
