// Status-Pipeline für das Prospecting-Modul (Stufe 1).
//
// Erweiterungshinweis (Stufe 3, Investoren-Pipeline): ein zweites Modul
// kann dieselbe Struktur ({ value, label, colorClasses }) mit eigenen
// Werten definieren, z.B.:
//   export const INVESTOR_STATUSES: StatusOption[] = [
//     { value: "Kontaktiert", label: "Kontaktiert", colorClasses: "..." },
//     { value: "Meeting", label: "Meeting", colorClasses: "..." },
//     { value: "Interessiert", label: "Interessiert", colorClasses: "..." },
//     { value: "Committed", label: "Committed", colorClasses: "..." },
//   ];

export type LeadStatus =
  | "Neu"
  | "Angeschrieben"
  | "Interesse"
  | "Pilot"
  | "Abgelehnt";

export type StatusOption = {
  value: LeadStatus;
  label: string;
  colorClasses: string;
  dotClasses: string;
};

export const LEAD_STATUSES: StatusOption[] = [
  {
    value: "Neu",
    label: "Neu",
    colorClasses:
      "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600",
    dotClasses: "bg-slate-400",
  },
  {
    value: "Angeschrieben",
    label: "Angeschrieben",
    colorClasses:
      "bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
    dotClasses: "bg-blue-500",
  },
  {
    value: "Interesse",
    label: "Interesse",
    colorClasses:
      "bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
    dotClasses: "bg-amber-500",
  },
  {
    value: "Pilot",
    label: "Pilot",
    colorClasses:
      "bg-emerald-100 text-emerald-700 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800",
    dotClasses: "bg-emerald-500",
  },
  {
    value: "Abgelehnt",
    label: "Abgelehnt",
    colorClasses:
      "bg-rose-100 text-rose-700 border-rose-300 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800",
    dotClasses: "bg-rose-500",
  },
];

export const LEAD_STATUS_VALUES = LEAD_STATUSES.map((s) => s.value);

export function statusOption(status: string): StatusOption {
  return (
    LEAD_STATUSES.find((s) => s.value === status) ?? {
      value: status as LeadStatus,
      label: status,
      colorClasses:
        "bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-600",
      dotClasses: "bg-slate-400",
    }
  );
}
