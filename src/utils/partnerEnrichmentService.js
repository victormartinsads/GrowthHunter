/**
 * Serviço de Enriquecimento de Sócios (QSA) & CNPJ via Receita Federal
 */

const BACKEND_URL = "http://localhost:3001";

export const enrichLeadPartnersAndCnpj = async (lead) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/enrich-cnpj-qsa`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        cnpj: lead.cnpj || "",
        name: lead.name || "",
        city: lead.city || ""
      })
    });

    if (res.ok) {
      const data = await res.json();
      return {
        cnpj: data.cnpj || lead.cnpj,
        razaoSocial: data.razaoSocial || lead.name,
        officialEmail: data.email || lead.email,
        officialPhone: (data.phones && data.phones[0]) ? data.phones[0] : lead.phone,
        partners: data.partners || [],
        capitalSocial: data.capitalSocial || "",
        address: data.address || lead.address,
        situation: data.situation || "ATIVA"
      };
    } else {
      const errData = await res.json();
      throw new Error(errData.error || "Não foi possível localizar o CNPJ/Sócios.");
    }
  } catch (err) {
    console.warn("Erro ao buscar sócios e CNPJ:", err);
    throw err;
  }
};

export const fetchCnpjQsaPartners = enrichLeadPartnersAndCnpj;
