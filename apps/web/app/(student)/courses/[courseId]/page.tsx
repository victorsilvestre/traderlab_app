import { notFound, redirect } from 'next/navigation';
import {
  CourseDetail,
  CourseLoadError,
} from '../../../../components/ui/CourseDetail';
import { getCurrentAccessToken } from '../../../../lib/authentication/getCurrentAccessToken';
import { getCurrentUserProfile } from '../../../../lib/authentication/getCurrentUserProfile';
import { getStudentCourse } from '../../../../lib/courses/courseApi';

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
  const { authenticated, profile } = await getCurrentUserProfile();

  if (!authenticated) redirect('/sign-in');
  if (!profile || profile.role !== 'student') redirect('/');

  const accessToken = await getCurrentAccessToken();
  if (!accessToken) redirect('/sign-in');

  let course: Awaited<ReturnType<typeof getStudentCourse>>;
  try {
    course = await getStudentCourse(accessToken, courseId);
  } catch (error) {
    if (isNotFound(error)) notFound();
    return <CourseLoadError profile={profile} />;
  }

  return <CourseDetail profile={profile} course={course} />;
}
