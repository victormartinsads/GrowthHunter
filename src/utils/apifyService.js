/**
 * Serviço de Busca de Leads B2B (Motor Próprio GrowthHunter & Apify)
 */

const BACKEND_URL = "http://localhost:3001";

/**
 * 🕷️ Motor Próprio de Scraping GrowthHunter (100% Gratuito / Ilimitado)
 */
export const searchLeadsNative = async ({ niche, location, maxResults = 30 }) => {
  try {
    const res = await fetch(`${BACKEND_URL}/api/search-leads-native`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        niche,
        location,
        maxResults
      })
    });

    if (res.ok) {
      return await res.json();
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Erro na resposta do motor próprio de busca.");
    }
  } catch (err) {
    console.error("Erro ao conectar com o motor próprio:", err);
    throw err;
  }
};

/**
 * 🚀 Buscador Apify (Google Places Actor com Token)
 */
export const searchLeadsApify = async ({ niche, location, maxResults = 25, apifyToken = "" }) => {
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
      return await res.json();
    } else {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || "Erro na resposta da busca Apify.");
    }
  } catch (err) {
    console.error("Erro ao conectar com o Apify:", err);
    throw err;
  }
};
