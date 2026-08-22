import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie 
} from "recharts";
import { 
  Users, Layers, MapPin, PhoneCall, CalendarCheck, CheckCircle2, TrendingUp, Sparkles, ArrowRight, Zap, Target, DollarSign, Globe, AlertTriangle 
} from "lucide-react";
import { normalizeSegment } from "../utils/segmentClassifier";

export default function LeadDashboard({ leads, onStartRoute, onFilterNiche, onFilterRegion }) {
  const totalLeads = leads.length;
  
  // Contagens por status
  const novosCount = leads.filter(l => l.status === "Novo Lead").length;
  const abordadosCount = leads.filter(l => l.status === "Abordado").length;
  const reuniaoCount = leads.filter(l => l.status === "Reunião Agendada").length;
  const propostaCount = leads.filter(l => l.status === "Proposta Enviada").length;
  const fechadosCount = leads.filter(l => l.status === "Cliente Fechado" || l.status === "Ganho").length;
  
  // Focos Estratégicos: Empresas sem site (Foco 1) e sem Google Ads (Foco 2)
  const noWebsiteCount = leads.filter(l => !l.website || String(l.website).trim() === "").length;
  const noGoogleAdsCount = leads.filter(l => {
    const audit = String(l.digitalAudit || "").toLowerCase();
    return !audit.includes("google tag manager") && !audit.includes("gtm");
  }).length;

  // Taxa de Abordagem e Conversão
  const contactedRate = totalLeads > 0 
    ? Math.round(((totalLeads - novosCount) / totalLeads) * 100) 
    : 0;

  const conversionRate = totalLeads > 0
    ? Math.round((fechadosCount / totalLeads) * 100)
    : 0;

  // Agrupamento por Nicho Normalizado
  const nicheMap = {};
  leads.forEach(l => {
    const n = normalizeSegment(l.niche);
    nicheMap[n] = (nicheMap[n] || 0) + 1;
  });

  const nicheData = Object.entries(nicheMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  // Agrupamento por Região/Cidade
  const regionMap = {};
  leads.forEach(l => {
    const r = l.neighborhood ? `${l.city} (${l.neighborhood})` : l.city || "Geral";
    regionMap[r] = (regionMap[r] || 0) + 1;
  });

  const regionData = Object.entries(regionMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Funil de Vendas
  const funnelData = [
    { stage: "Novo Lead", count: novosCount, color: "#94a3b8" },
    { stage: "Abordado", count: abordadosCount, color: "#f59e0b" },
    { stage: "Reunião", count: reuniaoCount, color: "#06b6d4" },
    { stage: "Proposta", count: propostaCount, color: "#c084fc" },
    { stage: "Fechado", count: fechadosCount, color: "#10b981" }
  ];

  const COLORS = ["#10b981", "#06b6d4", "#3b82f6", "#8b5cf6", "#f59e0b", "#ec4899", "#64748b"];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* Welcome & Top Action Bar */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(15, 23, 42, 0.85) 100%)",
        border: "1px solid rgba(239, 68, 68, 0.35)",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <Globe size={24} color="#f87171" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "800", color: "#f8fafc" }}>
              Painel Comercial: Venda de Sites (1º Foco) & Google Ads (2º Foco)
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "var(--text-muted)", marginTop: "4px" }}>
            Gestão estratégica para mapear empresas sem site ou sem anúncios ativos e fechar contratos de desenvolvimento e gestão.
          </p>
        </div>

        <button 
          className="btn-primary" 
          onClick={onStartRoute}
          style={{ fontSize: "0.92rem", padding: "0.7rem 1.25rem", background: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)" }}
        >
          <TrendingUp size={18} />
          <span>Iniciar Rota de Prospecção Diária</span>
        </button>
      </div>

      {/* STRATEGIC TARGET METRICS (Bento Grid) */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "1.25rem"
      }}>
        
        {/* Total Leads */}
        <div className="glass-card glass-card-hover" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>TOTAL DE LEADS</span>
            <div style={{ background: "rgba(6, 182, 212, 0.15)", padding: "0.45rem", borderRadius: "8px" }}>
              <Users size={18} color="#06b6d4" />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ffffff", marginTop: "0.4rem" }}>
            {totalLeads}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#38bdf8", marginTop: "0.2rem" }}>
            Mapeados por Nicho & Cidade
          </div>
        </div>

        {/* 1º FOCO: Empresas Sem Site */}
        <div className="glass-card glass-card-hover" style={{ padding: "1.25rem", borderLeft: "4px solid #ef4444" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.82rem", color: "#f87171", fontWeight: "700" }}>1º FOCO: EMPRESAS SEM SITE</span>
            <div style={{ background: "rgba(239, 68, 68, 0.15)", padding: "0.45rem", borderRadius: "8px" }}>
              <Globe size={18} color="#f87171" />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ffffff", marginTop: "0.4rem" }}>
            {noWebsiteCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#f87171", marginTop: "0.2rem" }}>
            Alvos imediatos para Vender Landing Page
          </div>
        </div>

        {/* 2º FOCO: Sem Google Ads */}
        <div className="glass-card glass-card-hover" style={{ padding: "1.25rem", borderLeft: "4px solid #f59e0b" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.82rem", color: "#fbbf24", fontWeight: "700" }}>2º FOCO: SEM GOOGLE ADS</span>
            <div style={{ background: "rgba(245, 158, 11, 0.15)", padding: "0.45rem", borderRadius: "8px" }}>
              <AlertTriangle size={18} color="#f59e0b" />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ffffff", marginTop: "0.4rem" }}>
            {noGoogleAdsCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#fbbf24", marginTop: "0.2rem" }}>
            Alvos para Vender Tráfego no Google
          </div>
        </div>

        {/* Clientes Fechados */}
        <div className="glass-card glass-card-hover" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.82rem", color: "var(--text-muted)", fontWeight: "600" }}>CLIENTES FECHADOS</span>
            <div style={{ background: "rgba(16, 185, 129, 0.15)", padding: "0.45rem", borderRadius: "8px" }}>
              <CheckCircle2 size={18} color="#10b981" />
            </div>
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "800", color: "#ffffff", marginTop: "0.4rem" }}>
            {fechadosCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#34d399", marginTop: "0.2rem" }}>
            Taxa de conversão: {conversionRate}%
          </div>
        </div>

      </div>

      {/* CHARTS GRID: FUNNEL & DISTRIBUTION */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "1.25rem" }}>
        
        {/* Funil de Vendas (Bar Chart) */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc" }}>
              Funil de Vendas Comercial (Sites + Google Ads)
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Estágios do CRM</span>
          </div>

          <div style={{ width: "100%", height: 260 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="stage" stroke="#64748b" fontSize={12} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={12} tickLine={false} />
                <Tooltip 
                  contentStyle={{ background: "#0f172a", borderColor: "rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff" }}
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição por Nicho (Pie Chart) */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1.25rem" }}>
            <h3 style={{ fontSize: "1.05rem", fontWeight: "700", color: "#f8fafc" }}>
              Distribuição por Nicho Otimizado
            </h3>
            <span style={{ fontSize: "0.78rem", color: "var(--text-muted)" }}>Top Segmentos</span>
          </div>

          <div style={{ width: "100%", height: 260, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={nicheData.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="count"
                >
                  {nicheData.slice(0, 5).map((entry, index) => (
                    <Cell key={`pie-cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ background: "#0f172a", borderColor: "rgba(255,255,255,0.15)", borderRadius: "8px", color: "#fff" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* TOP NICHES & TOP REGIONS SHORTCUTS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.25rem" }}>
        
        {/* Nichos Principais */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#f8fafc", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <Layers size={18} color="#06b6d4" />
            <span>Principais Nichos para Oferecer Site + Google Ads:</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {nicheData.slice(0, 5).map((item, idx) => (
              <div 
                key={idx}
                onClick={() => onFilterNiche(item.name)}
                className="glass-card-hover"
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  padding: "0.65rem 0.9rem",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.88rem"
                }}
              >
                <span style={{ fontWeight: "600", color: "#f8fafc" }}>{item.name}</span>
                <span className="badge badge-niche">{item.count} leads</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regiões / Cidades Principais */}
        <div className="glass-card" style={{ padding: "1.5rem" }}>
          <h3 style={{ fontSize: "1rem", fontWeight: "700", color: "#f8fafc", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <MapPin size={18} color="#c084fc" />
            <span>Cidades & Bairros Mapeados:</span>
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
            {regionData.slice(0, 5).map((item, idx) => (
              <div 
                key={idx}
                onClick={() => onFilterRegion(item.name)}
                className="glass-card-hover"
                style={{
                  background: "rgba(15, 23, 42, 0.6)",
                  padding: "0.65rem 0.9rem",
                  borderRadius: "var(--radius-sm)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  fontSize: "0.88rem"
                }}
              >
                <span style={{ fontWeight: "600", color: "#f8fafc" }}>{item.name}</span>
                <span className="badge badge-region">{item.count} leads</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
