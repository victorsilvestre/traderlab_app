import { notFound, redirect } from 'next/navigation';
import type { CourseContentDto, CourseDetailDto } from '@traderlab/contracts';
import {
  StudentSessionUnavailable,
  CourseContentLoadError,
  CourseContentView,
} from '../../../../../../components/ui/CourseContentView';
import { getCurrentUserProfile } from '../../../../../../lib/authentication/getCurrentUserProfile';
import { getSignInPath } from '../../../../../../lib/authentication/returnPath';
import {
  getStudentCourse,
  openStudentCourseContent,
} from '../../../../../../lib/courses/courseApi';

type CourseContentPageProps = {
  params: Promise<{ courseId: string; contentId: string }>;
};

function isNotFound(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error.statusCode === 404
  );
}

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error.statusCode === 401
  );
}

export default async function CourseContentPage({
  params,
}: CourseContentPageProps) {
  const { courseId: rawCourseId, contentId: rawContentId } = await params;
  const courseId = Number(rawCourseId);
  const contentId = Number(rawContentId);
  if (
    !Number.isSafeInteger(courseId) ||
    courseId < 1 ||
    !Number.isSafeInteger(contentId) ||
    contentId < 1
  ) {
    notFound();
  }
  const returnTo = `/courses/${courseId}/contents/${contentId}`;
  const signInPath = getSignInPath(returnTo);
  const { authenticated, profile, accessToken } = await getCurrentUserProfile();
  if (!authenticated) redirect(signInPath);
  if (!profile) return <StudentSessionUnavailable returnTo={returnTo} />;

  if (!accessToken) redirect(signInPath);

  let content: CourseContentDto | null = null;
  let course: CourseDetailDto | null = null;
  try {
    [content, course] = await Promise.all([
      openStudentCourseContent(accessToken, courseId, contentId),
      getStudentCourse(accessToken, courseId),
    ]);
  } catch (error) {
    if (isNotFound(error)) notFound();
    if (isUnauthorized(error)) redirect(signInPath);
  }

  if (!content || !course) return <CourseContentLoadError profile={profile} />;
  return <CourseContentView profile={profile} content={content} course={course} />;
}
