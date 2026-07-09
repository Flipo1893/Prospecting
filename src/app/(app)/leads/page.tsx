import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { FilterBar } from "@/components/filter-bar";
import { LeadListItem } from "@/components/lead-list-item";
import { LEAD_STATUSES } from "@/lib/constants/status";
import type { Lead } from "@/types/lead";

type SearchParams = {
  status?: string;
  canton?: string;
  industry?: string;
  sort?: string;
};

const SORT_MAP: Record<string, { column: string; ascending: boolean }> = {
  created_desc: { column: "created_at", ascending: false },
  created_asc: { column: "created_at", ascending: true },
  company_asc: { column: "company_name", ascending: true },
  status_asc: { column: "status", ascending: true },
};

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status, canton, industry, sort } = await searchParams;

  const supabaseConfigured = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );

  if (!supabaseConfigured) {
    return (
      <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 p-8 text-center text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
        Supabase ist noch nicht konfiguriert. Trage <code>NEXT_PUBLIC_SUPABASE_URL</code> und{" "}
        <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code> ein, um Leads zu speichern und zu
        verwalten (siehe README).
      </div>
    );
  }

  const supabase = await createClient();

  let query = supabase.from("leads").select("*");
  if (status) query = query.eq("status", status);
  if (canton) query = query.eq("canton", canton);
  if (industry) query = query.eq("industry", industry);

  const sortConfig = SORT_MAP[sort ?? "created_desc"] ?? SORT_MAP.created_desc;
  query = query.order(sortConfig.column, { ascending: sortConfig.ascending });

  const { data: leads, error } = await query;

  const { data: allLeads } = await supabase.from("leads").select("industry, status");
  const industryOptions = Array.from(
    new Set((allLeads ?? []).map((l) => l.industry).filter((i): i is string => Boolean(i))),
  ).sort();

  const statusCounts = LEAD_STATUSES.map((s) => ({
    ...s,
    count: (allLeads ?? []).filter((l) => l.status === s.value).length,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Meine Leads</h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Übersicht und Status-Pipeline deiner gespeicherten Akquise-Kontakte.
          </p>
        </div>
        <Link
          href="/search"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          + Neue Leads suchen
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {statusCounts.map((s) => (
          <div
            key={s.value}
            className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="text-2xl font-semibold text-slate-900 dark:text-slate-100">{s.count}</div>
            <div className="mt-1 text-xs font-medium text-slate-500 dark:text-slate-400">{s.label}</div>
          </div>
        ))}
      </div>

      <FilterBar industryOptions={industryOptions} />

      {error && (
        <div className="rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          Fehler beim Laden der Leads: {error.message}
        </div>
      )}

      {!error && (!leads || leads.length === 0) && (
        <p className="rounded-lg border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Noch keine Leads gespeichert.{" "}
          <Link href="/search" className="font-medium text-slate-700 underline dark:text-slate-200">
            Starte eine Lead-Suche
          </Link>
          , um Firmen zu finden und hier zu sammeln.
        </p>
      )}

      {leads && leads.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="hidden border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-slate-500 md:grid md:grid-cols-[1.6fr_1fr_1fr_1fr_1.1fr_1.6fr_auto] md:gap-4 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
            <span>Firma</span>
            <span>Ort / Kanton</span>
            <span>Branche</span>
            <span>Rechtsform</span>
            <span>Status</span>
            <span>Notizen</span>
            <span />
          </div>
          <div>
            {(leads as Lead[]).map((lead) => (
              <LeadListItem key={lead.id} lead={lead} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
