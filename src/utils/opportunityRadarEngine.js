import { PIPELINE_STAGES } from "../types/growthHunter";

/**
 * GrowthHunter — Opportunity Radar & Revenue Forecast Engine
 */

export const calculateOpportunityRadar = (companies = []) => {
  let noWebsiteHighSocialCount = 0;
  let criticalWebsiteCount = 0;
  let noMetaPixelCount = 0;
  let strongLocalLowQualitySiteCount = 0;

  companies.forEach(company => {
    const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");
    const rating = Number(company.rating) || 4.5;
    const reviewCount = Number(company.review_count || company.reviewsCount) || 0;
    const webScore = company.website_score?.totalScore || (hasWebsite ? 60 : 0);
    const hasMetaPixel = company.tech_results?.metaPixel?.detected === "detected";

    if (!hasWebsite && rating >= 4.5 && reviewCount >= 20) {
      noWebsiteHighSocialCount++;
    }
    if (hasWebsite && webScore < 50) {
      criticalWebsiteCount++;
    }
    if (hasWebsite && !hasMetaPixel) {
      noMetaPixelCount++;
    }
    if (rating >= 4.5 && reviewCount >= 30 && webScore < 60) {
      strongLocalLowQualitySiteCount++;
    }
  });

  return {
    noWebsiteHighSocialCount,
    criticalWebsiteCount,
    noMetaPixelCount,
    strongLocalLowQualitySiteCount
  };
};

export const calculateRevenueForecast = (companies = []) => {
  let potentialInitialDeal = 0;
  let potentialMonthlyRecurring = 0;
  let pipelineValue = 0;
  let weightedPipeline = 0;
  let wonRevenue = 0;

  companies.forEach(company => {
    const primaryValue = company.scores?.primaryOffer?.estimatedValue || 2500;
    const recurringValue = company.scores?.primaryOffer?.monthlyRecurring || 0;
    
    potentialInitialDeal += primaryValue;
    potentialMonthlyRecurring += recurringValue;

    const currentStageObj = PIPELINE_STAGES.find(s => s.id === (company.pipeline_stage || company.status));
    const probability = currentStageObj ? currentStageObj.probability : 0.1;

    const leadTotalValue = primaryValue + (recurringValue * 3); // 3 meses LTV estimado
    pipelineValue += leadTotalValue;
    weightedPipeline += leadTotalValue * probability;

    if (company.pipeline_stage === "WON" || company.status === "Cliente Fechado" || company.status === "Ganho") {
      wonRevenue += leadTotalValue;
    }
  });

  return {
    potentialInitialDeal,
    potentialMonthlyRecurring,
    pipelineValue,
    weightedPipeline: Math.round(weightedPipeline),
    wonRevenue
  };
};
