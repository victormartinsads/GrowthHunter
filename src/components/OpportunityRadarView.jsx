import React, { useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell 
} from "recharts";
import { 
  Flame, Globe, ShieldAlert, DollarSign, TrendingUp, Target 
} from "lucide-react";
import { calculateOpportunityRadar, calculateRevenueForecast } from "../utils/opportunityRadarEngine";

export default function OpportunityRadarView({ companies = [], onSelectFilter }) {
  const radar = useMemo(() => calculateOpportunityRadar(companies), [companies]);
  const forecast = useMemo(() => calculateRevenueForecast(companies), [companies]);

  const opportunityBreakdown = useMemo(() => {
    let siteCount = 0;
    let trackingCount = 0;
    let trafficCount = 0;
    let seoCount = 0;

    companies.forEach(c => {
      const hasWebsite = Boolean(c.website && String(c.website).trim() !== "");
      const webScore = c.website_score?.totalScore || 50;
      if (!hasWebsite || webScore < 50) siteCount++;
      if (c.tech_results?.metaPixel?.detected === "not_detected" || c.tech_results?.ga4?.detected === "not_detected") trackingCount++;
      if (c.tech_results?.googleAdsTag?.detected === "not_detected") trafficCount++;
      seoCount++;
    });

    return [
      { name: "Criação / Reformulação de Site", count: siteCount, color: "#ff6200" },
      { name: "Mensuração & Analytics (Pixel/GA4)", count: trackingCount, color: "#d97706" },
      { name: "Tráfego Pago (Google & Meta Ads)", count: trafficCount, color: "#0284c7" },
      { name: "SEO & Presença Local", count: seoCount, color: "#16a34a" }
    ];
  }, [companies]);

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
            <Flame size={26} color="#ff6200" />
            <h2 style={{ fontSize: "1.35rem", fontWeight: "900", color: "#1c1917" }}>
              🔥 RADAR DE OPORTUNIDADES — Inteligência Comercial
            </h2>
          </div>
          <p style={{ fontSize: "0.88rem", color: "#57534e", marginTop: "4px" }}>
            Responde instantaneamente: <strong>Onde estão as melhores oportunidades de vendas na sua base?</strong>
          </p>
        </div>
      </div>

      {/* OPPORTUNITY RADAR 4 HIGH IMPACT CARDS */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))",
        gap: "1.25rem"
      }}>
        
        {/* Card 1: Sem Site + Alta Prova Social */}
        <div 
          className="glass-card glass-card-hover" 
          style={{ padding: "1.25rem", borderLeft: "4px solid #dc2626", cursor: "pointer" }}
          onClick={() => onSelectFilter && onSelectFilter("NO_WEBSITE")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#dc2626", fontWeight: "800" }}>SEM SITE + ALTA PROVA SOCIAL</span>
            <Globe size={18} color="#dc2626" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#1c1917", marginTop: "0.4rem" }}>
            {radar.noWebsiteHighSocialCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#dc2626", marginTop: "0.2rem" }}>
            Empresas com 4.5+ ⭐ sem site
          </div>
        </div>

        {/* Card 2: Site Crítico */}
        <div 
          className="glass-card glass-card-hover" 
          style={{ padding: "1.25rem", borderLeft: "4px solid #ff6200", cursor: "pointer" }}
          onClick={() => onSelectFilter && onSelectFilter("BAD_WEBSITE")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#ea580c", fontWeight: "800" }}>SITE CRÍTICO (SCORE &lt; 50)</span>
            <ShieldAlert size={18} color="#ea580c" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#1c1917", marginTop: "0.4rem" }}>
            {radar.criticalWebsiteCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#ea580c", marginTop: "0.2rem" }}>
            Alvos para Reformulação de Site
          </div>
        </div>

        {/* Card 3: Sem Meta Pixel */}
        <div 
          className="glass-card glass-card-hover" 
          style={{ padding: "1.25rem", borderLeft: "4px solid #0284c7", cursor: "pointer" }}
          onClick={() => onSelectFilter && onSelectFilter("NO_META")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#0284c7", fontWeight: "800" }}>SEM META PIXEL DETECTADO</span>
            <Target size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#1c1917", marginTop: "0.4rem" }}>
            {radar.noMetaPixelCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#0284c7", marginTop: "0.2rem" }}>
            Alvos para Serviço de Rastreamento
          </div>
        </div>

        {/* Card 4: Forte Presença Local */}
        <div 
          className="glass-card glass-card-hover" 
          style={{ padding: "1.25rem", borderLeft: "4px solid #16a34a", cursor: "pointer" }}
          onClick={() => onSelectFilter && onSelectFilter("STRONG_LOCAL")}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "0.78rem", color: "#16a34a", fontWeight: "800" }}>ALTA PRESENÇA LOCAL</span>
            <TrendingUp size={18} color="#16a34a" />
          </div>
          <div style={{ fontSize: "2rem", fontWeight: "900", color: "#1c1917", marginTop: "0.4rem" }}>
            {radar.strongLocalLowQualitySiteCount}
          </div>
          <div style={{ fontSize: "0.75rem", color: "#16a34a", marginTop: "0.2rem" }}>
            30+ avaliações no Google Maps
          </div>
        </div>

      </div>

      {/* REVENUE FORECAST CARDS */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "1.25rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <DollarSign size={20} color="#16a34a" />
          <span>Previsão de Receita & Valor Estimado em Contratos (Estimated Deal Value)</span>
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
          
          <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
            <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>POTENCIAL INICIAL (Venda de Sites)</span>
            <strong style={{ fontSize: "1.35rem", color: "#1c1917", display: "block", marginTop: "4px" }}>
              R$ {forecast.potentialInitialDeal.toLocaleString('pt-BR')}
            </strong>
          </div>

          <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
            <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>POTENCIAL MENSAL RECORRENTE</span>
            <strong style={{ fontSize: "1.35rem", color: "#16a34a", display: "block", marginTop: "4px" }}>
              R$ {forecast.potentialMonthlyRecurring.toLocaleString('pt-BR')}/mês
            </strong>
          </div>

          <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
            <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>VALOR DO PIPELINE CRM</span>
            <strong style={{ fontSize: "1.35rem", color: "#0284c7", display: "block", marginTop: "4px" }}>
              R$ {forecast.pipelineValue.toLocaleString('pt-BR')}
            </strong>
          </div>

          <div style={{ background: "#faf9f6", padding: "1rem", borderRadius: "8px", border: "1px solid #e8e6e0" }}>
            <span style={{ fontSize: "0.75rem", color: "#78716c", display: "block" }}>PIPELINE PONDERADO (Probabilidade)</span>
            <strong style={{ fontSize: "1.35rem", color: "#ff6200", display: "block", marginTop: "4px" }}>
              R$ {forecast.weightedPipeline.toLocaleString('pt-BR')}
            </strong>
          </div>

        </div>
      </div>

      {/* CHART BREAKDOWN BY OPPORTUNITY */}
      <div className="glass-card" style={{ padding: "1.5rem" }}>
        <h3 style={{ fontSize: "1.05rem", fontWeight: "800", color: "#1c1917", marginBottom: "1.25rem" }}>
          Distribuição de Oportunidades por Categoria de Serviço
        </h3>

        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={opportunityBreakdown} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <XAxis dataKey="name" stroke="#78716c" fontSize={11} tickLine={false} />
              <YAxis stroke="#78716c" fontSize={12} tickLine={false} />
              <Tooltip 
                contentStyle={{ background: "#ffffff", borderColor: "#e8e6e0", borderRadius: "8px", color: "#1c1917" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {opportunityBreakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
