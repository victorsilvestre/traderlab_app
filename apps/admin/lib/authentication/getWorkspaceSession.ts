import type { UserProfileDto } from '@traderlab/contracts';
import { createSupabaseServerClient } from '../supabase/server';

export type WorkspaceSession =
  | { status: 'anonymous' }
  | { status: 'unavailable' }
  | { status: 'forbidden' }
  | { status: 'authorized'; profile: UserProfileDto };

export async function getWorkspaceSession(): Promise<WorkspaceSession> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getSession();
    if (error) return { status: 'unavailable' };
    const token = data.session?.access_token;
    if (!token) return { status: 'anonymous' };

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL!.replace(/\/$/, '')}/authentication/workspace/me`,
      {
        headers: { authorization: `Bearer ${token}` },
        cache: 'no-store',
        signal: AbortSignal.timeout(4000),
      },
    );
    if (response.status === 401) return { status: 'anonymous' };
    if (response.status === 403) return { status: 'forbidden' };
    if (!response.ok) return { status: 'unavailable' };
    const profile = (await response.json()) as UserProfileDto;
    if (profile.role !== 'mentor' && profile.role !== 'administrator') {
      return { status: 'forbidden' };
    }
    return { status: 'authorized', profile };
  } catch {
    return { status: 'unavailable' };
  }
}
