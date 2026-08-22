/**
 * Serviço de Rastreamento Real de Empresas Brasileiras via APIs Públicas (BrasilAPI / MinhaReceita)
 * Busca por CNPJ, Nome, E-mail e Telefone real na Receita Federal e na Web.
 */

// Limpa caracteres especiais mantendo apenas números
export const cleanDigits = (str) => String(str || "").replace(/\D/g, "");

// Formata CNPJ (00.000.000/0001-00)
export const formatCnpj = (cnpj) => {
  const digits = cleanDigits(cnpj);
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
};

/**
 * Extrai o domínio de um endereço de e-mail (ex: contato@clinicadental.com.br -> clinicadental.com.br)
 * Ignora webmails públicos como gmail, hotmail, yahoo, outlook.
 */
export const extractDomainFromEmail = (email) => {
  if (!email || !email.includes("@")) return null;
  const domain = email.split("@")[1].toLowerCase().trim();
  const publicMailProviders = ["gmail.com", "hotmail.com", "yahoo.com", "outlook.com", "bol.com.br", "uol.com.br", "terra.com.br", "icloud.com"];
  if (publicMailProviders.includes(domain)) return null;
  return domain;
};

/**
 * Realiza consulta em tempo real no CNPJ via BrasilAPI ou MinhaReceita
 */
export const fetchCnpjDataReal = async (rawCnpj) => {
  const cnpjClean = cleanDigits(rawCnpj);
  if (!cnpjClean || cnpjClean.length !== 14) {
    throw new Error("CNPJ inválido. Digite 14 números.");
  }

  try {
    // Tenta primeiro a BrasilAPI
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpjClean}`);
    if (res.ok) {
      const data = await res.json();
      return parseBrasilApiResponse(data);
    }
  } catch (err) {
    console.warn("BrasilAPI falhou, tentando fallback MinhaReceita...", err);
  }

  // Fallback para MinhaReceita.org
  try {
    const res = await fetch(`https://minhareceita.org/${cnpjClean}`);
    if (res.ok) {
      const data = await res.json();
      return parseMinhaReceitaResponse(data);
    }
  } catch (err) {
    console.error("Erro nas APIs de CNPJ:", err);
  }

  throw new Error("Não foi possível localizar os dados deste CNPJ na Receita Federal.");
};

// Parser BrasilAPI
function parseBrasilApiResponse(data) {
  const name = data.nome_fantasia || data.razao_social;
  const email = data.email || "";
  const phone = data.ddd_telefone_1 ? `55${data.ddd_telefone_1.replace(/\D/g, '')}` : "";
  const niche = data.cnae_fiscal_descricao || "Geral";
  const city = data.municipio || "";
  const neighborhood = data.bairro || "";
  const state = data.uf || "";
  const address = `${data.logradouro || ''}, ${data.numero || ''} - ${neighborhood}, ${city} - ${state}`;

  // Extrai domínio do e-mail oficial da empresa se disponível
  const domainFromEmail = extractDomainFromEmail(email);
  const website = domainFromEmail ? `https://www.${domainFromEmail}` : "";

  return {
    cnpj: formatCnpj(data.cnpj),
    name: name,
    razaoSocial: data.razao_social,
    email: email,
    phone: phone,
    niche: niche,
    city: city,
    neighborhood: neighborhood,
    state: state,
    address: address,
    website: website,
    situation: data.descricao_situacao_cadastral || "ATIVA"
  };
}

// Parser MinhaReceita
function parseMinhaReceitaResponse(data) {
  const name = data.nome_fantasia || data.razao_social;
  const email = data.email || "";
  const phone = data.ddd_telefone_1 ? `55${data.ddd_telefone_1.replace(/\D/g, '')}` : "";
  
  const domainFromEmail = extractDomainFromEmail(email);
  const website = domainFromEmail ? `https://www.${domainFromEmail}` : "";

  return {
    cnpj: formatCnpj(data.cnpj),
    name: name,
    razaoSocial: data.razao_social,
    email: email,
    phone: phone,
    niche: data.cnae_fiscal_descricao || "Geral",
    city: data.municipio || "",
    neighborhood: data.bairro || "",
    state: data.uf || "",
    address: `${data.logradouro || ''}, ${data.numero || ''} - ${data.bairro || ''}, ${data.municipio || ''} - ${data.uf || ''}`,
    website: website,
    situation: data.descricao_situacao_cadastral || "ATIVA"
  };
}

/**
 * Encontra links diretos de redes sociais reais por Nome, E-mail, Telefone ou CNPJ
 */
export const buildRealSocialLinks = (lead) => {
  const queryTerm = encodeURIComponent(`${lead.name || ''} ${lead.city || ''} ${lead.niche || ''}`);
  
  // Extrai domínio se tiver e-mail corporativo
  const emailDomain = extractDomainFromEmail(lead.email);
  const probableWebsite = lead.website || (emailDomain ? `https://www.${emailDomain}` : null);

  return {
    googleSearch: `https://www.google.com/search?q=${queryTerm}`,
    googleMaps: `https://www.google.com/maps/search/${queryTerm}`,
    instagramSearch: `https://www.instagram.com/explore/search/keyword/?q=${queryTerm}`,
    facebookSearch: `https://www.facebook.com/search/top?q=${queryTerm}`,
    linkedinSearch: `https://www.linkedin.com/search/results/companies/?keywords=${queryTerm}`,
    metaAdsLibrary: `https://www.facebook.com/ads/library/?active_status=all&ad_type=all&country=BR&q=${queryTerm}`,
    probableWebsite
  };
};
