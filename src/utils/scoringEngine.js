import { OPPORTUNITY_TYPES, TECH_STATUS } from "../types/growthHunter";

/**
 * GrowthHunter — Lead Scoring & Opportunity Engine
 * Regra Estrita:
 * 1. SEM SITE ou SITE RUIM (< 50) -> OFERTA PRIMÁRIA: SITE NOVO / REFORMULAÇÃO
 * 2. SITE BOM (>= 70) -> OFERTA PRIMÁRIA: SOMENTE TRÁFEGO PAGO (Google Ads / Meta Ads)
 */

export const evaluateCompanyOpportunities = (company, techResults, websiteScore, pageSpeed = null) => {
  const opportunities = [];
  const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");

  if (!hasWebsite) {
    opportunities.push(OPPORTUNITY_TYPES.NEW_WEBSITE);
    opportunities.push(OPPORTUNITY_TYPES.PAID_TRAFFIC);
  } else {
    if (websiteScore.totalScore < 50) {
      opportunities.push(OPPORTUNITY_TYPES.WEBSITE_REDESIGN);
      if (pageSpeed && pageSpeed.mobileScore < 50) {
        opportunities.push(OPPORTUNITY_TYPES.PERFORMANCE);
      }
    } else {
      // Site for bom
      opportunities.push(OPPORTUNITY_TYPES.PAID_TRAFFIC);
    }

    if (techResults.metaPixel.detected === TECH_STATUS.NOT_DETECTED) {
      opportunities.push(OPPORTUNITY_TYPES.META_TRACKING);
    }
    if (techResults.ga4.detected === TECH_STATUS.NOT_DETECTED && techResults.gtm.detected === TECH_STATUS.NOT_DETECTED) {
      opportunities.push(OPPORTUNITY_TYPES.GOOGLE_TRACKING);
    }
    if (techResults.whatsAppButton.detected === TECH_STATUS.NOT_DETECTED) {
      opportunities.push(OPPORTUNITY_TYPES.WHATSAPP_CONVERSION);
    }
  }

  return opportunities;
};

export const calculateLeadScores = (company, techResults, websiteScore, opportunities, pageSpeed = null) => {
  const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");
  const rating = Number(company.rating) || 4.5;
  const reviewCount = Number(company.review_count || company.reviewsCount) || 15;

  // 1. FIT SCORE (0 a 100)
  let fitScore = 55;
  if (rating >= 4.5) fitScore += 20;
  if (reviewCount >= 40) fitScore += 15;
  if (company.phone) fitScore += 10;
  fitScore = Math.min(fitScore, 98);

  // 2. PAIN SCORE (0 a 100)
  let painScore = 30;
  if (!hasWebsite) painScore += 65;
  else if (websiteScore.totalScore < 50) painScore += 45;
  else if (websiteScore.totalScore < 70) painScore += 25;

  if (techResults.metaPixel.detected === TECH_STATUS.NOT_DETECTED) painScore += 10;
  if (techResults.ga4.detected === TECH_STATUS.NOT_DETECTED) painScore += 10;
  painScore = Math.min(painScore, 99);

  // 3. BUYING SIGNAL SCORE (0 a 100)
  let buyingSignalScore = 40;
  if (reviewCount >= 100) buyingSignalScore += 40;
  else if (reviewCount >= 30) buyingSignalScore += 20;
  if (rating >= 4.7) buyingSignalScore += 18;
  buyingSignalScore = Math.min(buyingSignalScore, 98);

  // 4. OPPORTUNITY SCORE (0 a 100)
  let opportunityScore = 40;
  if (!hasWebsite) opportunityScore += 55;
  else if (websiteScore.totalScore < 50) opportunityScore += 38;
  else opportunityScore += 20;
  opportunityScore = Math.min(opportunityScore, 99);

  // 5. FINAL SCORE
  const finalScore = Math.round(
    (fitScore * 0.25) + (painScore * 0.35) + (buyingSignalScore * 0.15) + (opportunityScore * 0.25)
  );

  // Classificação
  let classification = "MEDIUM";
  if (finalScore >= 88) classification = "HOT";
  else if (finalScore >= 72) classification = "HIGH";
  else if (finalScore >= 45) classification = "MEDIUM";
  else classification = "LOW";

  // REGRAS DE OFERTA EXATAS SOLICITADAS:
  // - Sem Site -> Criação de Novo Site
  // - Site Ruim (< 50) -> Reformulação de Site
  // - Site Bom (>= 70) -> Somente Tráfego Pago (Google Ads / Meta Ads)
  let primaryOffer = OPPORTUNITY_TYPES.NEW_WEBSITE;
  let secondaryOffer = OPPORTUNITY_TYPES.PAID_TRAFFIC;

  if (!hasWebsite) {
    primaryOffer = OPPORTUNITY_TYPES.NEW_WEBSITE;
    secondaryOffer = OPPORTUNITY_TYPES.PAID_TRAFFIC;
  } else if (websiteScore.totalScore < 50) {
    primaryOffer = OPPORTUNITY_TYPES.WEBSITE_REDESIGN;
    secondaryOffer = OPPORTUNITY_TYPES.META_TRACKING;
  } else {
    // SITE BOM (Nota A ou B / Score 70+)
    primaryOffer = OPPORTUNITY_TYPES.PAID_TRAFFIC;
    secondaryOffer = OPPORTUNITY_TYPES.GOOGLE_TRACKING;
  }

  // Evidências Reais
  const evidenceList = [];
  if (rating >= 4.5 && reviewCount >= 20) {
    evidenceList.push(`Empresa tem forte prova social: ${rating} ⭐ com ${reviewCount} avaliações no Google Maps.`);
  }

  if (!hasWebsite) {
    evidenceList.push("🚨 EMPRESA NÃO POSSUI WEBSITE: Perde 100% dos clientes que pesquisam por este serviço na cidade.");
  } else if (websiteScore.totalScore < 50) {
    evidenceList.push(`⚠️ WEBSITE CRÍTICO (Nota ${websiteScore.grade} - ${websiteScore.totalScore}/100): Baixa performance e falhas de conversão no celular.`);
  } else {
    evidenceList.push(`🌐 WEBSITE ESTRUTURADO (Nota ${websiteScore.grade} - ${websiteScore.totalScore}/100): Ótima base web. Alvo ideal para ESCALAR VENDAS COM TRÁFEGO PAGO no Google e Meta Ads.`);
  }

  if (hasWebsite) {
    if (techResults.metaPixel.detected === TECH_STATUS.NOT_DETECTED) {
      evidenceList.push("Meta Pixel não foi detectado (perda de público de remarketing).");
    }
    if (techResults.ga4.detected === TECH_STATUS.NOT_DETECTED) {
      evidenceList.push("Mensuração do Google Analytics 4 (GA4) ausente no site.");
    }
  }

  return {
    fitScore,
    painScore,
    buyingSignalScore,
    opportunityScore,
    finalScore,
    classification,
    primaryOffer,
    secondaryOffer,
    evidenceList
  };
};
