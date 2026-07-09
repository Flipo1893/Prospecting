-- Stufe 1: Prospecting-Basis
-- Tabelle für gespeicherte Leads (Schweizer Gewerbe-/Handwerksbetriebe).
--
-- Erweiterungshinweis (Stufe 3, Investoren-Pipeline):
-- Für ein zweites Modul mit eigenen Status-Werten (Kontaktiert / Meeting /
-- Interessiert / Committed) empfiehlt sich eine eigene Tabelle "investors"
-- nach demselben Muster (siehe README, Abschnitt "Erweiterungspunkte"),
-- statt diese Tabelle zu verändern.

create extension if not exists "pgcrypto";

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,

  company_name text not null,
  canton text,
  industry text,
  legal_form text,

  -- Herkunft des Leads: 'zefix' (aus API-Suche) oder 'manual' (manuell erfasst).
  source text not null default 'manual',
  -- Zefix-UID/EHRAID zur Deduplizierung, falls über Zefix importiert.
  source_ref text,

  status text not null default 'Neu'
    constraint leads_status_check
    check (status in ('Neu', 'Angeschrieben', 'Interesse', 'Pilot', 'Abgelehnt')),

  notes text,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.leads is 'Prospecting-Leads (Schweizer KMU/Handwerksbetriebe) je Nutzer.';

create index if not exists leads_user_id_idx on public.leads (user_id);
create index if not exists leads_status_idx on public.leads (status);
create index if not exists leads_canton_idx on public.leads (canton);
create index if not exists leads_industry_idx on public.leads (industry);
-- Verhindert doppeltes Speichern desselben Zefix-Treffers durch denselben Nutzer.
create unique index if not exists leads_user_source_ref_idx
  on public.leads (user_id, source_ref)
  where source_ref is not null;

-- updated_at automatisch nachführen
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists leads_set_updated_at on public.leads;
create trigger leads_set_updated_at
  before update on public.leads
  for each row
  execute function public.set_updated_at();

-- Row Level Security: jede Person sieht/bearbeitet ausschliesslich eigene Leads.
alter table public.leads enable row level security;

drop policy if exists "leads_select_own" on public.leads;
create policy "leads_select_own" on public.leads
  for select using (auth.uid() = user_id);

drop policy if exists "leads_insert_own" on public.leads;
create policy "leads_insert_own" on public.leads
  for insert with check (auth.uid() = user_id);

drop policy if exists "leads_update_own" on public.leads;
create policy "leads_update_own" on public.leads
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "leads_delete_own" on public.leads;
create policy "leads_delete_own" on public.leads
  for delete using (auth.uid() = user_id);
