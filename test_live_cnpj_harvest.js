import * as cheerio from "cheerio";

async function fetchRealCnpjFromBrasilApi(cnpj) {
  const clean = cnpj.replace(/\D/g, "");
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${clean}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
      }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (e) {
    console.error("BrasilAPI erro:", e.message);
  }
  return null;
}

async function findCnpjForBusiness(businessName, city, state) {
  const query = `"${businessName}" "${city}" "${state}" "CNPJ"`;
  console.log(`Buscando CNPJ real para: ${businessName} em ${city}...`);

  try {
    const searchUrl = `https://www.bing.com/search?q=${encodeURIComponent(query)}&setlang=pt-BR&count=10`;
    const res = await fetch(searchUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        "Accept-Language": "pt-BR,pt;q=0.9"
      }
    });

    if (res.ok) {
      const html = await res.text();
      const $ = cheerio.load(html);
      let foundCnpj = null;

      $("li.b_algo").each((i, el) => {
        if (foundCnpj) return;
        const text = $(el).text();
        const match = text.match(/\b(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})\b/) || text.match(/\b(\d{14})\b/);
        if (match) {
          const clean = (match[1] || match[2]).replace(/\D/g, "");
          if (clean.length === 14 && clean !== "00000000000000") {
            foundCnpj = clean;
          }
        }
      });

      return foundCnpj;
    }
  } catch (e) {
    console.error("Erro search:", e.message);
  }
  return null;
}

async function test() {
  const sampleBusinesses = [
    { name: "Sorridents", city: "Campinas", state: "SP" },
    { name: "OdontoCompany", city: "Campinas", state: "SP" },
    { name: "Orthopride", city: "Campinas", state: "SP" }
  ];

  for (const b of sampleBusinesses) {
    const cnpj = await findCnpjForBusiness(b.name, b.city, b.state);
    console.log(`Resultado para ${b.name}: CNPJ=${cnpj}`);
    if (cnpj) {
      const officialData = await fetchRealCnpjFromBrasilApi(cnpj);
      if (officialData) {
        console.log(`🏛️ DADOS 100% REAIS RECEITA FEDERAL:`);
        console.log(`- Razão Social: ${officialData.razao_social}`);
        console.log(`- Sócios:`, officialData.qsa?.map(s => `${s.nome_socio} (${s.qualificacao_socio})`));
        console.log(`- Telefone:`, officialData.ddd_telefone_1);
        console.log(`- CNAE:`, officialData.cnae_fiscal_descricao);
        console.log(`- Endereço:`, `${officialData.logradouro}, ${officialData.numero} - ${officialData.bairro}, ${officialData.municipio}/${officialData.uf}`);
      }
    }
  }
}

test();
