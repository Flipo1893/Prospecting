"use client";

import { useState, useTransition } from "react";
import { cantonName } from "@/lib/constants/cantons";
import { LEAD_STATUSES, type LeadStatus } from "@/lib/constants/status";
import { deleteLead, updateLeadNotes, updateLeadStatus } from "@/lib/actions/leads";
import type { Lead } from "@/types/lead";

export function LeadListItem({ lead }: { lead: Lead }) {
  const [status, setStatus] = useState<LeadStatus>(lead.status);
  const [notes, setNotes] = useState(lead.notes ?? "");
  const [notesDirty, setNotesDirty] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [deleted, setDeleted] = useState(false);

  function handleStatusChange(next: LeadStatus) {
    setStatus(next);
    startTransition(async () => {
      await updateLeadStatus(lead.id, next);
    });
  }

  function handleNotesBlur() {
    if (!notesDirty) return;
    startTransition(async () => {
      await updateLeadNotes(lead.id, notes);
      setNotesDirty(false);
    });
  }

  function handleDelete() {
    if (!confirm(`Lead "${lead.company_name}" wirklich löschen?`)) return;
    setDeleted(true);
    startTransition(async () => {
      await deleteLead(lead.id);
    });
  }

  if (deleted) return null;

  return (
    <div
      className={`grid grid-cols-1 gap-3 border-b border-slate-100 p-4 last:border-b-0 md:grid-cols-[1.6fr_1fr_1fr_1fr_1.1fr_1.6fr_auto] md:items-start md:gap-4 md:px-4 md:py-3 dark:border-slate-800 ${isPending ? "opacity-60" : ""}`}
    >
      <div>
        <span className="block text-xs font-medium text-slate-400 md:hidden">Firma</span>
        <span className="font-medium text-slate-900 dark:text-slate-100">{lead.company_name}</span>
      </div>

      <div>
        <span className="block text-xs font-medium text-slate-400 md:hidden">Ort / Kanton</span>
        <span className="text-sm text-slate-600 dark:text-slate-300">{cantonName(lead.canton)}</span>
      </div>

      <div>
        <span className="block text-xs font-medium text-slate-400 md:hidden">Branche</span>
        <span className="text-sm text-slate-600 dark:text-slate-300">{lead.industry ?? "–"}</span>
      </div>

      <div>
        <span className="block text-xs font-medium text-slate-400 md:hidden">Rechtsform</span>
        <span className="text-sm text-slate-600 dark:text-slate-300">{lead.legal_form ?? "–"}</span>
      </div>

      <div>
        <span className="block text-xs font-medium text-slate-400 md:hidden">Status</span>
        <select
          value={status}
          onChange={(e) => handleStatusChange(e.target.value as LeadStatus)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-2 py-1.5 text-xs font-medium text-slate-900 md:mt-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        >
          {LEAD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <span className="block text-xs font-medium text-slate-400 md:hidden">Notizen</span>
        <textarea
          value={notes}
          onChange={(e) => {
            setNotes(e.target.value);
            setNotesDirty(true);
          }}
          onBlur={handleNotesBlur}
          rows={2}
          placeholder="Notiz hinzufügen…"
          className="mt-1 w-full resize-none rounded-lg border border-slate-300 px-2 py-1.5 text-xs text-slate-900 md:mt-0 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      <div className="flex items-start justify-end md:pt-0">
        <button
          onClick={handleDelete}
          title="Lead löschen"
          className="rounded-lg border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-rose-600 transition hover:bg-rose-50 dark:border-slate-700 dark:text-rose-400 dark:hover:bg-rose-950"
        >
          Löschen
        </button>
      </div>
    </div>
  );
}
