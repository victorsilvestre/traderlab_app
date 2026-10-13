import { redirect } from 'next/navigation';
import { StudentSearchPage } from '../../components/ui/StudentSearchPage';
import { StudentSessionUnavailable } from '../../components/ui/CourseContentView';
import { getCurrentUserProfile } from '../../lib/authentication/getCurrentUserProfile';
import { getSignInPath } from '../../lib/authentication/returnPath';
import { StudentWorkspaceShell } from '../../components/ui/StudentWorkspaceShell';

export default async function SearchPage() {
  const signInPath = getSignInPath('/search');
  const { authenticated, profile } = await getCurrentUserProfile();
  if (!authenticated) redirect(signInPath);
  if (!profile) return <StudentSessionUnavailable returnTo="/search" />;
  if (!profile.phone.trim()) redirect('/profile?complete=1');
  return (
    <StudentWorkspaceShell profile={profile}>
      <StudentSearchPage />
    </StudentWorkspaceShell>
  );
}
