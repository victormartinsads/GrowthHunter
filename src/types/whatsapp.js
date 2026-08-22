/**
 * GrowthHunter — WhatsApp Business Integration Types & Constants
 */

export const MESSAGE_DIRECTION = {
  INBOUND: "INBOUND",
  OUTBOUND: "OUTBOUND"
};

export const MESSAGE_TYPES = {
  TEXT: "TEXT",
  IMAGE: "IMAGE",
  VIDEO: "VIDEO",
  AUDIO: "AUDIO",
  DOCUMENT: "DOCUMENT",
  LOCATION: "LOCATION",
  CONTACT: "CONTACT",
  TEMPLATE: "TEMPLATE",
  SYSTEM: "SYSTEM"
};

export const MESSAGE_STATUS = {
  QUEUED: "QUEUED",
  SENT: "SENT",
  DELIVERED: "DELIVERED",
  READ: "READ",
  FAILED: "FAILED"
};

export const CONVERSATION_STATUS = {
  OPEN: "OPEN",
  PENDING: "PENDING",
  RESOLVED: "RESOLVED",
  ARCHIVED: "ARCHIVED"
};

export const OBJECTION_TYPES = {
  PRICE: { id: "PRICE", label: "Preço / Custo Elevado", suggestedAngle: "Focar no ROI e retorno do investimento em novos clientes gerados pelo site." },
  TIMING: { id: "TIMING", label: "Sem Tempo / Momento Inoportuno", suggestedAngle: "Oferecer processo 100% turnkey onde a agência cuida de todo o projeto." },
  AUTHORITY: { id: "AUTHORITY", label: "Precisa Falar com Sócio/Diretor", suggestedAngle: "Mandar vídeo-diagnóstico rápido para ser repassado ao decisor." },
  NO_INTEREST: { id: "NO_INTEREST", label: "Sem Interesse Atual", suggestedAngle: "Apresentar caso de sucesso do mesmo segmento na região." },
  NEED_MORE_INFO: { id: "NEED_MORE_INFO", label: "Quer Mais Detalhes / Proposta", suggestedAngle: "Enviar proposta resumida de 1 página com prazos e entregáveis." },
  COMPETITOR: { id: "COMPETITOR", label: "Já Tem Responsável / Agência", suggestedAngle: "Posicionar como auditoria especializada em taxa de conversão." },
  UNKNOWN: { id: "UNKNOWN", label: "Sem Objeção Identificada", suggestedAngle: "Conduzir para agendamento de reunião curta de 10 minutos." }
};
