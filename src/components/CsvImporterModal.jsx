import React, { useState } from "react";
import Papa from "papaparse";
import { Upload, X, Check, FileSpreadsheet, AlertCircle, Sparkles, HelpCircle } from "lucide-react";
import { autoDetectColumns, mapCsvRowsToLeads } from "../utils/csvParser";

export default function CsvImporterModal({ isOpen, onClose, onImportLeads, onLoadSampleData }) {
  const [file, setFile] = useState(null);
  const [csvHeaders, setCsvHeaders] = useState([]);
  const [csvRows, setCsvRows] = useState([]);
  const [mapping, setMapping] = useState({
    name: "",
    niche: "",
    city: "",
    neighborhood: "",
    state: "",
    phone: "",
    email: "",
    website: "",
    instagram: "",
    notes: ""
  });
  const [defaultNiche, setDefaultNiche] = useState("Odontologia & Saúde");
  const [defaultCity, setDefaultCity] = useState("São Paulo");
  const [step, setStep] = useState(1); // 1: Upload, 2: Map Columns
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;
    processFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const processFile = (fileObj) => {
    setFile(fileObj);
    setErrorMsg("");

    Papa.parse(fileObj, {
      header: true,
      skipEmptyLines: true,
      encoding: "UTF-8",
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          setErrorMsg("O arquivo CSV está vazio ou inválido.");
          return;
        }
        
        const headers = results.meta.fields || Object.keys(results.data[0]);
        setCsvHeaders(headers);
        setCsvRows(results.data);

        // Auto-detect columns
        const detected = autoDetectColumns(headers);
        setMapping(detected);

        setStep(2);
      },
      error: (err) => {
        setErrorMsg(`Erro ao ler CSV: ${err.message}`);
      }
    });
  };

  const handleConfirmImport = () => {
    if (!mapping.name) {
      setErrorMsg("Selecione a coluna que corresponde ao Nome / Empresa.");
      return;
    }

    const newLeads = mapCsvRowsToLeads(csvRows, mapping, defaultNiche, defaultCity);
    onImportLeads(newLeads);
    resetAndClose();
  };

  const resetAndClose = () => {
    setFile(null);
    setCsvHeaders([]);
    setCsvRows([]);
    setStep(1);
    setErrorMsg("");
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={resetAndClose}>
      <div 
        className="glass-card" 
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "680px",
          padding: "1.75rem",
          borderRadius: "var(--radius-lg)",
          position: "relative",
          maxHeight: "90vh",
          overflowY: "auto"
        }}
      >
        {/* Close Button */}
        <button 
          onClick={resetAndClose}
          style={{
            position: "absolute",
            top: "1.25rem",
            right: "1.25rem",
            background: "transparent",
            border: "none",
            color: "var(--text-muted)",
            cursor: "pointer"
          }}
        >
          <X size={20} />
        </button>

        {/* Title */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <FileSpreadsheet color="#10b981" size={24} />
            <h2 style={{ fontSize: "1.25rem", fontWeight: "700" }}>
              Importar Lista de Leads via CSV
            </h2>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Suba suas listas brutas e o sistema organizará automaticamente por Nicho e Região.
          </p>
        </div>

        {errorMsg && (
          <div style={{
            background: "rgba(244, 63, 94, 0.15)",
            border: "1px solid rgba(244, 63, 94, 0.4)",
            color: "#f87171",
            padding: "0.75rem 1rem",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem",
            marginBottom: "1.25rem",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}>
            <AlertCircle size={18} />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* STEP 1: Upload File */}
        {step === 1 && (
          <div>
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              style={{
                border: "2px dashed var(--border-hover)",
                borderRadius: "var(--radius-md)",
                padding: "2.5rem 1.5rem",
                textAlign: "center",
                background: "rgba(15, 23, 42, 0.5)",
                cursor: "pointer",
                transition: "all 0.2s ease"
              }}
              onClick={() => document.getElementById("csv-file-input").click()}
            >
              <input 
                type="file" 
                id="csv-file-input" 
                accept=".csv" 
                onChange={handleFileChange}
                style={{ display: "none" }}
              />
              <div style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(16, 185, 129, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                margin: "0 auto 1rem auto"
              }}>
                <Upload size={26} color="#10b981" />
              </div>
              <h3 style={{ fontSize: "1rem", fontWeight: "600", marginBottom: "0.3rem" }}>
                Clique para selecionar ou arraste o CSV aqui
              </h3>
              <p style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                Suporta arquivos `.csv` de ferramentas como Google Maps Scraper, Apify, HasData ou Excel.
              </p>
            </div>

            <div style={{
              margin: "1.5rem 0",
              textAlign: "center",
              position: "relative"
            }}>
              <span style={{
                background: "#0b0f19",
                padding: "0 0.75rem",
                color: "var(--text-dim)",
                fontSize: "0.8rem",
                position: "relative",
                zIndex: 1
              }}>
                OU TESTE SEM ARQUIVO
              </span>
              <div style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: "1px",
                background: "var(--border-color)"
              }} />
            </div>

            <button 
              className="btn-secondary"
              style={{ width: "100%", justifyContent: "center", padding: "0.75rem" }}
              onClick={() => {
                onLoadSampleData();
                resetAndClose();
              }}
            >
              <Sparkles size={18} color="#fbbf24" />
              <span>Carregar Lista Demonstrativa (40+ Leads de Exemplo)</span>
            </button>
          </div>
        )}

        {/* STEP 2: Map Columns */}
        {step === 2 && (
          <div>
            <div style={{
              background: "rgba(16, 185, 129, 0.1)",
              border: "1px solid rgba(16, 185, 129, 0.3)",
              padding: "0.75rem 1rem",
              borderRadius: "var(--radius-sm)",
              marginBottom: "1.25rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Check size={18} color="#10b981" />
                <span style={{ fontSize: "0.88rem", fontWeight: "600", color: "#34d399" }}>
                  {file?.name} ({csvRows.length} leads identificados)
                </span>
              </div>
              <button 
                onClick={() => setStep(1)}
                style={{ background: "none", border: "none", color: "var(--text-muted)", fontSize: "0.75rem", cursor: "pointer", textDecoration: "underline" }}
              >
                Trocar arquivo
              </button>
            </div>

            <h4 style={{ fontSize: "0.95rem", fontWeight: "600", marginBottom: "0.75rem" }}>
              Mapeamento de Colunas (De-Para)
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.85rem", marginBottom: "1.25rem" }}>
              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Nome da Empresa / Lead *
                </label>
                <select 
                  className="glass-select" 
                  style={{ width: "100%" }}
                  value={mapping.name}
                  onChange={(e) => setMapping({ ...mapping, name: e.target.value })}
                >
                  <option value="">-- Selecione --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Telefone / WhatsApp
                </label>
                <select 
                  className="glass-select" 
                  style={{ width: "100%" }}
                  value={mapping.phone}
                  onChange={(e) => setMapping({ ...mapping, phone: e.target.value })}
                >
                  <option value="">-- Nenhum --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Nicho / Categoria
                </label>
                <select 
                  className="glass-select" 
                  style={{ width: "100%" }}
                  value={mapping.niche}
                  onChange={(e) => setMapping({ ...mapping, niche: e.target.value })}
                >
                  <option value="">-- Valor Padrão ({defaultNiche}) --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Cidade / Município
                </label>
                <select 
                  className="glass-select" 
                  style={{ width: "100%" }}
                  value={mapping.city}
                  onChange={(e) => setMapping({ ...mapping, city: e.target.value })}
                >
                  <option value="">-- Valor Padrão ({defaultCity}) --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Bairro / Região
                </label>
                <select 
                  className="glass-select" 
                  style={{ width: "100%" }}
                  value={mapping.neighborhood}
                  onChange={(e) => setMapping({ ...mapping, neighborhood: e.target.value })}
                >
                  <option value="">-- Nenhum --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Site / URL
                </label>
                <select 
                  className="glass-select" 
                  style={{ width: "100%" }}
                  value={mapping.website}
                  onChange={(e) => setMapping({ ...mapping, website: e.target.value })}
                >
                  <option value="">-- Nenhum --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Instagram / Social
                </label>
                <select 
                  className="glass-select" 
                  style={{ width: "100%" }}
                  value={mapping.instagram}
                  onChange={(e) => setMapping({ ...mapping, instagram: e.target.value })}
                >
                  <option value="">-- Nenhum --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px" }}>
                  Observações / Detalhes
                </label>
                <select 
                  className="glass-select" 
                  style={{ width: "100%" }}
                  value={mapping.notes}
                  onChange={(e) => setMapping({ ...mapping, notes: e.target.value })}
                >
                  <option value="">-- Nenhum --</option>
                  {csvHeaders.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
            </div>

            {/* Fallbacks if column missing */}
            {(!mapping.niche || !mapping.city) && (
              <div style={{
                background: "rgba(30, 41, 59, 0.6)",
                padding: "0.85rem",
                borderRadius: "var(--radius-sm)",
                marginBottom: "1.25rem",
                border: "1px dashed var(--border-hover)"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem", fontSize: "0.8rem", color: "#fbbf24" }}>
                  <HelpCircle size={15} />
                  <span>Valores padrão caso o CSV não possua as colunas:</span>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                  {!mapping.niche && (
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Nicho Padrão:</span>
                      <input 
                        type="text"
                        className="glass-input"
                        value={defaultNiche}
                        onChange={(e) => setDefaultNiche(e.target.value)}
                        placeholder="Ex: Odontologia"
                        style={{ marginTop: "2px" }}
                      />
                    </div>
                  )}
                  {!mapping.city && (
                    <div>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Cidade Padrão:</span>
                      <input 
                        type="text"
                        className="glass-input"
                        value={defaultCity}
                        onChange={(e) => setDefaultCity(e.target.value)}
                        placeholder="Ex: São Paulo"
                        style={{ marginTop: "2px" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
              <button className="btn-secondary" onClick={resetAndClose}>
                Cancelar
              </button>
              <button className="btn-primary" onClick={handleConfirmImport}>
                <Check size={18} />
                <span>Importar {csvRows.length} Leads</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
