import { notFound, redirect } from 'next/navigation';
import type { CourseContentDto } from '@traderlab/contracts';
import {
  CourseContentLoadError,
  CourseContentView,
} from '../../../../../../components/ui/CourseContentView';
import { getCurrentAccessToken } from '../../../../../../lib/authentication/getCurrentAccessToken';
import { getCurrentUserProfile } from '../../../../../../lib/authentication/getCurrentUserProfile';
import { openStudentCourseContent } from '../../../../../../lib/courses/courseApi';

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
  const { authenticated, profile } = await getCurrentUserProfile();
  if (!authenticated) redirect('/sign-in');
  if (!profile || profile.role !== 'student') redirect('/');

  const accessToken = await getCurrentAccessToken();
  if (!accessToken) redirect('/sign-in');

  let content: CourseContentDto | null = null;
  try {
    content = await openStudentCourseContent(accessToken, courseId, contentId);
  } catch (error) {
    if (isNotFound(error)) notFound();
  }

  if (!content) return <CourseContentLoadError profile={profile} />;
  return <CourseContentView profile={profile} content={content} />;
}
