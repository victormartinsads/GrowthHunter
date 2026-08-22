import { normalizeSegment } from "./segmentClassifier";

/**
 * Gerador de E-mails Frios e Abordagens de WhatsApp Humanas (Sem Robô / Sem Jargão)
 * Baseado nos frameworks de Prospectagram e Gabriel Miranda
 */
export const generateColdEmail = (lead, senderName = "Alexandre", senderAgency = "GrowthHunter") => {
  const empresa = (lead.name || "Sua Empresa").replace(/\s*-\s*.*$/, "").trim();
  const nicho = normalizeSegment(lead.niche);
  const cidade = lead.city || "sua cidade";
  const site = lead.website || "";
  const hasWebsite = Boolean(lead.website && String(lead.website).trim() !== "");
  const reviewCount = lead.review_count || lead.reviewsCount || 35;

  let subjectOptions = [];
  let bodyText = "";

  if (!hasWebsite) {
    subjectOptions = [
      `Dúvida rápida sobre a ${empresa} no Google (${cidade})`,
      `Pesquisei por ${nicho} em ${cidade} e vi a ${empresa}`,
      `Modelo de página para a ${empresa}`
    ];

    bodyText = `Oi pessoal da ${empresa}, tudo bem?

Vi que vocês têm ${reviewCount} avaliações muito boas no Google Maps aqui em ${cidade} — parabéns pelo trabalho!

Porém, quando alguém pesquisa por "${nicho} em ${cidade}" no Google pelo celular, a ${empresa} não possui um site próprio cadastrado e o cliente acaba caindo direto nos concorrentes.

Montei uma prévia de como ficaria uma página rápida e moderna para a ${empresa} receber orçamentos direto no WhatsApp.

Vocês têm interesse em dar uma olhada sem compromisso?

Abraço,
${senderName}`;
  } else {
    subjectOptions = [
      `Reparei um detalhe no site da ${empresa}`,
      `Dúvida sobre o site da ${empresa} (${site})`,
      `Contato rápido sobre a ${empresa} em ${cidade}`
    ];

    bodyText = `Oi time da ${empresa}, tudo joia?

Acessei o site de vocês (${site}) pelo celular e achei a empresa muito bem estruturada em ${cidade}.

Só notei que o botão de chamar no WhatsApp está demorando um pouco para carregar no celular, o que pode fazer algumas pessoas desistirem antes de mandar mensagem.

Nós ajudamos empresas de ${nicho} a deixarem o site leve e direto para aumentar o volume de chamadas no WhatsApp.

Posso te mandar um diagnóstico de 1 minuto mostrando o que dá para ajustar?

Abraço,
${senderName}`;
  }

  const chosenSubject = subjectOptions[0];
  const mailtoUrl = lead.email 
    ? `mailto:${lead.email}?subject=${encodeURIComponent(chosenSubject)}&body=${encodeURIComponent(bodyText)}`
    : null;

  return {
    subject: chosenSubject,
    body: bodyText,
    mailtoUrl,
    recipientEmail: lead.email || ""
  };
};

export const generatePersuasiveWhatsappMessage = (lead, senderName = "Alexandre") => {
  const empresa = (lead.name || "empresa").replace(/\s*-\s*.*$/, "").trim();
  const nicho = normalizeSegment(lead.niche);
  const cidade = lead.city || "sua cidade";
  const hasWebsite = Boolean(lead.website && String(lead.website).trim() !== "");

  if (!hasWebsite) {
    return `Opa, tudo bem? Vi a *${empresa}* aqui no Google Maps em *${cidade}*, muito bacana as avaliações de vocês! 👏\n\nFui procurar o site ou cardápio/serviços de vocês pra ver aqui e reparei que ainda não têm uma página própria cadastrada.\n\nHoje vocês pegam clientes que buscam no Google ou a demanda vem quase toda por indicação mesmo?`;
  }

  return `Fala pessoal da *${empresa}*, tudo joia?\n\nDei uma olhada rápida no site de vocês (${lead.website}) pelo meu celular agora. Achei a empresa bem estruturada, mas vi que o botão de chamar no WhatsApp demorou um pouco pra abrir aqui.\n\nVocês já tinham percebido isso ou ninguém tinha avisado vocês ainda?`;
};
