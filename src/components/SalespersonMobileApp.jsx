import React, { useState, useMemo } from "react";
import { 
  MessageCircle, MapPin, Phone, Globe, Star, Sparkles, Check, 
  Copy, ArrowRight, CheckCircle2, XCircle, Clock, ChevronRight, User, Award, ArrowUpRight
} from "lucide-react";
import { buildWhatsappUrl, buildGoogleMapsUrl } from "../utils/helpers";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function SalespersonMobileApp({
  companies = [],
  onUpdatePipelineStage,
  salespersonName = "Amanda"
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [filterNiche, setFilterNiche] = useState("TODOS");
  const [completedCount, setCompletedCount] = useState(0);
  const [copiedScript, setCopiedScript] = useState(false);

  const pendingLeads = useMemo(() => {
    return companies.filter(c => {
      const stage = c.pipeline_stage || c.status || "NEW";
      const isPending = ["NEW", "QUALIFIED", "CONTACTED"].includes(stage);
      if (filterNiche !== "TODOS" && normalizeSegment(c.niche || c.category) !== filterNiche) return false;
      return isPending;
    });
  }, [companies, filterNiche]);

  const currentLead = pendingLeads[currentIndex] || pendingLeads[0];

  const handleAction = (stageId) => {
    if (!currentLead) return;
    if (onUpdatePipelineStage) {
      onUpdatePipelineStage(currentLead.id, stageId);
    }
    setCompletedCount(prev => prev + 1);
    if (currentIndex < pendingLeads.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      setCurrentIndex(0);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  if (!currentLead || pendingLeads.length === 0) {
    return (
      <div style={{
        maxWidth: "500px",
        margin: "2rem auto",
        padding: "2.5rem 1.5rem",
        background: "#ffffff",
        borderRadius: "16px",
        textAlign: "center",
        border: "1px solid #e2e8f0",
        boxShadow: "0 10px 25px rgba(0,0,0,0.05)"
      }}>
        <div style={{ width: "64px", height: "64px", background: "#f0fdf4", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
          <CheckCircle2 size={36} />
        </div>
        <h3 style={{ fontSize: "1.3rem", fontWeight: "900", color: "#0f172a", margin: 0 }}>
          Fila do Dia Concluída! 🎉
        </h3>
        <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0.5rem 0 1.5rem 0" }}>
          Você prospectou todos os leads disponíveis para hoje. Bom trabalho!
        </p>
        <button
          onClick={() => setCurrentIndex(0)}
          className="btn-primary"
          style={{ padding: "0.6rem 1.2rem", fontSize: "0.85rem" }}
        >
          Revisar Lista Completa
        </button>
      </div>
    );
  }

  const isRealWebsite = currentLead.is_real_website ?? Boolean(currentLead.website && String(currentLead.website).trim() !== "");
  const whatsappUrl = buildWhatsappUrl(currentLead.phone, currentLead.aiAnalysis?.opening_message);
  const mapsUrl = buildGoogleMapsUrl(currentLead);

  return (
    <div style={{
      maxWidth: "520px",
      margin: "0 auto",
      display: "flex",
      flexDirection: "column",
      gap: "1rem",
      padding: "0.5rem"
    }}>
      
      {/* MOBILE APP HEADER */}
      <div style={{
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        color: "#ffffff",
        padding: "1.25rem",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between"
      }}>
        <div>
          <span style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700", letterSpacing: "0.05em" }}>
            FILA DE PROSPECÇÃO DO DIA
          </span>
          <h3 style={{ fontSize: "1.15rem", fontWeight: "900", margin: "2px 0 0 0" }}>
            Olá, {salespersonName} 👋
          </h3>
        </div>

        <div style={{ textAlign: "right" }}>
          <span className="badge" style={{ background: "#ea580c", color: "#ffffff", fontWeight: "800", fontSize: "0.75rem" }}>
            {currentIndex + 1} de {pendingLeads.length}
          </span>
          <span style={{ display: "block", fontSize: "0.68rem", color: "#cbd5e1", marginTop: "2px" }}>
            {completedCount} feitos hoje
          </span>
        </div>
      </div>

      {/* LEAD FOCUS CARD */}
      <div className="glass-card" style={{
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        padding: "1.35rem",
        display: "flex",
        flexDirection: "column",
        gap: "1rem",
        boxShadow: "0 10px 25px rgba(0,0,0,0.06)"
      }}>
        
        {/* Title & Niche */}
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
            <span className="badge badge-niche" style={{ fontSize: "0.72rem" }}>
              {normalizeSegment(currentLead.niche || currentLead.category)}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#d97706", fontWeight: "700" }}>
              ⭐ {currentLead.rating || 4.8}
            </span>
          </div>

          <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#0f172a", margin: 0, lineHeight: "1.25" }}>
            {currentLead.name}
          </h2>

          <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginTop: "0.3rem", fontSize: "0.78rem", color: "#64748b" }}>
            <MapPin size={13} color="#94a3b8" />
            <span>{currentLead.city || "Brasil"} {currentLead.neighborhood ? `• ${currentLead.neighborhood}` : ""}</span>
          </div>
        </div>

        {/* Site Status Pill */}
        <div style={{
          padding: "0.6rem 0.85rem",
          borderRadius: "8px",
          background: isRealWebsite ? "#f0fdf4" : "#fef2f2",
          border: isRealWebsite ? "1px solid #bbf7d0" : "1px solid #fecaca",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <span style={{ fontSize: "0.78rem", fontWeight: "800", color: isRealWebsite ? "#166534" : "#dc2626" }}>
            {isRealWebsite ? "🌐 Possui Website Próprio" : "🚨 SEM SITE PRÓPRIO (Usa Instagram)"}
          </span>

          <a
            href={mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: "0.72rem", color: "#0284c7", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.2rem", textDecoration: "underline" }}
          >
            <span>Ver Ficha Google</span>
            <ArrowUpRight size={11} />
          </a>
        </div>

        {/* Script Box */}
        <div style={{ background: "#fafaf9", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
            <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#ea580c", display: "flex", alignItems: "center", gap: "0.3rem" }}>
              <Sparkles size={13} />
              <span>Script de Abertura Recomendado:</span>
            </span>

            <button
              onClick={() => handleCopy(currentLead.aiAnalysis?.opening_message || "")}
              style={{ fontSize: "0.7rem", padding: "0.15rem 0.45rem", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#475569" }}
            >
              {copiedScript ? "Copiado!" : "Copiar"}
            </button>
          </div>

          <p style={{ fontSize: "0.82rem", color: "#1e293b", margin: 0, lineHeight: "1.45" }}>
            "{currentLead.aiAnalysis?.opening_message || `Olá pessoal da ${currentLead.name}, tudo bem? Vi a empresa de vocês no Google!`}"
          </p>
        </div>

        {/* PRIMARY CALL TO ACTION (BIG WHATSAPP BUTTON) */}
        {whatsappUrl ? (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
            style={{
              background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
              border: "none",
              padding: "0.9rem 1.25rem",
              borderRadius: "10px",
              fontSize: "1rem",
              fontWeight: "900",
              color: "#ffffff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.5rem",
              textDecoration: "none",
              boxShadow: "0 6px 20px rgba(22, 163, 74, 0.35)"
            }}
          >
            <MessageCircle size={20} />
            <span>Chamar no WhatsApp (1 Toque)</span>
          </a>
        ) : (
          <div style={{ textAlign: "center", color: "#94a3b8", fontSize: "0.82rem" }}>
            Sem WhatsApp cadastrado para este lead.
          </div>
        )}

        {/* QUICK FEEDBACK BUTTONS (1-TOUCH STATUS) */}
        <div>
          <span style={{ fontSize: "0.72rem", color: "#64748b", fontWeight: "700", textTransform: "uppercase", display: "block", marginBottom: "0.4rem", textAlign: "center" }}>
            Registrar Retorno da Prospecção:
          </span>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.45rem" }}>
            <button
              onClick={() => handleAction("MEETING")}
              style={{
                padding: "0.65rem 0.4rem",
                borderRadius: "8px",
                background: "#ecfeff",
                border: "1px solid #a5f3fc",
                color: "#0891b2",
                fontWeight: "800",
                fontSize: "0.74rem",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              📅 Reunião!
            </button>

            <button
              onClick={() => handleAction("REPLIED")}
              style={{
                padding: "0.65rem 0.4rem",
                borderRadius: "8px",
                background: "#f5f3ff",
                border: "1px solid #ddd6fe",
                color: "#7c3aed",
                fontWeight: "800",
                fontSize: "0.74rem",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              💬 Respondeu
            </button>

            <button
              onClick={() => handleAction("LOST")}
              style={{
                padding: "0.65rem 0.4rem",
                borderRadius: "8px",
                background: "#fef2f2",
                border: "1px solid #fecaca",
                color: "#dc2626",
                fontWeight: "800",
                fontSize: "0.74rem",
                cursor: "pointer",
                textAlign: "center"
              }}
            >
              ❌ Sem Interesse
            </button>
          </div>

          <button
            onClick={() => {
              if (currentIndex < pendingLeads.length - 1) setCurrentIndex(prev => prev + 1);
              else setCurrentIndex(0);
            }}
            style={{
              width: "100%",
              marginTop: "0.6rem",
              background: "transparent",
              border: "none",
              color: "#94a3b8",
              fontSize: "0.76rem",
              cursor: "pointer",
              padding: "0.3rem"
            }}
          >
            Pular para o próximo lead ➡️
          </button>
        </div>

      </div>

    </div>
  );
}
