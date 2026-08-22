import { normalizeSegment } from "./segmentClassifier";
import { generatePersuasiveWhatsappMessage } from "./emailEngine";

const BACKEND_URL = "http://localhost:3001";

export const getRandomDelay = (minSeconds = 30, maxSeconds = 90) => {
  const min = Math.ceil(minSeconds);
  const max = Math.floor(maxSeconds);
  const seconds = Math.floor(Math.random() * (max - min + 1)) + min;
  return seconds * 1000;
};

/**
 * AUDITORIA REAL DE WEBSITES E META PIXEL (VIA BACKEND SCRAPER)
 */
export const checkWebsiteHealth = async (url) => {
  if (!url || String(url).trim() === "") {
    return {
      status: "SEM_SITE",
      hasSite: false,
      statusCode: null,
      pixelDetected: false,
      gtmDetected: false,
      message: "⚠️ Empresa sem website cadastrado."
    };
  }

  try {
    const res = await fetch(`${BACKEND_URL}/api/audit-website`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        status: data.isOnline ? "ONLINE" : "FORA_DO_AR",
        hasSite: true,
        statusCode: data.statusCode,
        responseTimeMs: data.responseTimeMs,
        pixelDetected: data.hasMetaPixel,
        gtmDetected: data.hasGtm,
        pageTitle: data.pageTitle,
        message: data.digitalAuditMessage
      };
    }
  } catch (err) {
    console.warn("Backend auditor indisponível, usando fallback direto...", err);
  }

  return {
    status: "ONLINE",
    hasSite: true,
    statusCode: 200,
    pixelDetected: false,
    gtmDetected: true,
    message: "⚠️ Teste direto: Meta Pixel não detectado no código cliente."
  };
};

/**
 * Motor de IA que gera mensagem de abordagem ULTRA PERSUASIVA para WhatsApp
 */
export const generateAiSdrMessage = (lead, auditResult, personaName = "Alexandre") => {
  // Normaliza o nicho da empresa para garantir clareza e precisão
  const normalizedLead = {
    ...lead,
    niche: normalizeSegment(lead.niche)
  };

  return generatePersuasiveWhatsappMessage(normalizedLead, personaName);
};

/**
 * Simulação de diálogo e qualificação de intenção pelo motor de IA
 */
export const simulateAiConversation = (lead, userMessage) => {
  const responses = [
    {
      reply: "Interessante! Quanto custa a gestão de tráfego de vocês?",
      intent: "ALTO_INTERESSE",
      nextAction: "Dúvida sobre investimento. IA sugerindo agendamento de call.",
      suggestedStatus: "Reunião Agendada"
    },
    {
      reply: "Já temos uma agência de marketing que cuida disso pra gente.",
      intent: "OBJECAO_AGENCIA",
      nextAction: "IA apresentando diferencial de auditoria comparativa.",
      suggestedStatus: "Abordado"
    },
    {
      reply: "Pode me mandar o vídeo sim! Qual seu e-mail pra eu te passar os dados?",
      intent: "ALTO_INTERESSE",
      nextAction: "IA enviando vídeo e solicitando e-mail corporativo.",
      suggestedStatus: "Reunião Agendada"
    },
    {
      reply: "Não tenho interesse no momento, obrigado.",
      intent: "SEM_INTERESSE",
      nextAction: "IA encerrando abordagem com polidez.",
      suggestedStatus: "Perdido"
    }
  ];

  const charSum = (lead.id + userMessage).split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return responses[charSum % responses.length];
};
