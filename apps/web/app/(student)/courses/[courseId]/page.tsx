import { notFound, redirect } from 'next/navigation';
import {
  CourseDetail,
  CourseLoadError,
} from '../../../../components/ui/CourseDetail';
import { StudentSessionUnavailable } from '../../../../components/ui/CourseContentView';
import { getCurrentAccessToken } from '../../../../lib/authentication/getCurrentAccessToken';
import { getCurrentUserProfile } from '../../../../lib/authentication/getCurrentUserProfile';
import { getSignInPath } from '../../../../lib/authentication/returnPath';
import { getStudentCourse } from '../../../../lib/courses/courseApi';
import { StudentWorkspaceShell } from '../../../../components/ui/StudentWorkspaceShell';

type CoursePageProps = {
  params: Promise<{ courseId: string }>;
};

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error.statusCode === 404
  );
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId: rawCourseId } = await params;
  const courseId = Number(rawCourseId);
  if (!Number.isSafeInteger(courseId) || courseId < 1) notFound();
  const returnTo = `/courses/${courseId}`;
  const signInPath = getSignInPath(returnTo);
  const { authenticated, profile } = await getCurrentUserProfile();

  if (!authenticated) redirect(signInPath);
  if (!profile) return <StudentSessionUnavailable returnTo={returnTo} />;
  if (!profile.phone.trim()) redirect('/profile?complete=1');

  const accessToken = await getCurrentAccessToken();
  if (!accessToken) redirect(signInPath);

  let course: Awaited<ReturnType<typeof getStudentCourse>>;
  try {
    course = await getStudentCourse(accessToken, courseId);
  } catch (error) {
    if (isNotFound(error)) notFound();
    if (
      typeof error === 'object' &&
      error !== null &&
      'statusCode' in error &&
      error.statusCode === 401
    ) {
      redirect(signInPath);
    }
    return (
      <StudentWorkspaceShell profile={profile}>
        <CourseLoadError />
      </StudentWorkspaceShell>
    );
  }

  return (
    <StudentWorkspaceShell profile={profile}>
      <CourseDetail course={course} />
    </StudentWorkspaceShell>
  );
}
