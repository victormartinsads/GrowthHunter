import React, { useState, useEffect, useRef } from "react";
import { 
  Bot, Play, Square, Pause, RefreshCw, Zap, ShieldAlert, CheckCircle, 
  Clock, MessageCircle, AlertCircle, ArrowRight, Terminal, UserCheck, Settings, Sparkles, Filter 
} from "lucide-react";

import { 
  checkWebsiteHealth, generateAiSdrMessage, simulateAiConversation, getRandomDelay 
} from "../utils/aiSdrAgent";
import { normalizeSegment } from "../utils/segmentClassifier";
import { buildWhatsappUrl } from "../utils/helpers";

export default function AiSdrPanel({ leads, onUpdateLeadStatus, onUpdateLead }) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [personaName, setPersonaName] = useState("Alexandre");
  const [minDelay, setMinDelay] = useState(15);
  const [maxDelay, setMaxDelay] = useState(45);
  const [filterNiche, setFilterNiche] = useState("TODOS");
  const [filterRegion, setFilterRegion] = useState("TODOS");

  // Estado da Fila de Execução
  const [queue, setQueue] = useState([]);
  const [currentLeadIndex, setCurrentLeadIndex] = useState(0);
  const [activeLead, setActiveLead] = useState(null);
  const [currentAudit, setCurrentAudit] = useState(null);
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [simulatedReply, setSimulatedReply] = useState(null);

  // Temporizador Anti-Ban
  const [countdownSeconds, setCountdownSeconds] = useState(0);
  const [totalCountdown, setTotalCountdown] = useState(0);
  const [isWaitingTimer, setIsWaitingTimer] = useState(false);

  // Terminal de Logs
  const [logs, setLogs] = useState([]);
  const terminalEndRef = useRef(null);

  const availableNiches = Array.from(new Set(leads.map(l => normalizeSegment(l.niche)).filter(Boolean)));
  const availableRegions = Array.from(new Set(leads.map(l => l.city).filter(Boolean)));

  const addLog = (text, type = "info") => {
    const timestamp = new Date().toLocaleTimeString("pt-BR");
    setLogs(prev => [...prev, { timestamp, text, type }]);
  };

  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Iniciar Automação da IA
  const handleStartAi = () => {
    let targetLeads = leads.filter(l => l.status === "Novo Lead" || l.status === "Abordado");
    if (filterNiche !== "TODOS") {
      targetLeads = targetLeads.filter(l => normalizeSegment(l.niche) === filterNiche);
    }
    if (filterRegion !== "TODOS") {
      targetLeads = targetLeads.filter(l => l.city === filterRegion);
    }

    if (targetLeads.length === 0) {
      alert("Nenhum lead elegível ('Novo Lead' ou 'Abordado') encontrado para os filtros selecionados.");
      return;
    }

    setQueue(targetLeads);
    setCurrentLeadIndex(0);
    setIsRunning(true);
    setIsPaused(false);
    setLogs([]);

    addLog(`IA SDR Autônoma iniciada pela persona "${personaName}". Fila com ${targetLeads.length} leads.`, "success");
    addLog(`Temporizador Anti-Ban configurado: intervalo aleatório entre ${minDelay}s e ${maxDelay}s por lead.`, "warning");
  };

  const handleStopAi = () => {
    setIsRunning(false);
    setIsPaused(false);
    setIsWaitingTimer(false);
    setActiveLead(null);
    addLog("Automação da IA SDR interrompida pelo usuário.", "warning");
  };

  // Loop principal de execução
  useEffect(() => {
    if (!isRunning || isPaused || isWaitingTimer) return;

    if (currentLeadIndex >= queue.length) {
      setIsRunning(false);
      addLog("Fila de prospecção concluída com sucesso!", "success");
      return;
    }

    const lead = queue[currentLeadIndex];
    setActiveLead(lead);

    const processCurrentLead = async () => {
      addLog(`[${currentLeadIndex + 1}/${queue.length}] Iniciando auditoria para "${lead.name}" (${normalizeSegment(lead.niche)} - ${lead.city})...`, "info");
      
      const audit = await checkWebsiteHealth(lead.website);
      setCurrentAudit(audit);
      addLog(`Auditoria do site: ${audit.message}`, audit.hasSite ? "success" : "warning");

      const message = generateAiSdrMessage(lead, audit, personaName);
      setGeneratedMessage(message);
      addLog(`Abordagem humanizada gerada para o WhatsApp de ${lead.name}.`, "info");

      const replySim = simulateAiConversation(lead, message);
      setSimulatedReply(replySim);

      onUpdateLeadStatus(lead.id, replySim.suggestedStatus);
      addLog(`Status no CRM atualizado para "${replySim.suggestedStatus}".`, "success");

      // Iniciar o Temporizador Anti-Ban para o próximo lead
      if (currentLeadIndex < queue.length - 1) {
        const delayMs = getRandomDelay(minDelay, maxDelay);
        const delaySec = Math.floor(delayMs / 1000);
        setTotalCountdown(delaySec);
        setCountdownSeconds(delaySec);
        setIsWaitingTimer(true);
        addLog(`Aguardando ${delaySec} segundos (temporizador anti-ban)...`, "warning");
      } else {
        setCurrentLeadIndex(prev => prev + 1);
      }
    };

    processCurrentLead();

  }, [isRunning, isPaused, isWaitingTimer, currentLeadIndex, queue]);

  // Efeito do Contador Anti-Ban
  useEffect(() => {
    if (!isWaitingTimer || countdownSeconds <= 0) return;

    const timer = setInterval(() => {
      setCountdownSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsWaitingTimer(false);
          setCurrentLeadIndex(idx => idx + 1);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isWaitingTimer, countdownSeconds]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* HEADER BAR */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.16) 0%, rgba(15, 23, 42, 0.85) 100%)",
        border: "1px solid rgba(6, 182, 212, 0.4)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <div className={isRunning ? "pulse-bot" : ""} style={{ background: "rgba(6, 182, 212, 0.2)", padding: "0.4rem", borderRadius: "8px", display: "flex" }}>
              <Bot size={24} color="#22d3ee" />
            </div>
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc" }}>
              IA SDR Autônoma (Temporizador Anti-Ban Integrado)
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Audita a saúde do site do lead em tempo real, gera a abordagem humanizada e dispara com intervalo aleatório.
          </p>
        </div>

        <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
          {!isRunning ? (
            <button className="btn-primary" onClick={handleStartAi} style={{ background: "linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)" }}>
              <Play size={18} />
              <span>Iniciar IA SDR Agora</span>
            </button>
          ) : (
            <button className="btn-secondary" onClick={handleStopAi} style={{ color: "#f87171", borderColor: "rgba(239,68,68,0.4)" }}>
              <Square size={18} />
              <span>Parar Automação</span>
            </button>
          )}
        </div>
      </div>

      {/* CONFIGURATION & FILTERS BAR */}
      <div className="glass-card" style={{ padding: "1.25rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        
        <div>
          <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            Persona da IA:
          </label>
          <input 
            className="glass-input"
            type="text"
            style={{ width: "100%" }}
            value={personaName}
            onChange={(e) => setPersonaName(e.target.value)}
            disabled={isRunning}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            Delay Mínimo (seg):
          </label>
          <input 
            className="glass-input"
            type="number"
            style={{ width: "100%" }}
            value={minDelay}
            onChange={(e) => setMinDelay(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            Delay Máximo (seg):
          </label>
          <input 
            className="glass-input"
            type="number"
            style={{ width: "100%" }}
            value={maxDelay}
            onChange={(e) => setMaxDelay(Number(e.target.value))}
            disabled={isRunning}
          />
        </div>

        <div>
          <label style={{ fontSize: "0.78rem", color: "var(--text-muted)", marginBottom: "4px", display: "block" }}>
            Filtrar Nicho:
          </label>
          <select 
            className="glass-select"
            style={{ width: "100%" }}
            value={filterNiche}
            onChange={(e) => setFilterNiche(e.target.value)}
            disabled={isRunning}
          >
            <option value="TODOS">Todos os Nichos</option>
            {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>

      </div>

      {/* ACTIVE LEAD EXECUTION VIEW */}
      {activeLead && (
        <div className="glass-card" style={{ padding: "1.5rem", borderLeft: "4px solid #06b6d4" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <div>
              <span style={{ fontSize: "0.75rem", color: "#38bdf8", fontWeight: "700" }}>EM PROCESSAMENTO AGORA:</span>
              <h3 style={{ fontSize: "1.2rem", fontWeight: "800", color: "#f8fafc" }}>
                {activeLead.name} ({normalizeSegment(activeLead.niche)} - {activeLead.city})
              </h3>
            </div>

            {activeLead.phone && buildWhatsappUrl(activeLead.phone, generatedMessage) && (
              <a 
                href={buildWhatsappUrl(activeLead.phone, generatedMessage)} 
                target="_blank" 
                rel="noopener noreferrer"
                className="btn-whatsapp"
                style={{ padding: "0.5rem 0.9rem", fontSize: "0.8rem" }}
              >
                <MessageCircle size={15} />
                <span>Abrir Chat no WhatsApp</span>
              </a>
            )}
          </div>

          {/* Anti-Ban Timer Visual Bar */}
          {isWaitingTimer && totalCountdown > 0 && (
            <div style={{ background: "rgba(245, 158, 11, 0.12)", border: "1px solid rgba(245, 158, 11, 0.3)", padding: "0.85rem 1rem", borderRadius: "var(--radius-sm)", marginBottom: "1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8rem", color: "#fbbf24", marginBottom: "6px" }}>
                <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}>
                  <Clock size={15} />
                  <span>Temporizador Anti-Ban Ativo:</span>
                </span>
                <strong>{countdownSeconds}s restantes</strong>
              </div>
              <div style={{ height: "6px", background: "rgba(255,255,255,0.08)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${((totalCountdown - countdownSeconds) / totalCountdown) * 100}%`,
                  background: "linear-gradient(90deg, #f59e0b 0%, #10b981 100%)",
                  transition: "width 1s linear"
                }} />
              </div>
            </div>
          )}

          {/* Message Preview */}
          {generatedMessage && (
            <div style={{ background: "rgba(10, 15, 26, 0.8)", padding: "1rem", borderRadius: "var(--radius-sm)", border: "1px solid var(--border-color)" }}>
              <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: "700", display: "block", marginBottom: "4px" }}>
                Mensagem Gerada pela IA SDR ({personaName}):
              </span>
              <p style={{ fontSize: "0.88rem", color: "#cbd5e1", whiteSpace: "pre-wrap", lineHeight: "1.5" }}>
                {generatedMessage}
              </p>
            </div>
          )}
        </div>
      )}

      {/* TERMINAL CONSOLE LOGS */}
      <div className="glass-card" style={{ padding: "1.25rem", background: "#050811" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.85rem", borderBottom: "1px solid rgba(255,255,255,0.08)", paddingBottom: "0.5rem" }}>
          <Terminal size={18} color="#10b981" />
          <h4 style={{ fontSize: "0.9rem", fontWeight: "700", color: "#10b981" }}>
            Console em Tempo Real da IA SDR:
          </h4>
        </div>

        <div style={{ height: "200px", overflowY: "auto", fontFamily: "monospace", fontSize: "0.82rem", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
          {logs.length === 0 ? (
            <span style={{ color: "var(--text-dim)" }}>Clique em "Iniciar IA SDR Agora" para ver os logs de processamento.</span>
          ) : (
            logs.map((log, idx) => (
              <div key={idx} style={{ color: log.type === "success" ? "#34d399" : log.type === "warning" ? "#fbbf24" : "#94a3b8" }}>
                [{log.timestamp}] {log.text}
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>

    </div>
  );
}
