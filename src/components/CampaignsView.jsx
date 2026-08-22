import React, { useState } from "react";
import { 
  Briefcase, Play, RefreshCw, CheckCircle2, AlertCircle, Sparkles 
} from "lucide-react";
import { runProspectingCampaign } from "../utils/campaignEngine";

export default function CampaignsView({ existingCompanies = [], onImportCampaignLeads }) {
  const [campaignName, setCampaignName] = useState("Clínicas Odontológicas - São Paulo");
  const [niche, setNiche] = useState("Clínica Odontológica");
  const [location, setLocation] = useState("São Paulo, SP");
  const [maxResults, setMaxResults] = useState(25);
  const [apifyToken, setApifyToken] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [lastReport, setLastReport] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const handleRunCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const { processedLeads, campaignReport } = await runProspectingCampaign({
        name: campaignName,
        niche,
        location,
        maxResults,
        apifyToken
      }, existingCompanies);

      setLastReport(campaignReport);
      if (onImportCampaignLeads) {
        onImportCampaignLeads(processedLeads);
      }
    } catch (err) {
      setErrorMsg(err.message || "Erro ao executar a campanha de prospecção.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* HEADER BANNER — OFF-WHITE & RADIX ORANGE */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #ffffff 100%)",
        border: "1px solid #fed7aa",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Briefcase size={26} color="#ff6200" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#1c1917" }}>
              💼 CAMPANHAS DE PROSPECÇÃO AUTOMÁTICA
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "#57534e", marginTop: "4px" }}>
            Execute pipelines completos de prospecção: <strong>Apify → Deduplicação → Análise de Site → PageSpeed → Detecção Pixel/GA4 → Score IA</strong>.
          </p>
        </div>
      </div>

      {/* CREATE CAMPAIGN FORM */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Sparkles size={20} color="#ff6200" />
          <span>Configurar & Executar Nova Campanha de Prospecção</span>
        </h3>

        <form onSubmit={handleRunCampaign} style={{ display: "flex", flexDirection: "column", gap: "1.1rem" }}>
          
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Nome da Campanha:
              </label>
              <input 
                className="glass-input" 
                type="text" 
                required 
                style={{ width: "100%" }}
                value={campaignName}
                onChange={(e) => setCampaignName(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Nicho / Segmento:
              </label>
              <input 
                className="glass-input" 
                type="text" 
                required 
                style={{ width: "100%" }}
                value={niche}
                onChange={(e) => setNiche(e.target.value)}
              />
            </div>

            <div>
              <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Localização / Cidade:
              </label>
              <input 
                className="glass-input" 
                type="text" 
                required 
                style={{ width: "100%" }}
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr", gap: "1rem" }}>
            <div>
              <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Qtd. Máxima de Leads:
              </label>
              <select 
                className="glass-select" 
                style={{ width: "100%" }}
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
              <label style={{ fontSize: "0.78rem", color: "#78716c", marginBottom: "4px", display: "block" }}>
                Chave Apify API Token (Opcional - Actor `compass/crawler-google-places`):
              </label>
              <input 
                className="glass-input" 
                type="password" 
                placeholder="Insera seu apify_api_token..." 
                style={{ width: "100%" }}
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

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "0.5rem" }}>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
              style={{ padding: "0.75rem 1.5rem" }}
            >
              {loading ? <RefreshCw size={18} className="animate-spin" /> : <Play size={18} />}
              <span>{loading ? "Executando Pipeline de Prospecção..." : "Rodar Campanha Agora"}</span>
            </button>
          </div>

        </form>
      </div>

      {/* CAMPAIGN REPORT RESULT */}
      {lastReport && (
        <div className="glass-card" style={{ padding: "1.5rem", borderLeft: "5px solid #16a34a" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "900", color: "#16a34a", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <CheckCircle2 size={20} />
              <span>RELATÓRIO DA CAMPANHA: "{lastReport.campaignName}"</span>
            </h3>

            <span className="badge badge-niche">
              🎉 {lastReport.insertedCount} novos leads adicionados
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
            
            <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>Empresas Encontradas</span>
              <strong style={{ fontSize: "1.25rem", color: "#1c1917" }}>{lastReport.totalFound}</strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>Sem Website (Venda de Site)</span>
              <strong style={{ fontSize: "1.25rem", color: "#dc2626" }}>{lastReport.noWebsite}</strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>Website Ruim (&lt; 50)</span>
              <strong style={{ fontSize: "1.25rem", color: "#ea580c" }}>{lastReport.badWebsite}</strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>Sem Meta Pixel</span>
              <strong style={{ fontSize: "1.25rem", color: "#0284c7" }}>{lastReport.noMetaPixel}</strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>Leads HOT (Score 90+)</span>
              <strong style={{ fontSize: "1.25rem", color: "#16a34a" }}>{lastReport.hotLeads}</strong>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
