import React, { FC, ChangeEvent } from 'react';

interface SelectOptionsProps {
  options: string[];
  onOptionSelected: (selectedOption: string) => void;
}

const SelectOptions: FC<SelectOptionsProps> = ({ options, onOptionSelected }) => {
  
  const handleChange = (event: ChangeEvent<HTMLSelectElement>) => {
    onOptionSelected(event.target.value);
  };

  return (
    <div className='w-full'>
        <label htmlFor='select' className='pl-2 text-sm'>Selecione o formato da planilha</label>
        <select id="select" onChange={handleChange} className='w-full px-2 py-2 border-b-2 border-slate-800'>
            <option value="">Selecione um Arquivo</option>
            {options.map((option, index) => (
                <option key={index} value={option}>
                {option}
                </option>
            ))}
        </select>
    </div>
  );
};

export default SelectOptions;
