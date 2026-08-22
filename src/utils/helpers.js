/**
 * Utilitários auxiliares para formatação perfeita de links de WhatsApp e Instagram
 */

/**
 * Limpa e formata qualquer entrada de telefone para um link do WhatsApp 100% válido.
 * Aceita: "(11) 99999-8888", "11999998888", "5511999998888", "+55 11 99999-8888", "https://wa.me/5511..."
 */
export const cleanPhoneDigits = (phoneStr) => {
  if (!phoneStr) return "";
  let cleaned = String(phoneStr).replace(/\D/g, "");
  if (!cleaned) return "";

  // Se começar com 0 (ex: 011999998888), remove o 0
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }

  // Se for número do Brasil com 10 ou 11 dígitos (DDD + Número sem 55)
  if (!cleaned.startsWith("55") && (cleaned.length === 10 || cleaned.length === 11)) {
    cleaned = "55" + cleaned;
  }

  return cleaned;
};

/**
 * Gera URL oficial do WhatsApp (wa.me) tratada com mensagem opcional
 */
export const buildWhatsappUrl = (phoneStr, messageText = "") => {
  const digits = cleanPhoneDigits(phoneStr);
  if (!digits) return null;

  const baseUrl = `https://wa.me/${digits}`;
  if (messageText) {
    const encoded = encodeURIComponent(messageText);
    return `${baseUrl}?text=${encoded}`;
  }
  return baseUrl;
};

/**
 * Formata um link de Instagram de forma robusta.
 * Aceita: "@usuario", "usuario", "https://instagram.com/usuario", "instagram.com/usuario"
 * Se não houver instagram cadastrado, gera um link de busca no Instagram pelo nome da empresa.
 */
export const buildInstagramUrl = (instagramInput, companyName = "") => {
  if (!instagramInput || String(instagramInput).trim() === "") {
    if (companyName) {
      return `https://www.instagram.com/explore/search/keyword/?q=${encodeURIComponent(companyName)}`;
    }
    return null;
  }

  let str = String(instagramInput).trim();

  // Se já for URL completa
  if (str.startsWith("http://") || str.startsWith("https://")) {
    return str;
  }

  // Se começar com instagram.com ou www.instagram.com
  if (str.startsWith("instagram.com") || str.startsWith("www.instagram.com")) {
    return `https://${str}`;
  }

  // Remove @ inicial e espaços
  const handle = str.replace(/^@/, "").replace(/\s+/g, "");
  return `https://www.instagram.com/${handle}/`;
};

/**
 * Formata um link de Website garantindo protocolo http/https
 */
export const buildWebsiteUrl = (urlInput) => {
  if (!urlInput || String(urlInput).trim() === "") return null;
  let str = String(urlInput).trim();
  if (!str.startsWith("http://") && !str.startsWith("https://")) {
    return `https://${str}`;
  }
  return str;
};
