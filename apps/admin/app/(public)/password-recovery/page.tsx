import { AuthShell } from '../../../components/authentication/AuthShell';
import { AdminAuthForm } from '../../../components/forms/AdminAuthForm';

export default function PasswordRecoveryPage() {
  return (
    <AuthShell>
      <AdminAuthForm mode="recovery" />
    </AuthShell>
  );
}
