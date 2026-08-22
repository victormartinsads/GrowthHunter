import React, { useState } from "react";
import { 
  X, Building2, Globe, Star, MapPin, Phone, Mail, MessageCircle, Check, Copy, 
  Flame, ShieldAlert, CheckCircle2, UserCheck, Calendar, Clock, Plus, Trash2, Edit3, ArrowUpRight 
} from "lucide-react";
import { normalizeSegment } from "../utils/segmentClassifier";
import { buildWhatsappUrl } from "../utils/helpers";

export default function LeadProfileModal({ company, isOpen, onClose, onOpenEditModal, onOpenEmailModal, onAddTask, onUpdatePipelineStage }) {
  const [copiedType, setCopiedType] = useState(null);

  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskType, setNewTaskType] = useState("WHATSAPP");
  const [newTaskDate, setNewTaskDate] = useState("");

  if (!isOpen || !company) return null;

  const scores = company.scores || {};
  const tech = company.tech_results || {};
  const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");
  const websiteScoreVal = company.website_score?.totalScore || (hasWebsite ? 55 : 0);
  const websiteGrade = company.website_score?.grade || (hasWebsite ? "C" : "N/A");

  const isGoodWebsite = hasWebsite && websiteScoreVal >= 70;
  const isBadWebsite = hasWebsite && websiteScoreVal < 50;
  const isNoWebsite = !hasWebsite;

  const handleCopy = (type, text) => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2000);
  };

  const handleCreateTaskSubmit = (e) => {
    e.preventDefault();
    if (!newTaskTitle) return;
    if (onAddTask) {
      onAddTask(company.id, {
        id: `task_${Date.now()}`,
        title: newTaskTitle,
        type: newTaskType,
        dueDate: newTaskDate || new Date().toISOString().split("T")[0],
        completed: false
      });
    }
    setNewTaskTitle("");
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(28, 25, 23, 0.45)",
      backdropFilter: "blur(8px)",
      zIndex: 1000,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "850px",
        padding: "1.75rem",
        maxHeight: "94vh",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "1.35rem",
        background: "#ffffff",
        border: "1px solid #e8e6e0"
      }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <span style={{ fontSize: "0.75rem", color: "#ff6200", fontWeight: "800", letterSpacing: "0.05em" }}>
              DIAGNÓSTICO DIGITAL 360º — GROWTHHUNTER
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#1c1917", marginTop: "2px" }}>
              {company.name}
            </h2>

            <div style={{ display: "flex", gap: "0.6rem", marginTop: "0.4rem", flexWrap: "wrap", alignItems: "center" }}>
              <span className="badge badge-niche">{normalizeSegment(company.niche || company.category)}</span>
              <span className="badge badge-region"><MapPin size={11} /> {company.city}</span>
              <span style={{ fontSize: "0.8rem", color: "#d97706", fontWeight: "700" }}>
                ⭐ {company.rating || 4.8} ({company.review_count || company.reviewsCount || 30} avaliações)
              </span>

              {/* LINK CLICÁVEL PROMINENTE */}
              {hasWebsite ? (
                <a 
                  href={company.website.startsWith("http") ? company.website : `https://${company.website}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="btn-secondary"
                  style={{
                    fontSize: "0.8rem",
                    padding: "0.25rem 0.65rem",
                    color: "#0284c7",
                    borderColor: "#bae6fd",
                    background: "#f0f9ff",
                    fontWeight: "800"
                  }}
                >
                  <Globe size={14} />
                  <span>{company.website}</span>
                  <ArrowUpRight size={14} />
                </a>
              ) : (
                <span className="badge" style={{ background: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca", fontWeight: "800" }}>
                  🚨 SEM WEBSITE (N/A)
                </span>
              )}
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span className="badge" style={{
              background: scores.classification === "HOT" ? "#fef2f2" : "#fff7ed",
              color: scores.classification === "HOT" ? "#dc2626" : "#ea580c",
              border: scores.classification === "HOT" ? "1px solid #fecaca" : "1px solid #ffedd5",
              padding: "0.6rem 0.9rem",
              fontSize: "0.88rem",
              fontWeight: "800"
            }}>
              🔥 SCORE {scores.finalScore || 88} ({scores.classification || 'HIGH'})
            </span>

            <button onClick={onClose} style={{ background: "none", border: "none", color: "#78716c", cursor: "pointer" }}>
              <X size={24} />
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
            <span style={{ fontSize: "0.75rem", color: isGoodWebsite ? "#16a34a" : "#dc2626", fontWeight: "800", display: "block" }}>
              {isNoWebsite ? "🚨 OFERTA RECOMENDADA: VENDER SITE NOVO" : isBadWebsite ? "⚠️ OFERTA RECOMENDADA: REFORMULAÇÃO DE SITE" : "🎯 OFERTA RECOMENDADA: VENDER SOMENTE TRÁFEGO PAGO"}
            </span>
            <strong style={{ fontSize: "1.1rem", color: "#1c1917", display: "block", marginTop: "2px" }}>
              {scores.primaryOffer?.title || "Criação de Website de Alta Conversão"}
            </strong>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>TICKET RECOMENDADO:</span>
            <strong style={{ fontSize: "1.05rem", color: "#ff6200" }}>
              R$ {scores.primaryOffer?.estimatedValue || 2500} {scores.primaryOffer?.monthlyRecurring ? `+ R$ ${scores.primaryOffer.monthlyRecurring}/mês` : ''}
            </strong>
          </div>
        </div>

        {/* DIGITAL DIAGNOSIS GRID */}
        <div>
          <h4 style={{ fontSize: "0.92rem", fontWeight: "800", color: "#1c1917", marginBottom: "0.75rem" }}>
            DIAGNÓSTICO DA PRESENÇA DIGITAL
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.85rem" }}>
            
            <div style={{ background: "#faf9f6", padding: "0.85rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>STATUS DO WEBSITE</span>
              <strong style={{ fontSize: "0.9rem", color: isNoWebsite ? "#dc2626" : isBadWebsite ? "#ea580c" : "#16a34a" }}>
                {isNoWebsite ? "❌ SEM SITE (N/A)" : isBadWebsite ? `⚠️ RUIM - NOTA ${websiteGrade}` : `✅ BOM - NOTA ${websiteGrade}`}
              </strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "0.85rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>META PIXEL</span>
              <strong style={{ fontSize: "0.9rem", color: tech.metaPixel?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                {tech.metaPixel?.detected === "detected" ? "✅ DETECTADO" : "❌ NÃO DETECTADO"}
              </strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "0.85rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>GOOGLE ANALYTICS / GA4</span>
              <strong style={{ fontSize: "0.9rem", color: tech.ga4?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                {tech.ga4?.detected === "detected" ? "✅ DETECTADO" : "❌ NÃO DETECTADO"}
              </strong>
            </div>

            <div style={{ background: "#faf9f6", padding: "0.85rem", borderRadius: "6px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>GOOGLE TAG MANAGER</span>
              <strong style={{ fontSize: "0.9rem", color: tech.gtm?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                {tech.gtm?.detected === "detected" ? "✅ DETECTADO" : "❌ NÃO DETECTADO"}
              </strong>
            </div>

          </div>
        </div>

        {/* POR QUE PROSPECTAR ESTA EMPRESA? */}
        <div style={{ background: "#faf9f6", padding: "1.1rem", borderRadius: "var(--radius-sm)", border: "1px solid #e8e6e0" }}>
          <h4 style={{ fontSize: "0.9rem", fontWeight: "800", color: "#ff6200", marginBottom: "0.6rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <Flame size={16} color="#ff6200" />
            <span>POR QUE PROSPECTAR ESTA EMPRESA AGORA?</span>
          </h4>

          <ul style={{ paddingLeft: "1.2rem", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.85rem", color: "#44403c" }}>
            {(scores.evidenceList || [
              isNoWebsite ? "Empresa não possui website oficial." : "Empresa possui presença web ativa."
            ]).map((ev, idx) => (
              <li key={idx} style={{ lineHeight: "1.35" }}>{ev}</li>
            ))}
          </ul>
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
            <span>Disparar no WhatsApp</span>
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
