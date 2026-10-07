import { AuthShell } from '../../../components/authentication/AuthShell';
import { AdminAuthForm } from '../../../components/forms/AdminAuthForm';

export default function EmailConfirmationPage() {
  return (
    <AuthShell>
      <AdminAuthForm mode="confirmation" />
    </AuthShell>
  );
}
