/**
 * Classificador Inteligente de Segmentos & Nichos B2B
 * Normaliza textos brutos de CSV ou descrições longas de CNAE da Receita Federal
 * para nichos comerciais claros e atraentes.
 */

const SEGMENT_MAPPINGS = [
  { keywords: ["dento", "odontolog", "dentist", "ortodont", "implant"], label: "Odontologia & Saúde Dental" },
  { keywords: ["estetic", "dermatol", "depilac", "sobrancelha", "harmoniz", "spa", "cosmetic"], label: "Clínica de Estética & Harmonização" },
  { keywords: ["academ", "fit", "crossfit", "pilates", "personal", "treino", "musculac"], label: "Academias & Studio Fitness" },
  { keywords: ["imobil", "corretor", "imovel", "construtor", "incorporad"], label: "Imobiliária & Construtora" },
  { keywords: ["restauran", "bar", "pizza", "hamburgu", "sushi", "buffet", "gastro", "lanchon"], label: "Restaurantes & Gastronomia" },
  { keywords: ["solar", "fotovolt", "energ"], label: "Energia Solar & Fotovoltaica" },
  { keywords: ["autoescola", "cnh", "condutor", "cfc"], label: "Autoescola & CFC" },
  { keywords: ["escola", "curso", "colegio", "educac", "idioma", "ingles"], label: "Escolas & Cursos Profissionalizantes" },
  { keywords: ["advog", "juridic", "direit", "advocac"], label: "Advocacia & Consultoria Jurídica" },
  { keywords: ["mecanic", "auto", "oficina", "pneu", "funilaria", "motopeza"], label: "Oficina Mecânica & Auto Center" },
  { keywords: ["vet", "pet", "animal", "racao"], label: "Pet Shop & Clínica Veterinária" },
  { keywords: ["contab", "fiscal", "financeir", "tribut"], label: "Contabilidade & Gestão Financeira" },
  { keywords: ["optica", "oculos", "visan"], label: "Óticas & Saúde Visual" },
  { keywords: ["moveis", "planejad", "marcenar", "decorac"], label: "Móveis Planejados & Arquitetura" }
];

export const normalizeSegment = (rawNiche) => {
  if (!rawNiche || typeof rawNiche !== "string" || rawNiche.trim() === "") {
    return "Serviços Gerais";
  }

  const text = rawNiche.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  for (const item of SEGMENT_MAPPINGS) {
    if (item.keywords.some(kw => text.includes(kw))) {
      return item.label;
    }
  }

  // Se for uma frase muito longa de CNAE (ex: "47.11-3-02 - Comércio Varejista..."), simplifica
  if (rawNiche.length > 30) {
    const parts = rawNiche.split("-");
    const clean = parts[parts.length - 1].trim();
    return clean.charAt(0).toUpperCase() + clean.slice(1).toLowerCase();
  }

  return rawNiche.trim();
};
