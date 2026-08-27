/**
 * Serviço de Integração com a Base Nacional de CNPJ (Receita Federal)
 * 100% Gratuito / Sem Chave de API Paga
 */

const BACKEND_URL = "http://localhost:3001";

/**
 * Formata um CNPJ cru para a máscara XX.XXX.XXX/XXXX-XX
 */
export function formatCnpj(cnpj = "") {
  const digits = String(cnpj).replace(/\D/g, "");
  if (digits.length !== 14) return cnpj;
  return digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
}

/**
 * Validação simples de formato de CNPJ
 */
export function isValidCnpj(cnpj = "") {
  const digits = String(cnpj).replace(/\D/g, "");
  return digits.length === 14;
}

/**
 * Consulta dados completos de um único CNPJ na Receita Federal
 */
export async function lookupCnpj(cnpj) {
  const clean = String(cnpj).replace(/\D/g, "");
  if (clean.length !== 14) {
    throw new Error("CNPJ inválido. Digite os 14 dígitos.");
  }

  const res = await fetch(`${BACKEND_URL}/api/cnpj/lookup/${clean}`);
  const data = await res.json();

  if (!res.ok || !data.success) {
    throw new Error(data.error || "Não foi possível localizar o CNPJ.");
  }

  return data.company;
}

/**
 * Busca em lote de CNPJs por Nicho/CNAE, Estado e Cidade
 */
export async function searchCnpjCompanies({
  niche = "",
  cnae = "",
  state = "SP",
  city = "",
  onlyActive = true,
  onlyWithPhone = true,
  limit = 20
}) {
  const res = await fetch(`${BACKEND_URL}/api/cnpj/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      niche,
      cnae,
      state,
      city,
      onlyActive,
      onlyWithPhone,
      limit
    })
  });

  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Erro na busca de empresas por CNPJ.");
  }

  return data.companies || [];
}

/**
 * Lista de CNAEs populares
 */
export async function fetchPopularCnaes() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/cnpj/cnaes`);
    const data = await res.json();
    return data.cnaes || [];
  } catch (err) {
    console.warn("Erro ao buscar CNAEs populares:", err);
    return [];
  }
}

/**
 * Converte um objeto retornado da Receita Federal para o formato padrão de Lead do GrowthHunter
 */
export function convertCnpjToLead(cnpjCompany, customNiche = "") {
  const mainPartner = (cnpjCompany.socios && cnpjCompany.socios.length > 0)
    ? cnpjCompany.socios[0].nome
    : "Sócio / Administrador";

  const allPartnersNames = (cnpjCompany.socios || [])
    .map(s => s.nome)
    .filter(Boolean)
    .join(", ");

  const phone = cnpjCompany.contatos?.whatsapp_phone || 
                (cnpjCompany.contatos?.telefone1 ? `55${cnpjCompany.contatos.telefone1.replace(/\D/g, '')}` : "");

  const companyName = cnpjCompany.nome_fantasia || cnpjCompany.razao_social || "Empresa Sem Nome";
  const niche = customNiche || cnpjCompany.cnae_fiscal_descricao || "Comércio & Serviços";
  const city = cnpjCompany.endereco?.municipio || "";
  const neighborhood = cnpjCompany.endereco?.bairro || "";
  const uf = cnpjCompany.endereco?.uf || "";

  return {
    id: `cnpj_${cnpjCompany.cnpj}_${Date.now()}`,
    cnpj: cnpjCompany.cnpj_formatted || formatCnpj(cnpjCompany.cnpj),
    name: companyName,
    razao_social: cnpjCompany.razao_social,
    nome_fantasia: cnpjCompany.nome_fantasia,
    phone: phone,
    email: cnpjCompany.contatos?.email || "",
    niche: niche,
    category: niche,
    city: city,
    state: uf,
    neighborhood: neighborhood,
    full_address: `${cnpjCompany.endereco?.logradouro || ""}, ${cnpjCompany.endereco?.numero || ""} - ${neighborhood}, ${city}/${uf} - CEP ${cnpjCompany.endereco?.cep || ""}`,
    website: "",
    presence_type: "none",
    status: "Novo Lead",
    pipeline_stage: "NEW",
    source: "Receita Federal (Base CNPJ)",
    rating: 4.8,
    review_count: 12,
    capital_social: cnpjCompany.capital_social || 0,
    porte: cnpjCompany.porte || "Micro Empresa",
    natureza_juridica: cnpjCompany.natureza_juridica || "",
    data_abertura: cnpjCompany.data_abertura || "",
    situacao_cadastral: cnpjCompany.situacao_cadastral || "ATIVA",
    cnae_codigo: cnpjCompany.cnae_fiscal || "",
    cnae_descricao: cnpjCompany.cnae_fiscal_descricao || "",
    socios: cnpjCompany.socios || [],
    decisor_nome: mainPartner,
    socios_lista: allPartnersNames,
    notes: `🏛️ Base Oficial da Receita Federal • CNPJ: ${cnpjCompany.cnpj_formatted || cnpjCompany.cnpj} • Situação: ${cnpjCompany.situacao_cadastral || "ATIVA"} • Sócios: ${allPartnersNames || "Não informado"} • Capital Social: R$ ${(cnpjCompany.capital_social || 0).toLocaleString("pt-BR")}`
  };
}
