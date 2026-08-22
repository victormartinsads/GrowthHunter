import * as cheerio from "cheerio";

async function scrapeRealCityLeads(niche, location, maxResults = 30) {
  const baseCity = location.split(",")[0].trim();
  const state = location.includes(",") ? location.split(",")[1].trim() : "SP";

  console.log(`Buscando ${niche} em ${baseCity}, ${state}...`);

  const leads = [];
  const seen = new Set();

  // 1. OpenStreetMap Nominatim (Exact Brazilian City Places)
  try {
    const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(niche + ' ' + baseCity)}&format=json&addressdetails=1&limit=50`;
    const res = await fetch(osmUrl, {
      headers: { "User-Agent": "GrowthHunterLeadEngine/1.0 (contact@growthhunter.io)" }
    });
    if (res.ok) {
      const places = await res.json();
      for (const p of places) {
        if (leads.length >= maxResults) break;
        const addr = p.address || {};
        const name = p.name || addr.shop || addr.craft || addr.amenity || (niche + " " + (addr.suburb || addr.neighbourhood || baseCity));
        const cleanName = name.replace(/,\s*.*$/, "").trim();
        const norm = cleanName.toLowerCase();
        if (seen.has(norm) || cleanName.length < 3) continue;
        seen.add(norm);

        const neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || "";
        leads.push({
          name: cleanName,
          niche,
          city: baseCity,
          state,
          neighborhood,
          address: p.display_name,
          source: "OpenStreetMap Local"
        });
      }
    }
  } catch (e) {
    console.warn("OSM Error:", e.message);
  }

  // 2. Bing Search with strict location query
  const queries = [
    `"${niche}" "${baseCity}" "${state}" site:instagram.com`,
    `"${niche}" "${baseCity}" "${state}" whatsapp telefone`,
    `"${niche}" "${baseCity}" contato orçamento`,
    `"${niche}" em ${baseCity} ${state}`
  ];

  for (const q of queries) {
    if (leads.length >= maxResults) break;
    try {
      const url = `https://www.bing.com/search?q=${encodeURIComponent(q)}&setlang=pt-BR&count=50`;
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"
        }
      });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);

      $("li.b_algo").each((_, el) => {
        if (leads.length >= maxResults) return false;
        let rawTitle = $(el).find("h2 a").text().trim();
        let rawLink = $(el).find("h2 a").attr("href") || "";
        let rawSnippet = $(el).find(".b_caption p, .b_algoSlug, .b_snippet").text().trim();

        if (!rawTitle || rawTitle.length < 3) return;

        let cleanName = rawTitle
          .split("-")[0]
          .split("|")[0]
          .split(":")[0]
          .replace(/^Home\s*-?\s*/i, "")
          .replace(/\s*–\s*.*$/, "")
          .trim();

        const norm = cleanName.toLowerCase();
        if (seen.has(norm)) return;
        seen.add(norm);

        leads.push({
          name: cleanName,
          niche,
          city: baseCity,
          state,
          website: rawLink,
          snippet: rawSnippet,
          source: "Bing Web"
        });
      });
    } catch (e) {}
  }

  console.log(`TOTAL LEADS COMBINED: ${leads.length}`);
  console.log(leads.slice(0, 10));
}

scrapeRealCityLeads("marcenaria", "São Paulo, SP", 30);
