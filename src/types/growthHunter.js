/**
 * GrowthHunter — Sales Intelligence & Prospecting CRM
 * Tipos e Constantes Globais de Dados
 */

export const OPPORTUNITY_TYPES = {
  NEW_WEBSITE: {
    id: "NEW_WEBSITE",
    title: "Criação de Website de Alta Conversão",
    category: "SITE",
    priority: "HIGH",
    estimatedValue: 2500,
    monthlyRecurring: 0,
    description: "Empresa não possui website. Perde clientes diariamente para concorrentes diretos no Google."
  },
  WEBSITE_REDESIGN: {
    id: "WEBSITE_REDESIGN",
    title: "Reformulação de Website (Alta Conversão)",
    category: "SITE",
    priority: "HIGH",
    estimatedValue: 1800,
    monthlyRecurring: 0,
    description: "Website existente possui score crítico (abaixo de 50) e baixa experiência no celular."
  },
  PERFORMANCE: {
    id: "PERFORMANCE",
    title: "Otimização de Performance & PageSpeed",
    category: "SITE",
    priority: "MEDIUM",
    estimatedValue: 1200,
    monthlyRecurring: 0,
    description: "Velocidade de carregamento no mobile está crítica (abaixo de 50 no PageSpeed)."
  },
  META_TRACKING: {
    id: "META_TRACKING",
    title: "Instalação & Configuração de Meta Pixel",
    category: "TRACKING",
    priority: "MEDIUM",
    estimatedValue: 800,
    monthlyRecurring: 0,
    description: "Não foi detectado código conhecido de Meta Pixel (perda de público de remarketing no Instagram)."
  },
  GOOGLE_TRACKING: {
    id: "GOOGLE_TRACKING",
    title: "Mensuração GA4 & Google Tag Manager",
    category: "TRACKING",
    priority: "MEDIUM",
    estimatedValue: 900,
    monthlyRecurring: 0,
    description: "Não foram detectadas tags oficiais de mensuração do Google Analytics (GA4) ou GTM."
  },
  PAID_TRAFFIC: {
    id: "PAID_TRAFFIC",
    title: "Gestão de Tráfego Pago (Google Ads & Maps)",
    category: "TRAFFIC",
    priority: "HIGH",
    estimatedValue: 800,
    monthlyRecurring: 1800,
    description: "Empresa possui boa estrutura web, porém não anuncia no topo das pesquisas de alta intenção."
  },
  CONVERSION_OPTIMIZATION: {
    id: "CONVERSION_OPTIMIZATION",
    title: "Otimização de Chamadas para Ação (CTA)",
    category: "SITE",
    priority: "MEDIUM",
    estimatedValue: 1000,
    monthlyRecurring: 0,
    description: "A página de destino possui chamadas para ação fracas ou pouco visíveis."
  },
  WHATSAPP_CONVERSION: {
    id: "WHATSAPP_CONVERSION",
    title: "Integração de Botão Flutuante WhatsApp",
    category: "SITE",
    priority: "HIGH",
    estimatedValue: 600,
    monthlyRecurring: 0,
    description: "Site não possui botão direto de direcionamento para atendimento no WhatsApp."
  },
  SEO: {
    id: "SEO",
    title: "Otimização de SEO & SEO Local",
    category: "SEO",
    priority: "MEDIUM",
    estimatedValue: 1200,
    monthlyRecurring: 1500,
    description: "Pontuação de SEO técnico baixa. Empresa perde posições orgânicas na cidade."
  }
};

export const PIPELINE_STAGES = [
  { id: "NEW", title: "Novo Lead", color: "#94a3b8", probability: 0.1 },
  { id: "QUALIFIED", title: "Qualificado", color: "#38bdf8", probability: 0.2 },
  { id: "CONTACTED", title: "Contactado", color: "#f59e0b", probability: 0.3 },
  { id: "REPLIED", title: "Respondeu", color: "#a855f7", probability: 0.4 },
  { id: "MEETING", title: "Reunião Agendada", color: "#06b6d4", probability: 0.6 },
  { id: "PROPOSAL", title: "Proposta Enviada", color: "#ec4899", probability: 0.75 },
  { id: "NEGOTIATION", title: "Em Negociação", color: "#f97316", probability: 0.85 },
  { id: "WON", title: "Cliente Fechado (Venda)", color: "#10b981", probability: 1.0 },
  { id: "LOST", title: "Perdido", color: "#ef4444", probability: 0.0 },
  { id: "NURTURE", title: "Nutrição Futura", color: "#64748b", probability: 0.15 }
];

export const TECH_STATUS = {
  DETECTED: "detected",
  NOT_DETECTED: "not_detected",
  UNKNOWN: "unknown"
};
