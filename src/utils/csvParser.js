import Papa from "papaparse";

/**
 * Normaliza um número de telefone brasileiro para o formato WhatsApp (55 + DDD + Número)
 */
export const formatPhoneForWhatsapp = (phoneStr) => {
  if (!phoneStr) return "";
  let cleaned = String(phoneStr).replace(/\D/g, "");
  if (!cleaned) return "";
  
  // Se começar com 0, remove
  if (cleaned.startsWith("0")) {
    cleaned = cleaned.substring(1);
  }
  
  // Se não começar com 55 e tiver 10 ou 11 dígitos (com DDD)
  if (!cleaned.startsWith("55") && (cleaned.length === 10 || cleaned.length === 11)) {
    cleaned = "55" + cleaned;
  }
  
  return cleaned;
};

/**
 * Detecta automaticamente o mapeamento de colunas em um arquivo CSV
 */
export const autoDetectColumns = (headers) => {
  const mapping = {
    name: "",
    niche: "",
    city: "",
    neighborhood: "",
    state: "",
    phone: "",
    email: "",
    website: "",
    instagram: "",
    notes: ""
  };

  const lowerHeaders = headers.map(h => String(h).trim().toLowerCase());

  lowerHeaders.forEach((header, idx) => {
    const original = headers[idx];
    
    // Nome / Empresa
    if (!mapping.name && (header.includes("nome") || header.includes("empresa") || header.includes("razao") || header.includes("fantasia") || header.includes("title") || header.includes("company") || header.includes("business"))) {
      mapping.name = original;
    }
    // Nicho / Categoria / Ramo
    else if (!mapping.niche && (header.includes("nicho") || header.includes("categoria") || header.includes("ramo") || header.includes("setor") || header.includes("segmento") || header.includes("type") || header.includes("category"))) {
      mapping.niche = original;
    }
    // Cidade / Município
    else if (!mapping.city && (header.includes("cidade") || header.includes("municipio") || header.includes("city") || header.includes("town"))) {
      mapping.city = original;
    }
    // Bairro / Região
    else if (!mapping.neighborhood && (header.includes("bairro") || header.includes("regiao") || header.includes("distrito") || header.includes("suburb") || header.includes("neighborhood") || header.includes("zona"))) {
      mapping.neighborhood = original;
    }
    // Estado / UF
    else if (!mapping.state && (header.includes("estado") || header.includes("uf") || header.includes("state"))) {
      mapping.state = original;
    }
    // Telefone / WhatsApp / Celular
    else if (!mapping.phone && (header.includes("telef") || header.includes("whats") || header.includes("celular") || header.includes("fone") || header.includes("phone") || header.includes("mobile"))) {
      mapping.phone = original;
    }
    // Email
    else if (!mapping.email && (header.includes("email") || header.includes("e-mail") || header.includes("mail"))) {
      mapping.email = original;
    }
    // Site / URL
    else if (!mapping.website && (header.includes("site") || header.includes("url") || header.includes("web") || header.includes("domain"))) {
      mapping.website = original;
    }
    // Instagram
    else if (!mapping.instagram && (header.includes("insta") || header.includes("social") || header.includes("ig"))) {
      mapping.instagram = original;
    }
    // Observações / Notas
    else if (!mapping.notes && (header.includes("obs") || header.includes("nota") || header.includes("desc") || header.includes("comment"))) {
      mapping.notes = original;
    }
  });

  // Se não achou 'name', pega a primeira coluna
  if (!mapping.name && headers.length > 0) {
    mapping.name = headers[0];
  }

  return mapping;
};

/**
 * Converte linhas do CSV em objetos de Lead padronizados
 */
export const mapCsvRowsToLeads = (rows, mapping, defaultNiche = "Geral", defaultCity = "Geral") => {
  return rows
    .filter(row => {
      // Ignora linhas totalmente vazias
      return row && Object.values(row).some(val => val !== null && val !== undefined && String(val).trim() !== "");
    })
    .map((row, index) => {
      const name = row[mapping.name] ? String(row[mapping.name]).trim() : `Lead #${index + 1}`;
      const rawPhone = mapping.phone && row[mapping.phone] ? String(row[mapping.phone]) : "";
      const phone = formatPhoneForWhatsapp(rawPhone);
      
      const niche = mapping.niche && row[mapping.niche] 
        ? String(row[mapping.niche]).trim() 
        : defaultNiche;
        
      const city = mapping.city && row[mapping.city] 
        ? String(row[mapping.city]).trim() 
        : defaultCity;
        
      const neighborhood = mapping.neighborhood && row[mapping.neighborhood] 
        ? String(row[mapping.neighborhood]).trim() 
        : "";
        
      const state = mapping.state && row[mapping.state] 
        ? String(row[mapping.state]).trim().toUpperCase() 
        : "";

      return {
        id: `csv-${Date.now()}-${index}-${Math.random().toString(36).substring(2, 7)}`,
        name,
        niche: niche || "Geral",
        city: city || "Geral",
        neighborhood: neighborhood || "",
        state: state || "",
        phone,
        email: mapping.email && row[mapping.email] ? String(row[mapping.email]).trim() : "",
        website: mapping.website && row[mapping.website] ? String(row[mapping.website]).trim() : "",
        instagram: mapping.instagram && row[mapping.instagram] ? String(row[mapping.instagram]).trim() : "",
        address: `${neighborhood ? neighborhood + ', ' : ''}${city}${state ? ' - ' + state : ''}`,
        lat: null,
        lng: null,
        status: "Novo Lead",
        digitalAudit: "Análise Pendente",
        notes: mapping.notes && row[mapping.notes] ? String(row[mapping.notes]).trim() : "",
        createdAt: new Date().toISOString(),
        lastContactDate: null
      };
    });
};

/**
 * Exporta array de leads para download em CSV
 */
export const exportLeadsToCsv = (leads, filename = "leads_prospeccao.csv") => {
  const exportData = leads.map(l => ({
    "Nome / Empresa": l.name,
    "Nicho": l.niche,
    "Cidade": l.city,
    "Bairro": l.neighborhood || "",
    "Estado": l.state || "",
    "Telefone / WhatsApp": l.phone,
    "Email": l.email || "",
    "Website": l.website || "",
    "Instagram": l.instagram || "",
    "Status no Funil": l.status,
    "Auditoria de Tráfego": l.digitalAudit || "",
    "Observações": l.notes || "",
    "Data de Cadastro": l.createdAt ? new Date(l.createdAt).toLocaleDateString('pt-BR') : ""
  }));

  const csv = Papa.unparse(exportData, { delimiter: ";" });
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
