import React, { useState, useEffect, useMemo } from "react";
import { 
  Building2, Search, Download, Plus, Check, CheckSquare, Square, 
  ExternalLink, MessageCircle, FileText, Sparkles, ShieldCheck, Users, 
  DollarSign, MapPin, Phone, Mail, Layers, Filter, Clock, ArrowRight,
  ChevronRight, RefreshCw, AlertCircle, Copy, HelpCircle, Briefcase,
  CheckCircle2, XCircle
} from "lucide-react";
import { 
  searchCnpjCompanies, 
  lookupCnpj, 
  fetchPopularCnaes, 
  convertCnpjToLead, 
  formatCnpj, 
  isValidCnpj 
} from "../utils/cnpjService";
import { buildWhatsappUrl } from "../utils/helpers";

const BRAZILIAN_STATES = [
  { uf: "SP", name: "São Paulo" },
  { uf: "RJ", name: "Rio de Janeiro" },
  { uf: "MG", name: "Minas Gerais" },
  { uf: "PR", name: "Paraná" },
  { uf: "RS", name: "Rio Grande do Sul" },
  { uf: "SC", name: "Santa Catarina" },
  { uf: "BA", name: "Bahia" },
  { uf: "GO", name: "Goiás" },
  { uf: "DF", name: "Distrito Federal" },
  { uf: "PE", name: "Pernambuco" },
  { uf: "CE", name: "Ceará" },
  { uf: "ES", name: "Espírito Santo" },
  { uf: "MT", name: "Mato Grosso" },
  { uf: "MS", name: "Mato Grosso do Sul" },
  { uf: "PA", name: "Pará" },
  { uf: "AM", name: "Amazonas" },
  { uf: "RN", name: "Rio Grande do Norte" },
  { uf: "PB", name: "Paraíba" },
  { uf: "AL", name: "Alagoas" },
  { uf: "PI", name: "Piauí" },
  { uf: "MA", name: "Maranhão" },
  { uf: "SE", name: "Sergipe" },
  { uf: "TO", name: "Tocantins" },
  { uf: "RO", name: "Rondônia" },
  { uf: "AC", name: "Acre" },
  { uf: "AP", name: "Amapá" },
  { uf: "RR", name: "Roraima" }
];

export default function CnpjDatabaseView({ onImportLeads, onNavigateTab }) {
  // Tabs internas: "search" (busca por nicho/cidade) e "lookup" (consulta rápida por CNPJ)
  const [activeSubTab, setActiveSubTab] = useState("search");

  // Estados da Busca por Filtros
  const [niche, setNiche] = useState("Clínica Odontológica");
  const [state, setState] = useState("SP");
  const [city, setCity] = useState("Campinas");
  const [onlyActive, setOnlyActive] = useState(true);
  const [onlyWithPhone, setOnlyWithPhone] = useState(true);
  const [searchLimit, setSearchLimit] = useState(25);

  // Estados da Consulta de CNPJ Único
  const [singleCnpjInput, setSingleCnpjInput] = useState("");
  const [singleCnpjResult, setSingleCnpjResult] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState(null);

  // Estados dos Resultados em Lote
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [selectedIndices, setSelectedIndices] = useState(new Set());
  const [copiedKey, setCopiedKey] = useState(null);
  const [popularCnaes, setPopularCnaes] = useState([]);
  const [importedSuccessMsg, setImportedSuccessMsg] = useState(null);

  // Modal / Drawer de Detalhes da Empresa
  const [selectedCompanyDetail, setSelectedCompanyDetail] = useState(null);

  useEffect(() => {
    fetchPopularCnaes().then(cnaes => {
      if (cnaes && cnaes.length > 0) setPopularCnaes(cnaes);
    });
  }, []);

  const handleCopy = (text, key) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Executar Busca em Lote
  const handleSearchSubmit = async (e) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSelectedIndices(new Set());
    setImportedSuccessMsg(null);

    try {
      const results = await searchCnpjCompanies({
        niche,
        state,
        city,
        onlyActive,
        onlyWithPhone,
        limit: searchLimit
      });

      if (results && results.length > 0) {
        setCompanies(results);
      } else {
        setCompanies([]);
        setErrorMsg("Nenhuma empresa encontrada com os filtros selecionados. Tente ampliar a cidade ou estado.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || "Erro ao conectar com a base da Receita Federal.");
    } finally {
      setLoading(false);
    }
  };

  // Executar Consulta de CNPJ Único
  const handleSingleLookupSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!singleCnpjInput.trim()) return;

    setSingleLoading(true);
    setSingleError(null);
    setSingleCnpjResult(null);

    try {
      const comp = await lookupCnpj(singleCnpjInput);
      setSingleCnpjResult(comp);
    } catch (err) {
      setSingleError(err.message || "CNPJ não localizado na base pública.");
    } finally {
      setSingleLoading(false);
    }
  };

  // Seleção múltipla
  const toggleSelectAll = () => {
    if (selectedIndices.size === companies.length) {
      setSelectedIndices(new Set());
    } else {
      const all = new Set(companies.map((_, i) => i));
      setSelectedIndices(all);
    }
  };

  const toggleSelectOne = (index) => {
    const next = new Set(selectedIndices);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIndices(next);
  };

  // Importar para o GrowthHunter CRM
  const handleImportToCrm = (targetCompanies) => {
    if (!targetCompanies || targetCompanies.length === 0) return;

    const leads = targetCompanies.map(c => convertCnpjToLead(c, niche));
    if (onImportLeads) {
      onImportLeads(leads);
      setImportedSuccessMsg(`🚀 ${leads.length} empresa(s) importada(s) com sucesso para o Pipeline do GrowthHunter!`);
      setTimeout(() => setImportedSuccessMsg(null), 5000);
    }
  };

  // Exportar para CSV / Excel
  const handleExportCsv = (dataList) => {
    if (!dataList || dataList.length === 0) return;

    const headers = [
      "CNPJ",
      "Razão Social",
      "Nome Fantasia",
      "Situação",
      "Data Abertura",
      "CNAE Principal",
      "Porte",
      "Capital Social (R$)",
      "Sócios",
      "Telefone 1",
      "Telefone 2",
      "WhatsApp",
      "E-mail",
      "Endereço",
      "Bairro",
      "Cidade",
      "UF",
      "CEP"
    ];

    const rows = dataList.map(c => [
      `"${c.cnpj_formatted || c.cnpj || ""}"`,
      `"${(c.razao_social || "").replace(/"/g, '""')}"`,
      `"${(c.nome_fantasia || "").replace(/"/g, '""')}"`,
      `"${c.situacao_cadastral || "ATIVA"}"`,
      `"${c.data_abertura || ""}"`,
      `"${(c.cnae_fiscal_descricao || "").replace(/"/g, '""')}"`,
      `"${c.porte || ""}"`,
      `"${c.capital_social || 0}"`,
      `"${(c.socios || []).map(s => s.nome).join("; ").replace(/"/g, '""')}"`,
      `"${c.contatos?.telefone1 || ""}"`,
      `"${c.contatos?.telefone2 || ""}"`,
      `"${c.contatos?.whatsapp_phone || ""}"`,
      `"${c.contatos?.email || ""}"`,
      `"${c.endereco?.logradouro || ""}, ${c.endereco?.numero || ""}"`,
      `"${c.endereco?.bairro || ""}"`,
      `"${c.endereco?.municipio || ""}"`,
      `"${c.endereco?.uf || ""}"`,
      `"${c.endereco?.cep || ""}"`
    ]);

    const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(r => r.join(";"))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `growthhunter_cnpj_${niche.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* ── Banner Principal ── */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, #f0fdf4 0%, #dcfce7 60%, #ffffff 100%)",
        border: "1px solid #bbf7d0",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <div style={{
            background: "#16a34a",
            color: "#ffffff",
            padding: "0.85rem",
            borderRadius: "14px",
            boxShadow: "0 4px 12px rgba(22, 163, 74, 0.2)"
          }}>
            <Building2 size={32} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <h2 style={{ fontSize: "1.4rem", fontWeight: "900", color: "#14532d", margin: 0 }}>
                Base Nacional de Empresas & CNPJs (Receita Federal)
              </h2>
              <span style={{
                background: "#dcfce7",
                color: "#15803d",
                fontSize: "0.72rem",
                fontWeight: "800",
                padding: "0.2rem 0.6rem",
                borderRadius: "12px",
                border: "1px solid #86efac"
              }}>
                28M+ ATIVAS • 100% GRATUITO
              </span>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#166534", marginTop: "4px", margin: 0 }}>
              Busque empresas ativas, consulte o <strong>Quadro de Sócios (QSA)</strong>, telefones, CNAEs e exporte listas ilimitadas para prospecção B2B.
            </p>
          </div>
        </div>

        {/* Subtab Switcher */}
        <div style={{
          display: "flex",
          background: "#ffffff",
          padding: "0.25rem",
          borderRadius: "10px",
          border: "1px solid #bbf7d0",
          boxShadow: "0 2px 6px rgba(0,0,0,0.03)"
        }}>
          <button
            type="button"
            onClick={() => setActiveSubTab("search")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: activeSubTab === "search" ? "#16a34a" : "transparent",
              color: activeSubTab === "search" ? "#ffffff" : "#374151",
              fontSize: "0.84rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease"
            }}
          >
            <Search size={15} />
            <span>Busca por Filtros (CNAE / Cidade)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab("lookup")}
            style={{
              padding: "0.5rem 1rem",
              borderRadius: "8px",
              border: "none",
              background: activeSubTab === "lookup" ? "#16a34a" : "transparent",
              color: activeSubTab === "lookup" ? "#ffffff" : "#374151",
              fontSize: "0.84rem",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.4rem",
              transition: "all 0.15s ease"
            }}
          >
            <FileText size={15} />
            <span>Consulta Rápida por CNPJ</span>
          </button>
        </div>
      </div>

      {importedSuccessMsg && (
        <div style={{
          background: "#f0fdf4",
          border: "1px solid #86efac",
          padding: "0.9rem 1.25rem",
          borderRadius: "10px",
          color: "#166534",
          fontSize: "0.9rem",
          fontWeight: "600",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <CheckCircle2 size={18} color="#16a34a" />
            <span>{importedSuccessMsg}</span>
          </div>
          {onNavigateTab && (
            <button
              type="button"
              onClick={() => onNavigateTab("pipeline")}
              style={{
                background: "#16a34a",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                padding: "0.35rem 0.75rem",
                fontSize: "0.8rem",
                fontWeight: "700",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.3rem"
              }}
            >
              <span>Ver no Kanban</span>
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ABA 1: BUSCA POR FILTROS AVANÇADOS                                   */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "search" && (
        <>
          {/* Painel de Filtros */}
          <div className="glass-card" style={{ padding: "1.5rem" }}>
            <form onSubmit={handleSearchSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
              
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1rem" }}>
                
                {/* Nicho / Ramo de Atuação */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "0.4rem" }}>
                    🏢 Nicho / Atividade (CNAE):
                  </label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    placeholder="Ex: Clínica Odontológica, Marcenaria, Advocacia..."
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Estado (UF) */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "0.4rem" }}>
                    📍 Estado (UF):
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.9rem",
                      background: "#ffffff",
                      outline: "none"
                    }}
                  >
                    {BRAZILIAN_STATES.map(s => (
                      <option key={s.uf} value={s.uf}>{s.uf} - {s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Cidade */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "0.4rem" }}>
                    🏙️ Cidade / Município:
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Campinas, Ribeirão Preto, Santo André..."
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.9rem",
                      outline: "none"
                    }}
                  />
                </div>

                {/* Quantidade Limite */}
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: "700", color: "#374151", marginBottom: "0.4rem" }}>
                    📊 Limite de Resultados:
                  </label>
                  <select
                    value={searchLimit}
                    onChange={(e) => setSearchLimit(Number(e.target.value))}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.85rem",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.9rem",
                      background: "#ffffff",
                      outline: "none"
                    }}
                  >
                    <option value={10}>10 Empresas</option>
                    <option value={25}>25 Empresas</option>
                    <option value={50}>50 Empresas</option>
                  </select>
                </div>
              </div>

              {/* Filtros de Caixa de Seleção */}
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: "1.5rem",
                flexWrap: "wrap",
                background: "#f9fafb",
                padding: "0.75rem 1rem",
                borderRadius: "8px",
                border: "1px solid #e5e7eb"
              }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.84rem", fontWeight: "600", color: "#374151", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={onlyActive}
                    onChange={(e) => setOnlyActive(e.target.checked)}
                    style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
                  />
                  <span>Apenas Empresas com Situação Cadastral <strong>ATIVA</strong></span>
                </label>

                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.84rem", fontWeight: "600", color: "#374151", cursor: "pointer" }}>
                  <input
                    type="checkbox"
                    checked={onlyWithPhone}
                    onChange={(e) => setOnlyWithPhone(e.target.checked)}
                    style={{ accentColor: "#16a34a", width: "16px", height: "16px" }}
                  />
                  <span>Apenas com <strong>Telefone / WhatsApp</strong></span>
                </label>
              </div>

              {/* Atalhos Rápidos de Nicho/CNAE */}
              {popularCnaes.length > 0 && (
                <div>
                  <span style={{ fontSize: "0.75rem", fontWeight: "700", color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    🔥 Nichos Mais Lucrativos para Prospecção B2B:
                  </span>
                  <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                    {popularCnaes.slice(0, 8).map((c) => (
                      <button
                        key={c.codigo}
                        type="button"
                        onClick={() => setNiche(c.nicho)}
                        style={{
                          background: niche === c.nicho ? "#dcfce7" : "#ffffff",
                          border: niche === c.nicho ? "1px solid #16a34a" : "1px solid #e5e7eb",
                          color: niche === c.nicho ? "#15803d" : "#4b5563",
                          fontSize: "0.78rem",
                          fontWeight: "600",
                          padding: "0.3rem 0.65rem",
                          borderRadius: "16px",
                          cursor: "pointer"
                        }}
                      >
                        {c.nicho}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botão de Busca */}
              <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem", marginTop: "0.5rem" }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    background: "#16a34a",
                    color: "#ffffff",
                    border: "none",
                    borderRadius: "8px",
                    padding: "0.75rem 1.75rem",
                    fontSize: "0.95rem",
                    fontWeight: "800",
                    cursor: loading ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    boxShadow: "0 4px 12px rgba(22, 163, 74, 0.25)"
                  }}
                >
                  {loading ? (
                    <>
                      <RefreshCw size={18} className="animate-spin" />
                      <span>Consultando Base da Receita Federal...</span>
                    </>
                  ) : (
                    <>
                      <Search size={18} />
                      <span>Buscar Empresas Ativas na Base Oficial</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Erro */}
          {errorMsg && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              padding: "1rem 1.25rem",
              borderRadius: "10px",
              color: "#991b1b",
              fontSize: "0.9rem",
              display: "flex",
              alignItems: "center",
              gap: "0.6rem"
            }}>
              <AlertCircle size={20} color="#dc2626" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Resultados da Busca em Lote */}
          {companies.length > 0 && (
            <div className="glass-card" style={{ padding: "1.5rem" }}>
              
              {/* Header dos Resultados */}
              <div style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
                paddingBottom: "1.25rem",
                borderBottom: "1px solid #e5e7eb",
                marginBottom: "1.25rem"
              }}>
                <div>
                  <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#111827", margin: 0 }}>
                    Resultados Encontrados ({companies.length} Empresas)
                  </h3>
                  <span style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                    Nicho: <strong>{niche}</strong> • Região: <strong>{city || "Todas as Cidades"}, {state}</strong>
                  </span>
                </div>

                {/* Ações em Lote */}
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                  <button
                    type="button"
                    onClick={toggleSelectAll}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #d1d5db",
                      color: "#374151",
                      padding: "0.45rem 0.85rem",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    {selectedIndices.size === companies.length ? <CheckSquare size={16} color="#16a34a" /> : <Square size={16} />}
                    <span>{selectedIndices.size === companies.length ? "Desmarcar Todos" : "Selecionar Todos"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const selected = selectedIndices.size > 0 
                        ? companies.filter((_, i) => selectedIndices.has(i)) 
                        : companies;
                      handleImportToCrm(selected);
                    }}
                    style={{
                      background: "#ff6200",
                      color: "#ffffff",
                      border: "none",
                      padding: "0.45rem 0.95rem",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      boxShadow: "0 2px 8px rgba(255, 98, 0, 0.25)"
                    }}
                  >
                    <Plus size={16} />
                    <span>Importar {selectedIndices.size > 0 ? `(${selectedIndices.size})` : "Todas"} para o Pipeline</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const list = selectedIndices.size > 0 
                        ? companies.filter((_, i) => selectedIndices.has(i)) 
                        : companies;
                      handleExportCsv(list);
                    }}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #16a34a",
                      color: "#16a34a",
                      padding: "0.45rem 0.85rem",
                      borderRadius: "6px",
                      fontSize: "0.82rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    <Download size={16} />
                    <span>Exportar CSV / Excel</span>
                  </button>
                </div>
              </div>

              {/* Tabela de Empresas */}
              <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "2px solid #e5e7eb", color: "#4b5563" }}>
                      <th style={{ padding: "0.75rem 0.5rem", width: "40px", textAlign: "center" }}>
                        <input
                          type="checkbox"
                          checked={companies.length > 0 && selectedIndices.size === companies.length}
                          onChange={toggleSelectAll}
                          style={{ accentColor: "#16a34a" }}
                        />
                      </th>
                      <th style={{ padding: "0.75rem 1rem" }}>Empresa / Razão Social</th>
                      <th style={{ padding: "0.75rem 1rem" }}>CNPJ & Status</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Sócios (QSA)</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Localização</th>
                      <th style={{ padding: "0.75rem 1rem" }}>Contatos</th>
                      <th style={{ padding: "0.75rem 1rem", textAlign: "right" }}>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companies.map((comp, idx) => {
                      const isSelected = selectedIndices.has(idx);
                      const primaryPhone = comp.contatos?.whatsapp_phone || comp.contatos?.telefone1 || "";
                      const firstPartner = comp.socios && comp.socios.length > 0 ? comp.socios[0] : null;

                      return (
                        <tr 
                          key={comp.cnpj || idx}
                          style={{
                            borderBottom: "1px solid #f3f4f6",
                            background: isSelected ? "#f0fdf4" : "transparent",
                            transition: "background 0.15s"
                          }}
                        >
                          <td style={{ padding: "0.75rem 0.5rem", textAlign: "center" }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(idx)}
                              style={{ accentColor: "#16a34a" }}
                            />
                          </td>

                          {/* Razão Social & Fantasia */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ fontWeight: "700", color: "#111827" }}>
                              {comp.nome_fantasia || comp.razao_social}
                            </div>
                            {comp.nome_fantasia && comp.razao_social && comp.nome_fantasia !== comp.razao_social && (
                              <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>
                                {comp.razao_social}
                              </div>
                            )}
                            <div style={{ fontSize: "0.72rem", color: "#059669", marginTop: "2px" }}>
                              {comp.cnae_fiscal_descricao || niche}
                            </div>
                          </td>

                          {/* CNPJ & Status */}
                          <td style={{ padding: "0.75rem 1rem", whiteSpace: "nowrap" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontFamily: "monospace", fontSize: "0.82rem" }}>
                              <span>{comp.cnpj_formatted || formatCnpj(comp.cnpj)}</span>
                              <button
                                type="button"
                                onClick={() => handleCopy(comp.cnpj, `cnpj_${idx}`)}
                                title="Copiar CNPJ"
                                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: 0 }}
                              >
                                {copiedKey === `cnpj_${idx}` ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                              </button>
                            </div>
                            <div style={{ marginTop: "3px" }}>
                              <span style={{
                                background: comp.situacao_cadastral === "ATIVA" ? "#dcfce7" : "#fee2e2",
                                color: comp.situacao_cadastral === "ATIVA" ? "#15803d" : "#991b1b",
                                fontSize: "0.68rem",
                                fontWeight: "800",
                                padding: "0.15rem 0.45rem",
                                borderRadius: "4px"
                              }}>
                                {comp.situacao_cadastral || "ATIVA"}
                              </span>
                              {comp.porte && (
                                <span style={{ fontSize: "0.7rem", color: "#6b7280", marginLeft: "6px" }}>
                                  • {comp.porte}
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Sócios */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            {firstPartner ? (
                              <div>
                                <div style={{ fontWeight: "700", color: "#374151", fontSize: "0.82rem" }}>
                                  {firstPartner.nome}
                                </div>
                                <div style={{ fontSize: "0.72rem", color: "#6b7280" }}>
                                  {firstPartner.qualificacao}
                                  {comp.socios.length > 1 && ` (+${comp.socios.length - 1} sócio)`}
                                </div>
                              </div>
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "#9ca3af" }}>Individual / MEI</span>
                            )}
                          </td>

                          {/* Localização */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            <div style={{ fontSize: "0.82rem", color: "#374151" }}>
                              {comp.endereco?.municipio || city}, {comp.endereco?.uf || state}
                            </div>
                            {comp.endereco?.bairro && (
                              <div style={{ fontSize: "0.74rem", color: "#6b7280" }}>
                                {comp.endereco.bairro}
                              </div>
                            )}
                          </td>

                          {/* Contatos */}
                          <td style={{ padding: "0.75rem 1rem" }}>
                            {comp.contatos?.telefone1 && (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.8rem", color: "#374151" }}>
                                <Phone size={12} color="#16a34a" />
                                <span>{comp.contatos.telefone1}</span>
                              </div>
                            )}
                            {comp.contatos?.email && (
                              <div style={{ display: "flex", alignItems: "center", gap: "0.3rem", fontSize: "0.75rem", color: "#6b7280", marginTop: "2px" }}>
                                <Mail size={12} color="#3b82f6" />
                                <span style={{ maxWidth: "160px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {comp.contatos.email}
                                </span>
                              </div>
                            )}
                            {!comp.contatos?.telefone1 && !comp.contatos?.email && (
                              <span style={{ fontSize: "0.74rem", color: "#9ca3af" }}>Não informado na RFB</span>
                            )}
                          </td>

                          {/* Ações */}
                          <td style={{ padding: "0.75rem 1rem", textAlign: "right" }}>
                            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "0.4rem" }}>
                              {primaryPhone && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const partnerName = firstPartner?.nome || "Responsável";
                                    const msg = `Olá ${partnerName}, vi que você é responsável pela ${comp.nome_fantasia || comp.razao_social}. Tudo bem? Gostaria de apresentar uma oportunidade comercial.`;
                                    const url = buildWhatsappUrl(primaryPhone, msg);
                                    if (url) window.open(url, "_blank");
                                  }}
                                  title="Chamar no WhatsApp"
                                  style={{
                                    background: "#25D366",
                                    color: "#ffffff",
                                    border: "none",
                                    padding: "0.35rem 0.6rem",
                                    borderRadius: "6px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.25rem",
                                    fontSize: "0.75rem",
                                    fontWeight: "700"
                                  }}
                                >
                                  <MessageCircle size={13} />
                                  <span>WhatsApp</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleImportToCrm([comp])}
                                title="Importar para o Kanban CRM"
                                style={{
                                  background: "#ff6200",
                                  color: "#ffffff",
                                  border: "none",
                                  padding: "0.35rem 0.6rem",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.25rem",
                                  fontSize: "0.75rem",
                                  fontWeight: "700"
                                }}
                              >
                                <Plus size={13} />
                                <span>CRM</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => setSelectedCompanyDetail(comp)}
                                title="Ver Dossiê Completo"
                                style={{
                                  background: "#f3f4f6",
                                  color: "#374151",
                                  border: "1px solid #d1d5db",
                                  padding: "0.35rem 0.5rem",
                                  borderRadius: "6px",
                                  cursor: "pointer",
                                  fontSize: "0.75rem"
                                }}
                              >
                                <FileText size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

            </div>
          )}
        </>
      )}

      {/* ═════════════════════════════════════════════════════════════════════ */}
      {/* ABA 2: CONSULTA RÁPIDA DE CNPJ INDIVIDUAL                             */}
      {/* ═════════════════════════════════════════════════════════════════════ */}
      {activeSubTab === "lookup" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          
          <div className="glass-card" style={{ padding: "1.75rem" }}>
            <h3 style={{ fontSize: "1.15rem", fontWeight: "800", color: "#111827", marginBottom: "0.5rem" }}>
              🔍 Consulta Cadastral Completa por CNPJ
            </h3>
            <p style={{ fontSize: "0.85rem", color: "#6b7280", marginBottom: "1.25rem" }}>
              Digite o número do CNPJ para buscar os dados oficiais atualizados na Receita Federal (QSA, Capital Social, CNAE, Endereço e Contatos).
            </p>

            <form onSubmit={handleSingleLookupSubmit} style={{ display: "flex", gap: "0.75rem", maxWidth: "600px" }}>
              <input
                type="text"
                value={singleCnpjInput}
                onChange={(e) => setSingleCnpjInput(e.target.value)}
                placeholder="00.000.000/0000-00 ou 14 dígitos"
                style={{
                  flex: 1,
                  padding: "0.75rem 1rem",
                  borderRadius: "8px",
                  border: "1px solid #d1d5db",
                  fontSize: "1rem",
                  fontFamily: "monospace",
                  outline: "none"
                }}
              />
              <button
                type="submit"
                disabled={singleLoading}
                style={{
                  background: "#16a34a",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "8px",
                  padding: "0.75rem 1.5rem",
                  fontSize: "0.95rem",
                  fontWeight: "800",
                  cursor: singleLoading ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}
              >
                {singleLoading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
                <span>Consultar</span>
              </button>
            </form>

            {singleError && (
              <div style={{
                marginTop: "1rem",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                padding: "0.85rem 1.25rem",
                borderRadius: "8px",
                color: "#991b1b",
                fontSize: "0.88rem",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem"
              }}>
                <AlertCircle size={18} color="#dc2626" />
                <span>{singleError}</span>
              </div>
            )}
          </div>

          {/* Cartão de Detalhes do CNPJ Consultado */}
          {singleCnpjResult && (
            <div className="glass-card" style={{ padding: "1.75rem", border: "1px solid #bbf7d0", background: "#ffffff" }}>
              
              {/* Header do Cartão */}
              <div style={{
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "1rem",
                paddingBottom: "1.25rem",
                borderBottom: "1px solid #e5e7eb"
              }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <h3 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#111827", margin: 0 }}>
                      {singleCnpjResult.nome_fantasia || singleCnpjResult.razao_social}
                    </h3>
                    <span style={{
                      background: singleCnpjResult.situacao_cadastral === "ATIVA" ? "#dcfce7" : "#fee2e2",
                      color: singleCnpjResult.situacao_cadastral === "ATIVA" ? "#15803d" : "#991b1b",
                      fontSize: "0.75rem",
                      fontWeight: "800",
                      padding: "0.2rem 0.6rem",
                      borderRadius: "6px"
                    }}>
                      {singleCnpjResult.situacao_cadastral}
                    </span>
                  </div>

                  <div style={{ fontSize: "0.9rem", color: "#4b5563", marginTop: "4px" }}>
                    Razão Social: <strong>{singleCnpjResult.razao_social}</strong>
                  </div>
                  <div style={{ fontSize: "0.85rem", color: "#6b7280", fontFamily: "monospace", marginTop: "2px" }}>
                    CNPJ: {singleCnpjResult.cnpj_formatted} • Abertura: {singleCnpjResult.data_abertura}
                  </div>
                </div>

                {/* Botões de Ação */}
                <div style={{ display: "flex", gap: "0.6rem" }}>
                  <button
                    type="button"
                    onClick={() => handleImportToCrm([singleCnpjResult])}
                    style={{
                      background: "#ff6200",
                      color: "#ffffff",
                      border: "none",
                      padding: "0.6rem 1.2rem",
                      borderRadius: "8px",
                      fontSize: "0.88rem",
                      fontWeight: "800",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      boxShadow: "0 2px 8px rgba(255, 98, 0, 0.25)"
                    }}
                  >
                    <Plus size={16} />
                    <span>Adicionar ao Pipeline CRM</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleExportCsv([singleCnpjResult])}
                    style={{
                      background: "#ffffff",
                      border: "1px solid #16a34a",
                      color: "#16a34a",
                      padding: "0.6rem 1rem",
                      borderRadius: "8px",
                      fontSize: "0.88rem",
                      fontWeight: "700",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem"
                    }}
                  >
                    <Download size={16} />
                    <span>Exportar CSV</span>
                  </button>
                </div>
              </div>

              {/* Grid de Informações Estruturadas */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginTop: "1.5rem" }}>
                
                {/* 1. Atividade & Porte */}
                <div style={{ background: "#f9fafb", padding: "1.2rem", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    🏢 Atividade & Porte
                  </h4>
                  <div style={{ fontSize: "0.85rem", color: "#374151", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <div><strong>CNAE Principal:</strong> {singleCnpjResult.cnae_fiscal} - {singleCnpjResult.cnae_fiscal_descricao}</div>
                    <div><strong>Natureza Jurídica:</strong> {singleCnpjResult.natureza_juridica}</div>
                    <div><strong>Porte:</strong> {singleCnpjResult.porte}</div>
                    <div><strong>Capital Social:</strong> R$ {(singleCnpjResult.capital_social || 0).toLocaleString("pt-BR")}</div>
                  </div>
                </div>

                {/* 2. Endereço */}
                <div style={{ background: "#f9fafb", padding: "1.2rem", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    📍 Localização
                  </h4>
                  <div style={{ fontSize: "0.85rem", color: "#374151", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                    <div><strong>Logradouro:</strong> {singleCnpjResult.endereco?.logradouro}, {singleCnpjResult.endereco?.numero} {singleCnpjResult.endereco?.complemento}</div>
                    <div><strong>Bairro:</strong> {singleCnpjResult.endereco?.bairro}</div>
                    <div><strong>Cidade/UF:</strong> {singleCnpjResult.endereco?.municipio} - {singleCnpjResult.endereco?.uf}</div>
                    <div><strong>CEP:</strong> {singleCnpjResult.endereco?.cep}</div>
                  </div>
                </div>

                {/* 3. Sócios e Administradores (QSA) */}
                <div style={{ background: "#f9fafb", padding: "1.2rem", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    👥 Quadro Societário (QSA)
                  </h4>
                  {singleCnpjResult.socios && singleCnpjResult.socios.length > 0 ? (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                      {singleCnpjResult.socios.map((s, idx) => (
                        <div key={idx} style={{ fontSize: "0.85rem", borderBottom: "1px dashed #d1d5db", paddingBottom: "0.3rem" }}>
                          <div style={{ fontWeight: "700", color: "#111827" }}>{s.nome}</div>
                          <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>{s.qualificacao}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: "0.85rem", color: "#9ca3af" }}>Empresa individual ou sem sócios listados.</span>
                  )}
                </div>

                {/* 4. Contatos Oficiais */}
                <div style={{ background: "#f9fafb", padding: "1.2rem", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
                  <h4 style={{ fontSize: "0.85rem", fontWeight: "800", color: "#1f2937", textTransform: "uppercase", marginBottom: "0.75rem" }}>
                    📞 Contatos Registrados
                  </h4>
                  <div style={{ fontSize: "0.85rem", color: "#374151", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                    {singleCnpjResult.contatos?.telefone1 && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Phone size={14} color="#16a34a" />
                        <span>{singleCnpjResult.contatos.telefone1}</span>
                      </div>
                    )}
                    {singleCnpjResult.contatos?.email && (
                      <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                        <Mail size={14} color="#3b82f6" />
                        <span>{singleCnpjResult.contatos.email}</span>
                      </div>
                    )}
                    {singleCnpjResult.contatos?.whatsapp_phone && (
                      <button
                        type="button"
                        onClick={() => {
                          const mainPartner = singleCnpjResult.socios?.[0]?.nome || "Responsável";
                          const msg = `Olá ${mainPartner}, vi que você é sócio da empresa ${singleCnpjResult.nome_fantasia || singleCnpjResult.razao_social}. Tudo bem?`;
                          const url = buildWhatsappUrl(singleCnpjResult.contatos.whatsapp_phone, msg);
                          if (url) window.open(url, "_blank");
                        }}
                        style={{
                          background: "#25D366",
                          color: "#ffffff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "0.4rem 0.8rem",
                          fontSize: "0.8rem",
                          fontWeight: "700",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem",
                          marginTop: "0.4rem"
                        }}
                      >
                        <MessageCircle size={14} />
                        <span>Abrir WhatsApp do Responsável</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ── Modal de Dossiê Rápido da Empresa ── */}
      {selectedCompanyDetail && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="glass-card" style={{
            width: "100%",
            maxWidth: "600px",
            background: "#ffffff",
            padding: "1.75rem",
            maxHeight: "90vh",
            overflowY: "auto"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#111827", margin: 0 }}>
                {selectedCompanyDetail.nome_fantasia || selectedCompanyDetail.razao_social}
              </h3>
              <button
                type="button"
                onClick={() => setSelectedCompanyDetail(null)}
                style={{ background: "none", border: "none", fontSize: "1.2rem", cursor: "pointer", color: "#6b7280" }}
              >
                ✕
              </button>
            </div>

            <div style={{ fontSize: "0.85rem", color: "#374151", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              <div><strong>CNPJ:</strong> {selectedCompanyDetail.cnpj_formatted || formatCnpj(selectedCompanyDetail.cnpj)}</div>
              <div><strong>Razão Social:</strong> {selectedCompanyDetail.razao_social}</div>
              <div><strong>Situação Cadastral:</strong> {selectedCompanyDetail.situacao_cadastral}</div>
              <div><strong>Data de Abertura:</strong> {selectedCompanyDetail.data_abertura}</div>
              <div><strong>CNAE:</strong> {selectedCompanyDetail.cnae_fiscal_descricao}</div>
              <div><strong>Capital Social:</strong> R$ {(selectedCompanyDetail.capital_social || 0).toLocaleString("pt-BR")}</div>
              <div><strong>Endereço:</strong> {selectedCompanyDetail.endereco?.logradouro}, {selectedCompanyDetail.endereco?.numero} - {selectedCompanyDetail.endereco?.bairro}, {selectedCompanyDetail.endereco?.municipio}/{selectedCompanyDetail.endereco?.uf}</div>
              
              <div style={{ marginTop: "0.5rem" }}>
                <strong>Sócios / Administradores:</strong>
                <ul style={{ paddingLeft: "1.2rem", marginTop: "0.3rem" }}>
                  {(selectedCompanyDetail.socios || []).map((s, i) => (
                    <li key={i}>{s.nome} ({s.qualificacao})</li>
                  ))}
                </ul>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "1.5rem" }}>
              <button
                type="button"
                onClick={() => {
                  handleImportToCrm([selectedCompanyDetail]);
                  setSelectedCompanyDetail(null);
                }}
                style={{
                  background: "#ff6200",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: "6px",
                  padding: "0.5rem 1rem",
                  fontSize: "0.85rem",
                  fontWeight: "700",
                  cursor: "pointer"
                }}
              >
                Importar para o CRM
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
