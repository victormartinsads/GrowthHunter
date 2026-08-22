import React, { useState, useMemo } from "react";
import { 
  MapPin, Play, CheckCircle, PhoneCall, MessageCircle, Copy, Check, 
  ArrowRight, ArrowLeft, RefreshCw, Zap, Layers, AlertCircle, ChevronRight, Award, AtSign, ExternalLink
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { buildWhatsappUrl, buildInstagramUrl, buildWebsiteUrl } from "../utils/helpers";

// Custom Leaflet Marker Icon
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const DEFAULT_SCRIPTS = [
  {
    id: "script-pixel",
    name: "🔥 Abordagem: Alerta de Vazamento de Clientes (Sem Meta Pixel)",
    text: "Olá {nome}, tudo bem? Me chamo [Seu Nome], sou gestor de tráfego especializado no segmento de {nicho}.\n\nEstava analisando as empresas de {cidade} e notei que o site de vocês ({site}) não possui a tag de rastreamento (Pixel) configurada. Isso significa que vocês estão perdendo potenciais clientes que entram no site e não voltam mais.\n\nMontei uma análise rápida em vídeo mostrando como podemos atrair de 15 a 30 novos clientes qualificados para a {nome} todos os meses. Posso te mandar por aqui?"
  },
  {
    id: "script-google",
    name: "🚀 Abordagem: Dominando as Buscas no Google (Sem Ads)",
    text: "Fala {nome}, tudo joia? Estava pesquisando por {nicho} em {cidade} no Google e reparei que os seus concorrentes estão aparecendo no topo dos anúncios e a {nome} ainda não.\n\nComo vocês são referência em {cidade}, isso é um desperdício enorme de pessoas que já estão com o cartão na mão querendo fechar serviço hoje mesmo.\n\nVocê teria 5 minutos essa semana para eu te mostrar como colocamos a {nome} na primeira posição do Google?"
  },
  {
    id: "script-auditoria",
    name: "📊 Abordagem: Diagnóstico Gratuito de Tráfego Pago",
    text: "Olá! Tudo bem com a equipe da {nome}?\n\nTrabalho como gestor de tráfego focado exclusivamente em atrair clientes com alto poder aquisitivo para empresas do nicho de {nicho}.\n\nPreparei um diagnóstico de tráfego pago gratuito com 3 melhorias imediatas para dobrar o volume de mensagens no WhatsApp da {nome}.\n\nPosso te enviar esse relatório sem compromisso?"
  }
];

export default function ProspectingRoute({ leads, onUpdateLeadStatus, initialRouteLeads }) {
  const [routeNiche, setRouteNiche] = useState("TODOS");
  const [routeRegion, setRouteRegion] = useState("TODOS");
  const [targetCount, setTargetCount] = useState(10);
  
  // Estado da Rota em Execução
  const [activeRoute, setActiveRoute] = useState(initialRouteLeads || null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedScriptId, setSelectedScriptId] = useState("script-pixel");
  const [copied, setCopied] = useState(false);
  const [completedCount, setCompletedCount] = useState(0);

  // Listas para filtros
  const availableNiches = useMemo(() => Array.from(new Set(leads.map(l => l.niche).filter(Boolean))), [leads]);
  const availableRegions = useMemo(() => Array.from(new Set(leads.map(l => l.city).filter(Boolean))), [leads]);

  // Gerar Rota
  const handleGenerateRoute = () => {
    let filtered = leads.filter(l => l.status === "Novo Lead" || l.status === "Abordado");
    if (routeNiche !== "TODOS") {
      filtered = filtered.filter(l => l.niche === routeNiche);
    }
    if (routeRegion !== "TODOS") {
      filtered = filtered.filter(l => l.city === routeRegion);
    }

    const route = filtered.slice(0, targetCount);
    if (route.length === 0) {
      alert("Nenhum lead encontrado para os critérios selecionados.");
      return;
    }

    setActiveRoute(route);
    setCurrentIndex(0);
    setCompletedCount(0);
  };

  const currentLead = activeRoute ? activeRoute[currentIndex] : null;
  const currentScript = DEFAULT_SCRIPTS.find(s => s.id === selectedScriptId) || DEFAULT_SCRIPTS[0];

  // Gera texto personalizado com substituição de variáveis
  const formattedScriptText = useMemo(() => {
    if (!currentLead) return "";
    return currentScript.text
      .replace(/{nome}/g, currentLead.name || "Empresa")
      .replace(/{nicho}/g, currentLead.niche || "serviços")
      .replace(/{cidade}/g, currentLead.city || "sua cidade")
      .replace(/{site}/g, currentLead.website || "seu site");
  }, [currentLead, currentScript]);

  const handleCopyScript = () => {
    navigator.clipboard.writeText(formattedScriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleWhatsAppClick = () => {
    if (!currentLead?.phone) return;
    const url = buildWhatsappUrl(currentLead.phone, formattedScriptText);
    if (url) window.open(url, "_blank");
  };

  const handleNextLead = (newStatus) => {
    if (newStatus && currentLead) {
      onUpdateLeadStatus(currentLead.id, newStatus);
      setCompletedCount(prev => prev + 1);
    }

    if (currentIndex < activeRoute.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      alert("🎉 Rota de prospecção concluída com sucesso! Parabéns pela disciplina.");
      setActiveRoute(null);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* HEADER BAR */}
      <div className="glass-card" style={{
        padding: "1.5rem",
        background: "linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%)",
        border: "1px solid rgba(6, 182, 212, 0.3)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={22} color="#06b6d4" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800" }}>
              Planejador & Rota de Prospecção Diária
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Foque nos melhores leads organizados por Nicho e Região com disparos em 1-Clique para WhatsApp.
          </p>
        </div>

        {activeRoute && (
          <button 
            className="btn-secondary" 
            onClick={() => setActiveRoute(null)}
            style={{ fontSize: "0.85rem" }}
          >
            <RefreshCw size={16} />
            <span>Configurar Nova Rota</span>
          </button>
        )}
      </div>

      {/* SETUP MODE (SE NENHUMA ROTA ESTÁ ATIVA) */}
      {!activeRoute ? (
        <div className="glass-card" style={{ padding: "1.75rem" }}>
          <h3 style={{ fontSize: "1.1rem", fontWeight: "700", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Zap size={18} color="#10b981" />
            <span>Montar Nova Rota de Abordagem</span>
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "1.25rem", marginBottom: "1.5rem" }}>
            {/* Filter Niche */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                1. Selecionar Nicho Alvo:
              </label>
              <select 
                className="glass-select"
                style={{ width: "100%" }}
                value={routeNiche}
                onChange={(e) => setRouteNiche(e.target.value)}
              >
                <option value="TODOS">Todos os Nichos</option>
                {availableNiches.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>

            {/* Filter Region */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                2. Selecionar Região / Cidade:
              </label>
              <select 
                className="glass-select"
                style={{ width: "100%" }}
                value={routeRegion}
                onChange={(e) => setRouteRegion(e.target.value)}
              >
                <option value="TODOS">Todas as Regiões</option>
                {availableRegions.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>

            {/* Goal Batch Count */}
            <div>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                3. Meta de Contatos Hoje:
              </label>
              <select 
                className="glass-select"
                style={{ width: "100%" }}
                value={targetCount}
                onChange={(e) => setTargetCount(Number(e.target.value))}
              >
                <option value={5}>5 Prospecções Rápida</option>
                <option value={10}>10 Prospecções (Padrão)</option>
                <option value={15}>15 Prospecções Avançadas</option>
                <option value={25}>25 Prospecções Modo Hardcore</option>
              </select>
            </div>
          </div>

          <button 
            className="btn-primary" 
            onClick={handleGenerateRoute}
            style={{ width: "100%", justifyContent: "center", padding: "0.85rem", fontSize: "1rem" }}
          >
            <Play size={18} />
            <span>Iniciar Rota de Prospecção Agora</span>
          </button>
        </div>
      ) : (
        /* EXECUTION MODE: DISPARADOR PASSO A PASSO */
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.25rem" }}>
          
          {/* LEFT: ACTIVE LEAD EXECUTION CARD */}
          <div className="glass-card" style={{ padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Progress Bar */}
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.82rem", color: "var(--text-muted)", marginBottom: "6px" }}>
                <span>Progresso da Rota: <strong>Lead {currentIndex + 1} de {activeRoute.length}</strong></span>
                <span style={{ color: "#10b981", fontWeight: "700" }}>{completedCount} abordagens concluídas</span>
              </div>
              <div style={{ height: "8px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
                <div style={{
                  height: "100%",
                  width: `${((currentIndex + 1) / activeRoute.length) * 100}%`,
                  background: "linear-gradient(90deg, #10b981 0%, #06b6d4 100%)",
                  transition: "width 0.3s ease"
                }} />
              </div>
            </div>

            {/* Current Lead Details Header */}
            {currentLead && (
              <div style={{
                background: "rgba(15, 23, 42, 0.7)",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-md)",
                padding: "1.25rem"
              }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
                  <div>
                    <h3 style={{ fontSize: "1.25rem", fontWeight: "800", color: "#f8fafc" }}>
                      {currentLead.name}
                    </h3>
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem", flexWrap: "wrap" }}>
                      <span className="badge badge-niche">{currentLead.niche}</span>
                      <span className="badge badge-region">
                        <MapPin size={11} />
                        {currentLead.city} {currentLead.neighborhood ? `(${currentLead.neighborhood})` : ''}
                      </span>
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                    {currentLead.phone && (
                      <button 
                        className="btn-whatsapp" 
                        onClick={handleWhatsAppClick}
                        style={{ padding: "0.65rem 1.1rem" }}
                      >
                        <MessageCircle size={17} />
                        <span>Abrir no WhatsApp</span>
                      </button>
                    )}
                    
                    <a 
                      href={buildInstagramUrl(currentLead.instagram, currentLead.name)} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="btn-secondary"
                      style={{ padding: "0.65rem 1rem", color: "#c084fc", borderColor: "rgba(168, 85, 247, 0.4)", textDecoration: "none" }}
                    >
                      <AtSign size={17} />
                      <span>Ver Instagram</span>
                    </a>
                  </div>
                </div>

                {/* Audit & Notes */}
                <div style={{ marginTop: "1rem", paddingTop: "0.85rem", borderTop: "1px solid var(--border-color)", display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                  {currentLead.digitalAudit && (
                    <div style={{ fontSize: "0.82rem", color: "#fbbf24", display: "flex", alignItems: "center", gap: "0.4rem" }}>
                      <AlertCircle size={15} />
                      <span>Diagnóstico: <strong>{currentLead.digitalAudit}</strong></span>
                    </div>
                  )}
                  {currentLead.notes && (
                    <p style={{ fontSize: "0.82rem", color: "var(--text-muted)" }}>
                      📝 <strong>Observações:</strong> {currentLead.notes}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Script Selection & Live Preview */}
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <label style={{ fontSize: "0.82rem", fontWeight: "600", color: "var(--text-muted)" }}>
                Escolher Copy de Abordagem para Tráfego Pago:
              </label>
              <select 
                className="glass-select"
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
              >
                {DEFAULT_SCRIPTS.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>

              {/* Text Preview Box */}
              <div style={{
                background: "#0f172a",
                border: "1px solid var(--border-color)",
                borderRadius: "var(--radius-sm)",
                padding: "1rem",
                position: "relative",
                whiteSpace: "pre-wrap",
                fontSize: "0.88rem",
                color: "#cbd5e1",
                lineHeight: "1.5"
              }}>
                {formattedScriptText}

                <button 
                  onClick={handleCopyScript}
                  style={{
                    position: "absolute",
                    top: "0.5rem",
                    right: "0.5rem",
                    background: copied ? "rgba(16, 185, 129, 0.2)" : "rgba(255,255,255,0.08)",
                    border: "1px solid var(--border-color)",
                    color: copied ? "#34d399" : "var(--text-muted)",
                    padding: "0.35rem 0.65rem",
                    borderRadius: "6px",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.3rem"
                  }}
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? "Copiado!" : "Copiar Copy"}</span>
                </button>
              </div>
            </div>

            {/* Outcome Result Logger Buttons */}
            <div style={{ paddingTop: "0.5rem", borderTop: "1px solid var(--border-color)" }}>
              <label style={{ display: "block", fontSize: "0.8rem", color: "var(--text-muted)", marginBottom: "0.75rem" }}>
                Registrar Resultado da Abordagem:
              </label>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.75rem" }}>
                <button 
                  className="btn-primary" 
                  onClick={() => handleNextLead("Reunião Agendada")}
                  style={{ justifyContent: "center", fontSize: "0.82rem", padding: "0.65rem 0.5rem" }}
                >
                  <Award size={16} />
                  <span>Agendou Reunião!</span>
                </button>

                <button 
                  className="btn-secondary" 
                  onClick={() => handleNextLead("Abordado")}
                  style={{ justifyContent: "center", fontSize: "0.82rem", padding: "0.65rem 0.5rem", color: "#fbbf24" }}
                >
                  <MessageCircle size={16} />
                  <span>Enviado / Abordado</span>
                </button>

                <button 
                  className="btn-secondary" 
                  onClick={() => handleNextLead("Perdido")}
                  style={{ justifyContent: "center", fontSize: "0.82rem", padding: "0.65rem 0.5rem", color: "#f87171" }}
                >
                  <AlertCircle size={16} />
                  <span>Sem Interesse</span>
                </button>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "1rem" }}>
                <button 
                  className="btn-secondary" 
                  disabled={currentIndex === 0}
                  onClick={() => setCurrentIndex(prev => prev - 1)}
                  style={{ opacity: currentIndex === 0 ? 0.5 : 1 }}
                >
                  <ArrowLeft size={16} />
                  <span>Anterior</span>
                </button>

                <button 
                  className="btn-secondary" 
                  onClick={() => handleNextLead(null)}
                >
                  <span>Pular Lead</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>

          </div>

          {/* RIGHT: MAP & ROUTE LIST */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            
            {/* Interactive Leaflet Map */}
            <div className="glass-card" style={{ height: "260px", overflow: "hidden", padding: "0.5rem" }}>
              <MapContainer 
                center={currentLead?.lat ? [currentLead.lat, currentLead.lng] : [-23.5505, -46.6333]} 
                zoom={11} 
                scrollWheelZoom={false}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {activeRoute.map((lead, idx) => (
                  lead.lat && lead.lng ? (
                    <Marker 
                      key={lead.id} 
                      position={[lead.lat, lead.lng]} 
                      icon={customIcon}
                      eventHandlers={{ click: () => setCurrentIndex(idx) }}
                    >
                      <Popup>
                        <strong>{lead.name}</strong><br />
                        {lead.niche} - {lead.city}
                      </Popup>
                    </Marker>
                  ) : null
                ))}
              </MapContainer>
            </div>

            {/* List of Leads in Route */}
            <div className="glass-card" style={{ padding: "1.25rem", flex: 1, overflowY: "auto", maxHeight: "320px" }}>
              <h4 style={{ fontSize: "0.9rem", fontWeight: "700", marginBottom: "0.75rem", color: "var(--text-muted)" }}>
                Fila de Prospecção ({activeRoute.length})
              </h4>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {activeRoute.map((lead, idx) => {
                  const isActive = idx === currentIndex;
                  return (
                    <div 
                      key={lead.id}
                      onClick={() => setCurrentIndex(idx)}
                      style={{
                        padding: "0.65rem 0.85rem",
                        borderRadius: "var(--radius-sm)",
                        background: isActive ? "rgba(16, 185, 129, 0.15)" : "rgba(15, 23, 42, 0.5)",
                        border: isActive ? "1px solid #10b981" : "1px solid var(--border-color)",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between"
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "0.85rem", fontWeight: isActive ? "700" : "500", color: isActive ? "#34d399" : "#f8fafc" }}>
                          {idx + 1}. {lead.name}
                        </div>
                        <div style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                          {lead.niche} • {lead.city}
                        </div>
                      </div>

                      {isActive && <ChevronRight size={16} color="#34d399" />}
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}
