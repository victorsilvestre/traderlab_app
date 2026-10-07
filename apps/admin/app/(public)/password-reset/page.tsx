import { redirect } from 'next/navigation';
import { AuthShell } from '../../../components/authentication/AuthShell';
import { AdminAuthForm } from '../../../components/forms/AdminAuthForm';
import { createSupabaseServerClient } from '../../../lib/supabase/server';

export default async function PasswordResetPage() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getSession();
  if (!data.session) redirect('/password-recovery');
  return (
    <AuthShell>
      <AdminAuthForm mode="reset" />
    </AuthShell>
  );
}
