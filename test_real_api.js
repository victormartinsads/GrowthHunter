async function testAlternativeAPIs() {
  const niche = "odontologia";
  const city = "campinas";
  const state = "sp";

  // 1. Transparência CC
  console.log("Testando Transparência CC...");
  try {
    const res = await fetch(`https://api.transparencia.cc/v1/companies?query=${niche}+${city}`);
    console.log("Transparencia CC status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("Transparencia CC OK:", data);
    }
  } catch (e) {
    console.log("Transparencia CC erro:", e.message);
  }

  // 2. CNPJ.rocks / CNPJ.ws
  console.log("Testando CNPJ.ws...");
  try {
    const res = await fetch(`https://publica.cnpj.ws/cnpj/30680829000143`);
    console.log("CNPJ.ws status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("CNPJ.ws OK:", data.razao_social);
    }
  } catch (e) {
    console.log("CNPJ.ws erro:", e.message);
  }

  // 3. BrasilAPI (Direto)
  console.log("Testando BrasilAPI...");
  try {
    const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/65753556000102`, {
      headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" }
    });
    console.log("BrasilAPI status:", res.status);
    if (res.ok) {
      const data = await res.json();
      console.log("BrasilAPI 65753556000102 Razao Social REAL:", data.razao_social);
      console.log("BrasilAPI Socios REAIS:", data.qsa);
      console.log("BrasilAPI Telefone REAL:", data.ddd_telefone_1);
      console.log("BrasilAPI Endereco REAL:", data.logradouro, data.numero, data.bairro, data.municipio);
    }
  } catch (e) {
    console.log("BrasilAPI erro:", e.message);
  }
}

testAlternativeAPIs();
