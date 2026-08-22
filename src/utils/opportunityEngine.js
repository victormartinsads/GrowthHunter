import { normalizeSegment } from "./segmentClassifier";

/**
 * Motor de Oportunidades Focado em VENDA DE SITES (Foco 1) + GOOGLE ADS (Foco 2)
 * Avalia se a empresa tem ou não site, identifica pontos de melhoria específicos,
 * analisa a concorrência na cidade e gera scripts persuasivos para cada caso.
 */

// Pontos de melhoria típicos por perfil de site
const WEBSITE_IMPROVEMENT_POINTS = {
  NO_WEBSITE: [
    "Empresa invisível nas buscas diretas do Google quando o cliente pesquisa na cidade.",
    "Perda diária de contatos qualificados para concorrentes que possuem Landing Page.",
    "Dependência 100% de redes sociais ou indicação boca a boca sem controle de vendas."
  ],
  WEBSITE_FAULTS: [
    "Falta de botão flutuante direto para o WhatsApp da recepção (baixa conversão).",
    "Carregamento lento ou estrutura não otimizada para navegação no celular (mobile).",
    "Ausência da Tag do Google Ads e Meta Pixel para fazer remarketing com visitantes.",
    "Design desatualizado que não transmite autoridade comercial perante a concorrência."
  ],
  WEBSITE_OK: [
    "Site ativo, porém sem campanhas de tráfego pago rodando na rede de pesquisa do Google.",
    "Falta de anúncios de geolocalização no Google Maps para dominar a região.",
    "Oportunidade para escalar o volume diário de orçamentos via Google Ads."
  ]
};

// Estimativa de concorrência local por nicho
const COMPETITION_SIGNALS = {
  "Odontologia & Saúde Dental": "Alta concorrência no Google Ads (média de 4 a 6 dentistas anunciando por cidade).",
  "Clínica de Estética & Harmonização": "Fortíssima concorrência visual no Instagram e Google Ads.",
  "Academias & Studio Fitness": "Média concorrência no Google Maps e busca local.",
  "Imobiliária & Construtora": "Altíssima concorrência em portais e links patrocinados.",
  "Restaurantes & Gastronomia": "Alta concorrência no Google Maps e horário de pico.",
  "Energia Solar & Fotovoltaica": "Alta concorrência em palavras-chave de intenção de compra no Google.",
  "Autoescola & CFC": "Concorrência concentrada no topo das pesquisas do Google."
};

export const analyzeLeadOpportunity = (lead) => {
  const normalizedNiche = normalizeSegment(lead.niche);
  const audit = String(lead.digitalAudit || "").toLowerCase();
  const hasWebsite = Boolean(lead.website && String(lead.website).trim() !== "");
  const hasPixel = !audit.includes("sem pixel");
  const hasGoogleAds = !audit.includes("sem google ads");

  let siteStatusCase = "CASO_A_SEM_SITE";
  let siteStatusBadge = "🚨 SEM WEBSITE (ALVO Nº 1 PARA VENDA DE SITE)";
  let siteStatusColor = "#ef4444";

  if (!hasWebsite) {
    siteStatusCase = "CASO_A_SEM_SITE";
    siteStatusBadge = "🚨 SEM WEBSITE (ALVO Nº 1 PARA VENDA DE SITE)";
    siteStatusColor = "#ef4444";
  } else if (!hasPixel || !hasGoogleAds || audit.includes("fora do ar") || audit.includes("inacessível")) {
    siteStatusCase = "CASO_B_SITE_DEFICIENTE";
    siteStatusBadge = "⚠️ SITE DEFICIENTE / REFORMULAÇÃO (ALVO PARA VENDA DE SITE + ADS)";
    siteStatusColor = "#f59e0b";
  } else {
    siteStatusCase = "CASO_C_SITE_OK";
    siteStatusBadge = "✅ SITE ATIVO (ALVO PARA VENDA DE GOOGLE ADS)";
    siteStatusColor = "#10b981";
  }

  // Pontuação priorizando Venda de Sites (Foco 1) e Google Ads (Foco 2)
  let score = 50;
  if (siteStatusCase === "CASO_A_SEM_SITE") score += 40; // Máxima prioridade
  if (siteStatusCase === "CASO_B_SITE_DEFICIENTE") score += 30;
  if (!hasGoogleAds) score += 15;
  if (lead.phone) score += 5;

  score = Math.min(Math.max(score, 20), 99);

  let opportunityLevel = "🚀 OPORTUNIDADE ALTA (VENDA DE SITE + ADS)";
  if (score < 55) {
    opportunityLevel = "🟢 OPORTUNIDADE DE MANUTENÇÃO";
  } else if (score < 75) {
    opportunityLevel = "⚡ OPORTUNIDADE MÉDIA";
  }

  // Pontos de melhoria do site
  const improvements = siteStatusCase === "CASO_A_SEM_SITE"
    ? WEBSITE_IMPROVEMENT_POINTS.NO_WEBSITE
    : siteStatusCase === "CASO_B_SITE_DEFICIENTE"
    ? WEBSITE_IMPROVEMENT_POINTS.WEBSITE_FAULTS
    : WEBSITE_IMPROVEMENT_POINTS.WEBSITE_OK;

  // Análise da concorrência na cidade
  const competitionAnalysis = COMPETITION_SIGNALS[normalizedNiche] || `Concorrência moderada a alta para ${normalizedNiche} em ${lead.city}. Concorrentes ativos no Google Ads captam os clientes antes.`;

  // Script Personalizado para CADA CASO
  let customPitch = "";
  if (siteStatusCase === "CASO_A_SEM_SITE") {
    customPitch = `Olá equipe da *${lead.name}*! Tudo bem?\n\nMe chamo Alexandre, sou especialista em criação de *Websites de Alta Conversão e Tráfego no Google* para *${normalizedNiche}*.\n\nPesquisando as empresas de *${lead.city}*, notei que a ${lead.name} ainda não possui um site estruturado para aparecer quando potenciais clientes procuram por seus serviços no Google.\n\nEnquanto isso, a concorrência na região está captando esses clientes diariamente via anúncios patrocinados.\n\nDesenvolvemos um combo especial: *Criação de Landing Page Profissional + Lançamento de Anúncios no Google Ads* para colocar de 15 a 35 novos orçamentos direto no WhatsApp da sua recepção todos os meses.\n\nPodemos agendar 10 minutos essa semana pra eu te apresentar uma proposta sem compromisso?`;
  } else if (siteStatusCase === "CASO_B_SITE_DEFICIENTE") {
    customPitch = `Oi pessoal da *${lead.name}*! Tudo certo?\n\nDei uma olhada no site de vocês (${lead.website}) e notei que a empresa tem um excelente serviço em *${lead.city}*, porém identifiquei 2 falhas sérias no site que estão fazendo vocês perderem clientes:\n\n1. ${improvements[0]}\n2. ${improvements[1]}\n\nTrabalhamos com a *Reformulação de Sites para Alta Conversão + Campanhas no Google Ads* para garantir que quem acesse seu site chame no WhatsApp imediatamente.\n\nPosso te mandar um diagnóstico rápido em vídeo de 2 minutos mostrando o que ajustar?`;
  } else {
    customPitch = `Olá time da *${lead.name}*! Tudo bem?\n\nVi que o site de vocês já está bem estruturado. Porém, analisando a concorrência de *${normalizedNiche}* em *${lead.city}*, notamos uma grande oportunidade no *Google Ads (Rede de Pesquisa e Google Maps)*.\n\nSeus concorrentes estão dominando o topo das buscas quando o cliente precisa do serviço na hora.\n\nNós ajudamos empresas com site como a sua a colocar campanhas de alta intenção no Google Ads com ROI medido semanalmente.\n\nVocê teria 10 minutos nesta semana para uma breve demonstração?`;
  }

  // Ticket Sugerido baseado nos focos
  const suggestedFee = siteStatusCase === "CASO_A_SEM_SITE"
    ? "R$ 2.500 (Criação do Site) + R$ 1.800/mês (Google Ads)"
    : siteStatusCase === "CASO_B_SITE_DEFICIENTE"
    ? "R$ 1.800 (Reformulação do Site) + R$ 1.800/mês (Google Ads)"
    : "R$ 1.800 a R$ 3.000/mês (Gestão de Tráfego Google Ads)";

  // Links nos Mecanismos de Busca
  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${lead.name} ${lead.city} ${normalizedNiche}`)}`;
  const googleMapsUrl = `https://www.google.com/maps/search/${encodeURIComponent(`${lead.name} ${lead.city}`)}`;
  const metaAdsLibraryUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=${encodeURIComponent(lead.name)}`;

  return {
    leadId: lead.id,
    companyName: lead.name,
    niche: normalizedNiche,
    city: lead.city,
    opportunityScore: score,
    opportunityLevel,
    siteStatusCase,
    siteStatusBadge,
    siteStatusColor,
    hasWebsite,
    improvements,
    competitionAnalysis,
    suggestedFee,
    customPitch,
    googleSearchUrl,
    googleMapsUrl,
    metaAdsLibraryUrl
  };
};
