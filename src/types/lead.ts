import type { LeadStatus } from "@/lib/constants/status";

export type Lead = {
  id: string;
  user_id: string;
  company_name: string;
  canton: string | null;
  industry: string | null;
  legal_form: string | null;
  source: string;
  source_ref: string | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

// Ein Treffer aus der Zefix-Suche (oder dem Mock-Fallback), bevor er
// als Lead in Supabase gespeichert wird.
export type CompanySearchResult = {
  // Zefix-UID bzw. EHRAID, dient als source_ref beim Speichern.
  sourceRef: string;
  companyName: string;
  canton: string | null;
  town: string | null;
  legalForm: string | null;
  status: string | null;
};
