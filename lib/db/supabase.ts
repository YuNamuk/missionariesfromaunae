import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Browser/server read client (anon key, RLS-enforced). Returns null when the
 * env is not configured yet — callers fall back to the typed seed module so
 * the app keeps working before the database is wired up.
 */
export function getSupabase(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

/**
 * Privileged client (service role) for seeding and ingestion. Server-only —
 * never import this into client components.
 */
export function getServiceSupabase(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Missing SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY for the service client.",
    );
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

export const isDbConfigured = () =>
  Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
