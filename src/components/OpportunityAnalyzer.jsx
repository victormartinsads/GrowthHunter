import React, { useState, useMemo } from "react";
import { 
  TrendingUp, Target, ShieldAlert, Sparkles, Check, Copy, MessageCircle, 
  ExternalLink, Search, MapPin, Eye, Zap, DollarSign, Package, AlertCircle, Edit3, Mail, Flame, Filter, Globe, AlertTriangle, Users, UserCheck
} from "lucide-react";

import { analyzeLeadOpportunity } from "../utils/opportunityEngine";
import { buildWhatsappUrl, buildInstagramUrl } from "../utils/helpers";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function OpportunityAnalyzer({ leads, onUpdateLeadStatus, onOpenEditModal, onOpenEmailModal }) {
  const [filterCase, setFilterCase] = useState("TODOS");
  const [filterNiche, setFilterNiche] = useState("TODOS");
  const [copiedPitchId, setCopiedPitchId] = useState(null);

  const availableNiches = useMemo(() => Array.from(new Set(leads.map(l => normalizeSegment(l.niche)).filter(Boolean))), [leads]);

  // Analisa todos os leads
  const analyzedLeads = useMemo(() => {
    return leads.map(lead => {
      const analysis = analyzeLeadOpportunity(lead);
      return { lead, analysis };
    }).sort((a, b) => b.analysis.opportunityScore - a.analysis.opportunityScore);
  }, [leads]);

  // Filtra por caso do site (Sem Site vs Site Deficiente vs Site OK) e por nicho
  const filteredAnalysis = useMemo(() => {
    return analyzedLeads.filter(({ lead, analysis }) => {
      if (filterCase === "SEM_SITE" && analysis.siteStatusCase !== "CASO_A_SEM_SITE") return false;
      if (filterCase === "SITE_DEFICIENTE" && analysis.siteStatusCase !== "CASO_B_SITE_DEFICIENTE") return false;
      if (filterCase === "SITE_OK" && analysis.siteStatusCase !== "CASO_C_SITE_OK") return false;
      if (filterNiche !== "TODOS" && normalizeSegment(lead.niche) !== filterNiche) return false;
      return true;
    });
  }, [analyzedLeads, filterCase, filterNiche]);

  const noWebsiteCount = analyzedLeads.filter(a => a.analysis.siteStatusCase === "CASO_A_SEM_SITE").length;
  const deficientWebsiteCount = analyzedLeads.filter(a => a.analysis.siteStatusCase === "CASO_B_SITE_DEFICIENTE").length;

  const handleCopyPitch = (id, pitchText) => {
    navigator.clipboard.writeText(pitchText);
    setCopiedPitchId(id);
    setTimeout(() => setCopiedPitchId(null), 2000);
  };

  const handleWhatsAppWithPitch = (phone, pitchText) => {
    const url = buildWhatsappUrl(phone, pitchText);
    if (url) window.open(url, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* HEADER BANNER */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.16) 0%, rgba(15, 23, 42, 0.85) 100%)",
        border: "1px solid rgba(239, 68, 68, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Globe size={24} color="#f87171" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc" }}>
              Caçador de Oportunidades: Venda de Sites (1º Foco) & Google Ads (2º Foco)
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Mapeie empresas sem site ou com páginas deficientes, analise a concorrência na cidade e ofereça o combo de atração no Google.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.6rem", alignItems: "center", flexWrap: "wrap" }}>
          <span className="badge" style={{ background: "rgba(239, 68, 68, 0.2)", color: "#f87171", border: "1px solid rgba(239, 68, 68, 0.4)", padding: "0.55rem 0.95rem", fontSize: "0.82rem" }}>
            <Flame size={15} color="#f87171" />
            <span>{noWebsiteCount} Empresas SEM WEBSITE (Melhores Alvos)</span>
          </span>
        </div>
      </div>

      {/* FILTER BAR BY SITE STATUS & NICHE */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        
        {/* Site Case Selector */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          <button 
            className="btn-secondary" 
            onClick={() => setFilterCase("TODOS")}
            style={{
              fontSize: "0.82rem",
              background: filterCase === "TODOS" ? "rgba(16, 185, 129, 0.2)" : "transparent",
              color: filterCase === "TODOS" ? "#34d399" : "var(--text-muted)",
              borderColor: filterCase === "TODOS" ? "#10b981" : "var(--border-color)"
            }}
          >
            Todas ({analyzedLeads.length})
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setFilterCase("SEM_SITE")}
            style={{
              fontSize: "0.82rem",
              background: filterCase === "SEM_SITE" ? "rgba(239, 68, 68, 0.2)" : "transparent",
              color: filterCase === "SEM_SITE" ? "#f87171" : "var(--text-muted)",
              borderColor: filterCase === "SEM_SITE" ? "#ef4444" : "var(--border-color)"
            }}
          >
            🚨 Sem Site ({noWebsiteCount})
          </button>
          <button 
            className="btn-secondary" 
            onClick={() => setFilterCase("SITE_DEFICIENTE")}
            style={{
              fontSize: "0.82rem",
              background: filterCase === "SITE_DEFICIENTE" ? "rgba(245, 158, 11, 0.2)" : "transparent",
              color: filterCase === "SITE_DEFICIENTE" ? "#fbbf24" : "var(--text-muted)",
              borderColor: filterCase === "SITE_DEFICIENTE" ? "#f59e0b" : "var(--border-color)"
            }}
          >
            ⚠️ Site Deficiente ({deficientWebsiteCount})
          </button>
        </div>

        {/* Niche Selector */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={15} color="var(--text-muted)" />
          <span style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>Filtrar Nicho:</span>
          <select 
            className="glass-select"
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
          >
            <option value="TODOS">Todos os Nichos</option>
            {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* CARDS BENTO GRID FOR WEBSITE OPPORTUNITIES */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {filteredAnalysis.length === 0 ? (
          <div className="glass-card" style={{ padding: "3.5rem 1.5rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <Search size={42} color="#06b6d4" />
            <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc" }}>Nenhuma empresa na lista para análise</h3>
            <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", maxWidth: "520px" }}>
              Sua lista de leads está limpa. Clique em <strong>"Caçar Leads Apify"</strong> no menu superior para buscar empresas por nicho e região em tempo real!
            </p>
          </div>
        ) : (
          filteredAnalysis.map(({ lead, analysis }) => {
          const isCopied = copiedPitchId === lead.id;

          return (
            <div 
              key={lead.id} 
              className="glass-card glass-card-hover" 
              style={{
                padding: "1.6rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                borderLeft: `5px solid ${analysis.siteStatusColor}`
              }}
            >
              {/* Card Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "800", color: "#f8fafc" }}>
                      {lead.name}
                    </h3>
                    <span className="badge" style={{
                      background: `${analysis.siteStatusColor}20`,
                      color: analysis.siteStatusColor,
                      border: `1px solid ${analysis.siteStatusColor}50`,
                      fontWeight: "700"
                    }}>
                      {analysis.siteStatusBadge}
                    </span>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
                    <span className="badge badge-niche">{normalizeSegment(lead.niche)}</span>
                    <span className="badge badge-region">
                      <MapPin size={11} />
                      {lead.city} {lead.neighborhood ? `(${lead.neighborhood})` : ''}
                    </span>

                    {lead.partners && lead.partners.length > 0 && (
                      <span className="badge" style={{ background: "rgba(16, 185, 129, 0.2)", color: "#34d399", border: "1px solid rgba(16, 185, 129, 0.4)", fontSize: "0.72rem" }}>
                        <UserCheck size={12} />
                        <span>Sócios (QSA): {lead.partners.map(p => p.name).join(", ")}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Contract Fee Estimate Badge & Edit button */}
                <div style={{ display: "flex", gap: "0.6rem", alignItems: "center" }}>
                  {onOpenEditModal && (
                    <button 
                      className="btn-secondary"
                      onClick={() => onOpenEditModal(lead)}
                      title="Editar Empresa"
                      style={{ padding: "0.55rem 0.75rem", fontSize: "0.8rem" }}
                    >
                      <Edit3 size={15} />
                      <span>Editar</span>
                    </button>
                  )}

                  <div style={{
                    background: "rgba(16, 185, 129, 0.15)",
                    border: "1px solid rgba(16, 185, 129, 0.35)",
                    padding: "0.65rem 1rem",
                    borderRadius: "var(--radius-sm)",
                    textAlign: "right"
                  }}>
                    <span style={{ fontSize: "0.72rem", color: "#34d399", fontWeight: "700", display: "block" }}>
                      OFERTA SUGERIDA (SITE + ADS):
                    </span>
                    <strong style={{ fontSize: "0.92rem", color: "#ffffff" }}>
                      {analysis.suggestedFee}
                    </strong>
                  </div>
                </div>
              </div>

              {/* THREE COLUMNS: SITE DIAGNOSIS, WEBSITE IMPROVEMENTS, LOCAL COMPETITION */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1.2rem" }}>
                
                {/* 1. Diagnóstico do Website */}
                <div style={{
                  background: "rgba(10, 15, 26, 0.75)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1.1rem"
                }}>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "#38bdf8", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Globe size={16} color="#38bdf8" />
                    <span>Diagnóstico de Presença Web:</span>
                  </h4>

                  <p style={{ fontSize: "0.85rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                    {lead.website ? (
                      <>
                        <strong>Site Cadastrado:</strong> {lead.website}<br/>
                        <span style={{ color: "#fbbf24", fontSize: "0.78rem" }}>{lead.digitalAudit || "Rastreamento pendente."}</span>
                      </>
                    ) : (
                      <span style={{ color: "#f87171", fontWeight: "700" }}>❌ A empresa NÃO possui website. Alvo ideal para fechar criação de Landing Page no valor de R$ 1.500 a R$ 2.500.</span>
                    )}
                  </p>
                </div>

                {/* 2. Pontos de Melhoria no Site */}
                <div style={{
                  background: "rgba(10, 15, 26, 0.75)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1.1rem"
                }}>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "#fbbf24", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <AlertTriangle size={16} color="#fbbf24" />
                    <span>Pontos de Melhoria Específicos:</span>
                  </h4>

                  <ul style={{ paddingLeft: "1.1rem", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem", color: "#cbd5e1" }}>
                    {analysis.improvements.map((imp, idx) => (
                      <li key={idx} style={{ lineHeight: "1.35" }}>
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* 3. Análise da Concorrência na Cidade */}
                <div style={{
                  background: "rgba(10, 15, 26, 0.75)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-sm)",
                  padding: "1.1rem"
                }}>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: "700", color: "#c084fc", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Users size={16} color="#c084fc" />
                    <span>Análise da Concorrência em {lead.city}:</span>
                  </h4>

                  <p style={{ fontSize: "0.82rem", color: "#cbd5e1", lineHeight: "1.4" }}>
                    {analysis.competitionAnalysis}
                  </p>
                </div>

              </div>

              {/* SEARCH MECHANISMS DEEP LINKS */}
              <div style={{ background: "rgba(22, 30, 48, 0.6)", padding: "0.85rem 1.1rem", borderRadius: "var(--radius-sm)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Search size={14} color="#38bdf8" />
                  <span><strong>Investigar Concorrência no Google & Meta Ads:</strong></span>
                </span>

                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <a href={analysis.googleSearchUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: "0.78rem", padding: "0.35rem 0.65rem" }}>
                    <Search size={13} />
                    <span>Google Search</span>
                  </a>
                  <a href={analysis.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: "0.78rem", padding: "0.35rem 0.65rem" }}>
                    <MapPin size={13} color="#f59e0b" />
                    <span>Google Maps</span>
                  </a>
                  <a href={analysis.metaAdsLibraryUrl} target="_blank" rel="noopener noreferrer" className="btn-secondary" style={{ fontSize: "0.78rem", padding: "0.35rem 0.65rem" }}>
                    <Eye size={13} color="#10b981" />
                    <span>Meta Ads Library</span>
                  </a>
                </div>
              </div>

              {/* PITCH PERSONALIZADO PARA CADA CASO DO SITE */}
              <div style={{
                background: "#0a0f1a",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.75rem"
              }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <MessageCircle size={15} color="#fbbf24" />
                    <span>Script Personalizado (Foco: Venda de Site + Google Ads):</span>
                  </span>

                  <button 
                    className="btn-secondary"
                    onClick={() => handleCopyPitch(lead.id, analysis.customPitch)}
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                  >
                    {isCopied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                    <span>{isCopied ? "Script Copiado!" : "Copiar Script"}</span>
                  </button>
                </div>

                <p style={{ fontSize: "0.85rem", color: "#cbd5e1", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                  {analysis.customPitch}
                </p>

                <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.6rem", marginTop: "0.25rem", flexWrap: "wrap" }}>
                  {onOpenEmailModal && (
                    <button 
                      className="btn-secondary"
                      onClick={() => onOpenEmailModal(lead)}
                      style={{ padding: "0.6rem 1.1rem", fontSize: "0.85rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)" }}
                    >
                      <Mail size={16} />
                      <span>{lead.email ? "Disparar E-mail Frio" : "Gerar E-mail Frio"}</span>
                    </button>
                  )}

                  {lead.phone && (
                    <button 
                      className="btn-whatsapp"
                      onClick={() => handleWhatsAppWithPitch(lead.phone, analysis.customPitch)}
                      style={{ padding: "0.6rem 1.1rem", fontSize: "0.85rem" }}
                    >
                      <MessageCircle size={16} />
                      <span>Disparar no WhatsApp</span>
                    </button>
                  )}
                </div>
              </div>

            </div>
          );
        }))}
      </div>
    </div>
  );
}
