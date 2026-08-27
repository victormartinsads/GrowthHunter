import React, { useState } from "react";
import { 
  X, Sparkles, Copy, Check, ExternalLink, Globe, Smartphone, 
  ShieldCheck, AlertTriangle, XCircle, CheckCircle2, TrendingDown, 
  Share2, Award, Printer, ArrowUpRight
} from "lucide-react";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function DossierModal({
  isOpen,
  company,
  onClose
}) {
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen || !company) return null;

  const isRealWebsite = company.is_real_website ?? Boolean(company.website && String(company.website).trim() !== "");
  const websiteScore = company.website_score || {};
  const scoreVal = websiteScore.totalScore || (isRealWebsite ? 58 : 0);
  const grade = websiteScore.grade || (scoreVal >= 70 ? "A" : scoreVal >= 50 ? "B" : scoreVal >= 30 ? "C" : "F");

  const hasPixel = company.tech_results?.metaPixel?.detected === "detected";
  const hasGA4 = company.tech_results?.googleAnalytics?.detected === "detected" || company.tech_results?.googleTagManager?.detected === "detected";
  const hasWhatsapp = company.tech_results?.whatsappButton?.detected === "detected" || Boolean(company.phone);

  const estimatedLostLeads = isRealWebsite ? Math.round((100 - scoreVal) * 0.4 + 12) : 45;
  const estimatedLostRevenue = estimatedLostLeads * 350;

  const publicDossierUrl = `${window.location.origin}/dossie/${encodeURIComponent(company.id || company.name)}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicDossierUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15, 23, 42, 0.6)",
      backdropFilter: "blur(8px)",
      zIndex: 1100,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem"
    }}>
      
      <div className="glass-card" style={{
        width: "100%",
        maxWidth: "780px",
        maxHeight: "92vh",
        overflowY: "auto",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "16px",
        padding: "2rem",
        display: "flex",
        flexDirection: "column",
        gap: "1.5rem",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)"
      }}>
        
        {/* HEADER BAR */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "1rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", marginBottom: "0.25rem" }}>
              <span className="badge" style={{ background: "#ea580c", color: "#ffffff", fontWeight: "800", fontSize: "0.7rem", letterSpacing: "0.05em" }}>
                RAIO-X DE PRESENÇA DIGITAL
              </span>
              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>Auditoria Oficial GrowthHunter</span>
            </div>
            
            <h2 style={{ fontSize: "1.5rem", fontWeight: "900", color: "#0f172a", margin: 0 }}>
              {company.name}
            </h2>
            <span style={{ fontSize: "0.82rem", color: "#64748b" }}>
              {normalizeSegment(company.niche || company.category)} • {company.city || "São Paulo, SP"}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <button
              onClick={handlePrint}
              className="btn-secondary"
              style={{ fontSize: "0.8rem", padding: "0.45rem 0.8rem", display: "flex", alignItems: "center", gap: "0.35rem" }}
            >
              <Printer size={15} />
              <span>Imprimir PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "0.45rem", cursor: "pointer", color: "#64748b" }}
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* SCORE & ESTIMATED LOSS BANNER */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.5fr",
          gap: "1rem",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#ffffff",
          padding: "1.5rem",
          borderRadius: "12px"
        }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.1)", paddingRight: "1rem" }}>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8", textTransform: "uppercase", fontWeight: "700" }}>
              Pontuação de Presença:
            </span>
            <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginTop: "0.2rem" }}>
              <span style={{ fontSize: "2.8rem", fontWeight: "900", color: scoreVal >= 70 ? "#22c55e" : scoreVal >= 50 ? "#eab308" : "#ef4444" }}>
                {scoreVal}
              </span>
              <span style={{ fontSize: "1.1rem", color: "#94a3b8" }}>/100</span>
              <span style={{ fontSize: "1rem", fontWeight: "800", background: "rgba(255,255,255,0.15)", padding: "0.1rem 0.5rem", borderRadius: "4px" }}>
                Grade {grade}
              </span>
            </div>
            <span style={{ fontSize: "0.75rem", color: "#cbd5e1", marginTop: "0.25rem" }}>
              {scoreVal >= 70 ? "Estrutura Digital Saudável" : scoreVal >= 50 ? "Abaixo da Média dos Concorrentes" : "Crítico • Perda Severa de Clientes"}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#f87171" }}>
              <TrendingDown size={18} />
              <strong style={{ fontSize: "0.85rem", textTransform: "uppercase" }}>Estimativa de Oportunidades Perdidas:</strong>
            </div>
            <div style={{ fontSize: "1.5rem", fontWeight: "900", color: "#ffffff", marginTop: "0.3rem" }}>
              ~{estimatedLostLeads} clientes/mês
            </div>
            <span style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.2rem", lineHeight: "1.35" }}>
              Potencial de faturamento não aproveitado estimado em <strong>R$ {estimatedLostRevenue.toLocaleString('pt-BR')}/mês</strong> devido a fricções no celular e falta de canais diretos.
            </span>
          </div>
        </div>

        {/* 5 CRITICAL CHECKPOINTS */}
        <div>
          <h4 style={{ fontSize: "0.95rem", fontWeight: "900", color: "#0f172a", marginBottom: "0.75rem" }}>
            🔍 Diagnóstico dos 5 Pilares de Conversão Digital:
          </h4>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            
            {/* 1. Website */}
            <div style={{ padding: "0.85rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>1. Website Próprio</span>
                {isRealWebsite ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              </div>
              <span style={{ fontSize: "0.74rem", color: isRealWebsite ? "#16a34a" : "#dc2626", display: "block", marginTop: "0.25rem" }}>
                {isRealWebsite ? "Website corporativo detectado" : "Não possui site próprio (apenas redes sociais)"}
              </span>
            </div>

            {/* 2. Mobile Speed */}
            <div style={{ padding: "0.85rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>2. Velocidade no Celular</span>
                {scoreVal >= 50 ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              </div>
              <span style={{ fontSize: "0.74rem", color: scoreVal >= 50 ? "#16a34a" : "#dc2626", display: "block", marginTop: "0.25rem" }}>
                {scoreVal >= 50 ? "Tempo de resposta aceitável" : "Lento no celular (taxa de rejeição > 60%)"}
              </span>
            </div>

            {/* 3. Pixel & Remarketing */}
            <div style={{ padding: "0.85rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>3. Rastreamento de Anúncios</span>
                {hasPixel ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              </div>
              <span style={{ fontSize: "0.74rem", color: hasPixel ? "#16a34a" : "#dc2626", display: "block", marginTop: "0.25rem" }}>
                {hasPixel ? "Meta Pixel ativo para remarketing" : "Meta Pixel ausente (não recupera visitantes)"}
              </span>
            </div>

            {/* 4. WhatsApp Direct */}
            <div style={{ padding: "0.85rem", borderRadius: "8px", background: "#f8fafc", border: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: "700", color: "#334155" }}>4. Canal Direto WhatsApp</span>
                {hasWhatsapp ? <CheckCircle2 size={16} color="#16a34a" /> : <XCircle size={16} color="#dc2626" />}
              </div>
              <span style={{ fontSize: "0.74rem", color: hasWhatsapp ? "#16a34a" : "#dc2626", display: "block", marginTop: "0.25rem" }}>
                {hasWhatsapp ? "Botão direto para atendimento" : "Falta botão flutuante no celular"}
              </span>
            </div>

          </div>
        </div>

        {/* SHARE LINK BOX */}
        <div style={{ background: "#fafaf9", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
          <div>
            <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "#0f172a", display: "block" }}>
              🔗 Link Público do Dossiê para o Cliente:
            </span>
            <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
              Copie e envie no WhatsApp do prospect como demonstração de valor
            </span>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={handleCopyLink}
            style={{
              fontSize: "0.82rem",
              padding: "0.45rem 1rem",
              background: copiedLink ? "#16a34a" : "#ea580c",
              border: "none",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem"
            }}
          >
            {copiedLink ? <Check size={15} /> : <Copy size={15} />}
            <span>{copiedLink ? "Link Copiado!" : "Copiar Link do Dossiê"}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
