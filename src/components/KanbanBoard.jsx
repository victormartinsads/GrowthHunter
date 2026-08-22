import React, { useState, useMemo } from "react";
import { 
  Kanban as KanbanIcon, MessageCircle, MapPin, AlertCircle, ChevronRight, ChevronLeft, 
  AtSign, Filter, Globe, DollarSign, UserCheck, Edit3, Mail, Eye, ExternalLink, Sparkles, Search, Check, Copy, X, Flame
} from "lucide-react";
import { buildWhatsappUrl, buildInstagramUrl, buildWebsiteUrl } from "../utils/helpers";
import { normalizeSegment } from "../utils/segmentClassifier";
import { analyzeLeadOpportunity } from "../utils/opportunityEngine";

const STAGES = [
  { id: "Novo Lead", title: "Novo Lead", color: "#94a3b8", bg: "rgba(148, 163, 184, 0.12)" },
  { id: "Abordado", title: "Abordado", color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  { id: "Reunião Agendada", title: "Reunião Agendada", color: "#06b6d4", bg: "rgba(6, 182, 212, 0.12)" },
  { id: "Proposta Enviada", title: "Proposta Enviada", color: "#c084fc", bg: "rgba(168, 85, 247, 0.12)" },
  { id: "Cliente Fechado", title: "Cliente Fechado", color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
  { id: "Perdido", title: "Perdido", color: "#f87171", bg: "rgba(244, 63, 94, 0.12)" }
];

export default function KanbanBoard({ leads, onUpdateLeadStatus, onOpenEditModal, onOpenEmailModal }) {
  const [filterNiche, setFilterNiche] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLeadForDetail, setSelectedLeadForDetail] = useState(null);
  const [copiedPitchId, setCopiedPitchId] = useState(null);

  const availableNiches = useMemo(() => Array.from(new Set(leads.map(l => normalizeSegment(l.niche)).filter(Boolean))), [leads]);

  // Leads filtrados e analisados com o motor de oportunidades (Sites + Google Ads)
  const processedLeads = useMemo(() => {
    return leads.map(lead => {
      const analysis = analyzeLeadOpportunity(lead);
      return { ...lead, analysis };
    }).filter(lead => {
      if (filterNiche !== "TODOS" && normalizeSegment(lead.niche) !== filterNiche) return false;
      if (searchQuery.trim() !== "") {
        const query = searchQuery.toLowerCase();
        const matchName = lead.name.toLowerCase().includes(query);
        const matchCity = (lead.city || "").toLowerCase().includes(query);
        const matchNiche = (lead.niche || "").toLowerCase().includes(query);
        if (!matchName && !matchCity && !matchNiche) return false;
      }
      return true;
    });
  }, [leads, filterNiche, searchQuery]);

  // Mover lead para o estágio seguinte ou anterior
  const moveStage = (leadId, currentStage, direction) => {
    const stageIds = STAGES.map(s => s.id);
    const currentIndex = stageIds.indexOf(currentStage);
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < stageIds.length) {
      onUpdateLeadStatus(leadId, stageIds[newIndex]);
    }
  };

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
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* CRM HEADER & SEARCH/FILTER BAR */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <KanbanIcon size={24} color="#10b981" />
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc" }}>
              CRM Comercial Kanban (Funil 360º de Vendas)
            </h2>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>
              Gerencie cada negociação sabendo exatamente qual produto ofertar (Venda de Site / Google Ads) e quem são os sócios.
            </span>
          </div>
        </div>

        {/* Search & Niche Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          
          <div style={{ position: "relative" }}>
            <Search size={14} color="var(--text-muted)" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
            <input 
              type="text"
              className="glass-input"
              placeholder="Buscar por nome, cidade..."
              style={{ paddingLeft: "1.9rem", fontSize: "0.82rem", width: "190px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Filter size={15} color="var(--text-muted)" />
            <select 
              className="glass-select"
              style={{ fontSize: "0.82rem" }}
              value={filterNiche}
              onChange={(e) => setFilterNiche(e.target.value)}
            >
              <option value="TODOS">Todos os Nichos</option>
              {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* KANBAN COLUMNS GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: "1.1rem",
        alignItems: "start"
      }}>
        {STAGES.map((stage) => {
          const stageLeads = processedLeads.filter(l => l.status === stage.id);

          return (
            <div 
              key={stage.id} 
              className="glass-card"
              style={{
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                minHeight: "500px",
                borderTop: `4px solid ${stage.color}`
              }}
            >
              {/* Column Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "700", fontSize: "0.9rem", color: "#f8fafc" }}>
                  {stage.title}
                </span>
                <span 
                  className="badge" 
                  style={{ background: stage.bg, color: stage.color, border: `1px solid ${stage.color}40`, fontSize: "0.72rem" }}
                >
                  {stageLeads.length} leads
                </span>
              </div>

              {/* Cards List inside Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {stageLeads.length === 0 ? (
                  <div style={{
                    padding: "2.5rem 1rem",
                    textAlign: "center",
                    color: "var(--text-dim)",
                    fontSize: "0.78rem",
                    border: "1px dashed var(--border-color)",
                    borderRadius: "var(--radius-sm)"
                  }}>
                    Nenhum lead nesta etapa
                  </div>
                ) : (
                  stageLeads.map((lead) => {
                    const whatsappUrl = buildWhatsappUrl(lead.phone, lead.analysis?.customPitch);
                    const instagramUrl = buildInstagramUrl(lead.instagram, lead.name);
                    const websiteUrl = buildWebsiteUrl(lead.website);
                    const isNoWebsite = !lead.website || String(lead.website).trim() === "";

                    return (
                      <div 
                        key={lead.id}
                        className="glass-card glass-card-hover"
                        style={{
                          padding: "1rem",
                          background: "rgba(10, 15, 26, 0.85)",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.6rem",
                          borderLeft: `4px solid ${lead.analysis?.siteStatusColor || '#3b82f6'}`,
                          cursor: "pointer"
                        }}
                        onClick={() => setSelectedLeadForDetail(lead)}
                      >
                        {/* Lead Name & Site Status Badge */}
                        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.5rem" }}>
                          <div style={{ fontWeight: "800", fontSize: "0.95rem", color: "#f8fafc" }}>
                            {lead.name}
                          </div>
                          {onOpenEditModal && (
                            <button 
                              onClick={(e) => { e.stopPropagation(); onOpenEditModal(lead); }}
                              style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}
                              title="Editar Lead"
                            >
                              <Edit3 size={14} />
                            </button>
                          )}
                        </div>

                        {/* Badges: Niche & Region */}
                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          <span className="badge badge-niche" style={{ fontSize: "0.68rem" }}>
                            {normalizeSegment(lead.niche)}
                          </span>
                          <span className="badge badge-region" style={{ fontSize: "0.68rem" }}>
                            <MapPin size={10} />
                            {lead.city}
                          </span>
                        </div>

                        {/* STATUS DO SITE (Foco 1: Venda de Site vs Google Ads) */}
                        <div style={{
                          background: isNoWebsite ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.15)",
                          border: isNoWebsite ? "1px solid rgba(239, 68, 68, 0.35)" : "1px solid rgba(16, 185, 129, 0.35)",
                          padding: "0.4rem 0.6rem",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          color: isNoWebsite ? "#f87171" : "#34d399"
                        }}>
                          {isNoWebsite ? "🚨 SEM WEBSITE (Ofertar Landing Page)" : "🌐 COM WEBSITE (Ofertar Google Ads)"}
                        </div>

                        {/* SÓCIOS (QSA) - Se cadastrados */}
                        {lead.partners && lead.partners.length > 0 && (
                          <div style={{ fontSize: "0.72rem", color: "#34d399", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                            <UserCheck size={12} color="#34d399" />
                            <span>Sócio: <strong>{lead.partners[0].name}</strong></span>
                          </div>
                        )}

                        {/* CARD FOOTER: FAST ACTIONS & KANBAN NAVIGATION ARROWS */}
                        <div 
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            marginTop: "0.3rem",
                            paddingTop: "0.5rem",
                            borderTop: "1px solid rgba(255,255,255,0.08)"
                          }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                            {whatsappUrl && (
                              <a 
                                href={whatsappUrl} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="btn-whatsapp"
                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem" }}
                                title="Enviar Pitch no WhatsApp"
                              >
                                <MessageCircle size={13} />
                                <span>Whats</span>
                              </a>
                            )}

                            {onOpenEmailModal && (
                              <button 
                                onClick={() => onOpenEmailModal(lead)}
                                className="btn-secondary"
                                style={{ padding: "0.25rem 0.5rem", fontSize: "0.72rem", color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)" }}
                                title="Gerar E-mail B2B"
                              >
                                <Mail size={13} />
                                <span>E-mail</span>
                              </button>
                            )}
                          </div>

                          {/* Navigation Arrows */}
                          <div style={{ display: "flex", gap: "2px" }}>
                            <button 
                              onClick={() => moveStage(lead.id, stage.id, "prev")}
                              disabled={STAGES[0].id === stage.id}
                              style={{
                                background: "none",
                                border: "none",
                                color: STAGES[0].id === stage.id ? "var(--text-dim)" : "var(--text-muted)",
                                cursor: STAGES[0].id === stage.id ? "not-allowed" : "pointer",
                                padding: "2px"
                              }}
                              title="Recuar Etapa"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <button 
                              onClick={() => moveStage(lead.id, stage.id, "next")}
                              disabled={STAGES[STAGES.length - 1].id === stage.id}
                              style={{
                                background: "none",
                                border: "none",
                                color: STAGES[STAGES.length - 1].id === stage.id ? "var(--text-dim)" : "var(--text-muted)",
                                cursor: STAGES[STAGES.length - 1].id === stage.id ? "not-allowed" : "pointer",
                                padding: "2px"
                              }}
                              title="Avançar Etapa"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* LEAD 360º CRM DETAIL MODAL / DRAWER */}
      {selectedLeadForDetail && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          background: "rgba(0, 0, 0, 0.8)",
          backdropFilter: "blur(10px)",
          zIndex: 1000,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem"
        }}>
          <div className="glass-card" style={{
            width: "100%",
            maxWidth: "750px",
            padding: "1.75rem",
            maxHeight: "92vh",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: "1.25rem",
            border: "1px solid rgba(16, 185, 129, 0.4)"
          }}>
            {/* Modal Header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: "700" }}>VISÃO 360º DO LEAD NO CRM</span>
                <h3 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc" }}>
                  {selectedLeadForDetail.name}
                </h3>
              </div>

              <button onClick={() => setSelectedLeadForDetail(null)} style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                <X size={22} />
              </button>
            </div>

            {/* Offer Strategy Banner */}
            <div style={{
              background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)",
              border: "1px solid rgba(16, 185, 129, 0.35)",
              padding: "1rem 1.2rem",
              borderRadius: "var(--radius-sm)"
            }}>
              <span style={{ fontSize: "0.75rem", color: "#34d399", fontWeight: "700", display: "block" }}>
                PRODUTO RECOMENDADO PARA OFERTAR NESTE LEAD:
              </span>
              <strong style={{ fontSize: "1.05rem", color: "#ffffff", display: "block", marginTop: "2px" }}>
                {selectedLeadForDetail.analysis?.suggestedFee}
              </strong>
            </div>

            {/* Quick Details Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "1rem" }}>
              
              <div style={{ background: "rgba(10, 15, 26, 0.75)", padding: "0.85rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Nicho & Cidade:</span>
                <strong style={{ fontSize: "0.85rem", color: "#f8fafc" }}>
                  {normalizeSegment(selectedLeadForDetail.niche)} ({selectedLeadForDetail.city})
                </strong>
              </div>

              <div style={{ background: "rgba(10, 15, 26, 0.75)", padding: "0.85rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Telefone / WhatsApp:</span>
                <strong style={{ fontSize: "0.85rem", color: "#34d399" }}>
                  {selectedLeadForDetail.phone || "Não cadastrado"}
                </strong>
              </div>

              <div style={{ background: "rgba(10, 15, 26, 0.75)", padding: "0.85rem", borderRadius: "6px", border: "1px solid var(--border-color)" }}>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", display: "block" }}>Website:</span>
                <strong style={{ fontSize: "0.85rem", color: "#60a5fa" }}>
                  {selectedLeadForDetail.website || "🚨 Sem Website"}
                </strong>
              </div>

            </div>

            {/* QSA Partners Block */}
            {selectedLeadForDetail.partners && selectedLeadForDetail.partners.length > 0 && (
              <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid rgba(16, 185, 129, 0.3)", padding: "1rem", borderRadius: "var(--radius-sm)" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#34d399", display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.5rem" }}>
                  <UserCheck size={16} />
                  <span>Sócios & Administradores (Receita Federal):</span>
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                  {selectedLeadForDetail.partners.map((p, idx) => (
                    <div key={idx} style={{ fontSize: "0.85rem", color: "#f8fafc" }}>
                      👤 <strong>{p.name}</strong> ({p.role})
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pitch Text Block */}
            {selectedLeadForDetail.analysis?.customPitch && (
              <div style={{ background: "#0a0f1a", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                  <span style={{ fontSize: "0.8rem", color: "#fbbf24", fontWeight: "700" }}>Script Comercial Personalizado:</span>
                  <button 
                    className="btn-secondary" 
                    onClick={() => handleCopyPitch(selectedLeadForDetail.id, selectedLeadForDetail.analysis.customPitch)}
                    style={{ fontSize: "0.75rem", padding: "0.25rem 0.55rem" }}
                  >
                    {copiedPitchId === selectedLeadForDetail.id ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                    <span>{copiedPitchId === selectedLeadForDetail.id ? "Copiado!" : "Copiar Script"}</span>
                  </button>
                </div>

                <p style={{ fontSize: "0.85rem", color: "#cbd5e1", whiteSpace: "pre-wrap", lineHeight: "1.45" }}>
                  {selectedLeadForDetail.analysis.customPitch}
                </p>
              </div>
            )}

            {/* Modal Actions Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "0.5rem" }}>
              <button 
                className="btn-secondary"
                onClick={() => {
                  if (onOpenEditModal) onOpenEditModal(selectedLeadForDetail);
                  setSelectedLeadForDetail(null);
                }}
              >
                <Edit3 size={15} />
                <span>Editar Lead / Buscar Sócios (QSA)</span>
              </button>

              <div style={{ display: "flex", gap: "0.6rem" }}>
                {onOpenEmailModal && (
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      onOpenEmailModal(selectedLeadForDetail);
                      setSelectedLeadForDetail(null);
                    }}
                    style={{ color: "#38bdf8", borderColor: "rgba(56, 189, 248, 0.4)" }}
                  >
                    <Mail size={15} />
                    <span>Disparar E-mail</span>
                  </button>
                )}

                {selectedLeadForDetail.phone && (
                  <button 
                    className="btn-whatsapp"
                    onClick={() => handleWhatsAppWithPitch(selectedLeadForDetail.phone, selectedLeadForDetail.analysis?.customPitch)}
                  >
                    <MessageCircle size={15} />
                    <span>Abrir no WhatsApp</span>
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
