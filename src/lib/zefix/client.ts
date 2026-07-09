import type { CompanySearchResult } from "@/types/lead";
import { searchMockCompanies } from "@/lib/zefix/mock-data";

export type ZefixSearchParams = {
  industry?: string;
  canton?: string;
};

export type ZefixSearchOutcome = {
  results: CompanySearchResult[];
  mode: "mock" | "live";
  warning?: string;
};

function isZefixConfigured(): boolean {
  return Boolean(process.env.ZEFIX_API_KEY) && process.env.ZEFIX_FORCE_MOCK !== "true";
}

// Rohes Response-Item der Zefix PublicREST API (best-effort typisiert).
// HINWEIS: Die exakten Feldnamen sind gemäss dem öffentlichen Swagger unter
// https://www.zefix.admin.ch/ZefixPublicREST/swagger-ui/index.html zu verifizieren
// - die Konsole war beim Erstellen dieses Projekts nicht per automatisiertem
// Zugriff erreichbar. Das Mapping unten ist defensiv gehalten (mehrere mögliche
// Feldnamen), bitte bei Abweichungen in dieser Datei nachziehen.
type ZefixRawCompany = {
  uid?: string;
  ehraid?: number | string;
  chid?: string;
  name?: string;
  legalSeat?: string;
  town?: string;
  canton?: string;
  address?: { canton?: string; town?: string };
  legalForm?: { shortName?: Record<string, string>; name?: Record<string, string> } | string;
  status?: string;
};

function mapRawCompany(raw: ZefixRawCompany): CompanySearchResult {
  const sourceRef =
    raw.uid ?? (raw.ehraid !== undefined ? String(raw.ehraid) : undefined) ?? raw.chid ?? crypto.randomUUID();

  const legalForm =
    typeof raw.legalForm === "string"
      ? raw.legalForm
      : raw.legalForm?.shortName?.de ?? raw.legalForm?.name?.de ?? null;

  return {
    sourceRef,
    companyName: raw.name ?? "Unbekannte Firma",
    canton: raw.canton ?? raw.address?.canton ?? null,
    town: raw.legalSeat ?? raw.town ?? raw.address?.town ?? null,
    legalForm,
    status: raw.status ?? null,
  };
}

async function searchZefixLive(params: ZefixSearchParams): Promise<CompanySearchResult[]> {
  const baseUrl = process.env.ZEFIX_API_BASE_URL ?? "https://www.zefix.admin.ch/ZefixPublicREST/api/v1";
  const apiKey = process.env.ZEFIX_API_KEY!;

  // Zefix erwartet HTTP Basic Auth mit den bei der Registrierung erhaltenen
  // Zugangsdaten. ZEFIX_API_KEY kann entweder "username:password" (Basic-Auth-
  // Zugangsdaten) oder ein bereits Base64-kodierter Wert sein.
  const credentials = apiKey.includes(":") ? Buffer.from(apiKey).toString("base64") : apiKey;

  const response = await fetch(`${baseUrl}/company/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Basic ${credentials}`,
    },
    body: JSON.stringify({
      name: params.industry || undefined,
      cantons: params.canton ? [params.canton] : undefined,
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Zefix-API antwortete mit Status ${response.status}`);
  }

  const data = await response.json();
  const list: ZefixRawCompany[] = Array.isArray(data) ? data : (data?.list ?? []);
  return list.map(mapRawCompany);
}

export async function searchCompanies(params: ZefixSearchParams): Promise<ZefixSearchOutcome> {
  if (!isZefixConfigured()) {
    return { results: searchMockCompanies(params), mode: "mock" };
  }

  try {
    const results = await searchZefixLive(params);
    return { results, mode: "live" };
  } catch (error) {
    console.error("Zefix-API-Aufruf fehlgeschlagen, verwende Mock-Daten als Fallback:", error);
    return {
      results: searchMockCompanies(params),
      mode: "mock",
      warning:
        "Zefix-API war nicht erreichbar oder lieferte einen Fehler. Es werden Beispieldaten angezeigt. Details siehe Server-Log.",
    };
  }
}
