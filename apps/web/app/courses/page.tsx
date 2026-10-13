import { redirect } from 'next/navigation';
import { StudentCourseLibrary } from '../../components/ui/StudentCourseLibrary';
import { StudentSessionUnavailable } from '../../components/ui/CourseContentView';
import { getCurrentUserProfile } from '../../lib/authentication/getCurrentUserProfile';
import { getSignInPath } from '../../lib/authentication/returnPath';
import { getStudentCourses } from '../../lib/courses/courseApi';
import { StudentWorkspaceShell } from '../../components/ui/StudentWorkspaceShell';

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error.statusCode === 401
  );
}

export default async function StudentCoursesPage() {
  const signInPath = getSignInPath('/courses');
  const { authenticated, profile, accessToken } = await getCurrentUserProfile();

  if (!authenticated || !accessToken) redirect(signInPath);
  if (!profile) return <StudentSessionUnavailable returnTo="/courses" />;
  if (!profile.phone.trim()) redirect('/profile?complete=1');

  try {
    const courses = await getStudentCourses(accessToken);
    return (
      <StudentWorkspaceShell profile={profile}>
        <StudentCourseLibrary courses={courses} unavailable={false} />
      </StudentWorkspaceShell>
    );
  } catch (error) {
    if (isUnauthorized(error)) redirect(signInPath);
    return (
      <StudentWorkspaceShell profile={profile}>
        <StudentCourseLibrary courses={[]} unavailable />
      </StudentWorkspaceShell>
    );
  }
}
