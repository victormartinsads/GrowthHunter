/**
 * GrowthHunter — Serviço de Dados Supabase
 * Substitui o localStorage como camada de persistência.
 * Todas as operações de CRUD de leads passam por aqui.
 */
import { supabase } from "./supabase";

// Chave legada do localStorage (para migração inicial)
const LEGACY_KEY = "growthhunter_companies_v5";

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

/** Converte o objeto company do frontend para o schema do banco */
function toDbRow(company) {
  return {
    id:             String(company.id),
    name:           company.name           || "",
    phone:          company.phone          || "",
    email:          company.email          || "",
    niche:          company.niche          || "",
    city:           company.city           || "",
    neighborhood:   company.neighborhood   || "",
    website:        company.website        || "",
    rating:         Number(company.rating) || 0,
    review_count:   Number(company.review_count || company.reviewsCount) || 0,
    instagram:      company.instagram      || "",
    status:         company.status         || "Novo Lead",
    notes:          company.notes          || "",
    digital_audit:  company.digitalAudit   || "",
    pipeline_stage: company.pipeline_stage || company.pipelineStage || "prospecting",
    website_score:  company.websiteScore   || company.website_score  || null,
    tech_results:   company.techResults    || company.tech_results   || null,
    lead_score:     company.leadScore      || company.lead_score     || null,
    ai_analysis:    company.aiAnalysis     || company.ai_analysis    || null,
    opportunities:  company.opportunities  || null,
    enriched:       Boolean(company.enriched),
  };
}

/** Converte o row do banco para o formato do frontend */
function fromDbRow(row) {
  return {
    ...row,
    reviewsCount:   row.review_count,
    digitalAudit:   row.digital_audit,
    pipelineStage:  row.pipeline_stage,
    websiteScore:   row.website_score,
    techResults:    row.tech_results,
    leadScore:      row.lead_score,
    aiAnalysis:     row.ai_analysis,
  };
}

// ─────────────────────────────────────────────────────────────────
// READ
// ─────────────────────────────────────────────────────────────────

/** Busca todos os leads do banco */
export async function fetchAllCompanies() {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[Supabase] fetchAllCompanies error:", error.message);
    return [];
  }
  return (data || []).map(fromDbRow);
}

/** Busca um lead por ID */
export async function fetchCompanyById(id) {
  const { data, error } = await supabase
    .from("companies")
    .select("*")
    .eq("id", String(id))
    .single();

  if (error) {
    console.error("[Supabase] fetchCompanyById error:", error.message);
    return null;
  }
  return data ? fromDbRow(data) : null;
}

// ─────────────────────────────────────────────────────────────────
// WRITE
// ─────────────────────────────────────────────────────────────────

/** Insere ou atualiza um lead (upsert por id) */
export async function upsertCompany(company) {
  const row = toDbRow(company);
  const { data, error } = await supabase
    .from("companies")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    console.error("[Supabase] upsertCompany error:", error.message);
    return null;
  }
  return data ? fromDbRow(data) : null;
}

/** Insere vários leads de uma vez (upsert em batch) */
export async function upsertManyCompanies(companies) {
  if (!companies || companies.length === 0) return [];
  const rows = companies.map(toDbRow);

  const { data, error } = await supabase
    .from("companies")
    .upsert(rows, { onConflict: "id" })
    .select();

  if (error) {
    console.error("[Supabase] upsertManyCompanies error:", error.message);
    return [];
  }
  return (data || []).map(fromDbRow);
}

/** Atualiza campos específicos de um lead */
export async function updateCompany(id, fields) {
  const { data, error } = await supabase
    .from("companies")
    .update(fields)
    .eq("id", String(id))
    .select()
    .single();

  if (error) {
    console.error("[Supabase] updateCompany error:", error.message);
    return null;
  }
  return data ? fromDbRow(data) : null;
}

/** Remove um lead */
export async function deleteCompany(id) {
  const { error } = await supabase
    .from("companies")
    .delete()
    .eq("id", String(id));

  if (error) {
    console.error("[Supabase] deleteCompany error:", error.message);
    return false;
  }
  return true;
}

/** Remove todos os leads (limpar banco) */
export async function deleteAllCompanies() {
  const { error } = await supabase
    .from("companies")
    .delete()
    .neq("id", "__never__"); // deleta tudo

  if (error) {
    console.error("[Supabase] deleteAllCompanies error:", error.message);
    return false;
  }
  return true;
}

// ─────────────────────────────────────────────────────────────────
// MIGRAÇÃO: localStorage → Supabase
// ─────────────────────────────────────────────────────────────────

/**
 * Migra dados do localStorage para o Supabase (roda uma única vez).
 * Retorna { migrated: N } ou { migrated: 0 } se não havia dados.
 */
export async function migrateFromLocalStorage() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return { migrated: 0 };

    const local = JSON.parse(raw);
    if (!Array.isArray(local) || local.length === 0) return { migrated: 0 };

    console.log(`[Migration] Encontrados ${local.length} leads no localStorage. Migrando para Supabase...`);

    // Garante IDs únicos e em formato string
    const prepared = local.map((c, idx) => ({
      ...c,
      id: c.id ? String(c.id) : `migrated_${Date.now()}_${idx}`,
    }));

    const result = await upsertManyCompanies(prepared);

    // Marca migração como concluída
    localStorage.setItem("growthhunter_migrated_to_supabase", "true");
    localStorage.removeItem(LEGACY_KEY);

    console.log(`[Migration] ✅ ${result.length} leads migrados com sucesso!`);
    return { migrated: result.length };
  } catch (err) {
    console.error("[Migration] Erro durante migração:", err);
    return { migrated: 0, error: err.message };
  }
}

/** Verifica se a migração já foi feita */
export function isMigrationDone() {
  return localStorage.getItem("growthhunter_migrated_to_supabase") === "true";
}

// ─────────────────────────────────────────────────────────────────
// REAL-TIME (opcional)
// ─────────────────────────────────────────────────────────────────

/**
 * Assina mudanças em tempo real na tabela companies.
 * @param {Function} onInsert - callback para novos leads
 * @param {Function} onUpdate - callback para atualizações
 * @param {Function} onDelete - callback para remoções
 * @returns {RealtimeChannel} - canal para desinscrever depois
 */
export function subscribeToCompanies({ onInsert, onUpdate, onDelete } = {}) {
  return supabase
    .channel("companies-realtime")
    .on("postgres_changes", { event: "INSERT", schema: "public", table: "companies" },
      (payload) => onInsert && onInsert(fromDbRow(payload.new)))
    .on("postgres_changes", { event: "UPDATE", schema: "public", table: "companies" },
      (payload) => onUpdate && onUpdate(fromDbRow(payload.new)))
    .on("postgres_changes", { event: "DELETE", schema: "public", table: "companies" },
      (payload) => onDelete && onDelete(payload.old))
    .subscribe();
}
