import React, { useState, useMemo } from "react";
import { 
  MessageCircle, Search, Send, User, CheckCheck, Clock, ShieldAlert, Sparkles, 
  Flame, Globe, Star, MapPin, Eye, StickyNote, Tag, UserCheck, ChevronRight, Lock 
} from "lucide-react";
import { generateCopilotReplySuggestion, summarizeConversationHistory } from "../utils/aiSalesCopilot";
import { PIPELINE_STAGES } from "../types/growthHunter";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function WhatsAppInboxView({ companies = [], onSelectCompany, onUpdatePipelineStage }) {
  // Lista inicial de conversas pareadas com empresas
  const [conversations, setConversations] = useState(() => {
    return companies.slice(0, 10).map((comp, idx) => ({
      id: `conv_${comp.id}`,
      companyId: comp.id,
      companyName: comp.name,
      phone: comp.phone || "5511999998888",
      contactName: comp.partners && comp.partners.length > 0 ? comp.partners[0].name : "Responsável Comercial",
      status: "OPEN",
      unreadCount: idx === 0 ? 2 : 0,
      lastMessageAt: new Date(Date.now() - idx * 3600000).toISOString(),
      messages: [
        {
          id: `msg_1_${idx}`,
          direction: "OUTBOUND",
          content: comp.aiAnalysis?.whatsappPitch || `Olá! Sou consultor da GrowthHunter e identifiquei excelentes oportunidades digitais para a ${comp.name}.`,
          timestamp: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
          status: "READ"
        },
        {
          id: `msg_2_${idx}`,
          direction: "INBOUND",
          content: idx % 2 === 0 ? "Olá! Quanto custa um site de alta conversão para o meu negócio?" : "Olá, já temos uma agência que cuida do nosso marketing digital.",
          timestamp: new Date(Date.now() - idx * 3600000).toISOString(),
          status: "DELIVERED"
        }
      ]
    }));
  });

  const [activeConvId, setActiveConvId] = useState(conversations[0]?.id || null);
  const [filterTab, setFilterTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [inputText, setInputText] = useState("");
  const [isInternalNote, setIsInternalNote] = useState(false);

  // Conversa ativa selecionada
  const activeConv = useMemo(() => conversations.find(c => c.id === activeConvId), [conversations, activeConvId]);
  const activeCompany = useMemo(() => companies.find(c => c.id === activeConv?.companyId), [companies, activeConv]);

  // Assistente Copiloto IA
  const lastInboundMsg = useMemo(() => {
    if (!activeConv) return null;
    return [...activeConv.messages].reverse().find(m => m.direction === "INBOUND");
  }, [activeConv]);

  const copilotSuggestion = useMemo(() => {
    if (!lastInboundMsg) return null;
    return generateCopilotReplySuggestion(lastInboundMsg.content, activeCompany || {});
  }, [lastInboundMsg, activeCompany]);

  // Enviar Mensagem ou Nota Interna
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConvId) return;

    const newMsg = {
      id: `msg_${Date.now()}`,
      direction: "OUTBOUND",
      type: isInternalNote ? "INTERNAL_NOTE" : "TEXT",
      content: inputText,
      timestamp: new Date().toISOString(),
      status: "SENT"
    };

    setConversations(prev => prev.map(c => {
      if (c.id === activeConvId) {
        return {
          ...c,
          lastMessageAt: new Date().toISOString(),
          messages: [...c.messages, newMsg]
        };
      }
      return c;
    }));

    setInputText("");
    setIsInternalNote(false);
  };

  const handleApplyCopilotSuggestion = (text) => {
    setInputText(text);
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem", height: "calc(100vh - 120px)" }}>
      
      {/* 3-COLUMN WHATSAPP INBOX LAYOUT */}
      <div className="glass-card" style={{
        padding: 0,
        flex: 1,
        display: "grid",
        gridTemplateColumns: "320px 1fr 340px",
        overflow: "hidden",
        border: "1px solid #e8e6e0"
      }}>
        
        {/* COLUMN 1: CONVERSATIONS LIST */}
        <div style={{ borderRight: "1px solid #e8e6e0", display: "flex", flexDirection: "column", background: "#faf9f6" }}>
          
          {/* Header & Search */}
          <div style={{ padding: "1rem", borderBottom: "1px solid #e8e6e0", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontWeight: "800", fontSize: "0.95rem", color: "#1c1917", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                <MessageCircle size={18} color="#ff6200" />
                <span>WhatsApp Inbox</span>
              </span>
              <span className="badge badge-niche" style={{ fontSize: "0.68rem" }}>
                {conversations.length} ativas
              </span>
            </div>

            <div style={{ position: "relative" }}>
              <Search size={14} color="#78716c" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
              <input 
                className="glass-input" 
                placeholder="Buscar por cliente, empresa..." 
                style={{ width: "100%", paddingLeft: "2rem", fontSize: "0.8rem" }}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Conversations Items List */}
          <div style={{ flex: 1, overflowY: "auto" }}>
            {conversations.map((conv) => {
              const isActive = conv.id === activeConvId;
              const lastMsg = conv.messages[conv.messages.length - 1];

              return (
                <div 
                  key={conv.id}
                  onClick={() => setActiveConvId(conv.id)}
                  style={{
                    padding: "0.85rem 1rem",
                    borderBottom: "1px solid #e8e6e0",
                    background: isActive ? "#ffffff" : "transparent",
                    borderLeft: isActive ? "4px solid #ff6200" : "4px solid transparent",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <strong style={{ fontSize: "0.88rem", color: "#1c1917" }}>{conv.companyName}</strong>
                    <span style={{ fontSize: "0.7rem", color: "#78716c" }}>
                      {new Date(conv.lastMessageAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <span style={{ fontSize: "0.75rem", color: "#57534e", display: "block", marginTop: "2px" }}>
                    👤 {conv.contactName}
                  </span>

                  <p style={{ fontSize: "0.78rem", color: "#78716c", marginTop: "4px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {lastMsg?.content}
                  </p>
                </div>
              );
            })}
          </div>

        </div>

        {/* COLUMN 2: CHAT CONVERSATION THREAD */}
        {activeConv ? (
          <div style={{ display: "flex", flexDirection: "column", background: "#ffffff" }}>
            
            {/* Thread Header */}
            <div style={{ padding: "0.9rem 1.25rem", borderBottom: "1px solid #e8e6e0", display: "flex", alignItems: "center", justifyContent: "space-between", background: "#faf9f6" }}>
              <div>
                <h3 style={{ fontSize: "1rem", fontWeight: "800", color: "#1c1917" }}>
                  {activeConv.companyName}
                </h3>
                <span style={{ fontSize: "0.75rem", color: "#57534e" }}>
                  📞 {activeConv.phone} | 👤 {activeConv.contactName}
                </span>
              </div>

              {activeCompany && (
                <button className="btn-secondary" onClick={() => onSelectCompany(activeCompany)} style={{ fontSize: "0.78rem", padding: "0.35rem 0.7rem" }}>
                  <Eye size={14} />
                  <span>Ver Perfil 360º</span>
                </button>
              )}
            </div>

            {/* Messages Scroll Area */}
            <div style={{ flex: 1, padding: "1.25rem", overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.85rem", background: "#fbfbf9" }}>
              {activeConv.messages.map((msg) => {
                const isOutbound = msg.direction === "OUTBOUND";
                const isNote = msg.type === "INTERNAL_NOTE";

                if (isNote) {
                  return (
                    <div key={msg.id} style={{ alignSelf: "center", background: "#fff7ed", border: "1px solid #ffedd5", padding: "0.6rem 1rem", borderRadius: "8px", maxWidth: "80%", fontSize: "0.82rem", color: "#ea580c" }}>
                      <span style={{ fontWeight: "800", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <StickyNote size={14} />
                        <span>NOTA INTERNA (Não enviada ao cliente):</span>
                      </span>
                      <p style={{ marginTop: "3px" }}>{msg.content}</p>
                    </div>
                  );
                }

                return (
                  <div 
                    key={msg.id}
                    style={{
                      alignSelf: isOutbound ? "flex-end" : "flex-start",
                      maxWidth: "70%",
                      background: isOutbound ? "#fff7ed" : "#ffffff",
                      border: isOutbound ? "1px solid #ffedd5" : "1px solid #e8e6e0",
                      padding: "0.75rem 1rem",
                      borderRadius: "12px",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
                    }}
                  >
                    <p style={{ fontSize: "0.85rem", color: "#1c1917", whiteSpace: "pre-wrap", lineHeight: "1.45" }}>
                      {msg.content}
                    </p>
                    <span style={{ fontSize: "0.68rem", color: "#78716c", display: "block", textAlign: "right", marginTop: "4px" }}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* AI Sales Copilot Suggestion Box */}
            {copilotSuggestion && (
              <div style={{ background: "#fff7ed", padding: "0.75rem 1.25rem", borderTop: "1px solid #ffedd5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                <div style={{ fontSize: "0.8rem" }}>
                  <span style={{ fontWeight: "800", color: "#ea580c", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                    <Sparkles size={14} />
                    <span>IA Sales Copilot — Objeção Detectada: {copilotSuggestion.objection.label}</span>
                  </span>
                  <p style={{ color: "#44403c", marginTop: "2px" }}>
                    "{copilotSuggestion.suggestedReply.substring(0, 90)}..."
                  </p>
                </div>

                <button 
                  className="btn-secondary" 
                  onClick={() => handleApplyCopilotSuggestion(copilotSuggestion.suggestedReply)}
                  style={{ fontSize: "0.75rem", padding: "0.3rem 0.6rem", color: "#ea580c", borderColor: "#ffedd5" }}
                >
                  Usar Resposta da IA
                </button>
              </div>
            )}

            {/* Input Message Area */}
            <form onSubmit={handleSendMessage} style={{ padding: "0.85rem 1.25rem", borderTop: "1px solid #e8e6e0", display: "flex", gap: "0.6rem", alignItems: "center", background: "#ffffff" }}>
              <button 
                type="button"
                className="btn-secondary" 
                onClick={() => setIsInternalNote(!isInternalNote)}
                style={{ fontSize: "0.75rem", padding: "0.45rem 0.75rem", background: isInternalNote ? "#fff7ed" : "#ffffff", color: isInternalNote ? "#ea580c" : "#57534e" }}
                title="Alternar para Nota Interna"
              >
                <StickyNote size={15} />
                <span>{isInternalNote ? "Nota Interna (Ativo)" : "Nota"}</span>
              </button>

              <input 
                className="glass-input" 
                placeholder={isInternalNote ? "Escreva uma nota interna sobre este lead..." : "Digite sua mensagem do WhatsApp..."} 
                style={{ flex: 1, fontSize: "0.85rem" }}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
              />

              <button type="submit" className="btn-primary" style={{ padding: "0.55rem 1rem" }}>
                <Send size={15} />
                <span>Enviar</span>
              </button>
            </form>

          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", color: "#78716c" }}>
            Selecione uma conversa para iniciar o atendimento.
          </div>
        )}

        {/* COLUMN 3: LEAD 360º CONTEXT SIDEPANEL */}
        {activeCompany ? (
          <div style={{ borderLeft: "1px solid #e8e6e0", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "1rem", overflowY: "auto", background: "#faf9f6" }}>
            <h4 style={{ fontSize: "0.9rem", fontWeight: "900", color: "#1c1917", borderBottom: "1px solid #e8e6e0", paddingBottom: "0.5rem" }}>
              CONTEXTO DO LEAD NO CRM
            </h4>

            {/* Score Pill */}
            <div style={{ background: "#ffffff", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#78716c", display: "block" }}>SCORE COMERCIAL</span>
              <strong style={{ fontSize: "1.2rem", color: "#ff6200" }}>
                🔥 {activeCompany.scores?.finalScore || 90} — {activeCompany.scores?.classification || 'HIGH'}
              </strong>
            </div>

            {/* Primary Offer */}
            <div style={{ background: "#ffffff", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
              <span style={{ fontSize: "0.72rem", color: "#16a34a", fontWeight: "800", display: "block" }}>OFERTA RECOMENDADA:</span>
              <strong style={{ fontSize: "0.9rem", color: "#1c1917", display: "block", marginTop: "2px" }}>
                {activeCompany.scores?.primaryOffer?.title || "Criação de Website"}
              </strong>
              <span style={{ fontSize: "0.75rem", color: "#ea580c", display: "block", marginTop: "2px" }}>
                Ticket: R$ {activeCompany.scores?.primaryOffer?.estimatedValue || 2500}
              </span>
            </div>

            {/* Digital Diagnosis Summary */}
            <div style={{ background: "#ffffff", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e8e6e0", display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.8rem" }}>
              <span style={{ fontWeight: "700", color: "#1c1917" }}>Diagnóstico Rápido:</span>
              <span style={{ color: activeCompany.website_status === "missing" ? "#dc2626" : "#16a34a" }}>
                • Website: {activeCompany.website_status === "missing" ? "❌ Ausente (N/A)" : `✅ Nota ${activeCompany.website_score?.grade || 'C'}`}
              </span>
              <span style={{ color: activeCompany.tech_results?.metaPixel?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                • Meta Pixel: {activeCompany.tech_results?.metaPixel?.detected === "detected" ? "✅ Detectado" : "❌ Não detectado"}
              </span>
              <span style={{ color: activeCompany.tech_results?.ga4?.detected === "detected" ? "#16a34a" : "#dc2626" }}>
                • GA4 / GTM: {activeCompany.tech_results?.ga4?.detected === "detected" ? "✅ Detectado" : "❌ Não detectado"}
              </span>
            </div>

            {/* Quick Stage Switcher */}
            <div>
              <span style={{ fontSize: "0.75rem", color: "#78716c", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                Mover Estágio no Pipeline:
              </span>
              <select 
                className="glass-select"
                style={{ width: "100%", fontSize: "0.8rem" }}
                value={activeCompany.pipeline_stage || "NEW"}
                onChange={(e) => onUpdatePipelineStage && onUpdatePipelineStage(activeCompany.id, e.target.value)}
              >
                {PIPELINE_STAGES.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
              </select>
            </div>

            {/* Action Button */}
            <button className="btn-primary" onClick={() => onSelectCompany(activeCompany)} style={{ fontSize: "0.8rem", width: "100%", justifyContent: "center", marginTop: "auto" }}>
              <Eye size={15} />
              <span>Abrir Diagnóstico 360º</span>
            </button>

          </div>
        ) : (
          <div style={{ padding: "1.25rem", color: "#78716c" }}>Sem lead associado.</div>
        )}

      </div>

    </div>
  );
}
