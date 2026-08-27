import React, { useState, useEffect, useMemo } from "react";
import { 
  MessageCircle, QrCode, Send, Sparkles, Clock, ShieldCheck, 
  Settings, CheckCircle2, XCircle, RefreshCw, Smartphone, Bot, 
  Layers, Users, Share2, ArrowRight, Zap, Filter, Search, Plus, 
  Trash2, Copy, Check, ExternalLink, Calendar, AlertTriangle,
  Mic, Square, Volume2, Play, Pause, Image as ImageIcon
} from "lucide-react";
import { buildWhatsappUrl, buildGoogleMapsUrl } from "../utils/helpers";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function WhatsAppAutomationDashboard({
  companies = [],
  onUpdatePipelineStage,
  showToast
}) {
  const [activeTab, setActiveTab] = useState("qr_login"); // "qr_login" | "live_chat" | "automation_rules" | "bulk_sender" | "webhooks" | "followup"
  
  // WhatsApp Session State
  const [session, setSession] = useState({
    status: "CONNECTED",
    phone: "5519998812233",
    profileName: "GrowthHunter SDR Desk",
    connectedAt: new Date().toISOString(),
    qrCode: "",
    battery: 95
  });
  const [isLoadingQr, setIsLoadingQr] = useState(false);

  // Live Chat State (100% REAL)
  const [realChats, setRealChats] = useState([]);
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [activeChatPhone, setActiveChatPhone] = useState(companies[0]?.phone || "");
  const [chatSidebarTab, setChatSidebarTab] = useState("chats"); // "chats" | "crm"
  const [chatSearchQuery, setChatSearchQuery] = useState("");

  // Automation Rules State (Desativadas por padrão)
  const [rules, setRules] = useState({
    welcomeEnabled: false,
    welcomeMessage: "Olá! Obrigado por entrar em contato com a nossa equipe. Em instantes um de nossos consultores vai te atender!",
    officeHoursEnabled: false,
    officeHoursStart: "08:00",
    officeHoursEnd: "18:00",
    officeHoursMessage: "Olá! Nosso horário de atendimento é de Segunda a Sexta das 08h às 18h. Deixe sua mensagem e responderemos logo no início do expediente!",
    keywordRules: [
      {
        id: "rule_preco",
        keyword: "preço, valor, quanto custa, orçamento",
        replyText: "Trabalhamos com projetos sob medida para o seu nicho! Para te passar a proposta exata, qual é o segmento da sua empresa e a cidade?",
        enabled: false
      },
      {
        id: "rule_reuniao",
        keyword: "reunião, agendar, horário, marcar",
        replyText: "Excelente! Tenho horários disponíveis amanhã às 14h ou 16h para uma apresentação rápida de 15 minutos. Qual fica melhor para você?",
        enabled: false
      },
      {
        id: "rule_site",
        keyword: "site, landing page, reformulação",
        replyText: "Desenvolvemos páginas ultra-rápidas otimizadas para celular com botão direto de WhatsApp e Meta Pixel configurado. Quer que eu te envie 2 exemplos reais?",
        enabled: false
      }
    ]
  });

  // Bulk Sender State
  const [bulkTemplate, setBulkTemplate] = useState("Olá {{nome}}, tudo bem? Notei que a {{empresa}} em {{cidade}} tem excelente reputação, mas ainda não possui um site próprio com agendamento direto no WhatsApp. Posso te mandar uma prévia em vídeo de 30s?");
  const [bulkDelay, setBulkDelay] = useState(3);
  const [isBulkSending, setIsBulkSending] = useState(false);
  const [bulkProgress, setBulkProgress] = useState(0);

  // Webhooks State
  const [webhookUrl, setWebhookUrl] = useState("https://hook.eu1.make.com/exemplo-webhook-growthhunter");
  const [webhookEvent, setWebhookEvent] = useState("LEAD_STAGE_UPDATED");
  const [isTestingWebhook, setIsTestingWebhook] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newReply, setNewReply] = useState("");

  // Carregar status da sessão e conversas reais periodicamente
  useEffect(() => {
    let intervalId = null;

    async function checkSession() {
      try {
        const res = await fetch("http://localhost:3001/api/whatsapp/session");
        if (res.ok) {
          const data = await res.json();
          if (data.session) {
            setSession(data.session);
          }
        }

        const chatsRes = await fetch("http://localhost:3001/api/whatsapp/chats");
        if (chatsRes.ok) {
          const chatsData = await chatsRes.json();
          if (chatsData.chats) {
            setRealChats(chatsData.chats);
            if (!activeChatPhone && chatsData.chats.length > 0) {
              setActiveChatPhone(chatsData.chats[0].phone);
            }
          }
        }

        const msgRes = await fetch("http://localhost:3001/api/whatsapp/messages");
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.messages) {
            setMessages(msgData.messages);
          }
        }
      } catch (e) {}
    }

    checkSession();

    intervalId = setInterval(() => {
      checkSession();
    }, 2500);

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeChatPhone]);

  const handleGenerateQr = async () => {
    setIsLoadingQr(true);
    try {
      const res = await fetch("http://localhost:3001/api/whatsapp/connect-qr", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSession(prev => ({ ...prev, status: "SCAN_QR", qrCode: data.qrCode }));
        showToast?.("QR Code gerado! Aponte o WhatsApp do celular.", "info");
      }
    } catch (e) {
      showToast?.("Erro ao gerar QR Code.", "error");
    } finally {
      setIsLoadingQr(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      const res = await fetch("http://localhost:3001/api/whatsapp/disconnect", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setSession(prev => ({ ...prev, status: "DISCONNECTED", phone: "", profileName: "" }));
        showToast?.("WhatsApp desconectado.", "info");
      }
    } catch (e) {
      showToast?.("Erro ao desconectar.", "error");
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !activeChatPhone) return;

    const messageText = chatInput.trim();
    const cleanPhone = String(activeChatPhone).replace(/\D/g, "");
    setChatInput("");

    try {
      const res = await fetch("http://localhost:3001/api/whatsapp/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, message: messageText })
      });

      const data = await res.json();
      if (data.success) {
        // Atualiza as mensagens imediatamente
        const msgRes = await fetch("http://localhost:3001/api/whatsapp/messages");
        if (msgRes.ok) {
          const msgData = await msgRes.json();
          if (msgData.messages) {
            setMessages(msgData.messages);
          }
        }
      } else {
        showToast?.(data.error || "Falha ao enviar mensagem pelo WhatsApp.", "error");
      }
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      showToast?.("Erro de conexão ao enviar mensagem.", "error");
    }
  };

  // ── Gravação e Envio de Áudio PTT (Voz Real) ──
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const mediaRecorderRef = React.useRef(null);
  const audioChunksRef = React.useRef([]);
  const timerRef = React.useRef(null);

  const handleStartRecording = async () => {
    if (!activeChatPhone) {
      showToast?.("Selecione um contato para enviar o áudio.", "warning");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingSeconds(0);

      timerRef.current = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error("Erro ao acessar microfone:", err);
      showToast?.("Permissão do microfone negada ou indisponível.", "error");
    }
  };

  const handleCancelRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (mediaRecorderRef.current) {
      try {
        mediaRecorderRef.current.stop();
        mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      } catch (e) {}
    }
    audioChunksRef.current = [];
    setIsRecording(false);
    setRecordingSeconds(0);
  };

  const handleStopAndSendAudio = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!mediaRecorderRef.current || !activeChatPhone) {
      handleCancelRecording();
      return;
    }

    const cleanPhone = String(activeChatPhone).replace(/\D/g, "");

    mediaRecorderRef.current.onstop = async () => {
      const audioBlob = new Blob(audioChunksRef.current, { type: "audio/mp4" });
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      reader.onloadend = async () => {
        const base64Audio = reader.result;
        try {
          const res = await fetch("http://localhost:3001/api/whatsapp/send-audio", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ phone: cleanPhone, audioBase64: base64Audio })
          });

          const data = await res.json();
          if (data.success) {
            showToast?.("🎙️ Áudio enviado com sucesso!", "success");
            const msgRes = await fetch("http://localhost:3001/api/whatsapp/messages");
            if (msgRes.ok) {
              const msgData = await msgRes.json();
              if (msgData.messages) {
                setMessages(msgData.messages);
              }
            }
          } else {
            showToast?.(data.error || "Falha ao enviar áudio.", "error");
          }
        } catch (err) {
          console.error("Erro ao enviar áudio:", err);
          showToast?.("Erro ao enviar áudio.", "error");
        }
      };

      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop());
      setIsRecording(false);
      setRecordingSeconds(0);
    };

    mediaRecorderRef.current.stop();
  };

  const handleAddKeywordRule = (e) => {
    e.preventDefault();
    if (!newKeyword.trim() || !newReply.trim()) return;

    const newRule = {
      id: `rule_${Date.now()}`,
      keyword: newKeyword.trim(),
      replyText: newReply.trim(),
      enabled: true
    };

    setRules(prev => ({
      ...prev,
      keywordRules: [...prev.keywordRules, newRule]
    }));
    setNewKeyword("");
    setNewReply("");
    showToast?.("Nova regra de palavra-chave adicionada!", "success");
  };

  const handleDeleteKeywordRule = (ruleId) => {
    setRules(prev => ({
      ...prev,
      keywordRules: prev.keywordRules.filter(r => r.id !== ruleId)
    }));
  };

  const handleStartBulkSend = async () => {
    const targetLeads = companies.slice(0, 15);
    if (targetLeads.length === 0) {
      showToast?.("Nenhum lead encontrado no CRM para disparo.", "warning");
      return;
    }

    setIsBulkSending(true);
    setBulkProgress(0);

    try {
      const res = await fetch("http://localhost:3001/api/whatsapp/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leads: targetLeads,
          templateText: bulkTemplate,
          delaySeconds: bulkDelay
        })
      });

      const data = await res.json();
      if (data.success) {
        setBulkProgress(100);
        showToast?.(`🚀 Disparo em massa concluído para ${data.totalDispatched} leads!`, "success");
      }
    } catch (e) {
      showToast?.("Erro ao processar disparo em massa.", "error");
    } finally {
      setIsBulkSending(false);
    }
  };

  const handleTestWebhook = async () => {
    if (!webhookUrl) return;
    setIsTestingWebhook(true);

    try {
      const res = await fetch("http://localhost:3001/api/webhooks/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl,
          event: webhookEvent,
          leadData: {
            name: "Clínica Exemplo Teste",
            niche: "Odontologia",
            city: "Campinas, SP",
            phone: "5519998812233",
            stage: "MEETING",
            dealValue: 2500
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        showToast?.("✅ Webhook disparado com sucesso para o endpoint!", "success");
      } else {
        showToast?.(data.message || "Erro no disparo do Webhook.", "error");
      }
    } catch (e) {
      showToast?.("Erro ao conectar com Webhook.", "error");
    } finally {
      setIsTestingWebhook(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
      
      {/* TOP BANNER */}
      <div className="glass-card" style={{
        padding: "1.5rem",
        background: "linear-gradient(135deg, #15803d 0%, #16a34a 50%, #059669 100%)",
        color: "#ffffff",
        borderRadius: "14px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem",
        boxShadow: "0 10px 25px -5px rgba(22, 163, 74, 0.3)"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.25rem" }}>
            <span style={{ background: "rgba(255,255,255,0.2)", padding: "0.3rem 0.6rem", borderRadius: "6px", fontSize: "0.72rem", fontWeight: "800", letterSpacing: "0.05em" }}>
              WHATSAPP AUTOMATION & QR CRM
            </span>
            <span style={{ fontSize: "0.75rem", color: "#dcfce7" }}>
              {session.status === "CONNECTED" ? "🟢 Conectado ao WhatsApp" : "🔴 Desconectado"}
            </span>
          </div>

          <h2 style={{ fontSize: "1.5rem", fontWeight: "900", margin: 0 }}>
            Central de Automação & Mensagens WhatsApp
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#f0fdf4", margin: "0.25rem 0 0 0", maxWidth: "650px", lineHeight: "1.4" }}>
            Conexão direta por QR Code, auto-respostas inteligentes de boas-vindas e palavras-chave, disparador em massa e webhooks para Google Sheets, Zapier e Make.
          </p>
        </div>

        <div style={{ textAlign: "right", background: "rgba(255,255,255,0.15)", padding: "0.6rem 1rem", borderRadius: "10px" }}>
          <span style={{ fontSize: "0.7rem", color: "#dcfce7", display: "block" }}>Número Ativo:</span>
          <strong style={{ fontSize: "1rem" }}>{session.phone || "Nenhum"}</strong>
        </div>
      </div>

      {/* NAVIGATION TABS */}
      <div style={{
        display: "flex",
        background: "#faf9f6",
        padding: "0.35rem",
        borderRadius: "10px",
        border: "1px solid #e8e6e0",
        gap: "0.35rem",
        overflowX: "auto"
      }}>
        {[
          { id: "qr_login", label: "QR Code Login", icon: QrCode },
          { id: "live_chat", label: "Live Chat Inbox", icon: MessageCircle },
          { id: "automation_rules", label: "Regras de Automação", icon: Bot },
          { id: "bulk_sender", label: "Disparo em Massa", icon: Send },
          { id: "webhooks", label: "Webhooks (Zapier/Make)", icon: Share2 },
          { id: "followup", label: "Rastreamento Follow-up", icon: Clock }
        ].map(t => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              style={{
                padding: "0.55rem 0.95rem",
                borderRadius: "8px",
                fontSize: "0.82rem",
                fontWeight: isActive ? "800" : "600",
                background: isActive ? "#ffffff" : "transparent",
                color: isActive ? "#15803d" : "#57534e",
                border: isActive ? "1px solid #bbf7d0" : "none",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: "0.4rem",
                boxShadow: isActive ? "0 2px 6px rgba(0,0,0,0.04)" : "none",
                whiteSpace: "nowrap"
              }}
            >
              <Icon size={15} color={isActive ? "#16a34a" : "#78716c"} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT */}

      {/* ── 1. QR CODE LOGIN & SESSÃO ── */}
      {activeTab === "qr_login" && (
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "1.25rem", alignItems: "start" }}>
          
          <div className="glass-card" style={{ padding: "1.5rem", background: "#ffffff", border: "1px solid #e8e6e0" }}>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1c1917", margin: "0 0 0.5rem 0", display: "flex", alignItems: "center", gap: "0.4rem" }}>
              <QrCode size={20} color="#16a34a" />
              <span>Pareamento WhatsApp via QR Code</span>
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: "1.45", margin: "0 0 1.25rem 0" }}>
              Abra o WhatsApp no seu celular, vá em <strong>Configurações &gt; Aparelhos Conectados &gt; Conectar Aparelho</strong> e aponte a câmera para o QR Code abaixo.
            </p>

            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "1.5rem",
              background: "#fafaf9",
              borderRadius: "12px",
              border: "1px dashed #cbd5e1"
            }}>
              {session.status === "CONNECTED" ? (
                <div style={{ textAlign: "center" }}>
                  <div style={{ width: "64px", height: "64px", background: "#f0fdf4", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
                    <CheckCircle2 size={36} />
                  </div>
                  <strong style={{ fontSize: "1.1rem", color: "#15803d", display: "block" }}>
                    WhatsApp Conectado com Sucesso!
                  </strong>
                  <span style={{ fontSize: "0.82rem", color: "#64748b", display: "block", marginTop: "0.25rem" }}>
                    Número: <strong>+{session.phone}</strong> • Perfil: {session.profileName}
                  </span>
                  
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", marginTop: "1.25rem" }}>
                    <button
                      onClick={handleGenerateQr}
                      className="btn-secondary"
                      style={{ fontSize: "0.78rem", padding: "0.45rem 0.85rem" }}
                    >
                      Trocar de Número
                    </button>
                    <button
                      onClick={handleDisconnect}
                      className="btn-secondary"
                      style={{ fontSize: "0.78rem", padding: "0.45rem 0.85rem", color: "#dc2626", borderColor: "#fecaca" }}
                    >
                      Desconectar
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  {session.qrCode ? (
                    <img
                      src={session.qrCode}
                      alt="WhatsApp QR Code"
                      style={{ width: "220px", height: "220px", borderRadius: "8px", border: "4px solid #ffffff", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
                    />
                  ) : (
                    <div style={{ width: "220px", height: "220px", background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8", borderRadius: "8px" }}>
                      Clique abaixo para gerar
                    </div>
                  )}

                  <button
                    onClick={handleGenerateQr}
                    disabled={isLoadingQr}
                    className="btn-primary"
                    style={{ marginTop: "1.25rem", background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)", border: "none" }}
                  >
                    {isLoadingQr ? "Gerando QR..." : "🔄 Gerar Novo QR Code"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="glass-card" style={{ padding: "1.5rem", background: "#ffffff", border: "1px solid #e8e6e0", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <h4 style={{ fontSize: "0.95rem", fontWeight: "800", color: "#1c1917", margin: 0 }}>
              🛡️ Status e Saúde da Conexão
            </h4>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", fontSize: "0.82rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Status da Sessão:</span>
                <strong style={{ color: session.status === "CONNECTED" ? "#16a34a" : "#dc2626" }}>
                  {session.status === "CONNECTED" ? "Ativa & Pronta" : "Desconectado"}
                </strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Conta Conectada:</span>
                <strong>{session.profileName || "Nenhum"}</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #f1f5f9", paddingBottom: "0.5rem" }}>
                <span style={{ color: "#64748b" }}>Bateria do Aparelho:</span>
                <strong style={{ color: "#16a34a" }}>🔋 {session.battery}%</strong>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ color: "#64748b" }}>Mensagens Armazenadas:</span>
                <strong>{messages.length} mensagens</strong>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ── 2. LIVE CHAT INBOX (100% REAL) ── */}
      {activeTab === "live_chat" && (() => {
        const cleanActivePhone = String(activeChatPhone || "").replace(/\D/g, "");
        const currentChatMessages = messages.filter(m => String(m.phone).replace(/\D/g, "") === cleanActivePhone);
        const activeLead = companies.find(c => String(c.phone).replace(/\D/g, "") === cleanActivePhone);
        const activeChatInfo = realChats.find(c => String(c.phone).replace(/\D/g, "") === cleanActivePhone) || (activeLead ? { phone: cleanActivePhone, name: activeLead.name } : { phone: cleanActivePhone, name: cleanActivePhone ? `+${cleanActivePhone}` : "Selecione um contato" });

        const filteredRealChats = realChats.filter(c => 
          (c.name || "").toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
          (c.phone || "").includes(chatSearchQuery) ||
          (c.lastMessage || "").toLowerCase().includes(chatSearchQuery.toLowerCase())
        );

        const filteredCrmLeads = companies.filter(c => 
          (c.name || "").toLowerCase().includes(chatSearchQuery.toLowerCase()) ||
          (c.phone || "").includes(chatSearchQuery) ||
          (c.city || "").toLowerCase().includes(chatSearchQuery.toLowerCase())
        );

        return (
          <div style={{ display: "grid", gridTemplateColumns: "340px 1fr", gap: "1rem", height: "600px" }}>
            
            {/* Sidebar: Chats List */}
            <div className="glass-card" style={{ padding: "0.85rem", background: "#ffffff", border: "1px solid #e8e6e0", display: "flex", flexDirection: "column", gap: "0.6rem" }}>
              
              {/* Search */}
              <div style={{ position: "relative" }}>
                <Search size={14} color="#78716c" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
                <input
                  type="text"
                  className="glass-input"
                  placeholder="Buscar conversas ou contatos..."
                  style={{ width: "100%", paddingLeft: "2rem", fontSize: "0.78rem" }}
                  value={chatSearchQuery}
                  onChange={(e) => setChatSearchQuery(e.target.value)}
                />
              </div>

              {/* Sidebar Tabs Switcher (WhatsApp Chats / CRM Leads) */}
              <div style={{ display: "flex", background: "#f8fafc", padding: "0.2rem", borderRadius: "6px", border: "1px solid #e2e8f0" }}>
                <button
                  onClick={() => setChatSidebarTab("chats")}
                  style={{
                    flex: 1,
                    padding: "0.35rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    fontWeight: chatSidebarTab === "chats" ? "800" : "600",
                    background: chatSidebarTab === "chats" ? "#ffffff" : "transparent",
                    color: chatSidebarTab === "chats" ? "#16a34a" : "#64748b",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: chatSidebarTab === "chats" ? "0 1px 3px rgba(0,0,0,0.06)" : "none"
                  }}
                >
                  WhatsApp ({realChats.length})
                </button>
                <button
                  onClick={() => setChatSidebarTab("crm")}
                  style={{
                    flex: 1,
                    padding: "0.35rem 0.5rem",
                    borderRadius: "4px",
                    fontSize: "0.72rem",
                    fontWeight: chatSidebarTab === "crm" ? "800" : "600",
                    background: chatSidebarTab === "crm" ? "#ffffff" : "transparent",
                    color: chatSidebarTab === "crm" ? "#16a34a" : "#64748b",
                    border: "none",
                    cursor: "pointer",
                    boxShadow: chatSidebarTab === "crm" ? "0 1px 3px rgba(0,0,0,0.06)" : "none"
                  }}
                >
                  Leads CRM ({companies.length})
                </button>
              </div>

              {/* Conversations Scrollable List */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                
                {chatSidebarTab === "chats" && (
                  filteredRealChats.length === 0 ? (
                    <div style={{ textAlign: "center", padding: "2rem 1rem", color: "#94a3b8", fontSize: "0.8rem" }}>
                      <MessageCircle size={28} color="#cbd5e1" style={{ margin: "0 auto 0.5rem auto" }} />
                      <strong style={{ display: "block", color: "#64748b", fontSize: "0.84rem" }}>Nenhuma conversa ativa no WhatsApp</strong>
                      <span style={{ fontSize: "0.74rem", display: "block", marginTop: "0.25rem" }}>
                        Quando você ou um cliente enviar mensagem, ela aparecerá aqui em tempo real.
                      </span>
                    </div>
                  ) : (
                    filteredRealChats.map((chat) => {
                      const isSelected = cleanActivePhone === chat.phone;
                      return (
                        <div
                          key={chat.phone}
                          onClick={() => setActiveChatPhone(chat.phone)}
                          style={{
                            padding: "0.65rem 0.75rem",
                            borderRadius: "8px",
                            background: isSelected ? "#f0fdf4" : "#fafaf9",
                            border: isSelected ? "1.5px solid #16a34a" : "1px solid #e8e6e0",
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                            display: "flex",
                            alignItems: "center",
                            gap: "0.65rem"
                          }}
                        >
                          {/* Avatar */}
                          {chat.avatar ? (
                            <img
                              src={chat.avatar}
                              alt={chat.name}
                              style={{ width: "36px", height: "36px", borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                            />
                          ) : (
                            <div style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "50%",
                              background: "#dcfce7",
                              color: "#15803d",
                              fontWeight: "800",
                              fontSize: "0.88rem",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0
                            }}>
                              {(chat.name || "W")[0].toUpperCase()}
                            </div>
                          )}

                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                              <strong style={{ fontSize: "0.82rem", color: "#1c1917", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                {chat.name || `+${chat.phone}`}
                              </strong>
                              <span style={{ fontSize: "0.66rem", color: "#94a3b8" }}>
                                {chat.timestamp ? new Date(chat.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                              </span>
                            </div>
                            <p style={{ margin: "0.2rem 0 0 0", fontSize: "0.74rem", color: "#64748b", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {chat.lastMessage || `+${chat.phone}`}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  )
                )}

                {chatSidebarTab === "crm" && (
                  filteredCrmLeads.map((c) => {
                    const isSelected = cleanActivePhone === String(c.phone || "").replace(/\D/g, "");
                    return (
                      <div
                        key={c.id}
                        onClick={() => setActiveChatPhone(c.phone)}
                        style={{
                          padding: "0.65rem 0.75rem",
                          borderRadius: "8px",
                          background: isSelected ? "#f0fdf4" : "#fafaf9",
                          border: isSelected ? "1.5px solid #16a34a" : "1px solid #e8e6e0",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.65rem"
                        }}
                      >
                        <div style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "50%",
                          background: "#e0f2fe",
                          color: "#0369a1",
                          fontWeight: "800",
                          fontSize: "0.88rem",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}>
                          {(c.name || "C")[0].toUpperCase()}
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <strong style={{ fontSize: "0.82rem", color: "#1c1917", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                              {c.name}
                            </strong>
                            <span style={{ fontSize: "0.66rem", color: "#16a34a", fontWeight: "700" }}>
                              {c.scores?.finalScore ? `${c.scores.finalScore} pts` : ""}
                            </span>
                          </div>
                          <span style={{ fontSize: "0.72rem", color: "#64748b", display: "block", marginTop: "2px" }}>
                            {normalizeSegment(c.niche || c.category)} • {c.city || "Brasil"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}

              </div>
            </div>

            {/* Chat Messages Panel */}
            <div className="glass-card" style={{ padding: "0", background: "#ffffff", border: "1px solid #e8e6e0", display: "flex", flexDirection: "column", overflow: "hidden" }}>
              
              {/* Active Contact Header */}
              <div style={{
                padding: "0.85rem 1.25rem",
                borderBottom: "1px solid #e2e8f0",
                background: "#f8fafc",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  {activeChatInfo.avatar ? (
                    <img
                      src={activeChatInfo.avatar}
                      alt={activeChatInfo.name}
                      style={{ width: "42px", height: "42px", borderRadius: "50%", objectFit: "cover" }}
                    />
                  ) : (
                    <div style={{
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: "#dcfce7",
                      color: "#15803d",
                      fontWeight: "900",
                      fontSize: "1rem",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {(activeChatInfo.name || "W")[0].toUpperCase()}
                    </div>
                  )}

                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a", display: "block" }}>
                      {activeChatInfo.name || "Selecione uma conversa"}
                    </strong>
                    <span style={{ fontSize: "0.72rem", color: "#64748b" }}>
                      {cleanActivePhone ? `+${cleanActivePhone}` : "Nenhum telefone selecionado"} • {session.status === "CONNECTED" ? "🟢 WhatsApp Conectado" : "🔴 Desconectado"}
                    </span>
                  </div>
                </div>

                {cleanActivePhone && (
                  <a
                    href={buildWhatsappUrl(cleanActivePhone)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-secondary"
                    style={{ fontSize: "0.74rem", padding: "0.35rem 0.65rem", display: "flex", alignItems: "center", gap: "0.3rem" }}
                  >
                    <ExternalLink size={13} />
                    <span>Abrir no App</span>
                  </a>
                )}
              </div>

              {/* Messages Flow */}
              <div style={{ flex: 1, overflowY: "auto", padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", background: "#f8fafc" }}>
                {currentChatMessages.length === 0 ? (
                  <div style={{ textAlign: "center", margin: "auto", maxWidth: "420px", padding: "2rem" }}>
                    <div style={{ width: "52px", height: "52px", background: "#f0fdf4", color: "#16a34a", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 1rem auto" }}>
                      <MessageCircle size={26} />
                    </div>
                    <strong style={{ fontSize: "0.95rem", color: "#1c1917", display: "block" }}>
                      Nenhuma mensagem trocada ainda com este contato
                    </strong>
                    <p style={{ fontSize: "0.78rem", color: "#64748b", margin: "0.4rem 0 0 0", lineHeight: "1.4" }}>
                      Digite sua mensagem ou grave um áudio no campo abaixo para conversar pelo WhatsApp em tempo real.
                    </p>
                  </div>
                ) : (
                  currentChatMessages.map(msg => {
                    const isOutbound = msg.direction === "OUTBOUND";
                    const isAudio = msg.type === "AUDIO" || Boolean(msg.audioBase64) || (msg.content && msg.content.includes("Áudio"));

                    return (
                      <div
                        key={msg.id}
                        style={{
                          alignSelf: isOutbound ? "flex-end" : "flex-start",
                          maxWidth: "75%",
                          background: isOutbound ? "#dcf8c6" : "#ffffff",
                          padding: "0.75rem 1rem",
                          borderRadius: isOutbound ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                          border: isOutbound ? "none" : "1px solid #e2e8f0"
                        }}
                      >
                        {isAudio ? (
                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "0.45rem", marginBottom: "0.35rem", fontSize: "0.78rem", fontWeight: "700", color: "#15803d" }}>
                              <Mic size={14} color="#16a34a" />
                              <span>Mensagem de Áudio (Voz)</span>
                            </div>
                            {msg.audioBase64 ? (
                              <audio
                                src={msg.audioBase64}
                                controls
                                style={{ height: "36px", width: "240px", borderRadius: "20px" }}
                              />
                            ) : (
                              <span style={{ fontSize: "0.75rem", color: "#64748b" }}>🎵 Áudio recebido no WhatsApp</span>
                            )}
                          </div>
                        ) : (
                          <p style={{ margin: 0, fontSize: "0.84rem", color: "#0f172a", lineHeight: "1.4", whiteSpace: "pre-wrap" }}>
                            {msg.content}
                          </p>
                        )}

                        <span style={{ fontSize: "0.66rem", color: "#64748b", display: "block", textAlign: "right", marginTop: "4px" }}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""} • {isOutbound ? (msg.status || "Enviado") : "Recebido"}
                        </span>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Input Form & Voice Recording Bar */}
              <div style={{ padding: "0.85rem 1.25rem", background: "#ffffff", borderTop: "1px solid #e2e8f0" }}>
                {isRecording ? (
                  <div style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: "#fef2f2",
                    padding: "0.6rem 1rem",
                    borderRadius: "10px",
                    border: "1px solid #fecaca"
                  }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#dc2626", animation: "pulse 1s infinite" }} />
                      <strong style={{ fontSize: "0.84rem", color: "#991b1b" }}>
                        Gravando Áudio: {String(Math.floor(recordingSeconds / 60)).padStart(2, "0")}:{String(recordingSeconds % 60).padStart(2, "0")}
                      </strong>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <button
                        type="button"
                        onClick={handleCancelRecording}
                        style={{
                          background: "#ffffff",
                          border: "1px solid #fca5a5",
                          color: "#dc2626",
                          borderRadius: "6px",
                          padding: "0.4rem 0.75rem",
                          fontSize: "0.76rem",
                          cursor: "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.3rem"
                        }}
                      >
                        <Trash2 size={14} />
                        <span>Cancelar</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleStopAndSendAudio}
                        className="btn-primary"
                        style={{
                          background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                          border: "none",
                          padding: "0.4rem 0.9rem",
                          fontSize: "0.76rem",
                          display: "flex",
                          alignItems: "center",
                          gap: "0.35rem"
                        }}
                      >
                        <Send size={14} />
                        <span>Enviar Áudio</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "0.5rem" }}>
                    <input
                      type="text"
                      className="glass-input"
                      style={{ flex: 1, fontSize: "0.84rem" }}
                      placeholder={cleanActivePhone ? "Digite uma mensagem para o WhatsApp..." : "Selecione um contato na lista ao lado..."}
                      disabled={!cleanActivePhone}
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                    />

                    {/* Microphone button */}
                    <button
                      type="button"
                      onClick={handleStartRecording}
                      disabled={!cleanActivePhone}
                      title="Gravar Áudio de Voz (PTT)"
                      style={{
                        background: "#f0fdf4",
                        border: "1px solid #bbf7d0",
                        color: "#16a34a",
                        borderRadius: "8px",
                        padding: "0 0.85rem",
                        cursor: cleanActivePhone ? "pointer" : "not-allowed",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "all 0.15s ease"
                      }}
                    >
                      <Mic size={18} />
                    </button>

                    <button
                      type="submit"
                      disabled={!cleanActivePhone || !chatInput.trim()}
                      className="btn-primary"
                      style={{ background: "#16a34a", border: "none", display: "flex", alignItems: "center", gap: "0.35rem", padding: "0.55rem 1rem" }}
                    >
                      <Send size={15} />
                      <span>Enviar</span>
                    </button>
                  </form>
                )}
              </div>

            </div>

          </div>
        );
      })()}

      {/* ── 3. REGRAS DE AUTOMAÇÃO ── */}
      {activeTab === "automation_rules" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Welcome Auto-Reply */}
          <div className="glass-card" style={{ padding: "1.25rem", background: "#ffffff", border: "1px solid #e8e6e0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div>
                <strong style={{ fontSize: "0.95rem", color: "#1c1917" }}>🤖 Mensagem Automática de Boas-Vindas</strong>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>
                  Enviada automaticamente quando um novo lead mandar a primeira mensagem
                </span>
              </div>
              <input
                type="checkbox"
                checked={rules.welcomeEnabled}
                onChange={(e) => setRules({ ...rules, welcomeEnabled: e.target.checked })}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>
            <textarea
              rows={2}
              className="glass-input"
              style={{ width: "100%", fontSize: "0.82rem" }}
              value={rules.welcomeMessage}
              onChange={(e) => setRules({ ...rules, welcomeMessage: e.target.value })}
            />
          </div>

          {/* Keyword Auto-Replies */}
          <div className="glass-card" style={{ padding: "1.25rem", background: "#ffffff", border: "1px solid #e8e6e0" }}>
            <strong style={{ fontSize: "0.95rem", color: "#1c1917", display: "block", marginBottom: "0.5rem" }}>
              🔑 Respostas Automáticas por Palavra-Chave (Keyword Triggers)
            </strong>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem", marginBottom: "1rem" }}>
              {rules.keywordRules.map(rule => (
                <div key={rule.id} style={{ background: "#fafaf9", padding: "0.85rem", borderRadius: "8px", border: "1px solid #e2e8f0", display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                  <div>
                    <span className="badge" style={{ background: "#f0fdf4", color: "#16a34a", fontSize: "0.72rem", marginBottom: "0.25rem" }}>
                      Palavras: {rule.keyword}
                    </span>
                    <p style={{ fontSize: "0.8rem", color: "#334155", margin: "0.25rem 0 0 0" }}>
                      "{rule.replyText}"
                    </p>
                  </div>
                  <button
                    onClick={() => handleDeleteKeywordRule(rule.id)}
                    style={{ background: "none", border: "none", color: "#dc2626", cursor: "pointer" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Keyword Form */}
            <form onSubmit={handleAddKeywordRule} style={{ display: "grid", gridTemplateColumns: "1fr 2fr auto", gap: "0.5rem" }}>
              <input
                type="text"
                className="glass-input"
                placeholder="Ex: proposta, contratar, portfólio"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                style={{ fontSize: "0.8rem" }}
              />
              <input
                type="text"
                className="glass-input"
                placeholder="Mensagem automática de resposta..."
                value={newReply}
                onChange={(e) => setNewReply(e.target.value)}
                style={{ fontSize: "0.8rem" }}
              />
              <button type="submit" className="btn-primary" style={{ background: "#16a34a", border: "none", fontSize: "0.78rem" }}>
                <Plus size={14} /> Adicionar
              </button>
            </form>
          </div>

          {/* Office Hours Fallback */}
          <div className="glass-card" style={{ padding: "1.25rem", background: "#ffffff", border: "1px solid #e8e6e0" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.75rem" }}>
              <div>
                <strong style={{ fontSize: "0.95rem", color: "#1c1917" }}>🌙 Horário de Atendimento & Resposta de Ausência</strong>
                <span style={{ fontSize: "0.75rem", color: "#64748b", display: "block" }}>
                  Responde automaticamente mensagens recebidas fora do expediente comercial
                </span>
              </div>
              <input
                type="checkbox"
                checked={rules.officeHoursEnabled}
                onChange={(e) => setRules({ ...rules, officeHoursEnabled: e.target.checked })}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
              />
            </div>
            <textarea
              rows={2}
              className="glass-input"
              style={{ width: "100%", fontSize: "0.82rem" }}
              value={rules.officeHoursMessage}
              onChange={(e) => setRules({ ...rules, officeHoursMessage: e.target.value })}
            />
          </div>

        </div>
      )}

      {/* ── 4. DISPARO EM MASSA (BULK SENDER) ── */}
      {activeTab === "bulk_sender" && (
        <div className="glass-card" style={{ padding: "1.5rem", background: "#ffffff", border: "1px solid #e8e6e0", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1c1917", margin: "0 0 0.25rem 0" }}>
              📤 Disparador em Massa Inteligente (Anti-Ban Throttling)
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
              Dispare mensagens personalizadas para múltiplos leads do CRM com atraso configurável entre cada envio.
            </p>
          </div>

          {/* Template Textarea */}
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569" }}>
                Template da Mensagem:
              </label>
              <div style={{ display: "flex", gap: "0.3rem" }}>
                {["{{nome}}", "{{empresa}}", "{{nicho}}", "{{cidade}}"].map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setBulkTemplate(prev => prev + " " + tag)}
                    style={{ fontSize: "0.7rem", background: "#f1f5f9", border: "1px solid #cbd5e1", borderRadius: "4px", padding: "0.1rem 0.4rem", cursor: "pointer" }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              className="glass-input"
              style={{ width: "100%", fontSize: "0.85rem" }}
              value={bulkTemplate}
              onChange={(e) => setBulkTemplate(e.target.value)}
            />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "0.2rem" }}>
                Atraso Anti-Ban por Envio:
              </label>
              <select
                className="glass-select"
                value={bulkDelay}
                onChange={(e) => setBulkDelay(Number(e.target.value))}
                style={{ fontSize: "0.82rem" }}
              >
                <option value={3}>3 segundos (Rápido)</option>
                <option value={6}>6 segundos (Recomendado)</option>
                <option value={12}>12 segundos (Ultra Seguro)</option>
              </select>
            </div>

            <button
              onClick={handleStartBulkSend}
              disabled={isBulkSending}
              className="btn-primary"
              style={{
                marginTop: "auto",
                background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
                border: "none",
                fontSize: "0.88rem",
                padding: "0.65rem 1.25rem"
              }}
            >
              {isBulkSending ? `Disparando (${bulkProgress}%)...` : `🚀 Iniciar Disparo para ${Math.min(companies.length, 15)} Leads`}
            </button>
          </div>
        </div>
      )}

      {/* ── 5. WEBHOOKS (ZAPIER / MAKE / GOOGLE SHEETS) ── */}
      {activeTab === "webhooks" && (
        <div className="glass-card" style={{ padding: "1.5rem", background: "#ffffff", border: "1px solid #e8e6e0", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div>
            <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1c1917", margin: "0 0 0.25rem 0" }}>
              🔗 Integrações de Webhook (Google Sheets, Zapier & Make)
            </h3>
            <p style={{ fontSize: "0.82rem", color: "#64748b", margin: 0 }}>
              Transmita eventos e leads do GrowthHunter instantaneamente para planilhas externas ou automações de CRM.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "0.75rem", alignItems: "end" }}>
            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "0.3rem" }}>
                URL do Endpoint do Webhook:
              </label>
              <input
                type="text"
                className="glass-input"
                style={{ width: "100%", fontSize: "0.85rem" }}
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hook.eu1.make.com/... ou https://hooks.zapier.com/..."
              />
            </div>

            <div>
              <label style={{ fontSize: "0.75rem", fontWeight: "700", color: "#475569", display: "block", marginBottom: "0.3rem" }}>
                Gatilho do Evento:
              </label>
              <select
                className="glass-select"
                style={{ width: "100%", fontSize: "0.85rem" }}
                value={webhookEvent}
                onChange={(e) => setWebhookEvent(e.target.value)}
              >
                <option value="LEAD_STAGE_UPDATED">Estágio do Funil Alterado</option>
                <option value="LEAD_REPLIED_WHATSAPP">Lead Respondeu no WhatsApp</option>
                <option value="DEAL_WON">Venda Fechada (Deal Ganho)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleTestWebhook}
            disabled={isTestingWebhook}
            className="btn-secondary"
            style={{ alignSelf: "flex-start", fontSize: "0.82rem", padding: "0.5rem 1rem", background: "#f0fdf4", color: "#166534", borderColor: "#bbf7d0" }}
          >
            {isTestingWebhook ? "Testando Disparo..." : "⚡ Testar Envio de Payload Agora"}
          </button>
        </div>
      )}

      {/* ── 6. RASTREAMENTO FOLLOW-UP ── */}
      {activeTab === "followup" && (
        <div className="glass-card" style={{ padding: "1.5rem", background: "#ffffff", border: "1px solid #e8e6e0" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "800", color: "#1c1917", margin: "0 0 0.25rem 0" }}>
            ⏰ Rastreamento de Follow-up (Régua de 5 Toques)
          </h3>
          <p style={{ fontSize: "0.82rem", color: "#64748b", margin: "0 0 1rem 0" }}>
            Leads contactados que precisam de reativação para não esfriarem no funil.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            {companies.slice(0, 5).map((comp, idx) => {
              const days = idx * 2 + 1;
              const whatsappUrl = buildWhatsappUrl(comp.phone, `Olá ${comp.name}, passando para ver se você conseguiu dar uma olhada na proposta que te mandei!`);

              return (
                <div key={comp.id} style={{ background: "#fafaf9", padding: "1rem", borderRadius: "10px", border: "1px solid #e2e8f0", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem" }}>
                  <div>
                    <strong style={{ fontSize: "0.92rem", color: "#0f172a" }}>{comp.name}</strong>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginTop: "2px", fontSize: "0.76rem" }}>
                      <span className="badge" style={{ background: days >= 5 ? "#fef2f2" : "#fffbeb", color: days >= 5 ? "#dc2626" : "#d97706", fontSize: "0.68rem" }}>
                        ⚠️ Sem contato há {days} dias (Toque {idx + 1})
                      </span>
                      <span style={{ color: "#64748b" }}>{comp.city}</span>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    {whatsappUrl && (
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary"
                        style={{ fontSize: "0.78rem", padding: "0.4rem 0.8rem", background: "#16a34a", border: "none", textDecoration: "none", color: "#ffffff", display: "flex", alignItems: "center", gap: "0.3rem" }}
                      >
                        <MessageCircle size={13} />
                        <span>Reativar no WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </div>
  );
}
