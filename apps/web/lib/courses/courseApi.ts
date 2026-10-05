import 'server-only';
import type {
  ApiErrorDto,
  CourseContentDto,
  CourseDetailDto,
  CourseSearchDto,
  CourseSummaryDto,
  StudentCourseSearchResultDto,
} from '@traderlab/contracts';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

async function request<T>(
  path: string,
  accessToken: string,
  init?: RequestInit,
) {
  if (!apiUrl) throw new Error('A API do TraderLab não está configurada.');

  const response = await fetch(`${apiUrl.replace(/\/$/, '')}${path}`, {
    ...init,
    headers: {
      authorization: `Bearer ${accessToken}`,
      'content-type': 'application/json',
      ...init?.headers,
    },
    cache: 'no-store',
  });
  const body = (await response.json().catch(() => ({}))) as T | ApiErrorDto;

  if (!response.ok) {
    const error = new Error(
      body && typeof body === 'object' && 'message' in body
        ? body.message
        : 'Não foi possível carregar estes dados. Tente novamente.',
    );
    Object.assign(error, { statusCode: response.status });
    throw error;
  }
  return body as T;
}

export function getStudentCourses(accessToken: string) {
  return request<CourseSummaryDto[]>('/courses', accessToken);
}

export function searchStudentContents(accessToken: string, query: string) {
  const search = new URLSearchParams({ query });
  return request<StudentCourseSearchResultDto[]>(
    `/courses/search?${search}`,
    accessToken,
  );
}

export function getStudentCourse(accessToken: string, courseId: number) {
  return request<CourseDetailDto>(
    `/courses/${encodeURIComponent(courseId)}`,
    accessToken,
  );
}

export function searchStudentCourse(
  accessToken: string,
  courseId: number,
  query: string,
) {
  const search = new URLSearchParams({ query });
  return request<CourseSearchDto>(
    `/courses/${encodeURIComponent(courseId)}/search?${search}`,
    accessToken,
  );
}

export function openStudentCourseContent(
  accessToken: string,
  courseId: number,
  contentId: number,
) {
  return request<CourseContentDto>(
    `/courses/${encodeURIComponent(courseId)}/contents/${encodeURIComponent(contentId)}/open`,
    accessToken,
    { method: 'POST' },
  );
}

export function completeStudentCourseContent(
  accessToken: string,
  courseId: number,
  contentId: number,
) {
  return request<{ completed: true; completedAt: string }>(
    `/courses/${encodeURIComponent(courseId)}/contents/${encodeURIComponent(contentId)}/completion`,
    accessToken,
    { method: 'POST' },
  );
}
