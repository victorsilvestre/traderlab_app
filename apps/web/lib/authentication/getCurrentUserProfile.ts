import type { UserProfileDto } from '@traderlab/contracts';
import { createSupabaseServerClient } from '../supabase/server';

export type CurrentUserProfileResult = {
  authenticated: boolean;
  profile: UserProfileDto | null;
};

export async function getCurrentUserProfile(): Promise<CurrentUserProfileResult> {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) return { authenticated: false, profile: null };

  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) return { authenticated: true, profile: null };

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/authentication/me`,
      {
        headers: { authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
      },
    );

    if (!response.ok) return { authenticated: true, profile: null };

    const profile = (await response.json()) as UserProfileDto;
    return { authenticated: true, profile };
  } catch {
    return { authenticated: true, profile: null };
  }
}
