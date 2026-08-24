import React, { useState } from "react";
import { 
  X, MessageCircle, MapPin, Phone, Mail, Globe, Star, Sparkles, 
  CheckCircle2, AlertTriangle, XCircle, ArrowUpRight, Copy, Check, 
  Calendar, FileText, Send, DollarSign, Tag, TrendingUp, ShieldAlert, Award
} from "lucide-react";
import { PIPELINE_STAGES, LOST_REASONS } from "../types/growthHunter";
import { buildWhatsappUrl, buildGoogleMapsUrl } from "../utils/helpers";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function LeadQuickDrawer({
  isOpen,
  company,
  onClose,
  onUpdateStage,
  onOpenDossier,
  onOpenEditModal,
  onOpenEmailModal
}) {
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "scripts" | "notes" | "cadence"
  const [newNote, setNewNote] = useState("");
  const [notesList, setNotesList] = useState([]);
  const [copiedScript, setCopiedScript] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);

  if (!isOpen || !company) return null;

  const stageObj = PIPELINE_STAGES.find(s => s.id === (company.pipeline_stage || company.status)) || PIPELINE_STAGES[0];
  const isRealWebsite = company.is_real_website ?? Boolean(company.website && String(company.website).trim() !== "");
  const websiteScoreVal = company.website_score?.totalScore || (isRealWebsite ? 65 : 0);
  const dealValue = company.deal_value || company.scores?.primaryOffer?.estimatedValue || 2500;
  const weightedValue = Math.round(dealValue * (stageObj.probability || 0.2));

  const whatsappUrl = buildWhatsappUrl(company.phone, company.aiAnalysis?.opening_message);
  const googleMapsUrl = buildGoogleMapsUrl(company);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;
    const item = {
      id: Date.now(),
      text: newNote.trim(),
      date: new Date().toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" })
    };
    setNotesList([item, ...notesList]);
    setNewNote("");
  };

  const handleCopyScript = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2000);
  };

  return (
    <div style={{
      position: "fixed",
      top: 0, left: 0, right: 0, bottom: 0,
      background: "rgba(15, 23, 42, 0.4)",
      backdropFilter: "blur(4px)",
      zIndex: 1050,
      display: "flex",
      justifyContent: "flex-end",
      animation: "fadeIn 0.2s ease-out"
    }}>
      
      {/* DRAWER PANEL */}
      <div style={{
        width: "100%",
        maxWidth: "540px",
        height: "100%",
        background: "#ffffff",
        borderLeft: "1px solid #e2e8f0",
        boxShadow: "-10px 0 30px rgba(0,0,0,0.12)",
        display: "flex",
        flexDirection: "column",
        animation: "slideLeft 0.25s cubic-bezier(0.16, 1, 0.3, 1)"
      }}>
        
        {/* TOP HEADER */}
        <div style={{
          padding: "1.25rem 1.5rem",
          borderBottom: "1px solid #e2e8f0",
          background: "#fafaf9",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "1rem"
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.3rem" }}>
              <span className="badge badge-niche" style={{ fontSize: "0.72rem" }}>
                {normalizeSegment(company.niche || company.category)}
              </span>
              <span className="badge" style={{ background: stageObj.badgeBg, color: stageObj.badgeColor, fontWeight: "700", fontSize: "0.72rem" }}>
                {stageObj.title} ({Math.round(stageObj.probability * 100)}%)
              </span>
            </div>
            
            <h3 style={{ fontSize: "1.2rem", fontWeight: "900", color: "#0f172a", margin: 0, lineHeight: "1.3" }}>
              {company.name}
            </h3>
            
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginTop: "0.35rem", fontSize: "0.76rem", color: "#64748b" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "0.2rem" }}>
                <MapPin size={12} color="#94a3b8" />
                <span>{company.city || "Brasil"}</span>
              </span>
              <span>•</span>
              <span style={{ color: "#d97706", fontWeight: "700" }}>
                ⭐ {company.rating || 4.8} ({company.review_count || 24} avaliações)
              </span>
            </div>
          </div>

          <button 
            onClick={onClose}
            style={{ background: "#f1f5f9", border: "none", borderRadius: "8px", padding: "0.4rem", cursor: "pointer", color: "#64748b" }}
          >
            <X size={20} />
          </button>
        </div>

        {/* FINANCIAL SUMMARY STRIP (Odoo Style Deal Value) */}
        <div style={{
          padding: "0.75rem 1.5rem",
          background: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <div>
            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
              Valor Estimado do Deal:
            </span>
            <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#0f172a" }}>
              R$ {dealValue.toLocaleString('pt-BR')}
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span style={{ fontSize: "0.7rem", color: "#64748b", fontWeight: "600", textTransform: "uppercase" }}>
              Receita Ponderada:
            </span>
            <div style={{ fontSize: "1.1rem", fontWeight: "900", color: "#16a34a" }}>
              R$ {weightedValue.toLocaleString('pt-BR')}
            </div>
          </div>
        </div>

        {/* ACTION SHORTCUTS (WhatsApp, GMB, Dossiê) */}
        <div style={{
          padding: "0.75rem 1.5rem",
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          flexWrap: "wrap"
        }}>
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                border: "none",
                fontSize: "0.78rem",
                padding: "0.45rem 0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "#ffffff",
                textDecoration: "none",
                borderRadius: "6px"
              }}
            >
              <MessageCircle size={14} />
              <span>Chamar WhatsApp</span>
            </a>
          )}

          <a
            href={googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary"
            style={{
              fontSize: "0.78rem",
              padding: "0.45rem 0.85rem",
              display: "flex",
              alignItems: "center",
              gap: "0.35rem",
              color: "#166534",
              background: "#f0fdf4",
              borderColor: "#bbf7d0",
              textDecoration: "none",
              borderRadius: "6px"
            }}
          >
            <MapPin size={14} color="#16a34a" />
            <span>Ficha Google</span>
            <ArrowUpRight size={12} />
          </a>

          {onOpenDossier && (
            <button
              type="button"
              onClick={() => onOpenDossier(company)}
              className="btn-secondary"
              style={{
                fontSize: "0.78rem",
                padding: "0.45rem 0.85rem",
                display: "flex",
                alignItems: "center",
                gap: "0.35rem",
                color: "#ea580c",
                background: "#fff7ed",
                borderColor: "#fed7aa",
                borderRadius: "6px"
              }}
            >
              <Sparkles size={14} color="#ea580c" />
              <span>Dossiê Raio-X</span>
            </button>
          )}
        </div>

        {/* TABS NAVIGATION */}
        <div style={{
          display: "flex",
          borderBottom: "1px solid #e2e8f0",
          background: "#fafaf9",
          padding: "0 1.5rem"
        }}>
          {[
            { id: "overview", label: "Diagnóstico & Oferta" },
            { id: "scripts", label: "Scripts & Áudio SDR" },
            { id: "notes", label: `Notas (${notesList.length})` }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "0.75rem 1rem",
                background: "none",
                border: "none",
                borderBottom: activeTab === t.id ? "2px solid #ea580c" : "2px solid transparent",
                color: activeTab === t.id ? "#ea580c" : "#64748b",
                fontWeight: activeTab === t.id ? "800" : "600",
                fontSize: "0.82rem",
                cursor: "pointer",
                transition: "all 0.15s"
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* TAB BODY (Scrollable) */}
        <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* 1. OVERVIEW & DIAGNÓSTICO */}
          {activeTab === "overview" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* Estágio do Funil (Mover em 1 clique) */}
              <div>
                <label style={{ fontSize: "0.75rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "0.4rem" }}>
                  Mover Etapa no Funil CRM:
                </label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.4rem" }}>
                  {PIPELINE_STAGES.map(stg => {
                    const isCur = (company.pipeline_stage || company.status) === stg.id;
                    return (
                      <button
                        key={stg.id}
                        type="button"
                        onClick={() => onUpdateStage && onUpdateStage(company.id, stg.id)}
                        style={{
                          padding: "0.5rem 0.6rem",
                          borderRadius: "6px",
                          fontSize: "0.75rem",
                          fontWeight: isCur ? "800" : "600",
                          background: isCur ? stg.badgeBg : "#ffffff",
                          color: isCur ? stg.badgeColor : "#64748b",
                          border: isCur ? `1.5px solid ${stg.badgeColor}` : "1px solid #e2e8f0",
                          cursor: "pointer",
                          textAlign: "left",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between"
                        }}
                      >
                        <span>{stg.title}</span>
                        {isCur && <Check size={13} color={stg.badgeColor} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Status do Website & Presença */}
              <div style={{ background: "#fafaf9", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                  Auditoria de Presença Digital:
                </span>

                <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", fontSize: "0.82rem" }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Website Próprio:</span>
                    {isRealWebsite ? (
                      <a href={company.website} target="_blank" rel="noreferrer" style={{ color: "#0284c7", fontWeight: "700", display: "flex", alignItems: "center", gap: "0.2rem" }}>
                        <span>{company.website.replace(/^https?:\/\//, '').split('/')[0]}</span>
                        <ArrowUpRight size={12} />
                      </a>
                    ) : (
                      <span style={{ color: "#dc2626", fontWeight: "800" }}>🚨 Não Possui (Alvo Venda)</span>
                    )}
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Nota Mobile:</span>
                    <strong style={{ color: websiteScoreVal >= 70 ? "#16a34a" : websiteScoreVal >= 50 ? "#d97706" : "#dc2626" }}>
                      {isRealWebsite ? `${websiteScoreVal}/100` : "0/100"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>Meta Pixel (Ads):</span>
                    <span style={{ fontWeight: "700", color: company.tech_results?.metaPixel?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                      {company.tech_results?.metaPixel?.detected === "detected" ? "✅ Instalado" : "❌ Não Detectado"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ color: "#64748b" }}>WhatsApp Flutuante:</span>
                    <span style={{ fontWeight: "700", color: company.tech_results?.whatsappButton?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                      {company.tech_results?.whatsappButton?.detected === "detected" ? "✅ Presente" : "❌ Faltando no Site"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Oferta Primária Recomendada */}
              <div style={{ background: "#fff7ed", padding: "1rem", borderRadius: "8px", border: "1px solid #ffedd5" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#ea580c", textTransform: "uppercase", display: "block", marginBottom: "0.3rem" }}>
                  🎯 Oferta Recomendada de Entrada:
                </span>
                <strong style={{ fontSize: "0.95rem", color: "#9a3412", display: "block" }}>
                  {company.scores?.primaryOffer?.title || "Criação de Landing Page de Alta Conversão"}
                </strong>
                <p style={{ fontSize: "0.78rem", color: "#78350f", margin: "0.3rem 0 0 0", lineHeight: "1.4" }}>
                  {company.scores?.primaryOffer?.description || "Empresa perde clientes por falta de presença direta no Google e WhatsApp."}
                </p>
              </div>

              {/* Contatos & Sócios */}
              <div style={{ background: "#f8fafc", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: "0.75rem", fontWeight: "800", color: "#475569", textTransform: "uppercase", display: "block", marginBottom: "0.5rem" }}>
                  Contatos & Decisores:
                </span>
                <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem" }}>
                  <div>📞 <strong>Telefone:</strong> {company.phone || "Não informado"}</div>
                  <div>📧 <strong>E-mail:</strong> {company.email || "Não informado"}</div>
                  {company.partners && company.partners.length > 0 && (
                    <div>👤 <strong>Sócios (QSA):</strong> {company.partners.map(p => p.name).join(", ")}</div>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* 2. SCRIPTS & ÁUDIO SDR */}
          {activeTab === "scripts" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              {/* Script WhatsApp */}
              <div style={{ background: "#fafaf9", padding: "1rem", borderRadius: "8px", border: "1px solid #e2e8f0" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.4rem" }}>
                  <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "#0f172a" }}>
                    💬 Script de WhatsApp (Pergunta Consultiva):
                  </span>
                  <button
                    onClick={() => handleCopyScript(company.aiAnalysis?.opening_message || "")}
                    style={{ fontSize: "0.72rem", padding: "0.2rem 0.5rem", background: "#ffffff", border: "1px solid #cbd5e1", borderRadius: "4px", cursor: "pointer", color: "#475569" }}
                  >
                    {copiedScript ? "Copiado!" : "Copiar"}
                  </button>
                </div>
                <p style={{ fontSize: "0.82rem", color: "#334155", lineHeight: "1.45", margin: 0, whiteSpace: "pre-wrap" }}>
                  {company.aiAnalysis?.opening_message || `Olá pessoal da ${company.name}, tudo bem? Vi a empresa de vocês aqui em ${company.city || 'São Paulo'} e achei muito bacana!`}
                </p>
              </div>

              {/* Minuta de Áudio 25s */}
              <div style={{ background: "#f0fdf4", padding: "1rem", borderRadius: "8px", border: "1px solid #bbf7d0" }}>
                <span style={{ fontSize: "0.78rem", fontWeight: "800", color: "#166534", display: "block", marginBottom: "0.4rem" }}>
                  🎙️ Roteiro de Áudio Humano (25 Segundos):
                </span>
                <p style={{ fontSize: "0.82rem", color: "#14532d", lineHeight: "1.45", margin: 0 }}>
                  "Opa [Nome], tudo bem? É a Amanda da GrowthHunter. Cara, tava pesquisando {company.niche || 'empresas'} aqui em {company.city || 'SP'} e vi que vocês tão no topo das buscas, mas {isRealWebsite ? 'o site de vocês tá bem pesado no celular' : 'vocês ainda não têm página própria, só Instagram'}. Gravei um vídeo de 30 segundos mostrando a tela com o erro que tá fazendo vocês perderem clientes. Posso te mandar por aqui?"
                </p>
              </div>

            </div>
          )}

          {/* 3. NOTAS & HISTÓRICO */}
          {activeTab === "notes" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              
              <form onSubmit={handleAddNote} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <textarea
                  rows={3}
                  className="glass-input"
                  style={{ width: "100%", fontSize: "0.82rem", padding: "0.6rem", borderRadius: "6px" }}
                  placeholder="Escreva uma anotação rápida sobre a conversa (ex: 'Pediu para retornar quinta-feira às 15h')..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-primary"
                  style={{ alignSelf: "flex-end", fontSize: "0.78rem", padding: "0.4rem 0.9rem" }}
                >
                  Salvar Nota
                </button>
              </form>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {notesList.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "2rem", color: "#94a3b8", fontSize: "0.82rem" }}>
                    Nenhuma anotação registrada ainda.
                  </div>
                ) : (
                  notesList.map(n => (
                    <div key={n.id} style={{ background: "#fafaf9", padding: "0.75rem", borderRadius: "6px", border: "1px solid #e2e8f0", fontSize: "0.8rem" }}>
                      <span style={{ fontSize: "0.7rem", color: "#94a3b8", display: "block", marginBottom: "0.2rem" }}>{n.date}</span>
                      <p style={{ margin: 0, color: "#334155", lineHeight: "1.4" }}>{n.text}</p>
                    </div>
                  ))
                )}
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
}
