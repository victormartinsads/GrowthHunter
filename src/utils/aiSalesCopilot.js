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

  // Framework SDR: Investigação e Pergunta de Micro-CTA em vez de confrontação
  if (objection.id === "PRICE") {
    return {
      objection,
      suggestedReply: `Entendi! Quando você comenta sobre valor, é em relação ao orçamento disponível no momento ou ao retorno esperado com novos clientes?`
    };
  }
  if (objection.id === "NO_INTEREST") {
    return {
      objection,
      suggestedReply: `Tranquilo! Só para eu não insistir no assunto errado: hoje vocês já captam clientes do Google de outra forma ou essa expansão simplesmente não é uma prioridade agora?`
    };
  }
  if (objection.id === "NEED_MORE_INFO") {
    return {
      objection,
      suggestedReply: `Com certeza! Para eu te mandar algo realmente relevante sobre a ${companyName}: o que pesa mais para vocês nessa área hoje — ter mais contatos no WhatsApp ou um site mais rápido?`
    };
  }
  if (objection.id === "COMPETITOR") {
    return {
      objection,
      suggestedReply: `Perfeito! E vocês estão 100% satisfeitos com a taxa de conversão e a velocidade de carregamento do site atual no celular?`
    };
  }
  if (objection.id === "TIMING") {
    return {
      objection,
      suggestedReply: `Sem problemas! É porque essa captação não é prioridade agora ou vocês estão em outro momento da operação?`
    };
  }

  return {
    objection,
    suggestedReply: `Olá! Entendi o seu ponto. Analisando a presença da ${companyName}, notamos ótimas oportunidades para potencializar os contatos via WhatsApp. Faz sentido conversarmos em 5 minutos nesta semana?`
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
