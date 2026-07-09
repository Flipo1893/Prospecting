import { statusOption } from "@/lib/constants/status";

export function StatusBadge({ status }: { status: string }) {
  const option = statusOption(status);
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${option.colorClasses}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${option.dotClasses}`} />
      {option.label}
    </span>
  );
}
