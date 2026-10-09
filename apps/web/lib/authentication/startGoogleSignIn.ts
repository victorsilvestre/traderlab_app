import { createSupabaseBrowserClient } from '../supabase/browser';

export async function startGoogleSignIn(returnTo: string): Promise<void> {
  const callback = new URL('/auth/callback', window.location.origin);
  callback.searchParams.set('next', returnTo);
  const supabase = createSupabaseBrowserClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: callback.toString(),
      scopes: 'openid email profile',
    },
  });
  if (error) throw error;
}
