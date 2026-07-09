"use client";

import { useState, type FormEvent } from "react";
import { CANTONS, cantonName } from "@/lib/constants/cantons";
import { INDUSTRIES } from "@/lib/constants/industries";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/constants/status";
import { saveLeadFromSearch } from "@/lib/actions/leads";
import type { CompanySearchResult } from "@/types/lead";

type RowState = {
  status: LeadStatus;
  saveState: "idle" | "saving" | "saved" | "error";
  errorMessage?: string;
};

export default function SearchPage() {
  const [industry, setIndustry] = useState("");
  const [canton, setCanton] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<CompanySearchResult[]>([]);
  const [mode, setMode] = useState<"mock" | "live" | null>(null);
  const [warning, setWarning] = useState<string | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [rowState, setRowState] = useState<Record<string, RowState>>({});

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setSearchError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams();
      if (industry) params.set("industry", industry);
      if (canton) params.set("canton", canton);

      const response = await fetch(`/api/zefix/search?${params.toString()}`);
      if (!response.ok) throw new Error(`Suche fehlgeschlagen (Status ${response.status})`);

      const data = await response.json();
      setResults(data.results);
      setMode(data.mode);
      setWarning(data.warning ?? null);
      setRowState({});
    } catch (error) {
      setSearchError(error instanceof Error ? error.message : "Unbekannter Fehler bei der Suche.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  function setRowStatus(sourceRef: string, status: LeadStatus) {
    setRowState((prev) => ({
      ...prev,
      [sourceRef]: { ...(prev[sourceRef] ?? { saveState: "idle" }), status },
    }));
  }

  async function handleSave(result: CompanySearchResult) {
    const currentStatus = rowState[result.sourceRef]?.status ?? "Neu";
    setRowState((prev) => ({
      ...prev,
      [result.sourceRef]: { status: currentStatus, saveState: "saving" },
    }));

    const outcome = await saveLeadFromSearch(result, industry, currentStatus);

    setRowState((prev) => ({
      ...prev,
      [result.sourceRef]: {
        status: currentStatus,
        saveState: outcome.ok ? "saved" : "error",
        errorMessage: outcome.ok ? undefined : outcome.error,
      },
    }));
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">Lead-Suche</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Firmen aus dem Schweizer Handelsregister (Zefix) nach Branche und Kanton suchen.
        </p>
      </div>

      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:grid-cols-[1fr_1fr_auto] sm:items-end dark:border-slate-800 dark:bg-slate-900"
      >
        <div>
          <label htmlFor="industry" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Branche
          </label>
          <input
            id="industry"
            list="industry-options"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            placeholder="z.B. Sanitär, Elektro, Schreiner"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          />
          <datalist id="industry-options">
            {INDUSTRIES.map((i) => (
              <option key={i} value={i} />
            ))}
          </datalist>
        </div>

        <div>
          <label htmlFor="canton" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Kanton
          </label>
          <select
            id="canton"
            value={canton}
            onChange={(e) => setCanton(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="">Alle Kantone</option>
            {CANTONS.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-slate-900 px-5 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-white"
        >
          {loading ? "Suche…" : "Suchen"}
        </button>
      </form>

      {mode === "mock" && (
        <div className="rounded-lg bg-blue-50 px-4 py-2.5 text-sm text-blue-700 dark:bg-blue-950 dark:text-blue-300">
          Mock-Modus: Es werden Beispieldaten angezeigt (kein Zefix-API-Key konfiguriert). Siehe README für die
          Einrichtung des echten Zugangs.
        </div>
      )}
      {warning && (
        <div className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:bg-amber-950 dark:text-amber-300">
          {warning}
        </div>
      )}
      {searchError && (
        <div className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm text-rose-700 dark:bg-rose-950 dark:text-rose-300">
          {searchError}
        </div>
      )}

      {hasSearched && !loading && results.length === 0 && !searchError && (
        <p className="rounded-lg border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
          Keine Treffer für diese Suche. Versuche eine andere Branche oder einen anderen Kanton.
        </p>
      )}

      {results.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Firmenname</th>
                <th className="px-4 py-3 font-medium">Ort / Kanton</th>
                <th className="px-4 py-3 font-medium">Branche</th>
                <th className="px-4 py-3 font-medium">Rechtsform</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((result) => {
                const state = rowState[result.sourceRef] ?? { status: "Neu" as LeadStatus, saveState: "idle" as const };
                return (
                  <tr key={result.sourceRef}>
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {result.companyName}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                      {result.town ? `${result.town}, ` : ""}
                      {cantonName(result.canton)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{industry || "–"}</td>
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{result.legalForm ?? "–"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={state.status}
                        onChange={(e) => setRowStatus(result.sourceRef, e.target.value as LeadStatus)}
                        disabled={state.saveState === "saved"}
                        className="rounded-lg border border-slate-300 px-2 py-1 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                      >
                        {LEAD_STATUSES.map((s) => (
                          <option key={s.value} value={s.value}>
                            {s.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {state.saveState === "saved" ? (
                        <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          ✓ Gespeichert
                        </span>
                      ) : (
                        <button
                          onClick={() => handleSave(result)}
                          disabled={state.saveState === "saving"}
                          className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                        >
                          {state.saveState === "saving" ? "Speichere…" : "In Leads speichern"}
                        </button>
                      )}
                      {state.saveState === "error" && (
                        <p className="mt-1 text-xs text-rose-600 dark:text-rose-400">{state.errorMessage}</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
