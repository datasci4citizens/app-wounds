import React from 'react';


interface RadioButtonProps {
  name: string;
  label: string;
  value: string | boolean;
  checked: boolean;
  onChange: (value: string | boolean) => void;
  isMultiple?: boolean; // Para permitir selecionar múltiplas opções (comorbidades)
}

const RadioButton: React.FC<RadioButtonProps> = ({ name, label, value, checked, onChange, isMultiple = false }) => {
  const handleClick = () => {
    if (isMultiple) {
      // Para permitir desmarcar a opção se ela já estiver selecionada
      if (checked) {
        onChange(value); // Se já estiver marcado, desmarca
      } else {
        onChange(value); // Se não estiver marcado, seleciona
      }
    } else {
      onChange(value); // Seleciona apenas uma opção
    }
  };

  return (
    <label className="flex items-center gap-2 text-sm text-[#0120AC]">
      <input
        type="radio"
        name={name}
        value={typeof value === 'string' ? value : String(value)}
        checked={checked}
        onChange={handleClick}
        className={`accent-[#A6BBFF] w-4 h-4`}
      />
      {label}
    </label>
  );


};

export default RadioButton;
