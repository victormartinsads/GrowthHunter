import React from "react";
import { 
  X, Globe, MapPin, Phone, Mail, Award, Flame, Zap, ArrowUpRight, 
  MessageCircle, Edit3, ShieldAlert, CheckCircle2, AlertTriangle, Camera, Link2
} from "lucide-react";
import { normalizeSegment } from "../utils/segmentClassifier";
import { buildWhatsappUrl, buildGoogleMapsUrl } from "../utils/helpers";

export default function LeadProfileModal({ company, onClose, onOpenEditModal }) {
  if (!company) return null;

  const websiteScore = company.website_score || {};
  const isRealWebsite = company.is_real_website ?? Boolean(company.website && String(company.website).trim() !== "");
  const websiteGrade = websiteScore.grade || "N/A";
  const presenceType = websiteScore.presenceType || company.presence_type || (isRealWebsite ? "Site Próprio" : "Sem Website");
  
  const tech = company.tech_results || {};
  const scores = company.scores || {};
  const isNoWebsite = !isRealWebsite;
  const isBadWebsite = isRealWebsite && (websiteScore.totalScore < 50);
  const isGoodWebsite = isRealWebsite && (websiteScore.totalScore >= 70);

  const criticalIssues = websiteScore.criticalIssues || [];
  const positivePoints = websiteScore.positivePoints || [];

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
        maxWidth: "880px",
        padding: "1.75rem",
        maxHeight: "94vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.25rem",
        background: "#ffffff",
        border: "1px solid #e8e6e0"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#ff6200", fontWeight: "800", letterSpacing: "0.05em" }}>
              DIAGNÓSTICO DIGITAL & SALES INTELLIGENCE
            </span>
            <h2 style={{ fontSize: "1.45rem", fontWeight: "900", color: "#1c1917", marginTop: "2px" }}>
              {company.name}
            </h2>

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
              <span className="badge badge-niche">{normalizeSegment(company.niche || company.category)}</span>
              <span className="badge badge-region"><MapPin size={11} /> {company.city}</span>
              <span style={{ fontSize: "0.8rem", color: "#d97706", fontWeight: "700" }}>
                ⭐ {company.rating || 4.8} ({company.review_count || company.reviewsCount || 30} avaliações)
              </span>

              {/* Status do Website com Filtro de Instagram / Linktree */}
              {isRealWebsite ? (
                <a 
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    fontSize: "0.78rem",
                    padding: "0.2rem 0.6rem",
                    color: "#0284c7",
                    borderColor: "#bae6fd",
                    background: "#f0f9ff",
                    fontWeight: "700",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  <Globe size={13} />
                  <span>{company.website.replace(/^https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                  <ArrowUpRight size={13} />
                </a>
              ) : company.presence_type === "instagram" ? (
                <span className="badge" style={{ background: "#fdf2f8", color: "#db2777", border: "1px solid #fbcfe8", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Camera size={13} />
                  <span>Usa Instagram ({company.instagram || "perfil"}) • SEM SITE</span>
                </span>
              ) : company.presence_type === "linktree" ? (
                <span className="badge" style={{ background: "#f5f3ff", color: "#7c3aed", border: "1px solid #ddd6fe", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                  <Link2 size={13} />
                  <span>Usa Linktree • SEM SITE PRÓPRIO</span>
                </span>
              ) : (
                <span className="badge" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontWeight: "800" }}>
                  🚨 SEM WEBSITE CADASTRADO
                </span>
              )}

              {/* Ficha Google Meu Negócio / Maps */}
              <a 
                href={buildGoogleMapsUrl(company)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  fontSize: "0.78rem",
                  padding: "0.2rem 0.6rem",
                  color: "#166534",
                  borderColor: "#bbf7d0",
                  background: "#f0fdf4",
                  fontWeight: "700",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.3rem"
                }}
                title="Abrir Ficha no Google Meu Negócio / Maps"
              >
                <MapPin size={13} color="#16a34a" />
                <span>Ficha Google Meu Negócio</span>
                <ArrowUpRight size={13} />
              </a>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="badge" style={{
              background: scores.classification === "HOT" ? "#fef2f2" : "#fff7ed",
              color: scores.classification === "HOT" ? "#dc2626" : "#ea580c",
              border: scores.classification === "HOT" ? "1px solid #fecaca" : "1px solid #ffedd5",
              padding: "0.5rem 0.85rem",
              fontSize: "0.85rem",
              fontWeight: "800"
            }}>
              🔥 SCORE {scores.finalScore || 88} ({scores.classification || 'HIGH'})
            </span>

            <button onClick={onClose} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
              <X size={22} />
            </button>
          </div>
        </div>

        {/* STRATEGIC OFFER & VALUE BANNER */}
        <div style={{
          background: isNoWebsite ? "#fff7ed" : isBadWebsite ? "#fff7ed" : "#f0fdf4",
          border: isNoWebsite ? "1px solid #ffedd5" : isBadWebsite ? "1px solid #ffedd5" : "1px solid #bbf7d0",
          padding: "1.1rem 1.3rem",
          borderRadius: "var(--radius-sm)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem"
        }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: isGoodWebsite ? "#16a34a" : "#ea580c", fontWeight: "800", display: "block" }}>
              {isNoWebsite ? "🚨 OFERTA RECOMENDADA: CRIAÇÃO DE SITE DE ALTA CONVERSÃO" : isBadWebsite ? "⚠️ OFERTA RECOMENDADA: REFORMULAÇÃO DE SITE NO CELULAR" : "🎯 OFERTA RECOMENDADA: TRÁFEGO PAGO NO GOOGLE / META ADS"}
            </span>
            <strong style={{ fontSize: "1.05rem", color: "#1c1917", display: "block", marginTop: "2px" }}>
              {scores.primaryOffer?.title || (isNoWebsite ? "Criação de Landing Page de Vendas" : "Otimização / Tráfego")}
            </strong>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>TICKET RECOMENDADO:</span>
            <strong style={{ fontSize: "1.1rem", color: "#ff6200" }}>
              R$ {scores.primaryOffer?.estimatedValue || 2500} {scores.primaryOffer?.monthlyRecurring ? `+ R$ ${scores.primaryOffer.monthlyRecurring}/mês` : ''}
            </strong>
          </div>
        </div>

        {/* DIGITAL DIAGNOSIS GRID */}
        <div>
          <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "#1c1917", marginBottom: "0.65rem" }}>
            📊 DIAGNÓSTICO DETALHADO DO SITE & PRESENÇA WEB
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
            
            <div style={{ background: "#faf9f6", padding: "0.85rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>TIPO DE PRESENÇA</span>
              <strong style={{ fontSize: "0.85rem", color: isNoWebsite ? "#dc2626" : isBadWebsite ? "#ea580c" : "#16a34a" }}>
                {presenceType}
              </strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "0.85rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>PONTUAÇÃO DO SITE</span>
              <strong style={{ fontSize: "0.85rem", color: isNoWebsite ? "#dc2626" : isBadWebsite ? "#ea580c" : "#16a34a" }}>
                {isNoWebsite ? "0/100 (Sem Site)" : `${websiteScore.totalScore || 50}/100 (Nota ${websiteGrade})`}
              </strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "0.85rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>META PIXEL (FACEBOOK)</span>
              <strong style={{ fontSize: "0.85rem", color: tech.metaPixel?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                {tech.metaPixel?.detected === "detected" ? "✅ DETECTADO" : "❌ AUSENTE"}
              </strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "0.85rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>GOOGLE ANALYTICS / GA4</span>
              <strong style={{ fontSize: "0.85rem", color: (tech.ga4?.detected === "detected" || tech.gtm?.detected === "detected") ? "#16a34a" : "#dc2626" }}>
                {(tech.ga4?.detected === "detected" || tech.gtm?.detected === "detected") ? "✅ DETECTADO" : "❌ AUSENTE"}
              </strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "0.85rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>BOTÃO WHATSAPP DIRETO</span>
              <strong style={{ fontSize: "0.85rem", color: tech.whatsAppButton?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                {tech.whatsAppButton?.detected === "detected" ? "✅ PRESENTE" : "❌ NÃO ENCONTRADO"}
              </strong>
            </div>

          </div>
        </div>

        {/* AUDITORIA & FALHAS ENCONTRADAS */}
        <div style={{ background: "#faf9f6", padding: "1.1rem", borderRadius: "var(--radius-sm)", border: "1px solid #e8e6e0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h4 style={{ fontSize: "0.88rem", fontWeight: "800", color: "#1c1917", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <ShieldAlert size={16} color="#ea580c" />
            <span>FALHAS IDENTIFICADAS & OPORTUNIDADES PARA USAR NA ABORDAGEM:</span>
          </h4>

          {criticalIssues.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {criticalIssues.map((issue, idx) => (
                <div key={idx} style={{ fontSize: "0.83rem", color: "#44403c", lineHeight: "1.4" }}>
                  {issue}
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: "0.83rem", color: "#16a34a" }}>
              ✅ Site bem estruturado tecnicamente. O foco principal deve ser Tráfego Pago e captação de clientes.
            </div>
          )}

          {positivePoints.length > 0 && (
            <div style={{ borderTop: "1px dashed #e8e6e0", paddingTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.3rem" }}>
              {positivePoints.map((pt, idx) => (
                <div key={idx} style={{ fontSize: "0.8rem", color: "#15803d" }}>
                  {pt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ACTION BUTTONS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "0.75rem", paddingTop: "0.5rem", borderTop: "1px solid #e8e6e0" }}>
          <button 
            className="btn-primary" 
            onClick={() => {
              const url = buildWhatsappUrl(company.phone, company.aiAnalysis?.opening_message);
              if (url) window.open(url, "_blank");
            }}
            style={{ background: "#16a34a", borderColor: "#15803d" }}
          >
            <MessageCircle size={16} />
            <span>Disparar Abordagem no WhatsApp</span>
          </button>

          <button className="btn-secondary" onClick={() => onOpenEditModal(company)}>
            <Edit3 size={15} />
            <span>Editar Dados da Empresa</span>
          </button>
        </div>

      </div>
    </div>
  );
}
