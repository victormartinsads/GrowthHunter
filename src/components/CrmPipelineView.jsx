import React, { useState, useMemo } from "react";
import { 
  Kanban as KanbanIcon, MessageCircle, MapPin, ChevronRight, ChevronLeft, 
  Filter, Search, DollarSign, Users, TrendingUp, Layers, CheckCircle2, Star, Phone, ArrowUpRight
} from "lucide-react";
import { PIPELINE_STAGES } from "../types/growthHunter";
import { buildWhatsappUrl } from "../utils/helpers";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function CrmPipelineView({ 
  companies = [], 
  onUpdatePipelineStage, 
  onSelectCompany, 
  onOpenEditModal, 
  onOpenEmailModal 
}) {
  const [selectedNiche, setSelectedNiche] = useState("TODOS");
  const [searchQuery, setSearchQuery] = useState("");

  // Lista única de nichos presentes na base
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

  // Métricas do Pipeline Selecionado
  const pipelineMetrics = useMemo(() => {
    const totalLeads = filteredCompanies.length;
    const totalPotentialValue = filteredCompanies.reduce((acc, c) => {
      return acc + (c.scores?.primaryOffer?.estimatedValue || 2500);
    }, 0);

    const activeInNegotiation = filteredCompanies.filter(c => 
      ["MEETING", "PROPOSAL", "NEGOTIATION"].includes(c.pipeline_stage || c.status)
    ).length;

    const wonCount = filteredCompanies.filter(c => 
      (c.pipeline_stage || c.status) === "WON"
    ).length;

    return { totalLeads, totalPotentialValue, activeInNegotiation, wonCount };
  }, [filteredCompanies]);

  const moveStage = (companyId, currentStageId, direction) => {
    const stageIds = PIPELINE_STAGES.map(s => s.id);
    const currentIndex = stageIds.indexOf(currentStageId);
    const newIndex = direction === "next" ? currentIndex + 1 : currentIndex - 1;
    if (newIndex >= 0 && newIndex < stageIds.length) {
      onUpdatePipelineStage(companyId, stageIds[newIndex]);
    }
  };

  const handleWhatsApp = (phone, company) => {
    const text = company.aiAnalysis?.opening_message || `Olá equipe da ${company.name}, tudo bem?`;
    const url = buildWhatsappUrl(phone, text);
    if (url) window.open(url, "_blank");
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* ── HEADER BANNER ── */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #ffffff 100%)",
        border: "1px solid #fed7aa",
      }}>
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <KanbanIcon size={26} color="#ff6200" />
              <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#1c1917" }}>
                🎯 PIPELINES CRM POR NICHO
              </h2>
            </div>
            <p style={{ fontSize: "0.88rem", color: "#57534e", marginTop: "4px" }}>
              Alterne entre os pipelines de cada segmento para gerenciar a cadência de prospecção e vendas de forma 100% isolada.
            </p>
          </div>

          {/* Quick Metrics of Active Niche Pipeline */}
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap" }}>
            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", textTransform: "uppercase", fontWeight: "700", display: "block" }}>
                Leads no Pipeline
              </span>
              <strong style={{ fontSize: "1.3rem", fontWeight: "900", color: "#ea580c" }}>
                {pipelineMetrics.totalLeads}
              </strong>
            </div>

            <div style={{ textAlign: "right" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", textTransform: "uppercase", fontWeight: "700", display: "block" }}>
                Potencial em Negociação
              </span>
              <strong style={{ fontSize: "1.3rem", fontWeight: "900", color: "#16a34a" }}>
                R$ {pipelineMetrics.totalPotentialValue.toLocaleString('pt-BR')}
              </strong>
            </div>
          </div>
        </div>

        {/* ── NICHE TABS SWITCHER (PIPELINE POR NICHO) ── */}
        <div style={{ marginTop: "1.25rem", display: "flex", alignItems: "center", gap: "0.45rem", flexWrap: "wrap", borderTop: "1px solid #fed7aa", paddingTop: "1rem" }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "#78716c", marginRight: "0.25rem", display: "flex", alignItems: "center", gap: "0.3rem" }}>
            <Layers size={15} color="#ea580c" />
            <span>Escolha o Pipeline:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedNiche("TODOS")}
            style={{
              padding: "0.4rem 0.95rem",
              borderRadius: "999px",
              fontSize: "0.82rem",
              fontWeight: selectedNiche === "TODOS" ? "800" : "600",
              cursor: "pointer",
              border: selectedNiche === "TODOS" ? "1px solid #ea580c" : "1px solid #fed7aa",
              background: selectedNiche === "TODOS" ? "#ea580c" : "#ffffff",
              color: selectedNiche === "TODOS" ? "#ffffff" : "#57534e",
              transition: "all 0.15s",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem"
            }}
          >
            <span>🌐 Todos os Nichos</span>
            <span style={{ 
              fontSize: "0.7rem", 
              background: selectedNiche === "TODOS" ? "rgba(255,255,255,0.25)" : "#f5f5f4",
              padding: "0.1rem 0.4rem", 
              borderRadius: "999px" 
            }}>
              {companies.length}
            </span>
          </button>

          {niches.map(n => (
            <button
              key={n.name}
              type="button"
              onClick={() => setSelectedNiche(n.name)}
              style={{
                padding: "0.4rem 0.95rem",
                borderRadius: "999px",
                fontSize: "0.82rem",
                fontWeight: selectedNiche === n.name ? "800" : "600",
                cursor: "pointer",
                border: selectedNiche === n.name ? "1px solid #ea580c" : "1px solid #e8e6e0",
                background: selectedNiche === n.name ? "#ea580c" : "#ffffff",
                color: selectedNiche === n.name ? "#ffffff" : "#57534e",
                transition: "all 0.15s",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem"
              }}
            >
              <span>{n.name}</span>
              <span style={{ 
                fontSize: "0.7rem", 
                background: selectedNiche === n.name ? "rgba(255,255,255,0.25)" : "#f5f5f4",
                padding: "0.1rem 0.4rem", 
                borderRadius: "999px" 
              }}>
                {n.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── SEARCH FILTER INSIDE KANBAN ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ position: "relative", minWidth: "280px" }}>
          <Search size={15} color="#78716c" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input 
            className="glass-input"
            type="text"
            placeholder={`Filtrar leads ${selectedNiche !== 'TODOS' ? `em ${selectedNiche}` : 'no Kanban'}...`}
            style={{ width: "100%", paddingLeft: "2rem", fontSize: "0.82rem" }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={{ fontSize: "0.8rem", color: "#78716c" }}>
          Exibindo <strong>{filteredCompanies.length} empresas</strong> no pipeline de <strong>{selectedNiche === 'TODOS' ? 'Todos os Nichos' : selectedNiche}</strong>
        </div>
      </div>

      {/* ── PIPELINE COLUMNS SCROLLABLE HORIZONTAL GRID ── */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(10, minmax(270px, 1fr))",
        gap: "1.1rem",
        overflowX: "auto",
        paddingBottom: "1.5rem",
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
                minHeight: "560px",
                borderTop: `4px solid ${stage.color}`
              }}
            >
              {/* Column Header */}
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontWeight: "800", fontSize: "0.88rem", color: "#1c1917" }}>
                    {stage.title}
                  </span>
                  <span className="badge" style={{ background: `${stage.color}15`, color: stage.color, border: `1px solid ${stage.color}40`, fontSize: "0.72rem", fontWeight: "800" }}>
                    {stageCompanies.length}
                  </span>
                </div>

                <div style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: "700", marginTop: "4px" }}>
                  R$ {stageTotalDeal.toLocaleString('pt-BR')}
                </div>
              </div>

              {/* Lead Cards List in Column */}
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                {stageCompanies.map((company) => {
                  const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");
                  const scoreVal = company.scores?.finalScore || 80;
                  const estimatedValue = company.scores?.primaryOffer?.estimatedValue || 2500;

                  return (
                    <div 
                      key={company.id}
                      className="glass-card glass-card-hover"
                      style={{
                        padding: "0.95rem",
                        background: "#ffffff",
                        border: "1px solid #e8e6e0",
                        display: "flex",
                        flexDirection: "column",
                        gap: "0.6rem"
                      }}
                    >
                      {/* Top title & Score */}
                      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.4rem" }}>
                        <strong 
                          onClick={() => onSelectCompany(company)}
                          style={{ fontSize: "0.88rem", color: "#1c1917", cursor: "pointer", lineHeight: "1.3", flex: 1 }}
                        >
                          {company.name}
                        </strong>
                        <span style={{
                          fontSize: "0.7rem",
                          fontWeight: "800",
                          color: scoreVal >= 90 ? "#dc2626" : "#ea580c",
                          background: "#fff7ed",
                          padding: "0.1rem 0.35rem",
                          borderRadius: "4px"
                        }}>
                          {scoreVal}
                        </span>
                      </div>

                      {/* City & Rating */}
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap", fontSize: "0.74rem", color: "#78716c" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                          <MapPin size={11} />
                          <span>{company.city}</span>
                        </span>
                        <span>•</span>
                        <span style={{ display: "flex", alignItems: "center", gap: "0.2rem", color: "#d97706", fontWeight: "700" }}>
                          <Star size={11} fill="#d97706" />
                          <span>{company.rating || 4.8}</span>
                        </span>
                      </div>

                      {/* Offer Badge */}
                      <div style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "0.25rem 0.5rem",
                        borderRadius: "4px",
                        background: !hasWebsite ? "#fef2f2" : "#f0fdf4",
                        color: !hasWebsite ? "#dc2626" : "#16a34a",
                        border: !hasWebsite ? "1px solid #fecaca" : "1px solid #bbf7d0"
                      }}>
                        {!hasWebsite ? "🚨 Sem Site (Criação)" : "🌐 Tráfego / Reformulação"} • R$ {estimatedValue}
                      </div>

                      {/* Card Action Buttons (WhatsApp + Navigation) */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.4rem", borderTop: "1px solid #f5f5f4" }}>
                        
                        {/* WhatsApp Trigger */}
                        <button
                          type="button"
                          onClick={() => handleWhatsApp(company.phone, company)}
                          style={{
                            background: "#16a34a",
                            color: "#ffffff",
                            border: "none",
                            borderRadius: "4px",
                            padding: "0.3rem 0.55rem",
                            fontSize: "0.72rem",
                            fontWeight: "700",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.3rem"
                          }}
                        >
                          <MessageCircle size={12} />
                          <span>Whats</span>
                        </button>

                        {/* Stage Mover Buttons (Left / Right) */}
                        <div style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                          <button 
                            type="button"
                            onClick={() => moveStage(company.id, stage.id, "prev")}
                            disabled={PIPELINE_STAGES.indexOf(stage) === 0}
                            title="Mover para estágio anterior"
                            style={{
                              background: "#f5f5f4",
                              border: "1px solid #e8e6e0",
                              borderRadius: "4px",
                              padding: "0.25rem 0.4rem",
                              cursor: "pointer",
                              opacity: PIPELINE_STAGES.indexOf(stage) === 0 ? 0.3 : 1
                            }}
                          >
                            <ChevronLeft size={13} color="#57534e" />
                          </button>

                          <button 
                            type="button"
                            onClick={() => moveStage(company.id, stage.id, "next")}
                            disabled={PIPELINE_STAGES.indexOf(stage) === PIPELINE_STAGES.length - 1}
                            title="Avançar para próximo estágio"
                            style={{
                              background: "#ea580c",
                              border: "none",
                              color: "#ffffff",
                              borderRadius: "4px",
                              padding: "0.25rem 0.4rem",
                              cursor: "pointer",
                              opacity: PIPELINE_STAGES.indexOf(stage) === PIPELINE_STAGES.length - 1 ? 0.3 : 1
                            }}
                          >
                            <ChevronRight size={13} color="#ffffff" />
                          </button>
                        </div>

                      </div>

                    </div>
                  );
                })}

                {stageCompanies.length === 0 && (
                  <div style={{
                    padding: "2rem 1rem",
                    textAlign: "center",
                    fontSize: "0.75rem",
                    color: "#a8a29e",
                    border: "1px dashed #e8e6e0",
                    borderRadius: "6px"
                  }}>
                    Nenhum lead neste estágio
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
