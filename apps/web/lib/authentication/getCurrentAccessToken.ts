import 'server-only';
import { createSupabaseServerClient } from '../supabase/server';

export async function getCurrentAccessToken(): Promise<string | null> {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}
