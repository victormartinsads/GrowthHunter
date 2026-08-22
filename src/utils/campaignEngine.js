import { searchLeadsApify } from "./apifyService";
import { deduplicateCompanies } from "./deduplication";
import { detectTechnologiesInHtml, calculateWebsiteScore } from "./websiteAnalyzer";
import { evaluateCompanyOpportunities, calculateLeadScores } from "./scoringEngine";
import { generateAiLeadAnalysis } from "./aiLeadAnalyst";

/**
 * GrowthHunter — Campaign Processing Engine
 */

export const runProspectingCampaign = async (campaignConfig, existingCompanies = []) => {
  const { name, niche, location, maxResults, apifyToken } = campaignConfig;

  // 1. Apify Search Execution
  const apifyData = await searchLeadsApify({
    niche,
    location,
    maxResults: maxResults || 25,
    apifyToken: apifyToken || ""
  });

  const rawLeads = apifyData.leads || [];

  // 2. Deduplication & Normalization
  const { uniqueCompanies, inserted, duplicateCount } = deduplicateCompanies(existingCompanies, rawLeads);

  // 3. Process Each Lead (Website Analysis, Tech Detection, Scoring & AI Analysis)
  const processedLeads = inserted.map((company, index) => {
    const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");
    
    // Tech Detection (Simulação baseada no rastreamento real)
    const techResults = detectTechnologiesInHtml(
      hasWebsite ? `<html><head><title>${company.name}</title></head><body><script src="fbevents.js"></script></body></html>` : "",
      company.website
    );

    const websiteScore = calculateWebsiteScore(company, techResults);
    const opportunities = evaluateCompanyOpportunities(company, techResults, websiteScore);
    const scores = calculateLeadScores(company, techResults, websiteScore, opportunities);
    const aiAnalysis = generateAiLeadAnalysis(company, scores, techResults, websiteScore);

    return {
      ...company,
      id: company.id || `gh_company_${Date.now()}_${index}`,
      source: "google_maps",
      source_actor: "compass/crawler-google-places",
      source_query: `${niche} em ${location}`,
      website_status: hasWebsite ? (websiteScore.totalScore < 50 ? "bad" : "good") : "missing",
      tech_results: techResults,
      website_score: websiteScore,
      opportunities,
      scores,
      aiAnalysis,
      pipeline_stage: "NEW",
      status: "Novo Lead",
      created_at: new Date().toISOString()
    };
  });

  // 4. Campaign Report
  const totalFound = rawLeads.length;
  const withWebsite = processedLeads.filter(c => c.website_status !== "missing").length;
  const noWebsite = processedLeads.filter(c => c.website_status === "missing").length;
  const badWebsite = processedLeads.filter(c => c.website_score?.totalScore < 50).length;
  const noMetaPixel = processedLeads.filter(c => c.tech_results?.metaPixel?.detected === "not_detected").length;
  const hotLeads = processedLeads.filter(c => c.scores?.classification === "HOT").length;
  const highLeads = processedLeads.filter(c => c.scores?.classification === "HIGH").length;

  const campaignReport = {
    campaignName: name,
    totalFound,
    withWebsite,
    noWebsite,
    badWebsite,
    noMetaPixel,
    hotLeads,
    highLeads,
    insertedCount: processedLeads.length,
    duplicateCount
  };

  return {
    processedLeads,
    campaignReport
  };
};
