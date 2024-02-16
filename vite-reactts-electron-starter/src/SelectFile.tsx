import React, { FC, ChangeEvent, useRef } from 'react';

interface FileSelectorProps {
  onFileSelected: (file: File) => void;
}

const FileSelector: FC<FileSelectorProps> = ({ onFileSelected }) => {
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    event.preventDefault()
    const file = event.target.files?.[0];
    if (file) {
      onFileSelected(file);
    }
    clearButton()
  };

  const clearButton = () => {
    (inputFileRef.current as any).value = "";
  }

  return (
    <div className='flex w-full flex-col justify-center items-center'>
      <label>
        <span className='px-6 py-2 bg-slate-700 text-white rounded-md'>Selecionar arquivo</span>
        <input className='hidden' ref={inputFileRef} type="file" onChange={handleChange} />
      </label>
    </div>
  );
};

export default FileSelector;
