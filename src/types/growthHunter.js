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
  { id: "NEW", title: "Novo Lead", color: "#94a3b8", probability: 0.1, badgeBg: "#f1f5f9", badgeColor: "#475569" },
  { id: "QUALIFIED", title: "Qualificado", color: "#38bdf8", probability: 0.25, badgeBg: "#f0f9ff", badgeColor: "#0284c7" },
  { id: "CONTACTED", title: "Contactado", color: "#f59e0b", probability: 0.4, badgeBg: "#fffbeb", badgeColor: "#d97706" },
  { id: "MEETING", title: "Reunião Agendada", color: "#06b6d4", probability: 0.6, badgeBg: "#ecfeff", badgeColor: "#0891b2" },
  { id: "PROPOSAL", title: "Proposta Enviada", color: "#ea580c", probability: 0.8, badgeBg: "#fff7ed", badgeColor: "#ea580c" },
  { id: "WON", title: "Cliente Fechado", color: "#10b981", probability: 1.0, badgeBg: "#f0fdf4", badgeColor: "#16a34a" },
  { id: "LOST", title: "Perdido", color: "#ef4444", probability: 0.0, badgeBg: "#fef2f2", badgeColor: "#dc2626" }
];

export const LOST_REASONS = [
  "Preço / Sem Orçamento",
  "Já possui agência / prestador",
  "Sem interesse no momento",
  "Não respondeu aos 5 toques",
  "Decisor inalcançável",
  "Concorrente fechou antes",
  "Outro motivo"
];

export const CADENCE_TOUCHES = [
  { day: 0, name: "Toque 1 (D+0)", title: "Gancho Visual & Quebra de Padrão", type: "whatsapp" },
  { day: 2, name: "Toque 2 (D+2)", title: "Áudio Casual de 20s com Diagnóstico", type: "audio" },
  { day: 4, name: "Toque 3 (D+4)", title: "Exemplo Prático do Concorrente", type: "whatsapp" },
  { day: 7, name: "Toque 4 (D+7)", title: "Link do Dossiê Raio-X Visual", type: "dossier" },
  { day: 10, name: "Toque 5 (D+10)", title: "Break-up Message Amigável", type: "breakup" }
];

export const TECH_STATUS = {
  DETECTED: "detected",
  NOT_DETECTED: "not_detected",
  UNKNOWN: "unknown"
};
