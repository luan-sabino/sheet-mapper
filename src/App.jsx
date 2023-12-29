import React, { useRef, useState } from "react";
import { FileUpload } from "primereact/fileupload";
import { PrimeReactProvider, PrimeReactContext } from "primereact/api";
import { read, utils, writeFile } from "xlsx";
import {
  COLUMNS_ALFRED,
  COLUMNS_EPIC,
  COLUMNS_MEET_TIME,
  COLUMNS_QUALIJET,
  COLUMNS_REEV,
} from "./premadeMappings";
import { Dropdown } from "primereact/dropdown";
import { Toast } from "primereact/toast";
import { ProgressSpinner } from "primereact/progressspinner";

function App() {
  const [fileFormat, setFileFormat] = useState(null);
  const toast = useRef(null);
  const fileUpload = useRef(null);
  const [loading, setLoading] = useState(false);

  const showToast = (message) => {
    toast.current.show({
      severity: "warn",
      summary: "Aviso",
      detail: message,
    });
  };

  const customBase64Uploader = async (event) => {
    setLoading(true);
    const file = event.files[0];
    const reader = new FileReader();
    reader.onloadend = (r) => {
      manipulateFile(r.target.result);
    };
    reader.readAsArrayBuffer(file);
  };

  const manipulateFile = (file) => {
    const workbook = read(file, { type: "array" });
    const { Sheets } = workbook;
    const keys = Object.keys(Sheets);
    const sheet = utils.sheet_to_json(Sheets[keys[0]]);

    const header = Object.keys(sheet[0]);

    if (fileInRightFormat(header)) {
      makeReevFormat(sheet, fileFormat);
      makeMeetTimeFormat(sheet, fileFormat);
      makeMeetAlfred(sheet, fileFormat);
    }

    fileUpload.current.clear();
    setLoading(false);
  };

  const fileInRightFormat = (header) => {
    if (fileFormat === "epic") {
      if (!header.every((h) => COLUMNS_EPIC.includes(h))) {
        showToast("Tabela no formato errado para EPIC");
        return false;
      }
    } else if (fileFormat === "qualijet") {
      if (!header.every((h) => COLUMNS_QUALIJET.includes(h))) {
        showToast("Tabela no formato errado para Qualijet");
        return false;
      }
    }
    return true;
  };

  const makeReevFormat = (rows, fileformat) => {
    const newRows = [COLUMNS_REEV];
    if (fileformat === "epic") {
      rows.forEach((r) => {
        newRows.push([
          r[COLUMNS_EPIC[2]], // Nome
          r[COLUMNS_EPIC[3]], // Sobrenome
          r[COLUMNS_EPIC[0]], // Email
          r[COLUMNS_EPIC[11]], // Empresa
          r[COLUMNS_EPIC[6]], // Cargo
          r[COLUMNS_EPIC[20]], // Telefone
          "", // Celular
          r[COLUMNS_EPIC[16]], // Endereço
          r[COLUMNS_EPIC[12]], // URL
          r[COLUMNS_EPIC[5]], // Linkedin
          "", // Variavel 1
          "", // Variavel 2
          "", // Variavel 3
          "", // Grupo
        ]);
      });
    } else if (fileformat === "qualijet") {
      rows.forEach((r) => {
        const nomes = r[COLUMNS_QUALIJET[41]].split(" ");
        const nome = nomes.shift();
        const sobrenome = nomes.reduce((prev, curr) => prev + `${curr} `, "");
        const endereço = r[COLUMNS_QUALIJET[23]]
          ? `${r[COLUMNS_QUALIJET[23]]}, ${r[COLUMNS_QUALIJET[24]]}`
          : "";
        let telefone = r[COLUMNS_QUALIJET[26].split(",")[0]];
        telefone = /[^0-9]/g.test(telefone) ? "" : telefone;
        newRows.push([
          nome, // Nome
          sobrenome, // Sobrenome
          r[COLUMNS_QUALIJET[37].split(",")[0]], // Email
          r[COLUMNS_QUALIJET[1]]
            ? r[COLUMNS_QUALIJET[1]]
            : r[COLUMNS_QUALIJET[0]], // Empresa
          r[COLUMNS_QUALIJET[42]], // Cargo
          telefone, // Telefone
          r[COLUMNS_QUALIJET[31].split(",")[0]], // Celular
          endereço, // Endereço
          r[COLUMNS_QUALIJET[32]], // URL
          r[COLUMNS_QUALIJET[43]], // Linkedin
          r[COLUMNS_QUALIJET[2]], // Variavel 1 -- CNPJ
          r[COLUMNS_QUALIJET[6]], // Variavel 2 -- CNAE
          "", // Variavel 3
          "", // Grupo
        ]);
      });
    }

    exportAOAtoXLSX(newRows, "Reev");
  };

  const makeMeetTimeFormat = (rows, fileformat) => {
    const newRows = [COLUMNS_MEET_TIME];
    if (fileformat === "epic") {
      rows.forEach((r) => {
        newRows.push([
          r[COLUMNS_EPIC[11]], // Empresa
          r[COLUMNS_EPIC[2]], // Nome
          r[COLUMNS_EPIC[4]], // Nome Completo
          r[COLUMNS_EPIC[20]], // Telefone
          r[COLUMNS_EPIC[0]], // Email
          r[COLUMNS_EPIC[6]], // Cargo
          r[COLUMNS_EPIC[13]], // Linkedin
        ]);
      });
    } else if (fileformat === "qualijet") {
      rows.forEach((r) => {
        const nomes = r[COLUMNS_QUALIJET[41]].split(" ");
        const nome = nomes.shift();
        const sobrenome = nomes.reduce((prev, curr) => prev + `${curr} `, "");
        const endereço = r[COLUMNS_QUALIJET[23]]
          ? `${r[COLUMNS_QUALIJET[23]]}, ${r[COLUMNS_QUALIJET[24]]}`
          : "";
        let telefone = r[COLUMNS_QUALIJET[26].split(",")[0]];
        telefone = /[^0-9]/g.test(telefone) ? "" : telefone;
        newRows.push([
          r[COLUMNS_QUALIJET[1]]
            ? r[COLUMNS_QUALIJET[1]]
            : r[COLUMNS_QUALIJET[0]], // Empresa
          nome, // Nome
          r[COLUMNS_QUALIJET[41]], // Nome Completo
          telefone, // Telefone
          r[COLUMNS_QUALIJET[37].split(",")[0]], // Email
          r[COLUMNS_QUALIJET[42]], // Cargo
          r[COLUMNS_QUALIJET[43]], // Linkedin
        ]);
      });
    }
    exportAOAtoXLSX(newRows, "MeetTime");
  };

  const makeMeetAlfred = (rows, fileformat) => {
    const newRows = [COLUMNS_ALFRED];
    if (fileformat === "epic") {
      rows.forEach((r) => {
        newRows.push([
          r[COLUMNS_EPIC[13]], // Linkedin
          r[COLUMNS_EPIC[2]], // Nome
          r[COLUMNS_EPIC[11]], // Empresa
        ]);
      });
    } else if (fileformat === "qualijet") {
      rows.forEach((r) => {
        const nomes = r[COLUMNS_QUALIJET[41]].split(" ");
        const nome = nomes.shift();
        const sobrenome = nomes.reduce((prev, curr) => prev + `${curr} `, "");
        const endereço = r[COLUMNS_QUALIJET[23]]
          ? `${r[COLUMNS_QUALIJET[23]]}, ${r[COLUMNS_QUALIJET[24]]}`
          : "";
        let telefone = r[COLUMNS_QUALIJET[26].split(",")[0]];
        telefone = /[^0-9]/g.test(telefone) ? "" : telefone;
        newRows.push([
          r[COLUMNS_QUALIJET[43]], // Linkedin
          nome, // Nome
          r[COLUMNS_QUALIJET[1]]
            ? r[COLUMNS_QUALIJET[1]]
            : r[COLUMNS_QUALIJET[0]], // Empresa
        ]);
      });
    }
    exportAOAtoXLSX(newRows, "MeetAlfred");
  };

  const exportAOAtoXLSX = (aoa, filename) => {
    /* create worksheet */
    var ws = utils.aoa_to_sheet(aoa);
    /* create workbook and export */
    var wb = utils.book_new();
    utils.book_append_sheet(wb, ws, "Pagina 1");
    writeFile(wb, `${filename}${new Date().toLocaleDateString("pt-BR")}.xlsx`);
  };

  return (
    <PrimeReactProvider>
      <Toast ref={toast} />
      <div className="flex h-screen w-full items-center justify-center bg-zinc-800">
        <div className="flex h-3/4 w-3/4 flex-col items-center rounded-md bg-neutral-200 p-8">
          <h1 className="text-3xl font-semibold">Mapeador de Planilha</h1>
          <div className="flex h-full w-full flex-col items-center justify-between p-4 pt-16">
            <div className="flex h-fit w-full flex-col items-center gap-3">
              <span className="p-float-label w-1/4">
                <Dropdown
                  inputId="dd-formatfile"
                  value={fileFormat}
                  onChange={(e) => setFileFormat(e.value)}
                  options={[
                    { name: "Epic", value: "epic" },
                    { name: "Qualijet", value: "qualijet" },
                  ]}
                  optionLabel="name"
                  className="md:w-14rem w-full"
                />
                <label htmlFor="dd-city">Selecione uma fonte</label>
              </span>
              <FileUpload
                disabled={!fileFormat}
                ref={fileUpload}
                auto
                chooseLabel="Escolher arquivo"
                mode="basic"
                name="sheets"
                url="/api/upload"
                accept=".csv,.xlsx"
                maxFileSize={1000000}
                customUpload
                uploadHandler={customBase64Uploader}
              />
            </div>
            <span>
              Se você trabalha com um formato específico que não está atualmente
              disponível, entre em contato{" "}
              <a
                target="_blank"
                className="rounded-md bg-zinc-800 p-2 px-4 text-white"
                href="https://github.com/luan-sabino"
              >
                clicando aqui
              </a>
            </span>
          </div>
        </div>
      </div>
      <div
        className={
          `absolute left-0 top-0 h-screen w-screen items-center justify-center bg-slate-400 bg-opacity-30 backdrop-blur-sm ` +
          loading
            ? "flex"
            : "hidden"
        }
      >
        <ProgressSpinner style={{ width: "50px", height: "50px" }} />
      </div>
    </PrimeReactProvider>
  );
}

export default App;
