"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { CANTONS } from "@/lib/constants/cantons";
import { LEAD_STATUSES } from "@/lib/constants/status";

export function FilterBar({ industryOptions }: { industryOptions: string[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Status</label>
        <select
          value={searchParams.get("status") ?? ""}
          onChange={(e) => updateParam("status", e.target.value)}
          className="mt-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Alle</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Kanton</label>
        <select
          value={searchParams.get("canton") ?? ""}
          onChange={(e) => updateParam("canton", e.target.value)}
          className="mt-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Alle</option>
          {CANTONS.map((c) => (
            <option key={c.code} value={c.code}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Branche</label>
        <select
          value={searchParams.get("industry") ?? ""}
          onChange={(e) => updateParam("industry", e.target.value)}
          className="mt-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="">Alle</option>
          {industryOptions.map((i) => (
            <option key={i} value={i}>
              {i}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Sortierung</label>
        <select
          value={searchParams.get("sort") ?? "created_desc"}
          onChange={(e) => updateParam("sort", e.target.value)}
          className="mt-1 rounded-lg border border-slate-300 px-2.5 py-1.5 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          <option value="created_desc">Neueste zuerst</option>
          <option value="created_asc">Älteste zuerst</option>
          <option value="company_asc">Firma A–Z</option>
          <option value="status_asc">Status</option>
        </select>
      </div>

      {(searchParams.get("status") || searchParams.get("canton") || searchParams.get("industry")) && (
        <button
          onClick={() => router.push(pathname)}
          className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Filter zurücksetzen
        </button>
      )}
    </div>
  );
}
