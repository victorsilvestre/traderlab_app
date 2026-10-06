import type { UserProfileDto } from '@traderlab/contracts';
import { createSupabaseServerClient } from '../supabase/server';

export type CurrentUserProfileResult = {
  authenticated: boolean;
  profile: UserProfileDto | null;
  accessToken: string | null;
};

export async function getCurrentUserProfile(): Promise<CurrentUserProfileResult> {
  const supabase = await createSupabaseServerClient();
  const { data: sessionData } = await supabase.auth.getSession();
  const accessToken = sessionData.session?.access_token;
  if (!accessToken) {
    return { authenticated: false, profile: null, accessToken: null };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/authentication/me`,
      {
        headers: { authorization: `Bearer ${accessToken}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
        next: { revalidate: 60 },
      },
    );

    if (response.status === 401) {
      return { authenticated: false, profile: null, accessToken: null };
    }
    if (!response.ok) return { authenticated: true, profile: null, accessToken };

    const profile = (await response.json()) as UserProfileDto;
    return { authenticated: true, profile, accessToken };
  } catch {
    return { authenticated: true, profile: null, accessToken };
  }
}
