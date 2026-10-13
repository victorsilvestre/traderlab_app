import { CourseDetailLoading } from '../../../../components/ui/CourseDetail';
import { StudentWorkspaceShell } from '../../../../components/ui/StudentWorkspaceShell';
import { getCurrentUserProfile } from '../../../../lib/authentication/getCurrentUserProfile';

export default async function CourseLoading() {
  const { authenticated, profile } = await getCurrentUserProfile();
  if (!authenticated || !profile) return <CourseDetailLoading />;

  return (
    <StudentWorkspaceShell profile={profile}>
      <CourseDetailLoading />
    </StudentWorkspaceShell>
  );
}
