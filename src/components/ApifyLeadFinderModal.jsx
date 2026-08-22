import React, { useState } from "react";
import { X, Search, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import { searchLeadsApify } from "../utils/apifyService";

export default function ApifyLeadFinderModal({ isOpen, onClose, onImportLeads }) {
  const [niche, setNiche] = useState("Clínica Odontológica");
  const [location, setLocation] = useState("São Paulo, SP");
  const [maxResults, setMaxResults] = useState(25);
  const [apifyToken, setApifyToken] = useState(() => {
    return localStorage.getItem("APIFY_API_TOKEN") || "";
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!isOpen) return null;

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const data = await searchLeadsApify({
        niche,
        location,
        maxResults,
        apifyToken
      });

      if (data.leads && data.leads.length > 0) {
        onImportLeads(data.leads);
        onClose();
      } else {
        setErrorMsg("Nenhum lead retornado para esses termos de pesquisa.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Erro ao conectar com a API de extração.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(28, 25, 23, 0.45)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "600px",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        background: "#ffffff",
        border: "1px solid #e8e6e0"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ background: "#fff7ed", padding: "0.5rem", borderRadius: "8px", border: "1px solid #ffedd5" }}>
              <Search size={20} color="#ff6200" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.15rem", fontWeight: "900", color: "#1c1917", margin: 0 }}>
                Buscador de Leads Apify (Google Places)
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#78716c" }}>
                Extração real por Nicho & Região com filtro de agregadores
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
            <X size={22} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          
          <div>
            <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
              Segmento / Nicho:
            </label>
            <input 
              className="glass-input"
              type="text"
              required
              placeholder="Ex: Dentista, Restaurante, Advogado..."
              style={{ width: "100%", fontSize: "0.88rem" }}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
            />
          </div>

          <div>
            <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
              Cidade / Região:
            </label>
            <input 
              className="glass-input"
              type="text"
              required
              placeholder="Ex: São Paulo, SP ou Rio de Janeiro, RJ..."
              style={{ width: "100%", fontSize: "0.88rem" }}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Qtd. Máxima de Leads:
              </label>
              <select 
                className="glass-select"
                style={{ width: "100%", fontSize: "0.88rem" }}
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
              >
                <option value={15}>15 Leads</option>
                <option value={25}>25 Leads</option>
                <option value={50}>50 Leads</option>
                <option value={100}>100 Leads</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "0.8rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Token Apify Configurado:
              </label>
              <input 
                className="glass-input"
                type="password"
                placeholder="apify_api_..."
                style={{ width: "100%", fontSize: "0.88rem" }}
                value={apifyToken}
                onChange={(e) => setApifyToken(e.target.value)}
              />
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: "#fef2f2", border: "1px solid #fecaca", padding: "0.85rem", borderRadius: "6px", color: "#dc2626", fontSize: "0.85rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.5rem" }}>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <RefreshCw size={16} className="animate-spin" /> : <Search size={16} />}
              <span>{loading ? "Buscando Empresas Reais..." : "Buscar & Importar Leads"}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
