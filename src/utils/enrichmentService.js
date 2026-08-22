import { checkWebsiteHealth } from "./aiSdrAgent";

/**
 * Módulo de Enriquecimento de Dados e Rastreamento Digital de Leads
 * Analisa a presença digital da empresa (Site, Instagram, Meta Pixel, Google Ads)
 */

const slugify = (text) => {
  return String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "");
};

const STOP_WORDS = ["clinica", "instituto", "dr", "dra", "estudio", "studio", "de", "e", "da", "do", "grupo"];

export const enrichLeadData = async (lead) => {
  const rawSlug = slugify(lead.name);
  let domainCore = rawSlug;
  STOP_WORDS.forEach(sw => {
    domainCore = domainCore.replace(new RegExp(`^${sw}`, 'i'), '');
  });
  if (domainCore.length < 3) domainCore = rawSlug;

  const suggestedWebsite = lead.website || `https://www.${domainCore}.com.br`;
  const suggestedInstagram = lead.instagram || `@${domainCore}`;

  // Executa auditoria REAL de código-fonte HTML através do servidor backend local
  const realAudit = await checkWebsiteHealth(lead.website || suggestedWebsite);

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(`${lead.name} ${lead.city || ''} ${lead.niche || ''}`)}`;
  const instagramSearchUrl = `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(lead.name)}`;
  const metaAdsLibraryUrl = `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=${encodeURIComponent(lead.name)}`;

  return {
    ...lead,
    website: lead.website ? lead.website : suggestedWebsite,
    instagram: lead.instagram ? lead.instagram : suggestedInstagram,
    digitalAudit: realAudit.message,
    googleSearchUrl,
    instagramSearchUrl,
    metaAdsLibraryUrl,
    lastEnrichedAt: new Date().toISOString(),
    notes: lead.notes 
      ? `${lead.notes}\n🔍 Rastreamento Real: ${realAudit.message}`
      : `🔍 Rastreamento Real: ${realAudit.message}`
  };
};

/**
 * Enriquece um lote de leads sequencialmente
 */
export const enrichBatchLeads = async (leadsList, onProgress) => {
  const enrichedList = [];
  for (let i = 0; i < leadsList.length; i++) {
    const lead = leadsList[i];
    const enriched = await enrichLeadData(lead);
    enrichedList.push(enriched);
    if (onProgress) {
      onProgress(i + 1, leadsList.length, enriched);
    }
  }
  return enrichedList;
};
