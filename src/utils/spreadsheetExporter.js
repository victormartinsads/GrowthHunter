/**
 * GrowthHunter — Advanced Spreadsheet & Excel Exporter
 * Exporta planilhas com separação por nicho, links de WhatsApp 1-toque, indicação de serviço e dados 360º.
 */

import { normalizeSegment } from "./segmentClassifier";
import { buildWhatsappUrl, buildGoogleMapsUrl } from "./helpers";

export function exportLeadsToSpreadsheet(companies = [], options = {}) {
  if (!companies || companies.length === 0) {
    alert("Nenhuma empresa disponível para exportar.");
    return;
  }

  const { filename = "growthhunter_leads_prospeccao" } = options;

  // Ordena por Nicho para que a planilha venha organizada por categorias
  const sortedCompanies = [...companies].sort((a, b) => {
    const nicheA = normalizeSegment(a.niche || a.category) || "";
    const nicheB = normalizeSegment(b.niche || b.category) || "";
    return nicheA.localeCompare(nicheB) || a.name.localeCompare(b.name);
  });

  // Cabeçalhos Profissionais
  const headers = [
    "NICHO / SEGMENTO",
    "EMPRESA",
    "WHATSAPP (LINK CLICÁVEL)",
    "TELEFONE FORMATADO",
    "SERVIÇO RECOMENDADO",
    "VALOR ESTIMADO (R$ / €)",
    "SITUAÇÃO DO SITE",
    "URL DO WEBSITE / BIO",
    "FICHA GOOGLE MAPS / GMB",
    "CIDADE / REGIÃO",
    "AVALIAÇÃO GOOGLE",
    "QTD AVALIAÇÕES",
    "ESTÁGIO NO CRM",
    "SCRIPT DE ABORDAGEM SUGERIDO",
    "DATA DE EXTRAÇÃO"
  ];

  const escapeCsv = (str) => {
    if (str === null || str === undefined) return '""';
    const clean = String(str).replace(/"/g, '""').replace(/\r?\n/g, ' ');
    return `"${clean}"`;
  };

  const rows = sortedCompanies.map(c => {
    const niche = normalizeSegment(c.niche || c.category) || "Geral";
    const isRealWebsite = c.is_real_website ?? Boolean(c.website && String(c.website).trim() !== "");
    const siteStatus = !isRealWebsite 
      ? (c.presence_type === "instagram" ? "🚨 Sem Site (Usa apenas Instagram)" : "🚨 Sem Website Próprio")
      : ((c.website_score?.totalScore || 60) < 50 ? "⚠️ Site Lento / Baixa Conversão" : "🌐 Possui Website Próprio");

    const whatsappUrl = buildWhatsappUrl(c.phone, c.aiAnalysis?.opening_message) || (c.phone ? `https://wa.me/${c.phone}` : "");
    const whatsappFormula = whatsappUrl 
      ? `=HYPERLINK("${whatsappUrl}", "📲 Chamar no WhatsApp")` 
      : "Não informado";

    const mapsUrl = buildGoogleMapsUrl(c);
    const mapsFormula = mapsUrl 
      ? `=HYPERLINK("${mapsUrl}", "📍 Ver no Google Maps")` 
      : "Não informado";

    const recommendedService = c.scores?.primaryOffer?.title 
      || (!isRealWebsite ? "Criação de Website de Alta Conversão" : "Reformulação de Landing Page & Conversão");

    const dealValue = c.deal_value || c.scores?.primaryOffer?.estimatedValue || 2500;
    const stage = c.pipeline_stage || c.status || "Novo Lead";
    const script = c.aiAnalysis?.opening_message || `Olá pessoal da ${c.name}, tudo bem? Vi a empresa de vocês no Google!`;
    const extractionDate = new Date().toLocaleDateString("pt-BR");

    return [
      escapeCsv(niche),
      escapeCsv(c.name),
      escapeCsv(whatsappFormula),
      escapeCsv(c.phone || ""),
      escapeCsv(recommendedService),
      dealValue,
      escapeCsv(siteStatus),
      escapeCsv(c.website || ""),
      escapeCsv(mapsFormula),
      escapeCsv(c.city || ""),
      c.rating || 4.8,
      c.review_count || 24,
      escapeCsv(stage),
      escapeCsv(script),
      escapeCsv(extractionDate)
    ];
  });

  // UTF-8 BOM (\uFEFF) garante que o Excel abra sem desconfigurar acentos em Português
  const csvContent = "\uFEFF" + [headers.join(";"), ...rows.map(e => e.join(";"))].join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
