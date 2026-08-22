import React, { useState, useEffect } from "react";
import { X, Search, Sparkles, AlertCircle, RefreshCw, Zap, Globe, ShieldCheck, MapPin, Building, CheckCircle2 } from "lucide-react";
import { searchLeadsNative, searchLeadsApify } from "../utils/apifyService";
import { fetchAppSettings } from "../utils/dataService";

const SUGGESTED_NICHES = [
  "Marcenaria",
  "Vidraçaria",
  "Clínica Odontológica",
  "Escritório de Advocacia",
  "Clínica de Estética",
  "Auto Center & Mecânica",
  "Restaurante",
  "Imobiliária"
];

const SUGGESTED_CITIES = [
  "São Paulo, SP",
  "Rio de Janeiro, RJ",
  "Curitiba, PR",
  "Belo Horizonte, MG",
  "Campinas, SP",
  "Porto Alegre, RS",
  "Brasília, DF"
];

export default function ApifyLeadFinderModal({ isOpen, onClose, onImportLeads }) {
  const [engine, setEngine] = useState("apify"); // "apify" (Google Maps Oficial) ou "native" (Gratuito)
  const [niche, setNiche] = useState("Marcenaria");
  const [location, setLocation] = useState("São Paulo, SP");
  const [maxResults, setMaxResults] = useState(30);
  const [apifyToken, setApifyToken] = useState(() => {
    return localStorage.getItem("APIFY_API_TOKEN") || "";
  });
  
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    if (isOpen && !apifyToken) {
      fetchAppSettings().then((settings) => {
        if (settings?.apify_api_token) {
          setApifyToken(settings.apify_api_token);
          localStorage.setItem("APIFY_API_TOKEN", settings.apify_api_token);
        }
      });
    }
  }, [isOpen, apifyToken]);

  if (!isOpen) return null;

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setStatusMsg(engine === "apify" 
      ? "📍 Extraindo estabelecimentos 100% reais diretamente do Google Maps..."
      : "🕷️ Buscando empresas cadastradas no OpenStreetMap e Web Local..."
    );

    try {
      let data;
      if (engine === "apify") {
        data = await searchLeadsApify({ niche, location, maxResults, apifyToken });
      } else {
        data = await searchLeadsNative({ niche, location, maxResults });
      }

      if (data.leads && data.leads.length > 0) {
        onImportLeads(data.leads);
        onClose();
      } else {
        setErrorMsg("Nenhuma empresa localizada com esses termos no Google Maps. Tente um nicho ou cidade mais ampla.");
      }
    } catch (err) {
      setErrorMsg(err.message || "Erro durante a extração de leads.");
    } finally {
      setLoading(false);
      setStatusMsg("");
    }
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(28, 25, 23, 0.5)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "650px",
        padding: "1.75rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        background: "#ffffff",
        border: "1px solid #e8e6e0",
        boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div style={{ background: "#fff7ed", padding: "0.5rem", borderRadius: "10px", border: "1px solid #ffedd5" }}>
              <Zap size={22} color="#ff6200" />
            </div>
            <div>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#1c1917", margin: 0 }}>
                Buscador de Leads 100% Reais (Google Maps)
              </h3>
              <span style={{ fontSize: "0.75rem", color: "#78716c" }}>
                Extrai estabelecimentos comerciais reais com avaliações, telefones e websites
              </span>
            </div>
          </div>

          <button onClick={onClose} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
            <X size={22} />
          </button>
        </div>

        {/* ── Engine Switcher (Apify Google Maps vs Motor Web) ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1.2fr 1fr",
          gap: "0.5rem",
          background: "#faf9f6",
          padding: "0.35rem",
          borderRadius: "8px",
          border: "1px solid #e8e6e0"
        }}>
          <button
            type="button"
            onClick={() => setEngine("apify")}
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.82rem",
              fontWeight: engine === "apify" ? "800" : "600",
              cursor: "pointer",
              border: engine === "apify" ? "1px solid #ea580c" : "1px solid transparent",
              background: engine === "apify" ? "#ffffff" : "transparent",
              color: engine === "apify" ? "#ea580c" : "#57534e",
              boxShadow: engine === "apify" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.15s"
            }}
          >
            <Globe size={15} color={engine === "apify" ? "#ea580c" : "#78716c"} />
            <span>Google Maps Oficial (Apify)</span>
          </button>

          <button
            type="button"
            onClick={() => setEngine("native")}
            style={{
              padding: "0.6rem 0.8rem",
              borderRadius: "6px",
              fontSize: "0.82rem",
              fontWeight: engine === "native" ? "800" : "600",
              cursor: "pointer",
              border: engine === "native" ? "1px solid #ea580c" : "1px solid transparent",
              background: engine === "native" ? "#ffffff" : "transparent",
              color: engine === "native" ? "#ea580c" : "#57534e",
              boxShadow: engine === "native" ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.4rem",
              transition: "all 0.15s"
            }}
          >
            <Zap size={15} color={engine === "native" ? "#ea580c" : "#78716c"} />
            <span>Motor Web Local (Gratuito)</span>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSearchSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          
          {/* Nicho */}
          <div>
            <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "#1c1917", display: "block", marginBottom: "0.35rem" }}>
              Nicho / Ramo de Atuação:
            </label>
            <input 
              type="text" 
              className="glass-input" 
              style={{ width: "100%", fontSize: "0.88rem" }}
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="Ex: Marcenaria, Vidraçaria, Odontologia, Mecânica..."
              required
            />
            {/* Quick Pills */}
            <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
              {SUGGESTED_NICHES.slice(0, 5).map(item => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setNiche(item)}
                  style={{
                    fontSize: "0.72rem",
                    padding: "0.15rem 0.5rem",
                    borderRadius: "999px",
                    background: niche === item ? "#fff7ed" : "#faf9f6",
                    color: niche === item ? "#ea580c" : "#78716c",
                    border: niche === item ? "1px solid #fed7aa" : "1px solid #e8e6e0",
                    cursor: "pointer"
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          {/* Cidade & Quantidade */}
          <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1fr", gap: "0.75rem" }}>
            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "#1c1917", display: "block", marginBottom: "0.35rem" }}>
                Cidade e Estado:
              </label>
              <input 
                type="text" 
                className="glass-input" 
                style={{ width: "100%", fontSize: "0.88rem" }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: São Paulo, SP"
                required
              />
              {/* City quick pills */}
              <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                {SUGGESTED_CITIES.slice(0, 3).map(city => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => setLocation(city)}
                    style={{
                      fontSize: "0.72rem",
                      padding: "0.15rem 0.45rem",
                      borderRadius: "999px",
                      background: location === city ? "#fff7ed" : "#faf9f6",
                      color: location === city ? "#ea580c" : "#78716c",
                      border: location === city ? "1px solid #fed7aa" : "1px solid #e8e6e0",
                      cursor: "pointer"
                    }}
                  >
                    {city.split(",")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ fontSize: "0.82rem", fontWeight: "700", color: "#1c1917", display: "block", marginBottom: "0.35rem" }}>
                Quantidade de Leads:
              </label>
              <select 
                className="glass-select"
                style={{ width: "100%", fontSize: "0.88rem" }}
                value={maxResults}
                onChange={(e) => setMaxResults(Number(e.target.value))}
              >
                <option value={15}>15 empresas</option>
                <option value={30}>30 empresas</option>
                <option value={50}>50 empresas</option>
                <option value={100}>100 empresas</option>
              </select>
            </div>
          </div>

          {/* Token Apify */}
          {engine === "apify" && (
            <div style={{ background: "#faf9f6", padding: "0.75rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.25rem" }}>
                <label style={{ fontSize: "0.78rem", fontWeight: "700", color: "#1c1917" }}>
                  Token Apify (Google Places Actor):
                </label>
                {apifyToken && (
                  <span style={{ fontSize: "0.7rem", color: "#16a34a", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                    <CheckCircle2 size={12} /> Salvo e Conectado
                  </span>
                )}
              </div>
              <input 
                type="password" 
                className="glass-input" 
                style={{ width: "100%", fontSize: "0.8rem" }}
                value={apifyToken}
                onChange={(e) => setApifyToken(e.target.value)}
                placeholder="Insira seu token do Apify para extrair do Google Maps em tempo real"
              />
            </div>
          )}

          {/* Error message */}
          {errorMsg && (
            <div style={{
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#dc2626",
              padding: "0.75rem",
              borderRadius: "6px",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <AlertCircle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Status Message */}
          {statusMsg && (
            <div style={{
              background: "#fff7ed",
              border: "1px solid #fed7aa",
              color: "#ea580c",
              padding: "0.75rem",
              borderRadius: "6px",
              fontSize: "0.82rem",
              display: "flex",
              alignItems: "center",
              gap: "0.5rem"
            }}>
              <RefreshCw size={16} className="animate-spin" />
              <span>{statusMsg}</span>
            </div>
          )}

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary"
            disabled={loading}
            style={{ 
              justifyContent: "center", 
              padding: "0.75rem", 
              fontSize: "0.95rem",
              background: "linear-gradient(135deg, #ff6200 0%, #ea580c 100%)",
              opacity: loading ? 0.7 : 1,
              marginTop: "0.25rem"
            }}
          >
            {loading ? <RefreshCw size={18} className="animate-spin" /> : <Search size={18} />}
            <span>{loading ? "Extraindo dados do Google Maps..." : `Extrair ${maxResults} Empresas Reais do Google Maps`}</span>
          </button>
        </form>
      </div>
    </div>
  );
}
