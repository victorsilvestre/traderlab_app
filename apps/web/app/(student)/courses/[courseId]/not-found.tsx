import { CourseUnavailableState } from '../../../../components/ui/CourseDetail';
import { StudentWorkspaceShell } from '../../../../components/ui/StudentWorkspaceShell';
import { getCurrentUserProfile } from '../../../../lib/authentication/getCurrentUserProfile';

export default async function CourseNotFound() {
  const { authenticated, profile } = await getCurrentUserProfile();
  if (!authenticated || !profile) return <CourseUnavailableState />;
  return (
    <StudentWorkspaceShell profile={profile}>
      <CourseUnavailableState />
    </StudentWorkspaceShell>
  );
}
