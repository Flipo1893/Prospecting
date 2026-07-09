"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { CompanySearchResult } from "@/types/lead";
import type { LeadStatus } from "@/lib/constants/status";

export type ActionResult = { ok: true } | { ok: false; error: string };

function ensureSupabaseConfigured(): ActionResult | null {
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return null;
  }
  return { ok: false, error: "Supabase ist nicht konfiguriert (siehe README, Abschnitt Setup)." };
}

export async function saveLeadFromSearch(
  result: CompanySearchResult,
  industry: string,
  status: LeadStatus = "Neu",
): Promise<ActionResult> {
  const configError = ensureSupabaseConfigured();
  if (configError) return configError;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "Nicht angemeldet." };
  }

  const { error } = await supabase.from("leads").insert({
    user_id: user.id,
    company_name: result.companyName,
    canton: result.canton,
    industry: industry || null,
    legal_form: result.legalForm,
    source: "zefix",
    source_ref: result.sourceRef,
    status,
  });

  if (error) {
    // Eindeutigkeitsverletzung = Lead wurde bereits gespeichert.
    if (error.code === "23505") {
      return { ok: false, error: "Dieser Lead wurde bereits gespeichert." };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/leads");
  return { ok: true };
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<ActionResult> {
  const configError = ensureSupabaseConfigured();
  if (configError) return configError;

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ status }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/leads");
  return { ok: true };
}

export async function updateLeadNotes(id: string, notes: string): Promise<ActionResult> {
  const configError = ensureSupabaseConfigured();
  if (configError) return configError;

  const supabase = await createClient();
  const { error } = await supabase.from("leads").update({ notes }).eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/leads");
  return { ok: true };
}

export async function deleteLead(id: string): Promise<ActionResult> {
  const configError = ensureSupabaseConfigured();
  if (configError) return configError;

  const supabase = await createClient();
  const { error } = await supabase.from("leads").delete().eq("id", id);

  if (error) return { ok: false, error: error.message };
  revalidatePath("/leads");
  return { ok: true };
}
