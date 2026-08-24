import React, { useState, useMemo } from "react";
import { 
  Zap, Flame, Target, Star, Globe, AlertTriangle, CheckCircle2, XCircle, 
  MessageCircle, Mail, Phone, ChevronRight, UserCheck, ShieldAlert, ArrowUpRight, Copy, Check, Filter, Sparkles, Eye, MapPin,
  Kanban, CheckSquare, Square, ArrowRight, Layers, Send, MessageSquare
} from "lucide-react";
import { normalizeSegment } from "../utils/segmentClassifier";
import { buildWhatsappUrl } from "../utils/helpers";
import { PIPELINE_STAGES } from "../types/growthHunter";

export default function ProspectNowView({ 
  companies = [], 
  onSelectCompany, 
  onUpdatePipelineStage, 
  onBatchUpdatePipelineStage,
  onNavigateTab,
  onOpenEmailModal, 
  onOpenApifyModal,
  onOpenDispatchModal
}) {
  const [filterCategory, setFilterCategory] = useState("TODOS");
  const [copiedId, setCopiedId] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [targetStage, setTargetStage] = useState("QUALIFIED");

  const categories = useMemo(() => Array.from(new Set(companies.map(c => normalizeSegment(c.niche || c.category)).filter(Boolean))), [companies]);

  const rankedCompanies = useMemo(() => {
    return [...companies]
      .filter(c => filterCategory === "TODOS" || normalizeSegment(c.niche || c.category) === filterCategory)
      .sort((a, b) => (b.scores?.finalScore || 0) - (a.scores?.finalScore || 0));
  }, [companies, filterCategory]);

  const allVisibleSelected = useMemo(() => {
    if (rankedCompanies.length === 0) return false;
    return rankedCompanies.every(c => selectedIds.has(c.id));
  }, [rankedCompanies, selectedIds]);

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds(new Set());
    } else {
      const newSet = new Set(selectedIds);
      rankedCompanies.forEach(c => newSet.add(c.id));
      setSelectedIds(newSet);
    }
  };

  const toggleSelectOne = (id) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) {
      newSet.delete(id);
    } else {
      newSet.add(id);
    }
    setSelectedIds(newSet);
  };

  const handleBatchSendToKanban = () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    if (onBatchUpdatePipelineStage) {
      onBatchUpdatePipelineStage(ids, targetStage);
    } else if (onUpdatePipelineStage) {
      ids.forEach(id => onUpdatePipelineStage(id, targetStage));
    }
    setSelectedIds(new Set());
  };

  const handleSendSingleToKanban = (companyId, stage = "QUALIFIED") => {
    if (onUpdatePipelineStage) {
      onUpdatePipelineStage(companyId, stage);
    }
  };

  const handleCopyText = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleWhatsApp = (phone, text) => {
    const url = buildWhatsappUrl(phone, text);
    if (url) window.open(url, "_blank");
  };

  if (companies.length === 0) {
    return (
      <div className="glass-card" style={{ padding: "4rem 2rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1.25rem" }}>
        <div style={{ background: "#fff7ed", padding: "1.2rem", borderRadius: "50%", border: "1px solid #ffedd5" }}>
          <Zap size={48} color="#ff6200" />
        </div>
        <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#1c1917" }}>
          Sua Fila de Prospecção Inteligente está Vazia
        </h2>
        <p style={{ fontSize: "0.92rem", color: "#57534e", maxWidth: "550px", lineHeight: "1.5" }}>
          Inicie uma nova busca no <strong>Google Maps / Apify</strong> para encontrar empresas em qualquer cidade, analisar se possuem site e qual produto comercial oferecer.
        </p>
        <button className="btn-primary" onClick={onOpenApifyModal} style={{ padding: "0.75rem 1.5rem", fontSize: "0.92rem" }}>
          <Zap size={18} />
          <span>Iniciar Nova Prospecção com Apify</span>
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem", position: "relative" }}>
      
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
            <Zap size={26} color="#ff6200" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#1c1917" }}>
              🚀 PROSPECTAR AGORA — Fila Prioritária de Vendas
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "#57534e", marginTop: "4px" }}>
            Você possui <strong style={{ color: "#ea580c" }}>{rankedCompanies.length} empresas analisadas</strong>. Selecione as empresas e envie em lote diretamente para o Kanban de Prospecção.
          </p>
        </div>

        {/* Action / Filter Bar */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", flexWrap: "wrap" }}>
          {/* New Search Button */}
          <button 
            type="button"
            onClick={onOpenApifyModal}
            className="btn-primary"
            style={{ fontSize: "0.82rem", padding: "0.45rem 0.95rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            <Zap size={15} />
            <span>+ Buscar Mais Empresas</span>
          </button>

          {/* Select All Checkbox */}
          <button 
            type="button"
            onClick={toggleSelectAll}
            className="btn-secondary"
            style={{ fontSize: "0.8rem", padding: "0.45rem 0.85rem", display: "flex", alignItems: "center", gap: "0.4rem" }}
          >
            {allVisibleSelected ? <CheckSquare size={16} color="#ea580c" /> : <Square size={16} color="#78716c" />}
            <span>{allVisibleSelected ? "Desmarcar Todos" : "Selecionar Todos"}</span>
          </button>

          {/* Category Filter */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Filter size={15} color="#78716c" />
            <select 
              className="glass-select"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="TODOS">Todos os Nichos ({companies.length})</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* FLOATING / STICKY BATCH ACTIONS BAR (WHEN ITEMS ARE SELECTED) */}
      {selectedIds.size > 0 && (
        <div className="glass-card" style={{
          position: "sticky",
          top: "1rem",
          zIndex: 100,
          padding: "1rem 1.5rem",
          background: "#1c1917",
          color: "#ffffff",
          border: "1px solid #44403c",
          boxShadow: "0 10px 25px -5px rgba(0,0,0,0.3)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
          borderRadius: "12px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ background: "#ea580c", color: "#ffffff", padding: "0.25rem 0.65rem", borderRadius: "999px", fontSize: "0.85rem", fontWeight: "900" }}>
              {selectedIds.size}
            </div>
            <div>
              <strong style={{ fontSize: "0.92rem", display: "block" }}>
                {selectedIds.size === 1 ? "1 empresa selecionada" : `${selectedIds.size} empresas selecionadas`}
              </strong>
              <span style={{ fontSize: "0.75rem", color: "#a8a29e" }}>
                Prontas para mover para o Kanban de Vendas
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", flexWrap: "wrap" }}>
            {/* Stage Selector */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <span style={{ fontSize: "0.78rem", color: "#d6d3d1" }}>Estágio:</span>
              <select 
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
                style={{
                  background: "#292524",
                  color: "#ffffff",
                  border: "1px solid #57534e",
                  borderRadius: "6px",
                  padding: "0.4rem 0.6rem",
                  fontSize: "0.82rem"
                }}
              >
                {PIPELINE_STAGES.map(s => (
                  <option key={s.id} value={s.id}>{s.title}</option>
                ))}
              </select>
            </div>

            {/* Enviar para Vendedora (WhatsApp) */}
            {onOpenDispatchModal && (
              <button 
                type="button"
                onClick={() => {
                  const selectedList = rankedCompanies.filter(c => selectedIds.has(c.id));
                  onOpenDispatchModal(selectedList);
                }}
                className="btn-primary"
                style={{
                  background: "#16a34a",
                  borderColor: "#15803d",
                  padding: "0.5rem 1.1rem",
                  fontSize: "0.85rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.45rem",
                  boxShadow: "0 2px 8px rgba(22, 163, 74, 0.25)"
                }}
                title="Exportar dados formatados com links diretos para o WhatsApp da vendedora"
              >
                <Send size={16} color="#ffffff" />
                <span>Enviar p/ Vendedora</span>
              </button>
            )}

            {/* Send to Kanban Button */}
            <button 
              type="button"
              onClick={handleBatchSendToKanban}
              className="btn-primary"
              style={{
                background: "#ea580c",
                borderColor: "#c2410c",
                padding: "0.5rem 1.1rem",
                fontSize: "0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.45rem"
              }}
            >
              <Kanban size={16} />
              <span>Jogar no Kanban</span>
            </button>

            {/* Quick Navigate to Kanban */}
            {onNavigateTab && (
              <button 
                type="button"
                onClick={() => onNavigateTab("crm_pipeline")}
                style={{
                  background: "transparent",
                  color: "#fdba74",
                  border: "1px solid #7c2d12",
                  borderRadius: "6px",
                  padding: "0.5rem 0.85rem",
                  fontSize: "0.82rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.35rem"
                }}
              >
                <span>Abrir Kanban</span>
                <ArrowRight size={14} />
              </button>
            )}

            {/* Deselect Button */}
            <button 
              type="button"
              onClick={() => setSelectedIds(new Set())}
              style={{
                background: "transparent",
                color: "#a8a29e",
                border: "none",
                fontSize: "0.78rem",
                cursor: "pointer",
                padding: "0.4rem"
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* RANKED LIST CARDS */}
      <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
        {rankedCompanies.map((company, index) => {
          const rank = index + 1;
          const scores = company.scores || {};
          const isHot = scores.classification === "HOT";
          const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");
          const websiteGrade = company.website_score?.grade || (hasWebsite ? "C" : "N/A");
          const websiteScoreVal = company.website_score?.totalScore || (hasWebsite ? 55 : 0);
          
          const isGoodWebsite = hasWebsite && websiteScoreVal >= 70;
          const isBadWebsite = hasWebsite && websiteScoreVal < 50;
          const isNoWebsite = !hasWebsite;

          const isSelected = selectedIds.has(company.id);
          const currentStage = PIPELINE_STAGES.find(s => s.id === (company.pipeline_stage || company.status)) || { title: company.status || "Novo Lead" };

          const hasMetaPixel = company.tech_results?.metaPixel?.detected === "detected";
          const hasGA4 = company.tech_results?.ga4?.detected === "detected" || company.tech_results?.gtm?.detected === "detected";

          return (
            <div 
              key={company.id}
              className="glass-card glass-card-hover"
              style={{
                padding: "1.6rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.25rem",
                borderLeft: isSelected ? "6px solid #ea580c" : (isHot ? "5px solid #dc2626" : "5px solid #ff6200"),
                background: isSelected ? "#fffaf5" : "#ffffff",
                transition: "all 0.15s ease"
              }}
            >
              {/* Card Top Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
                
                {/* Left info with Checkbox */}
                <div style={{ display: "flex", alignItems: "flex-start", gap: "0.75rem" }}>
                  <button 
                    type="button"
                    onClick={() => toggleSelectOne(company.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", padding: "0.2rem 0 0 0" }}
                    title={isSelected ? "Desmarcar" : "Selecionar para mover ao Kanban"}
                  >
                    {isSelected ? (
                      <CheckSquare size={22} color="#ea580c" />
                    ) : (
                      <Square size={22} color="#9ca3af" />
                    )}
                  </button>

                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.65rem", flexWrap: "wrap" }}>
                      <span style={{
                        fontSize: "1.1rem",
                        fontWeight: "900",
                        color: isHot ? "#dc2626" : "#ea580c",
                        background: "#fff7ed",
                        padding: "0.2rem 0.65rem",
                        borderRadius: "6px",
                        border: "1px solid #ffedd5"
                      }}>
                        #{rank}
                      </span>
                      <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#1c1917", margin: 0 }}>
                        {company.name}
                      </h3>

                      <span className="badge" style={{
                        background: isHot ? "#fef2f2" : "#fff7ed",
                        color: isHot ? "#dc2626" : "#ea580c",
                        border: isHot ? "1px solid #fecaca" : "1px solid #ffedd5",
                        fontWeight: "800"
                      }}>
                        🔥 SCORE {scores.finalScore || 85} — {scores.classification || 'HIGH'}
                      </span>

                      {/* Current Pipeline Status Badge */}
                      <span style={{
                        fontSize: "0.72rem",
                        fontWeight: "700",
                        padding: "0.15rem 0.55rem",
                        borderRadius: "4px",
                        background: "#f1f5f9",
                        color: "#475569",
                        border: "1px solid #cbd5e1"
                      }}>
                        📍 Kanban: {currentStage.title}
                      </span>
                    </div>

                    <div style={{ display: "flex", gap: "0.75rem", marginTop: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                      <span className="badge badge-niche">{normalizeSegment(company.niche || company.category)}</span>
                      <span className="badge badge-region">
                        <MapPin size={11} />
                        {company.city}
                      </span>

                      <span style={{ fontSize: "0.8rem", color: "#d97706", display: "flex", alignItems: "center", gap: "0.2rem", fontWeight: "700" }}>
                        <Star size={13} fill="#d97706" color="#d97706" />
                        <span>{company.rating || 4.8}</span>
                        <span style={{ color: "#78716c" }}>({company.review_count || company.reviewsCount || 40} avaliações)</span>
                      </span>

                      {company.phone && (
                        <span style={{ fontSize: "0.8rem", color: "#16a34a", display: "flex", alignItems: "center", gap: "0.3rem", fontWeight: "600" }}>
                          <Phone size={12} />
                          <span>{company.phone}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Offer Badge + Direct Kanban Action */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem" }}>
                  <div style={{
                    background: isNoWebsite ? "#fef2f2" : (isBadWebsite ? "#fff7ed" : "#f0fdf4"),
                    border: isNoWebsite ? "1px solid #fecaca" : (isBadWebsite ? "1px solid #ffedd5" : "1px solid #bbf7d0"),
                    padding: "0.5rem 0.85rem",
                    borderRadius: "8px",
                    textAlign: "right"
                  }}>
                    <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block", textTransform: "uppercase", fontWeight: "700" }}>
                      🎯 SERVIÇO PRINCIPAL RECOMENDADO:
                    </span>
                    <strong style={{ fontSize: "0.95rem", color: isNoWebsite ? "#dc2626" : (isBadWebsite ? "#ea580c" : "#16a34a"), display: "block" }}>
                      {scores.primaryOffer?.title || (isNoWebsite ? "Criação de Website" : (isBadWebsite ? "Reformulação de Site" : "Tráfego Pago"))}
                    </strong>
                    <span style={{ fontSize: "0.75rem", color: "#57534e", fontWeight: "600" }}>
                      Ticket Est.: R$ {scores.primaryOffer?.estimatedValue || 2500}
                    </span>
                  </div>

                  {/* Single Send to Kanban Button */}
                  <button
                    type="button"
                    onClick={() => handleSendSingleToKanban(company.id, "QUALIFIED")}
                    className="btn-secondary"
                    style={{ fontSize: "0.75rem", padding: "0.3rem 0.65rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Kanban size={13} color="#ea580c" />
                    <span>Mover p/ Kanban</span>
                  </button>
                </div>

              </div>

              {/* WEBSITE AUDIT DETAILS & DIRECT LINK */}
              <div style={{
                background: "#faf9f6",
                padding: "1rem",
                borderRadius: "var(--radius-sm)",
                border: "1px solid #e8e6e0",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "1rem",
                alignItems: "center"
              }}>
                <div>
                  <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block", textTransform: "uppercase", fontWeight: "700" }}>
                    Status da Presença Web:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "2px", flexWrap: "wrap" }}>
                    {hasWebsite ? (
                      <a 
                        href={company.website.startsWith("http") ? company.website : `https://${company.website}`} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ fontSize: "0.85rem", fontWeight: "800", color: "#0284c7", display: "flex", alignItems: "center", gap: "0.3rem", textDecoration: "underline" }}
                      >
                        <Globe size={14} />
                        <span>{company.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                        <ArrowUpRight size={13} />
                      </a>
                    ) : company.presence_type === "instagram" ? (
                      <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#db2777", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span>📸 Instagram ({company.instagram || "perfil"}) • SEM SITE</span>
                      </span>
                    ) : company.presence_type === "linktree" ? (
                      <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#7c3aed", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <span>🔗 Usa Linktree • SEM SITE PRÓPRIO</span>
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.82rem", fontWeight: "800", color: "#dc2626", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <XCircle size={14} />
                        <span>SEM SITE PRÓPRIO (NÃO POSSUI)</span>
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block", textTransform: "uppercase", fontWeight: "700" }}>
                    Performance & Experiência Mobile:
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "2px" }}>
                    <span style={{
                      fontWeight: "900",
                      fontSize: "0.88rem",
                      color: isNoWebsite ? "#dc2626" : (websiteScoreVal >= 70 ? "#16a34a" : (websiteScoreVal >= 50 ? "#ca8a04" : "#dc2626"))
                    }}>
                      {hasWebsite ? `NOTA ${websiteScoreVal}/100 (Nota ${websiteGrade})` : '0/100 (Sem Website)'}
                    </span>
                  </div>
                </div>

                <div>
                  <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block", textTransform: "uppercase", fontWeight: "700" }}>
                    Rastreamento de Conversão:
                  </span>
                  <div style={{ display: "flex", gap: "0.6rem", marginTop: "4px" }}>
                    <span style={{ fontSize: "0.75rem", color: hasMetaPixel ? "#16a34a" : "#dc2626", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      {hasMetaPixel ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      <span>Meta Pixel</span>
                    </span>
                    <span style={{ fontSize: "0.75rem", color: hasGA4 ? "#16a34a" : "#dc2626", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                      {hasGA4 ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                      <span>GA4 / GTM</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* AI SDR SCRIPT BOX */}
              {company.aiAnalysis?.opening_message && (
                <div style={{ background: "#fff7ed", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid #ffedd5" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "#ea580c", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <Sparkles size={15} color="#ea580c" />
                      <span>Script de Abordagem do Agente SDR (Abordagem Consultiva):</span>
                    </span>

                    <button 
                      className="btn-secondary"
                      onClick={() => handleCopyText(company.id, company.aiAnalysis.opening_message)}
                      style={{ fontSize: "0.72rem", padding: "0.25rem 0.55rem" }}
                    >
                      {copiedId === company.id ? <Check size={13} color="#16a34a" /> : <Copy size={13} />}
                      <span>{copiedId === company.id ? "Copiado!" : "Copiar Script"}</span>
                    </button>
                  </div>

                  <p style={{ fontSize: "0.85rem", color: "#1c1917", whiteSpace: "pre-wrap", lineHeight: "1.45" }}>
                    {company.aiAnalysis.opening_message}
                  </p>
                </div>
              )}

              {/* CARD FOOTER ACTIONS */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #e8e6e0" }}>
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
                  <button 
                    className="btn-primary"
                    onClick={() => handleWhatsApp(company.phone, company.aiAnalysis?.opening_message)}
                    style={{ background: "#16a34a", borderColor: "#15803d", padding: "0.5rem 1rem", fontSize: "0.82rem" }}
                  >
                    <MessageCircle size={15} />
                    <span>Disparar no WhatsApp</span>
                  </button>

                  {company.email && (
                    <button 
                      className="btn-secondary"
                      onClick={() => onOpenEmailModal(company)}
                      style={{ padding: "0.5rem 0.85rem", fontSize: "0.82rem" }}
                    >
                      <Mail size={15} color="#0284c7" />
                      <span>E-mail</span>
                    </button>
                  )}

                  <button 
                    type="button"
                    onClick={() => handleSendSingleToKanban(company.id, "CONTACTED")}
                    className="btn-secondary"
                    style={{ padding: "0.5rem 0.85rem", fontSize: "0.82rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
                  >
                    <Kanban size={14} color="#f59e0b" />
                    <span>Marcar Contactado</span>
                  </button>
                </div>

                <button 
                  className="btn-secondary"
                  onClick={() => onSelectCompany(company)}
                  style={{ fontSize: "0.82rem", padding: "0.5rem 0.95rem" }}
                >
                  <Eye size={15} />
                  <span>Ver Diagnóstico 360º</span>
                  <ChevronRight size={14} />
                </button>

              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
}
