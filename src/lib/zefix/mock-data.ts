import type { CompanySearchResult } from "@/types/lead";

// Beispieldaten für den Mock-/Fallback-Modus (kein Zefix-API-Key nötig).
// Deckt mehrere Kantone und Gewerbe-/Handwerksbranchen ab, damit sich
// Filterung/Suche sinnvoll demonstrieren lässt.
const MOCK_COMPANIES: (CompanySearchResult & { industryHints: string[] })[] = [
  {
    sourceRef: "MOCK-CHE-100.000.001",
    companyName: "Sanitär Müller AG",
    canton: "ZH",
    town: "Zürich",
    legalForm: "Aktiengesellschaft",
    status: "ACTIVE",
    industryHints: ["sanitär", "sanitaer", "plumbing"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.002",
    companyName: "Elektro Widmer GmbH",
    canton: "BE",
    town: "Bern",
    legalForm: "GmbH",
    status: "ACTIVE",
    industryHints: ["elektro", "electric"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.003",
    companyName: "Schreinerei Steiner & Söhne",
    canton: "LU",
    town: "Luzern",
    legalForm: "Kollektivgesellschaft",
    status: "ACTIVE",
    industryHints: ["schreiner", "schreinerei", "holzbau"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.004",
    companyName: "Gebrüder Keller Sanitär & Heizung AG",
    canton: "ZH",
    town: "Winterthur",
    legalForm: "Aktiengesellschaft",
    status: "ACTIVE",
    industryHints: ["sanitär", "heizung", "hllk"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.005",
    companyName: "Maler Rossi SA",
    canton: "TI",
    town: "Lugano",
    legalForm: "Società anonima",
    status: "ACTIVE",
    industryHints: ["maler", "malerei"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.006",
    companyName: "Elektro Favre Sàrl",
    canton: "VD",
    town: "Lausanne",
    legalForm: "Sàrl",
    status: "ACTIVE",
    industryHints: ["elektro", "electricite"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.007",
    companyName: "Schreinerei Bachmann AG",
    canton: "AG",
    town: "Baden",
    legalForm: "Aktiengesellschaft",
    status: "ACTIVE",
    industryHints: ["schreiner", "schreinerei"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.008",
    companyName: "Gipser & Maler Huber GmbH",
    canton: "SG",
    town: "St. Gallen",
    legalForm: "GmbH",
    status: "ACTIVE",
    industryHints: ["gipser", "maler"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.009",
    companyName: "Dach & Fassade Frei AG",
    canton: "ZH",
    town: "Uster",
    legalForm: "Aktiengesellschaft",
    status: "ACTIVE",
    industryHints: ["dach", "dachdecker", "fassade"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.010",
    companyName: "Metallbau Zurbrügg AG",
    canton: "BE",
    town: "Thun",
    legalForm: "Aktiengesellschaft",
    status: "ACTIVE",
    industryHints: ["metallbau", "schlosserei"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.011",
    companyName: "Garten & Landschaft Meier AG",
    canton: "SO",
    town: "Solothurn",
    legalForm: "Aktiengesellschaft",
    status: "ACTIVE",
    industryHints: ["garten", "gartenbau", "landschaftsbau"],
  },
  {
    sourceRef: "MOCK-CHE-100.000.012",
    companyName: "Sanitär Blanc Sàrl",
    canton: "GE",
    town: "Genève",
    legalForm: "Sàrl",
    status: "ACTIVE",
    industryHints: ["sanitär", "sanitaire"],
  },
];

export function searchMockCompanies(params: {
  industry?: string;
  canton?: string;
}): CompanySearchResult[] {
  const industryQuery = params.industry?.trim().toLowerCase();
  const cantonQuery = params.canton?.trim().toUpperCase();

  return MOCK_COMPANIES.filter((company) => {
    const matchesCanton = !cantonQuery || company.canton === cantonQuery;
    const matchesIndustry =
      !industryQuery ||
      company.industryHints.some((hint) => hint.includes(industryQuery)) ||
      company.companyName.toLowerCase().includes(industryQuery);
    return matchesCanton && matchesIndustry;
  }).map((company) => ({
    sourceRef: company.sourceRef,
    companyName: company.companyName,
    canton: company.canton,
    town: company.town,
    legalForm: company.legalForm,
    status: company.status,
  }));
}
