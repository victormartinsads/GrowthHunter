import { OBJECTION_TYPES } from "../types/whatsapp";

/**
 * GrowthHunter — AI Sales Copilot for WhatsApp Inbox
 * Alimentado pelo Prompt do AGENTE SDR — ESPECIALISTA EM PROSPECÇÃO ESTRATÉGICA
 */

export const detectObjectionInMessage = (text = "") => {
  if (!text || typeof text !== "string") return OBJECTION_TYPES.UNKNOWN;

  const lower = text.toLowerCase();

  if (lower.includes("caro") || lower.includes("preço") || lower.includes("valor") || lower.includes("orçamento alto") || lower.includes("desconto")) {
    return OBJECTION_TYPES.PRICE;
  }
  if (lower.includes("sem tempo") || lower.includes("depois") || lower.includes("mês que vem") || lower.includes("ocupado")) {
    return OBJECTION_TYPES.TIMING;
  }
  if (lower.includes("sócio") || lower.includes("diretor") || lower.includes("marido") || lower.includes("esposa") || lower.includes("aprovação")) {
    return OBJECTION_TYPES.AUTHORITY;
  }
  if (lower.includes("não quero") || lower.includes("não temos interesse") || lower.includes("não preciso")) {
    return OBJECTION_TYPES.NO_INTEREST;
  }
  if (lower.includes("como funciona") || lower.includes("me manda mais detalhes") || lower.includes("me manda proposta")) {
    return OBJECTION_TYPES.NEED_MORE_INFO;
  }
  if (lower.includes("já temos agência") || lower.includes("já temos quem faz") || lower.includes("já temos site")) {
    return OBJECTION_TYPES.COMPETITOR;
  }

  return OBJECTION_TYPES.UNKNOWN;
};

export const generateCopilotReplySuggestion = (lastMessageText = "", company = {}) => {
  const objection = detectObjectionInMessage(lastMessageText);
  const companyName = company.name || "empresa";
  const hasWebsite = Boolean(company.website && String(company.website).trim() !== "");

  // Respostas 100% Humanas (Metodologia Prospectagram + Gabriel Miranda)
  if (objection.id === "PRICE") {
    return {
      objection,
      suggestedReply: `Cara, sem estresse! Uma página rápida pra receber orçamento no WhatsApp fica em torno de R$ 1.500 a R$ 2.500 parcela única, sem mensalidade presa. Quer que eu te mande um print do modelo pra ver se faz sentido pro seu caso?`
    };
  }
  if (objection.id === "NO_INTEREST") {
    return {
      objection,
      suggestedReply: `Tranquilo, sem crise nenhuma! É porque vocês já tão com a agenda cheia por aí ou porque já tiveram alguma experiência ruim antes?`
    };
  }
  if (objection.id === "NEED_MORE_INFO") {
    return {
      objection,
      suggestedReply: `Mando sim! Só me diz uma coisa rápida pra eu te mandar o que for mais certeiro: hoje o foco de vocês seria aparecer no Google pra quem busca na cidade ou passar mais autoridade pra quem já chega no Whats?`
    };
  }
  if (objection.id === "COMPETITOR") {
    return {
      objection,
      suggestedReply: `Ah que massa! E eles tão conseguindo colocar vocês no topo do Google quando alguém pesquisa na cidade, ou tão mais cuidando das postagens de Instagram?`
    };
  }
  if (objection.id === "TIMING") {
    return {
      objection,
      suggestedReply: `Com certeza, imagino a correria! Qual seria um dia mais tranquilo pra gente trocar 5 minutinhos — na terça ou na quinta que vem?`
    };
  }
  if (objection.id === "AUTHORITY") {
    return {
      objection,
      suggestedReply: `Show de bola! Quer que eu te mande o print do rascunho pra você mostrar pra ele? Fica bem mais fácil de visualizar como ficaria no celular.`
    };
  }

  return {
    objection: OBJECTION_TYPES.UNKNOWN,
    suggestedReply: hasWebsite
      ? `Show! Posso te mandar um videozinho rápido de 40s mostrando exatamente onde dá pra melhorar a conversão do site de vocês?`
      : `Legal! Quer que eu te mande um print do modelo de página que rascunhei pra ${companyName} no WhatsApp?`
  };
};

export const summarizeConversationHistory = (messages = [], company = {}) => {
  if (!messages || messages.length === 0) {
    return "Nenhuma mensagem trocada até o momento.";
  }

  const inboundCount = messages.filter(m => m.direction === "INBOUND").length;
  const outboundCount = messages.filter(m => m.direction === "OUTBOUND").length;
  const lastMsg = messages[messages.length - 1];

  return `Resumo SDR: ${inboundCount} mensagem(ns) recebida(s) e ${outboundCount} enviada(s). Última interação do prospect: "${lastMsg?.content?.substring(0, 70)}...". Próxima ação recomendada: Conduzir com pergunta de qualificação antes de agendar reunião.`;
};
