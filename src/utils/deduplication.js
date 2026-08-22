/**
 * GrowthHunter — Módulo de Normalização e Deduplicação de Empresas
 */

export const normalizeName = (name = "") => {
  return String(name)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
};

export const normalizePhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("55") && digits.length >= 12) return digits;
  if (digits.length >= 10) return `55${digits}`;
  return digits;
};

export const normalizeWebsite = (url = "") => {
  if (!url || typeof url !== "string") return { website: "", domain: "" };
  let cleanUrl = url.trim().toLowerCase();
  if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
    cleanUrl = `https://${cleanUrl}`;
  }
  try {
    const parsed = new URL(cleanUrl);
    const domain = parsed.hostname.replace(/^www\./, "");
    return { website: cleanUrl, domain };
  } catch (e) {
    return { website: cleanUrl, domain: cleanUrl.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] };
  }
};

export const generateCompanyHash = (company) => {
  const normName = normalizeName(company.name);
  const normPhone = normalizePhone(company.phone);
  const { domain } = normalizeWebsite(company.website);
  const placeId = company.google_place_id || company.place_id || "";

  if (placeId) return `place_${placeId}`;
  if (domain && !domain.includes("facebook.com") && !domain.includes("instagram.com")) return `domain_${domain}`;
  if (normPhone && normPhone.length >= 10) return `phone_${normPhone}`;
  
  const normCity = normalizeName(company.city || "");
  return `hash_${normName}_${normCity}`;
};

export const deduplicateCompanies = (existingCompanies = [], newCompanies = []) => {
  const companyHashMap = new Map();

  existingCompanies.forEach(comp => {
    const hash = comp.company_hash || generateCompanyHash(comp);
    companyHashMap.set(hash, comp);
  });

  const inserted = [];
  const duplicates = [];

  newCompanies.forEach(comp => {
    const hash = generateCompanyHash(comp);
    if (companyHashMap.has(hash)) {
      duplicates.push({ company: comp, existing: companyHashMap.get(hash), hash });
    } else {
      const enrichedComp = {
        ...comp,
        company_hash: hash,
        phone: normalizePhone(comp.phone),
        ...normalizeWebsite(comp.website)
      };
      companyHashMap.set(hash, enrichedComp);
      inserted.push(enrichedComp);
    }
  });

  return {
    uniqueCompanies: Array.from(companyHashMap.values()),
    inserted,
    duplicates,
    duplicateCount: duplicates.length
  };
};
