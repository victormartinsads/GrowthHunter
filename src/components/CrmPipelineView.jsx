import React, { useState, useMemo } from "react";
import { 
  Kanban as KanbanIcon, MessageCircle, MapPin, ChevronRight, ChevronLeft, 
  Filter 
} from "lucide-react";
import { PIPELINE_STAGES } from "../types/growthHunter";
import { buildWhatsappUrl } from "../utils/helpers";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function CrmPipelineView({ companies = [], onUpdatePipelineStage, onSelectCompany, onOpenEditModal, onOpenEmailModal }) {
  const [filterNiche, setFilterNiche] = useState("TODOS");

  const niches = useMemo(() => Array.from(new Set(companies.map(c => normalizeSegment(c.niche || c.category)).filter(Boolean))), [companies]);

  const filteredCompanies = useMemo(() => {
    return companies.filter(c => filterNiche === "TODOS" || normalizeSegment(c.niche || c.category) === filterNiche);
  }, [companies, filterNiche]);

  const moveStage = (companyId, currentStageId, direction) => {
    const stageIds = PIPELINE_STAGES.map(s => s.id);
    const currentIndex = stageIds.indexOf(currentStageId);
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < stageIds.length) {
      onUpdatePipelineStage(companyId, stageIds[newIndex]);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* HEADER & NICHE FILTER */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <KanbanIcon size={24} color="#ff6200" />
          <div>
            <h2 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#1c1917" }}>
              Pipeline CRM de Vendas (10 Estágios Estruturados)
            </h2>
            <span style={{ fontSize: "0.78rem", color: "#78716c" }}>
              Acompanhe a evolução das prospecções desde o primeiro contato até o fechamento do contrato.
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <Filter size={15} color="#78716c" />
          <select 
            className="glass-select"
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
          >
            <option value="TODOS">Todos os Nichos</option>
            {niches.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>

      {/* PIPELINE COLUMNS SCROLLABLE HORIZONTAL GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(10, minmax(260px, 1fr))",
        gap: "1.1rem",
        overflowX: "auto",
        paddingBottom: "1rem",
        alignItems: "start"
      }}>
        {PIPELINE_STAGES.map((stage) => {
          const stageCompanies = filteredCompanies.filter(c => (c.pipeline_stage || c.status) === stage.id);
          const stageTotalDeal = stageCompanies.reduce((acc, c) => acc + (c.scores?.primaryOffer?.estimatedValue || 2500), 0);

          return (
            <div 
              key={stage.id} 
              className="glass-card"
              style={{
                padding: "1rem",
                background: "#faf9f6",
                display: "flex",
                flexDirection: "column",
                gap: "0.85rem",
                minHeight: "520px",
                borderTop: `4px solid ${stage.color}`
              }}
            >
              {/* Column Header */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "800", fontSize: "0.9rem", color: "#1c1917" }}>
                    {stage.title}
                  </span>
                  <span className="badge" style={{ background: `${stage.color}15`, color: stage.color, border: `1px solid ${stage.color}40`, fontSize: "0.72rem" }}>
                    {stageCompanies.length}
                  </span>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: "700", marginTop: "4px" }}>
                  R$ {stageTotalDeal.toLocaleString('pt-BR')} em potencial
                </div>
              </div>

              {/* Cards List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {stageCompanies.length === 0 ? (
                  <div style={{ padding: "2.5rem 1rem", textAlign: "center", color: "#a8a29e", fontSize: "0.78rem", border: "1px dashed #e8e6e0", borderRadius: "6px" }}>
                    Sem negócios nesta etapa
                  </div>
                ) : (
                  stageCompanies.map((company) => {
                    const isNoWebsite = company.website_status === "missing" || !company.website;
                    const whatsappUrl = buildWhatsappUrl(company.phone, company.aiAnalysis?.opening_message);

                    return (
                      <div 
                        key={company.id}
                        className="glass-card glass-card-hover"
                        style={{
                          padding: "0.9rem",
                          background: "#ffffff",
                          display: "flex",
                          flexDirection: "column",
                          gap: "0.5rem",
                          borderLeft: `4px solid ${company.scores?.classification === 'HOT' ? '#dc2626' : '#ff6200'}`,
                          cursor: "pointer"
                        }}
                        onClick={() => onSelectCompany(company)}
                      >
                        <div style={{ fontWeight: "800", fontSize: "0.9rem", color: "#1c1917" }}>
                          {company.name}
                        </div>

                        <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
                          <span className="badge badge-niche" style={{ fontSize: "0.68rem" }}>
                            {normalizeSegment(company.niche || company.category)}
                          </span>
                          <span className="badge badge-region" style={{ fontSize: "0.68rem" }}>
                            <MapPin size={10} /> {company.city}
                          </span>
                        </div>

                        <div style={{
                          background: isNoWebsite ? "#fef2f2" : "#f0fdf4",
                          padding: "0.35rem 0.55rem",
                          borderRadius: "4px",
                          fontSize: "0.72rem",
                          fontWeight: "700",
                          color: isNoWebsite ? "#dc2626" : "#16a34a",
                          border: isNoWebsite ? "1px solid #fecaca" : "1px solid #bbf7d0"
                        }}>
                          {isNoWebsite ? "🚨 SEM SITE" : "🌐 COM SITE"} — {company.scores?.primaryOffer?.title || 'SITE'}
                        </div>

                        {/* Card Controls */}
                        <div 
                          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "0.3rem", paddingTop: "0.45rem", borderTop: "1px solid #e8e6e0" }}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div style={{ display: "flex", gap: "6px" }}>
                            {whatsappUrl && (
                              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ padding: "0.2rem 0.45rem", fontSize: "0.7rem" }}>
                                <MessageCircle size={12} />
                                <span>Whats</span>
                              </a>
                            )}
                          </div>

                          <div style={{ display: "flex", gap: "2px" }}>
                            <button onClick={() => moveStage(company.id, stage.id, "prev")} disabled={PIPELINE_STAGES[0].id === stage.id} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer", padding: "2px" }}>
                              <ChevronLeft size={16} />
                            </button>
                            <button onClick={() => moveStage(company.id, stage.id, "next")} disabled={PIPELINE_STAGES[PIPELINE_STAGES.length - 1].id === stage.id} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer", padding: "2px" }}>
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

    </div>
  );
}
