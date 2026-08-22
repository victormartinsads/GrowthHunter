import React from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  BarChart3, Users, Globe, ShieldAlert, CheckCircle2 
} from "lucide-react";

export default function DashboardView({ companies = [], onStartRoute }) {
  const totalCompanies = companies.length;

  const noWebsiteCount = companies.filter(c => c.website_status === "missing" || !c.website).length;
  const badWebsiteCount = companies.filter(c => c.website_score?.totalScore < 50 && c.website_status !== "missing").length;
  const wonCount = companies.filter(c => c.pipeline_stage === "WON" || c.status === "Cliente Fechado").length;

  const funnelData = [
    { stage: "Mapeados", count: totalCompanies, color: "#78716c" },
    { stage: "Contactados", count: companies.filter(c => c.pipeline_stage === "CONTACTED" || c.status === "Abordado").length, color: "#ea580c" },
    { stage: "Reunião", count: companies.filter(c => c.pipeline_stage === "MEETING" || c.status === "Reunião Agendada").length, color: "#0284c7" },
    { stage: "Proposta", count: companies.filter(c => c.pipeline_stage === "PROPOSAL" || c.status === "Proposta Enviada").length, color: "#7c3aed" },
    { stage: "Venda (WON)", count: wonCount, color: "#16a34a" }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      
      {/* HEADER BANNER — OFF-WHITE & RADIX ORANGE */}
      <div className="glass-card" style={{
        padding: "1.5rem 1.75rem",
        background: "linear-gradient(135deg, #fff7ed 0%, #ffedd5 60%, #ffffff 100%)",
        border: "1px solid #fed7aa",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "1rem"
      }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
            <BarChart3 size={26} color="#ff6200" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#1c1917" }}>
              📊 DASHBOARD DE PERFORMANCE & INTELIGÊNCIA COMERCIAL
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "#57534e", marginTop: "4px" }}>
            Métricas executivas de captação, diagnóstico de sites, funil de vendas e previsão de faturamento.
          </p>
        </div>
      </div>

      {/* EXECUTIVE KPIS GRID */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
        gap: "1.25rem"
      }}>
        
        <div className="glass-card glass-card-hover" style={{ padding: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#78716c", fontWeight: "700" }}>EMPRESAS MAPEADAS</span>
            <Users size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1c1917", marginTop: "0.4rem" }}>
            {totalCompanies}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#0284c7", marginTop: "0.2rem" }}>
            Total no banco de inteligência
          </div>
        </div>

        <div className="glass-card glass-card-hover" style={{ padding: "1.25rem", borderLeft: "4px solid #dc2626" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: "800" }}>SEM WEBSITE (OFERTA SITE)</span>
            <Globe size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1c1917", marginTop: "0.4rem" }}>
            {noWebsiteCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.2rem" }}>
            Alvos nº 1 para Vender Landing Page
          </div>
        </div>

        <div className="glass-card glass-card-hover" style={{ padding: "1.25rem", borderLeft: "4px solid #ff6200" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#ea580c", fontWeight: "800" }}>SITES RUINS (&lt; 50 SCORE)</span>
            <ShieldAlert size={18} color="#ea580c" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1c1917", marginTop: "0.4rem" }}>
            {badWebsiteCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#ea580c", marginTop: "0.2rem" }}>
            Alvos para Reformulação
          </div>
        </div>

        <div className="glass-card glass-card-hover" style={{ padding: "1.25rem", borderLeft: "4px solid #16a34a" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: "800" }}>REDE DE NEGÓCIOS (WON)</span>
            <CheckCircle2 size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: "1.8rem", fontWeight: "900", color: "#1c1917", marginTop: "0.4rem" }}>
            {wonCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "0.2rem" }}>
            Clientes fechados no CRM
          </div>
        </div>

      </div>

      {/* FUNNEL CHART */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "1.25rem" }}>
          Funil Comercial de Vendas (GrowthHunter Pipeline)
        </h3>

        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={funnelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="stage" stroke="#78716c" fontSize={12} tickLine={false} />
              <YAxis stroke="#78716c" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#ffffff", borderColor: "#e8e6e0", borderRadius: "8px", color: "#1c1917" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {funnelData.map((entry, index) => (
                  <Cell key={`funnel-cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
