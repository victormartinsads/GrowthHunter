import React, { useState, useMemo } from "react";
import { 
  Kanban as KanbanIcon, MessageCircle, MapPin, ChevronRight, ChevronLeft, 
  Filter, Search, DollarSign, Users, TrendingUp, Layers, CheckCircle2, 
  Star, Phone, ArrowUpRight, List, BarChart3, Plus, Sparkles, Clock, AlertCircle
} from "lucide-react";
import { PIPELINE_STAGES } from "../types/growthHunter";
import { buildWhatsappUrl, buildGoogleMapsUrl } from "../utils/helpers";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function CrmPipelineView({ 
  companies = [], 
  onUpdatePipelineStage, 
  onSelectCompany, 
  onOpenEditModal, 
  onOpenEmailModal,
  onOpenDossier
}) {
  const [selectedNiche, setSelectedNiche] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("kanban"); // "kanban" | "table" | "forecast"
  const [draggedLeadId, setDraggedLeadId] = useState(null);
  const [dragOverStageId, setDragOverStageId] = useState(null);

  // Nichos presentes
  const niches = useMemo(() => {
    const counts = {};
    companies.forEach(c => {
      const n = normalizeSegment(c.niche || c.category) || "Outros";
      counts[n] = (counts[n] || 0) + 1;
    });
    return Object.entries(counts).map(([name, count]) => ({ name, count }));
  }, [companies]);

  // Filtra as empresas pelo nicho selecionado e pela busca
  const filteredCompanies = useMemo(() => {
    return companies.filter(c => {
      const normNiche = normalizeSegment(c.niche || c.category);
      if (selectedNiche !== "TODOS" && normNiche !== selectedNiche) return false;

      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = (c.name || "").toLowerCase().includes(q);
        const matchCity = (c.city || "").toLowerCase().includes(q);
        if (!matchName && !matchCity) return false;
      }
      return true;
    });
  }, [companies, selectedNiche, searchQuery]);

  // Métricas do Pipeline (Totais e Ponderados - Odoo Style)
  const pipelineMetrics = useMemo(() => {
    const totalLeads = filteredCompanies.length;
    
    let totalGrossValue = 0;
    let totalWeightedValue = 0;
    let wonCount = 0;
    let wonValue = 0;

    filteredCompanies.forEach(c => {
      const stage = c.pipeline_stage || c.status || "NEW";
      const stageObj = PIPELINE_STAGES.find(s => s.id === stage) || PIPELINE_STAGES[0];
      const val = c.deal_value || c.scores?.primaryOffer?.estimatedValue || 2500;
      
      totalGrossValue += val;
      totalWeightedValue += Math.round(val * (stageObj.probability || 0.1));

      if (stage === "WON") {
        wonCount += 1;
        wonValue += val;
      }
    });

    const activeInNegotiation = filteredCompanies.filter(c => 
      ["MEETING", "PROPOSAL", "NEGOTIATION"].includes(c.pipeline_stage || c.status)
    ).length;

    return {
      totalLeads,
      totalGrossValue,
      totalWeightedValue,
      activeInNegotiation,
      wonCount,
      wonValue
    };
  }, [filteredCompanies]);

  // ── Drag and Drop Handlers ──
  const handleDragStart = (e, leadId) => {
    setDraggedLeadId(leadId);
    e.dataTransfer.setData("text/plain", leadId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e, stageId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (dragOverStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDragLeave = (stageId) => {
    if (dragOverStageId === stageId) {
      setDragOverStageId(null);
    }
  };

  const handleDrop = (e, targetStageId) => {
    e.preventDefault();
    setDragOverStageId(null);
    const leadId = e.dataTransfer.getData("text/plain") || draggedLeadId;
    if (leadId && targetStageId && onUpdatePipelineStage) {
      onUpdatePipelineStage(leadId, targetStageId);
    }
    setDraggedLeadId(null);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* ── TOP CONTROLS & METRICS HEADER ── */}
      <div className="glass-card" style={{
        padding: "1.25rem 1.5rem",
        background: "#ffffff",
        border: "1px solid #e8e6e0",
        display: "flex",
        flexDirection: "column",
        gap: "1rem"
      }}>
        
        {/* Header Title & View Switcher */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <div style={{ background: "#fff7ed", padding: "0.45rem", borderRadius: "8px", border: "1px solid #ffedd5" }}>
                <KanbanIcon size={20} color="#ea580c" />
              </div>
              <h2 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#1c1917", margin: 0 }}>
                Pipeline de Vendas & CRM Enterprise
              </h2>
            </div>
            <span style={{ fontSize: "0.78rem", color: "#78716c", display: "block", marginTop: "2px" }}>
              Gestão visual de oportunidades, previsão de receita e fechamento estilo Odoo & Zoho
            </span>
          </div>

          {/* View Mode Toggle Buttons (Kanban / Tabela / Forecast) */}
          <div style={{
            display: "flex",
            alignItems: "center",
            background: "#faf9f6",
            padding: "0.25rem",
            borderRadius: "8px",
            border: "1px solid #e8e6e0",
            gap: "0.25rem"
          }}>
            <button
              type="button"
              onClick={() => setViewMode("kanban")}
              style={{
                padding: "0.45rem 0.8rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: viewMode === "kanban" ? "800" : "600",
                background: viewMode === "kanban" ? "#ffffff" : "transparent",
                color: viewMode === "kanban" ? "#ea580c" : "#57534e",
                border: viewMode === "kanban" ? "1px solid #fed7aa" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                boxShadow: viewMode === "kanban" ? "0 1px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >
              <KanbanIcon size={14} />
              <span>Kanban</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("table")}
              style={{
                padding: "0.45rem 0.8rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: viewMode === "table" ? "800" : "600",
                background: viewMode === "table" ? "#ffffff" : "transparent",
                color: viewMode === "table" ? "#ea580c" : "#57534e",
                border: viewMode === "table" ? "1px solid #fed7aa" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                boxShadow: viewMode === "table" ? "0 1px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >
              <List size={14} />
              <span>Lista</span>
            </button>

            <button
              type="button"
              onClick={() => setViewMode("forecast")}
              style={{
                padding: "0.45rem 0.8rem",
                borderRadius: "6px",
                fontSize: "0.8rem",
                fontWeight: viewMode === "forecast" ? "800" : "600",
                background: viewMode === "forecast" ? "#ffffff" : "transparent",
                color: viewMode === "forecast" ? "#ea580c" : "#57534e",
                border: viewMode === "forecast" ? "1px solid #fed7aa" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                boxShadow: viewMode === "forecast" ? "0 1px 4px rgba(0,0,0,0.05)" : "none"
              }}
            >
              <BarChart3 size={14} />
              <span>Previsão (Forecast)</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Stat Cards (Odoo Pattern) */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
          
          <div style={{ background: "#faf9f6", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
            <span style={{ fontSize: "0.72rem", color: "#78716c", fontWeight: "700", textTransform: "uppercase" }}>
              Total no Pipeline:
            </span>
            <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#1c1917", marginTop: "2px" }}>
              R$ {pipelineMetrics.totalGrossValue.toLocaleString('pt-BR')}
            </div>
            <span style={{ fontSize: "0.72rem", color: "#ea580c", fontWeight: "700" }}>
              {pipelineMetrics.totalLeads} oportunidades ativas
            </span>
          </div>

          <div style={{ background: "#faf9f6", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
            <span style={{ fontSize: "0.72rem", color: "#78716c", fontWeight: "700", textTransform: "uppercase" }}>
              Receita Ponderada (Probabilidade):
            </span>
            <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#16a34a", marginTop: "2px" }}>
              R$ {pipelineMetrics.totalWeightedValue.toLocaleString('pt-BR')}
            </div>
            <span style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: "700" }}>
              Valor provável de fechamento
            </span>
          </div>

          <div style={{ background: "#faf9f6", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
            <span style={{ fontSize: "0.72rem", color: "#78716c", fontWeight: "700", textTransform: "uppercase" }}>
              Em Negociação / Reunião:
            </span>
            <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#0284c7", marginTop: "2px" }}>
              {pipelineMetrics.activeInNegotiation} deals
            </div>
            <span style={{ fontSize: "0.72rem", color: "#0284c7", fontWeight: "700" }}>
              Fase final de fechamento
            </span>
          </div>

          <div style={{ background: "#faf9f6", padding: "0.85rem 1rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
            <span style={{ fontSize: "0.72rem", color: "#78716c", fontWeight: "700", textTransform: "uppercase" }}>
              Vendas Ganhas (Fechadas):
            </span>
            <div style={{ fontSize: "1.25rem", fontWeight: "900", color: "#16a34a", marginTop: "2px" }}>
              R$ {pipelineMetrics.wonValue.toLocaleString('pt-BR')}
            </div>
            <span style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: "700" }}>
              {pipelineMetrics.wonCount} clientes convertidos
            </span>
          </div>

        </div>

        {/* Filters Bar (Nicho & Search) */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap", borderTop: "1px solid #f5f5f4", paddingTop: "0.75rem" }}>
          
          <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
            <Search size={15} style={{ position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)", color: "#78716c" }} />
            <input 
              type="text" 
              className="glass-input" 
              placeholder="Buscar por empresa, cidade ou decisor..." 
              style={{ width: "100%", paddingLeft: "2.2rem", fontSize: "0.82rem" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Nicho Selector */}
          <div style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap" }}>
            <button
              type="button"
              onClick={() => setSelectedNiche("TODOS")}
              style={{
                padding: "0.35rem 0.65rem",
                borderRadius: "6px",
                fontSize: "0.75rem",
                fontWeight: selectedNiche === "TODOS" ? "800" : "600",
                background: selectedNiche === "TODOS" ? "#1c1917" : "#faf9f6",
                color: selectedNiche === "TODOS" ? "#ffffff" : "#57534e",
                border: "1px solid #e8e6e0",
                cursor: "pointer"
              }}
            >
              Todos ({companies.length})
            </button>

            {niches.slice(0, 5).map(({ name, count }) => (
              <button
                key={name}
                type="button"
                onClick={() => setSelectedNiche(name)}
                style={{
                  padding: "0.35rem 0.65rem",
                  borderRadius: "6px",
                  fontSize: "0.75rem",
                  fontWeight: selectedNiche === name ? "800" : "600",
                  background: selectedNiche === name ? "#fff7ed" : "#faf9f6",
                  color: selectedNiche === name ? "#ea580c" : "#57534e",
                  border: selectedNiche === name ? "1px solid #fed7aa" : "1px solid #e8e6e0",
                  cursor: "pointer"
                }}
              >
                {name} ({count})
              </button>
            ))}
          </div>

        </div>

      </div>

      {/* ── 1. KANBAN VIEW (DRAG AND DROP) ── */}
      {viewMode === "kanban" && (
        <div style={{
          display: "flex",
          gap: "1rem",
          overflowX: "auto",
          paddingBottom: "1.5rem",
          alignItems: "flex-start",
          minHeight: "550px"
        }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageCompanies = filteredCompanies.filter(c => (c.pipeline_stage || c.status || "NEW") === stage.id);
            const stageTotalDeal = stageCompanies.reduce((acc, c) => acc + (c.deal_value || c.scores?.primaryOffer?.estimatedValue || 2500), 0);
            const isDropTarget = dragOverStageId === stage.id;

            return (
              <div 
                key={stage.id}
                onDragOver={(e) => handleDragOver(e, stage.id)}
                onDragLeave={() => handleDragLeave(stage.id)}
                onDrop={(e) => handleDrop(e, stage.id)}
                style={{
                  minWidth: "290px",
                  width: "290px",
                  background: isDropTarget ? "#fff7ed" : "#fbfbf9",
                  borderRadius: "12px",
                  border: isDropTarget ? "2px dashed #ea580c" : "1px solid #e8e6e0",
                  padding: "0.85rem",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                  transition: "all 0.15s ease"
                }}
              >
                {/* Column Header */}
                <div style={{
                  paddingBottom: "0.6rem",
                  borderBottom: "1px solid #e8e6e0",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.2rem"
                }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: stage.color }} />
                      <strong style={{ fontSize: "0.85rem", color: "#1c1917" }}>{stage.title}</strong>
                    </div>
                    <span className="badge" style={{ fontSize: "0.7rem", background: stage.badgeBg, color: stage.badgeColor, fontWeight: "800" }}>
                      {stageCompanies.length}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: "0.72rem", color: "#78716c", marginTop: "2px" }}>
                    <span>Probab: {Math.round(stage.probability * 100)}%</span>
                    <strong style={{ color: "#16a34a" }}>R$ {stageTotalDeal.toLocaleString('pt-BR')}</strong>
                  </div>
                </div>

                {/* Cards List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "0.65rem", minHeight: "120px" }}>
                  {stageCompanies.length === 0 ? (
                    <div style={{
                      padding: "1.5rem 0.5rem",
                      textAlign: "center",
                      color: "#a8a29e",
                      fontSize: "0.75rem",
                      border: "1px dashed #e8e6e0",
                      borderRadius: "8px"
                    }}>
                      Arraste um lead para cá
                    </div>
                  ) : (
                    stageCompanies.map((company) => {
                      const isRealWebsite = company.is_real_website ?? Boolean(company.website && String(company.website).trim() !== "");
                      const scoreVal = company.scores?.finalScore || 80;
                      const dealValue = company.deal_value || company.scores?.primaryOffer?.estimatedValue || 2500;
                      const whatsappUrl = buildWhatsappUrl(company.phone, company.aiAnalysis?.opening_message);
                      const isDragging = draggedLeadId === company.id;

                      return (
                        <div
                          key={company.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, company.id)}
                          onClick={() => onSelectCompany(company)}
                          style={{
                            padding: "0.85rem",
                            background: "#ffffff",
                            border: "1px solid #e8e6e0",
                            borderRadius: "10px",
                            boxShadow: "0 2px 6px rgba(0,0,0,0.04)",
                            cursor: "grab",
                            display: "flex",
                            flexDirection: "column",
                            gap: "0.5rem",
                            opacity: isDragging ? 0.4 : 1,
                            transition: "all 0.15s ease"
                          }}
                        >
                          {/* Card Top: Name & Score */}
                          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.4rem" }}>
                            <strong style={{ fontSize: "0.86rem", color: "#1c1917", lineHeight: "1.3", flex: 1 }}>
                              {company.name}
                            </strong>
                            <span style={{
                              fontSize: "0.68rem",
                              fontWeight: "800",
                              color: scoreVal >= 90 ? "#dc2626" : "#ea580c",
                              background: "#fff7ed",
                              padding: "0.1rem 0.35rem",
                              borderRadius: "4px"
                            }}>
                              {scoreVal}
                            </span>
                          </div>

                          {/* City & Niche */}
                          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexWrap: "wrap", fontSize: "0.72rem", color: "#78716c" }}>
                            <span className="badge badge-niche" style={{ fontSize: "0.68rem", padding: "0.1rem 0.4rem" }}>
                              {normalizeSegment(company.niche || company.category)}
                            </span>
                            <span>{company.city || "SP"}</span>
                          </div>

                          {/* Deal Value Strip */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            padding: "0.3rem 0.5rem",
                            background: "#faf9f6",
                            borderRadius: "6px",
                            fontSize: "0.72rem"
                          }}>
                            <span style={{ color: "#78716c" }}>Valor do Deal:</span>
                            <strong style={{ color: "#16a34a", fontSize: "0.78rem" }}>
                              R$ {dealValue.toLocaleString('pt-BR')}
                            </strong>
                          </div>

                          {/* Card Footer Actions */}
                          <div style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingTop: "0.4rem",
                            borderTop: "1px solid #f5f5f4"
                          }}
                          onClick={(e) => e.stopPropagation()} // Evita abrir o drawer ao clicar no botão
                          >
                            <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                              {whatsappUrl && (
                                <a
                                  href={whatsappUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  title="Chamar no WhatsApp"
                                  style={{
                                    background: "#16a34a",
                                    color: "#ffffff",
                                    border: "none",
                                    borderRadius: "4px",
                                    padding: "0.25rem 0.45rem",
                                    fontSize: "0.7rem",
                                    fontWeight: "700",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "0.2rem",
                                    textDecoration: "none"
                                  }}
                                >
                                  <MessageCircle size={11} />
                                  <span>Whats</span>
                                </a>
                              )}

                              <a
                                href={buildGoogleMapsUrl(company)}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="Abrir Ficha no Google Meu Negócio / Maps"
                                style={{
                                  background: "#f0fdf4",
                                  border: "1px solid #bbf7d0",
                                  color: "#166534",
                                  borderRadius: "4px",
                                  padding: "0.25rem 0.45rem",
                                  fontSize: "0.7rem",
                                  fontWeight: "700",
                                  textDecoration: "none",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.2rem"
                                }}
                              >
                                <MapPin size={11} color="#16a34a" />
                                <span>GMB</span>
                              </a>
                            </div>

                            {onOpenDossier && (
                              <button
                                type="button"
                                onClick={() => onOpenDossier(company)}
                                title="Gerar Dossiê Raio-X"
                                style={{
                                  background: "#fff7ed",
                                  border: "1px solid #fed7aa",
                                  color: "#ea580c",
                                  borderRadius: "4px",
                                  padding: "0.25rem 0.45rem",
                                  fontSize: "0.7rem",
                                  fontWeight: "700",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "0.2rem"
                                }}
                              >
                                <Sparkles size={11} />
                                <span>Raio-X</span>
                              </button>
                            )}
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
      )}

      {/* ── 2. TABLE VIEW (LISTA RÁPIDA) ── */}
      {viewMode === "table" && (
        <div className="glass-card" style={{ padding: 0, overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "0.85rem" }}>
            <thead>
              <tr style={{ background: "#faf9f6", borderBottom: "1px solid #e8e6e0" }}>
                <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700" }}>Empresa</th>
                <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700" }}>Estágio do Funil</th>
                <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700" }}>Valor do Deal</th>
                <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700" }}>Receita Ponderada</th>
                <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700" }}>Nicho & Cidade</th>
                <th style={{ padding: "0.85rem 1rem", color: "#57534e", fontWeight: "700", textAlign: "right" }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredCompanies.map(company => {
                const stage = company.pipeline_stage || company.status || "NEW";
                const stageObj = PIPELINE_STAGES.find(s => s.id === stage) || PIPELINE_STAGES[0];
                const dealVal = company.deal_value || company.scores?.primaryOffer?.estimatedValue || 2500;
                const weightedVal = Math.round(dealVal * (stageObj.probability || 0.1));

                return (
                  <tr key={company.id} style={{ borderBottom: "1px solid #f5f5f4" }} className="table-row-hover">
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <strong 
                        onClick={() => onSelectCompany(company)}
                        style={{ cursor: "pointer", color: "#0f172a" }}
                      >
                        {company.name}
                      </strong>
                    </td>
                    <td style={{ padding: "0.85rem 1rem" }}>
                      <select
                        value={stage}
                        onChange={(e) => onUpdatePipelineStage && onUpdatePipelineStage(company.id, e.target.value)}
                        style={{
                          background: stageObj.badgeBg,
                          color: stageObj.badgeColor,
                          border: `1px solid ${stage.color}`,
                          padding: "0.3rem 0.5rem",
                          borderRadius: "6px",
                          fontSize: "0.78rem",
                          fontWeight: "700"
                        }}
                      >
                        {PIPELINE_STAGES.map(s => (
                          <option key={s.id} value={s.id}>{s.title}</option>
                        ))}
                      </select>
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: "800", color: "#0f172a" }}>
                      R$ {dealVal.toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", fontWeight: "800", color: "#16a34a" }}>
                      R$ {weightedVal.toLocaleString('pt-BR')}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", color: "#64748b" }}>
                      {normalizeSegment(company.niche || company.category)} • {company.city}
                    </td>
                    <td style={{ padding: "0.85rem 1rem", textAlign: "right" }}>
                      <button
                        onClick={() => onSelectCompany(company)}
                        className="btn-secondary"
                        style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem" }}
                      >
                        Abrir Drawer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── 3. FORECAST VIEW (PREVISÃO DE RECEITA ODOO) ── */}
      {viewMode === "forecast" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {PIPELINE_STAGES.map(stage => {
            const stageLeads = filteredCompanies.filter(c => (c.pipeline_stage || c.status || "NEW") === stage.id);
            const totalStageVal = stageLeads.reduce((acc, c) => acc + (c.deal_value || c.scores?.primaryOffer?.estimatedValue || 2500), 0);
            const weightedVal = Math.round(totalStageVal * stage.probability);

            return (
              <div key={stage.id} className="glass-card" style={{ padding: "1.25rem", background: "#ffffff", border: "1px solid #e8e6e0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: stage.color }} />
                    <strong style={{ fontSize: "0.95rem", color: "#0f172a" }}>{stage.title}</strong>
                    <span style={{ fontSize: "0.75rem", color: "#64748b" }}>({stageLeads.length} oportunidades)</span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block" }}>Volume Bruto:</span>
                      <strong style={{ fontSize: "0.9rem", color: "#0f172a" }}>R$ {totalStageVal.toLocaleString('pt-BR')}</strong>
                    </div>

                    <div>
                      <span style={{ fontSize: "0.7rem", color: "#64748b", display: "block" }}>Previsão ({Math.round(stage.probability * 100)}%):</span>
                      <strong style={{ fontSize: "1rem", color: "#16a34a" }}>R$ {weightedVal.toLocaleString('pt-BR')}</strong>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ height: "8px", width: "100%", background: "#f1f5f9", borderRadius: "999px", overflow: "hidden" }}>
                  <div style={{
                    height: "100%",
                    width: `${Math.round(stage.probability * 100)}%`,
                    background: stage.color,
                    borderRadius: "999px"
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
