import { redirect } from 'next/navigation';
import { ProfileScreen } from '../../components/ui/ProfileScreen';
import { getCurrentUserProfile } from '../../lib/authentication/getCurrentUserProfile';
import { getSignInPath } from '../../lib/authentication/returnPath';
import { StudentWorkspaceShell } from '../../components/ui/StudentWorkspaceShell';

export default async function ProfilePage() {
  const { authenticated, profile } = await getCurrentUserProfile();
  if (!authenticated) redirect(getSignInPath('/profile'));
  if (!profile) {
    return (
      <main className="home-page">
        <section className="welcome-panel" role="alert">
          <h1>Não conseguimos carregar seu perfil.</h1>
          <p>Atualize a página em instantes. Sua sessão continua protegida.</p>
        </section>
      </main>
    );
  }
  return (
    <StudentWorkspaceShell profile={profile}>
      <ProfileScreen profile={profile} />
    </StudentWorkspaceShell>
  );
}
