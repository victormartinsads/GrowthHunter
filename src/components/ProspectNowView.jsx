import React, { useState, useMemo } from "react";
import { 
  Zap, Flame, Target, Star, Globe, AlertTriangle, CheckCircle2, XCircle, 
  MessageCircle, Mail, Phone, ChevronRight, UserCheck, ShieldAlert, ArrowUpRight, Copy, Check, Filter, Sparkles, Eye, MapPin 
} from "lucide-react";
import { normalizeSegment } from "../utils/segmentClassifier";
import { buildWhatsappUrl } from "../utils/helpers";

export default function ProspectNowView({ companies = [], onSelectCompany, onUpdatePipelineStage, onOpenEmailModal, onOpenApifyModal }) {
  const [filterCategory, setFilterCategory] = useState("TODOS");
  const [copiedId, setCopiedId] = useState(null);

  const categories = useMemo(() => Array.from(new Set(companies.map(c => normalizeSegment(c.niche || c.category)).filter(Boolean))), [companies]);

  const rankedCompanies = useMemo(() => {
    return [...companies]
      .filter(c => filterCategory === "TODOS" || normalizeSegment(c.niche || c.category) === filterCategory)
      .sort((a, b) => (b.scores?.finalScore || 0) - (a.scores?.finalScore || 0));
  }, [companies, filterCategory]);

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
            <Zap size={26} color="#ff6200" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#1c1917" }}>
              🚀 PROSPECTAR AGORA — Fila Prioritária de Vendas
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "#57534e", marginTop: "4px" }}>
            Você possui <strong style={{ color: "#ea580c" }}>{rankedCompanies.length} empresas analisadas</strong> ordenadas por pontuação e oferta comercial (Criação de Site, Reformulação ou Tráfego Pago).
          </p>
        </div>

        {/* Category Filter */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
                borderLeft: isHot ? "5px solid #dc2626" : "5px solid #ff6200"
              }}
            >
              {/* Card Top Header */}
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
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
                    <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#1c1917" }}>
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

                    {/* WEBSITE LINK PROMINENTE */}
                    <div style={{ marginLeft: "auto", display: "flex", alignItems: "center" }}>
                      {hasWebsite ? (
                        <a 
                          href={company.website.startsWith("http") ? company.website : `https://${company.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{
                            fontSize: "0.78rem",
                            padding: "0.25rem 0.65rem",
                            color: "#0284c7",
                            borderColor: "#bae6fd",
                            background: "#f0f9ff",
                            fontWeight: "700"
                          }}
                        >
                          <Globe size={13} />
                          <span>{company.website}</span>
                          <ArrowUpRight size={13} />
                        </a>
                      ) : (
                        <span className="badge" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontWeight: "800", fontSize: "0.75rem" }}>
                          🚨 SEM WEBSITE (N/A)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Pills Breakdown */}
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                  <div style={{ background: "#faf9f6", padding: "0.45rem 0.7rem", borderRadius: "6px", border: "1px solid #e8e6e0", textAlign: "center" }}>
                    <span style={{ fontSize: "0.68rem", color: "#78716c", display: "block" }}>FIT</span>
                    <strong style={{ fontSize: "0.85rem", color: "#0284c7" }}>{scores.fitScore || 80}</strong>
                  </div>
                  <div style={{ background: "#faf9f6", padding: "0.45rem 0.7rem", borderRadius: "6px", border: "1px solid #e8e6e0", textAlign: "center" }}>
                    <span style={{ fontSize: "0.68rem", color: "#78716c", display: "block" }}>PAIN</span>
                    <strong style={{ fontSize: "0.85rem", color: "#dc2626" }}>{scores.painScore || 90}</strong>
                  </div>
                  <div style={{ background: "#faf9f6", padding: "0.45rem 0.7rem", borderRadius: "6px", border: "1px solid #e8e6e0", textAlign: "center" }}>
                    <span style={{ fontSize: "0.68rem", color: "#78716c", display: "block" }}>SIGNAL</span>
                    <strong style={{ fontSize: "0.85rem", color: "#ea580c" }}>{scores.buyingSignalScore || 70}</strong>
                  </div>
                </div>
              </div>

              {/* DIGITAL DIAGNOSIS GRID — REAL EVALUATION */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.75rem" }}>
                <div style={{ background: "#faf9f6", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
                  <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>STATUS DO WEBSITE</span>
                  <strong style={{ 
                    fontSize: "0.92rem", 
                    color: isNoWebsite ? "#dc2626" : isBadWebsite ? "#ea580c" : "#16a34a" 
                  }}>
                    {isNoWebsite 
                      ? "❌ SEM SITE" 
                      : isBadWebsite 
                      ? `⚠️ RUIM - Nota ${websiteGrade} (${websiteScoreVal}/100)` 
                      : `✅ BOM - Nota ${websiteGrade} (${websiteScoreVal}/100)`}
                  </strong>
                </div>

                <div style={{ background: "#faf9f6", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
                  <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>META PIXEL</span>
                  <strong style={{ fontSize: "0.88rem", color: hasMetaPixel ? "#16a34a" : "#dc2626" }}>
                    {hasMetaPixel ? "✅ DETECTADO" : "❌ NÃO DETECTADO"}
                  </strong>
                </div>

                <div style={{ background: "#faf9f6", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
                  <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>GA4 / GTM</span>
                  <strong style={{ fontSize: "0.88rem", color: hasGA4 ? "#16a34a" : "#dc2626" }}>
                    {hasGA4 ? "✅ DETECTADO" : "❌ NÃO DETECTADO"}
                  </strong>
                </div>

                <div style={{ background: "#faf9f6", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
                  <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>DISPONIBILIDADE</span>
                  <strong style={{ fontSize: "0.88rem", color: "#16a34a" }}>
                    {hasWebsite ? "ONLINE 200 OK" : "INDISPONÍVEL"}
                  </strong>
                </div>
              </div>

              {/* OFERTA COMERCIAL RECOMENDADA COM REGRAS ESTRITAS */}
              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.25rem" }}>
                
                {/* Evidências */}
                <div style={{ background: "#faf9f6", padding: "1.1rem", borderRadius: "var(--radius-sm)", border: "1px solid #e8e6e0" }}>
                  <h4 style={{ fontSize: "0.88rem", fontWeight: "800", color: "#ea580c", marginBottom: "0.75rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                    <Flame size={16} color="#ea580c" />
                    <span>DIAGNÓSTICO COMERCIAL & EVIDÊNCIAS:</span>
                  </h4>
                  <ul style={{ paddingLeft: "1.1rem", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem", color: "#44403c" }}>
                    {(scores.evidenceList || [
                      isNoWebsite ? "Empresa não possui site oficial." : "Empresa possui presença web ativa."
                    ]).map((ev, idx) => (
                      <li key={idx} style={{ lineHeight: "1.35" }}>{ev}</li>
                    ))}
                  </ul>
                </div>

                {/* Oferta Primária & Secundária */}
                <div style={{ 
                  background: isNoWebsite ? "#fff7ed" : isBadWebsite ? "#fff7ed" : "#f0fdf4", 
                  padding: "1.1rem", 
                  borderRadius: "var(--radius-sm)", 
                  border: isNoWebsite ? "1px solid #ffedd5" : isBadWebsite ? "1px solid #ffedd5" : "1px solid #bbf7d0", 
                  display: "flex", 
                  flexDirection: "column", 
                  gap: "0.75rem" 
                }}>
                  <div>
                    <span style={{ fontSize: "0.72rem", color: isGoodWebsite ? "#16a34a" : "#dc2626", fontWeight: "800", display: "block" }}>
                      {isNoWebsite ? "🚨 PRODUTO PRINCIPAL: VENDER SITE NOVO" : isBadWebsite ? "⚠️ PRODUTO PRINCIPAL: REFORMULAÇÃO DE SITE" : "🎯 PRODUTO PRINCIPAL: VENDER SOMENTE TRÁFEGO PAGO"}
                    </span>
                    <strong style={{ fontSize: "1rem", color: "#1c1917", display: "block", marginTop: "2px" }}>
                      {scores.primaryOffer?.title || "Criação de Website"}
                    </strong>
                    <span style={{ fontSize: "0.8rem", color: "#ea580c", display: "block", marginTop: "2px", fontWeight: "800" }}>
                      TICKET SUGERIDO: R$ {scores.primaryOffer?.estimatedValue || 2500}
                    </span>
                  </div>

                  <div style={{ borderTop: "1px solid #e8e6e0", paddingTop: "0.5rem" }}>
                    <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>OFERTA COMPLEMENTAR / RECORRÊNCIA:</span>
                    <span style={{ fontSize: "0.82rem", color: "#44403c", fontWeight: "700" }}>
                      {scores.secondaryOffer?.title || "Gestão de Tráfego Pago no Google Ads"}
                    </span>
                  </div>
                </div>

              </div>

              {/* ARGUMENTO DE ABORDAGEM PERSONALIZADO (AGENTE SDR) */}
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
                
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
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
