import { redirect } from 'next/navigation';
import type { CourseSummaryDto } from '@traderlab/contracts';
import { StudentHome } from '../../../components/ui/StudentHome';
import { getCurrentAccessToken } from '../../../lib/authentication/getCurrentAccessToken';
import { getCurrentUserProfile } from '../../../lib/authentication/getCurrentUserProfile';
import { getStudentCourses } from '../../../lib/courses/courseApi';

export default async function StudentHomePage() {
  const { authenticated, profile } = await getCurrentUserProfile();

  if (!authenticated) redirect('/sign-in');
  if (!profile || profile.role !== 'student') redirect('/');

  const accessToken = await getCurrentAccessToken();
  if (!accessToken) redirect('/sign-in');

  let coursesUnavailable = false;
  let courses: CourseSummaryDto[] = [];
  try {
    courses = await getStudentCourses(accessToken);
  } catch {
    coursesUnavailable = true;
  }

  return (
    <StudentHome
      profile={profile}
      courses={courses}
      coursesUnavailable={coursesUnavailable}
    />
  );
}
