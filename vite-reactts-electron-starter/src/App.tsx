import React, { useEffect, useState } from 'react';
import AppBar from './AppBar';
import FileSelector from './SelectFile';
import { read, utils, writeFile } from "xlsx"
import { COLUMNS_ALFRED, COLUMNS_BIGDATA, COLUMNS_MEET_TIME, COLUMNS_REEV, COLUMNS_SNOVIO } from './premadeMappings';
import SelectOptions from './SelectOptions';
function App() {

  const [fileFormat, setFileFormat] = useState("");
  const [errorMessage, setErrorMessage] = useState("")

  const clearErrorMessage = () => {
    setErrorMessage("")
  }

  const customBase64Uploader = async (file: any) => {
    const reader = new FileReader();
    reader.onloadend = (r: any) => {
      manipulateFile(r.target?.result);
    };
    reader.readAsArrayBuffer(file);
  };

  const manipulateFile = (file: any) => {
    const workbook = read(file, { type: "array" });
    const { Sheets } = workbook;
    const keys = Object.keys(Sheets);
    const sheet = utils.sheet_to_json(Sheets[keys[0] as any]);

    const header = Object.keys(sheet[0] as any);

    if (fileInRightFormat(header)) {
      makeReevFormat(sheet, fileFormat);
      makeMeetTimeFormat(sheet, fileFormat);
      makeMeetAlfred(sheet, fileFormat);
    }

  };

  const fileInRightFormat = (header: any) => {
    if (fileFormat === "Snovio") {
      if (!header.every((h: any) => COLUMNS_SNOVIO.includes(h))) {
        setErrorMessage("Arquivo não esta no formato adequado para Snovio")
        return false;
      }
    } else if (fileFormat === "Big Data") {
      if (!header.every((h: any) => COLUMNS_BIGDATA.includes(h))) {
        setErrorMessage("Arquivo não esta no formato adequado para Big Data")
        return false;
      }
    } else if (fileFormat === "") {
      setErrorMessage("Selecione um formato de arquivo")
      return false;
    }
    return true;
  };

  const makeReevFormat = (rows: any, fileformat: any) => {
    const newRows = [COLUMNS_REEV] ;
    if (fileformat === "Snovio") {
      rows.forEach((r: any) => {
        newRows.push([
          r[COLUMNS_SNOVIO[2] as any], // Nome
          r[COLUMNS_SNOVIO[3] as any], // Sobrenome
          r[COLUMNS_SNOVIO[0] as any], // Email
          r[COLUMNS_SNOVIO[11] as any], // Empresa
          r[COLUMNS_SNOVIO[6] as any], // Cargo
          r[COLUMNS_SNOVIO[20] as any], // Telefone
          "", // Celular
          r[COLUMNS_SNOVIO[16] as any], // Endereço
          r[COLUMNS_SNOVIO[12] as any], // URL
          r[COLUMNS_SNOVIO[5] as any], // Linkedin
          "", // Variavel 1
          "", // Variavel 2
          "", // Variavel 3
          "", // Grupo
        ]);
      });
    } else if (fileformat === "Big Data") {
      rows.forEach((r: any) => {
        const nomes = r[COLUMNS_BIGDATA[41] as any].split(" ");
        const nome = nomes.shift();
        const sobrenome = nomes.reduce((prev: any, curr: any) => prev + `${curr} `, "");
        const endereço = r[COLUMNS_BIGDATA[23] as any]
          ? `${r[COLUMNS_BIGDATA[23] as any]}, ${r[COLUMNS_BIGDATA[24] as any]}`
          : "";
        let telefone = r[COLUMNS_BIGDATA[26].split(",")[0] as any];
        telefone = /[^0-9]/g.test(telefone) ? "" : telefone;
        newRows.push([
          nome, // Nome
          sobrenome, // Sobrenome
          r[COLUMNS_BIGDATA[37].split(",")[0] as any], // Email
          r[COLUMNS_BIGDATA[1] as any] ? r[COLUMNS_BIGDATA[1] as any] : r[COLUMNS_BIGDATA[0] as any], // Empresa
          r[COLUMNS_BIGDATA[42] as any], // Cargo
          telefone, // Telefone
          r[COLUMNS_BIGDATA[31].split(",")[0] as any], // Celular
          endereço, // Endereço
          r[COLUMNS_BIGDATA[32] as any], // URL
          r[COLUMNS_BIGDATA[43] as any], // Linkedin
          r[COLUMNS_BIGDATA[2] as any], // Variavel 1 -- CNPJ
          r[COLUMNS_BIGDATA[6] as any], // Variavel 2 -- CNAE
          "", // Variavel 3
          "", // Grupo
        ]);
      });
    }
    exportAOAtoXLSX(newRows, "Reev");
  };

  const makeMeetTimeFormat = (rows: any, fileformat: any) => {
    const newRows = [COLUMNS_MEET_TIME];
    if (fileformat === "Snovio") {
      rows.forEach((r: any) => {
        newRows.push([
          r[COLUMNS_SNOVIO[11] as any], // Empresa
          r[COLUMNS_SNOVIO[2] as any], // Nome
          r[COLUMNS_SNOVIO[4] as any], // Nome Completo
          r[COLUMNS_SNOVIO[20] as any], // Telefone
          r[COLUMNS_SNOVIO[0] as any], // Email
          r[COLUMNS_SNOVIO[6] as any], // Cargo
          r[COLUMNS_SNOVIO[13] as any], // Linkedin
        ]);
      });
    } else if (fileformat === "Big Data") {
      rows.forEach((r: any) => {
        const nomes = r[COLUMNS_BIGDATA[41] as any].split(" ");
        const nome = nomes.shift();
        const sobrenome = nomes.reduce((prev: any, curr: any) => prev + `${curr} `, "");
        const endereço = r[COLUMNS_BIGDATA[23] as any]
          ? `${r[COLUMNS_BIGDATA[23] as any]}, ${r[COLUMNS_BIGDATA[24] as any]}`
          : "";
        let telefone = r[COLUMNS_BIGDATA[26].split(",")[0] as any];
        telefone = /[^0-9]/g.test(telefone) ? "" : telefone;
        newRows.push([
          r[COLUMNS_BIGDATA[1] as any] ? r[COLUMNS_BIGDATA[1] as any] : r[COLUMNS_BIGDATA[0] as any], // Empresa
          nome, // Nome
          r[COLUMNS_BIGDATA[41] as any], // Nome Completo
          telefone, // Telefone
          r[COLUMNS_BIGDATA[37].split(",")[0] as any], // Email
          r[COLUMNS_BIGDATA[42] as any], // Cargo
          r[COLUMNS_BIGDATA[43] as any], // Linkedin
        ]);
      });
    }
    exportAOAtoXLSX(newRows, "MeetTime");
  };

  const makeMeetAlfred = (rows: any, fileformat: any) => {
    const newRows = [COLUMNS_ALFRED];
    if (fileformat === "Snovio") {
      rows.forEach((r: any) => {
        newRows.push([
          r[COLUMNS_SNOVIO[13] as any], // Linkedin
          r[COLUMNS_SNOVIO[2] as any], // Nome
          r[COLUMNS_SNOVIO[11] as any], // Empresa
        ]);
      });
    } else if (fileformat === "Big Data") {
      rows.forEach((r: any) => {
        const nomes = r[COLUMNS_BIGDATA[41] as any].split(" ");
        const nome = nomes.shift();
        const sobrenome = nomes.reduce((prev: any, curr: any) => prev + `${curr} `, "");
        const endereço = r[COLUMNS_BIGDATA[23] as any]
          ? `${r[COLUMNS_BIGDATA[23] as any]}, ${r[COLUMNS_BIGDATA[24] as any]}`
          : "";
        let telefone = r[COLUMNS_BIGDATA[26].split(",")[0] as any];
        telefone = /[^0-9]/g.test(telefone) ? "" : telefone;
        newRows.push([
          r[COLUMNS_BIGDATA[43] as any], // Linkedin
          nome, // Nome
          r[COLUMNS_BIGDATA[1] as any] ? r[COLUMNS_BIGDATA[1] as any] : r[COLUMNS_BIGDATA[0] as any], // Empresa
        ]);
      });
    }
    exportAOAtoXLSX(newRows, "MeetAlfred");
  };

  const exportAOAtoXLSX = (aoa: any, filename: any) => {
    /* create worksheet */
    var ws = utils.aoa_to_sheet(aoa);
    /* create workbook and export */
    var wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Pagina 1");
    writeFile(wb, `${filename}${new Date().toLocaleDateString("pt-BR")}.xlsx`);
  };

  return (
    <div className="flex flex-col h-screen w-screen bg-slate-800">
      {window.Main && (
        <div className="flex-none text-white">
          <AppBar />
        </div>
      )}
      <div className='w-full h-full flex items-center justify-center p-12'>
        <div className="w-full h-full flex items-center justify-center flex-col bg-white rounded-md py-6 px-4">
          <h2 className='text-2xl font-bold'>Mapeador de Planilha</h2>
          <div className={errorMessage ? "flex" : "hidden"}>
            <span className='w-full text-center font-bold text-red-500'>{errorMessage}</span>
          </div>
          <SelectOptions options={["Snovio", "Big Data"]} onOptionSelected={(value) => {setFileFormat(value); clearErrorMessage();}} />
          <div className='w-full h-full p-8'>
            <FileSelector onFileSelected={customBase64Uploader} />
          </div>
        </div>
      </div>
    </div>
      
  );
}

export default App;
