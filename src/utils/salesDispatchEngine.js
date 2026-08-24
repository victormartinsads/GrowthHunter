import { normalizeSegment } from "./segmentClassifier";

/**
 * GrowthHunter — GERADOR DE PACOTE DE LEADS PARA DISPARO NO WHATSAPP DA VENDEDORA
 * Formata os leads selecionados em uma mensagem limpa, profissional e com links diretos
 * para a vendedora clicar e abrir o WhatsApp do prospect em 1 toque.
 */

export const generateSalespersonDispatchMessage = (selectedCompanies = [], salespersonName = "") => {
  if (!selectedCompanies || selectedCompanies.length === 0) return "";

  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const total = selectedCompanies.length;
  
  let header = `🚀 *PACOTE DE LEADS PARA PROSPECÇÃO — ${today}*\n`;
  if (salespersonName && salespersonName.trim()) {
    header += `👤 *Vendedora:* ${salespersonName.trim()}\n`;
  }
  header += `📋 *Total de Empresas Selecionadas:* ${total} leads\n`;
  header += `━━━━━━━━━━━━━━━━━━━━━\n\n`;

  const body = selectedCompanies.map((comp, index) => {
    const num = index + 1;
    const name = (comp.name || "Empresa").replace(/\s*-\s*.*$/, "").trim();
    const city = comp.city || "Não informada";
    const neighborhood = comp.neighborhood ? ` (${comp.neighborhood})` : "";
    const niche = normalizeSegment(comp.niche || comp.category);
    const phone = comp.phone ? comp.phone.replace(/\D/g, '') : "";
    const formattedPhone = comp.phone ? comp.phone : "Não informado";
    const email = comp.email && comp.email.trim() ? comp.email.trim() : "Não informado";
    
    // Status do Site e Presença
    const isRealWebsite = comp.is_real_website ?? Boolean(comp.website && String(comp.website).trim() !== "");
    const presenceType = comp.presence_type || (isRealWebsite ? "real_website" : "none");
    const websiteGrade = comp.website_score?.grade || "N/A";
    const websiteScoreVal = comp.website_score?.totalScore || 0;

    let siteSituation = "";
    if (presenceType === "instagram") {
      siteSituation = `📸 Não possui site próprio (Cadastrou apenas Instagram ${comp.instagram || ''})`;
    } else if (presenceType === "linktree") {
      siteSituation = `🔗 Não possui site próprio (Cadastrou apenas Linktree/Bio)`;
    } else if (!isRealWebsite) {
      siteSituation = `🚨 Não possui site cadastrado no Google`;
    } else if (websiteScoreVal < 50) {
      siteSituation = `⚠️ Possui site (${comp.website}), mas é lento no celular (Nota ${websiteScoreVal}/100 - Grade ${websiteGrade})`;
    } else {
      siteSituation = `✅ Possui bom site (${comp.website}) • Nota ${websiteScoreVal}/100`;
    }

    // Oferta recomendada e Ticket
    const primaryOffer = comp.scores?.primaryOffer?.title || (!isRealWebsite ? "Criação de Landing Page de Vendas" : "Reformulação / Tráfego Pago");
    const estimatedValue = comp.scores?.primaryOffer?.estimatedValue || (!isRealWebsite ? 2500 : 1800);

    // Link Clicável de WhatsApp do Prospect
    const openingMsg = comp.aiAnalysis?.opening_message || `Olá pessoal da ${name}, tudo bem? Vi a empresa de vocês no Google em ${city}!`;
    const whatsappLink = phone ? `https://wa.me/${phone}?text=${encodeURIComponent(openingMsg)}` : "Sem WhatsApp cadastrado";

    // Sócios / Dono
    const partnerName = comp.partners && comp.partners.length > 0 ? comp.partners[0].name : null;

    let leadBlock = `${num}️⃣ *${name.toUpperCase()}*\n`;
    leadBlock += `🏷️ *Nicho:* ${niche}\n`;
    leadBlock += `📍 *Localização:* ${city}${neighborhood}\n`;
    if (partnerName) {
      leadBlock += `👤 *Sócio / Dono:* ${partnerName}\n`;
    }
    leadBlock += `📞 *Telefone:* ${formattedPhone}\n`;
    leadBlock += `📧 *E-mail:* ${email}\n`;
    leadBlock += `🌐 *Situação do Site:* ${siteSituation}\n`;
    leadBlock += `🎯 *Oferta:* ${primaryOffer} (~R$ ${estimatedValue.toLocaleString('pt-BR')})\n`;
    if (phone) {
      leadBlock += `📲 *Chamar no WhatsApp (1 Toque):*\n${whatsappLink}\n`;
    }
    leadBlock += `💡 *Script de Abertura:* "${openingMsg}"\n`;

    return leadBlock;
  }).join("\n━━━━━━━━━━━━━━━━━━━━━\n\n");

  const footer = `\n━━━━━━━━━━━━━━━━━━━━━\n🔥 *Boas Vendas! Registre os retornos no CRM conforme as respostas.*`;

  return `${header}${body}${footer}`;
};
