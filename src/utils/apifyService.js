/**
 * Serviço de Busca de Leads B2B via Apify API & Scraper de Lugares
 * Utiliza o Actor `compass/crawler-google-places` ou o Scraper local para extrair
 * empresas por Nicho e Cidade com Telefone, E-mail, Site e Endereço.
 */

const BACKEND_URL = "http://localhost:3001";

export const searchLeadsApify = async ({ niche, location, maxResults = 10, apifyToken = "" }) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/search-leads-apify`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        niche,
        location,
        maxResults,
        apifyToken
      })
    });

    if (res.ok) {
      const data = await res.json();
      return data;
    } else {
      const errData = await res.json();
      throw new Error(errData.error || "Erro na resposta da busca.");
    }
  } catch (err) {
    console.warn("Erro no backend auditor local, utilizando gerador direto de busca...", err);
    throw err;
  }
};
