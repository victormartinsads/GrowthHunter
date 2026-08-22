-- GrowthHunter CRM — Schema Supabase
-- Execute no Supabase Dashboard > SQL Editor

-- ─────────────────────────────────────────────────────────────────
-- TABELA: companies (leads)
-- ─────────────────────────────────────────────────────────────────
create table if not exists public.companies (
  id              text primary key,
  name            text not null default '',
  phone           text default '',
  email           text default '',
  niche           text default '',
  city            text default '',
  neighborhood    text default '',
  website         text default '',
  rating          numeric(3,1) default 0,
  review_count    integer default 0,
  instagram       text default '',
  status          text default 'Novo Lead',
  notes           text default '',
  digital_audit   text default '',
  pipeline_stage  text default 'prospecting',

  -- Dados enriquecidos (JSON)
  website_score   jsonb default null,
  tech_results    jsonb default null,
  lead_score      jsonb default null,
  ai_analysis     jsonb default null,
  opportunities   jsonb default null,

  -- Controle
  enriched        boolean default false,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

-- Índices para performance
create index if not exists idx_companies_status   on public.companies(status);
create index if not exists idx_companies_niche    on public.companies(niche);
create index if not exists idx_companies_city     on public.companies(city);
create index if not exists idx_companies_pipeline on public.companies(pipeline_stage);
create index if not exists idx_companies_created  on public.companies(created_at desc);

-- Trigger: atualiza updated_at automaticamente
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_companies_updated_at on public.companies;
create trigger trg_companies_updated_at
  before update on public.companies
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- RLS (Row Level Security) — acesso público por ora
-- Habilite autenticação aqui quando virar SaaS multi-tenant
-- ─────────────────────────────────────────────────────────────────
alter table public.companies enable row level security;

-- Policy: permite tudo para usuários anônimos (ajuste quando tiver auth)
create policy "allow_all_anon" on public.companies
  for all
  using (true)
  with check (true);
