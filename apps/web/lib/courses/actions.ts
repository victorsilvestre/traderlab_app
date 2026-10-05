'use server';

import { revalidatePath } from 'next/cache';
import { getCurrentAccessToken } from '../authentication/getCurrentAccessToken';
import {
  completeStudentCourseContent,
  searchStudentCourse,
} from './courseApi';

export async function searchCourse(courseId: number, query: string) {
  const accessToken = await getCurrentAccessToken();
  if (!accessToken) throw new Error('Entre novamente para pesquisar.');

  return searchStudentCourse(accessToken, courseId, query.slice(0, 120));
}

export async function markCourseContentComplete(
  courseId: number,
  contentId: number,
) {
  const accessToken = await getCurrentAccessToken();
  if (!accessToken) throw new Error('Entre novamente para continuar.');

  await completeStudentCourseContent(accessToken, courseId, contentId);
  revalidatePath(`/courses/${encodeURIComponent(courseId)}`);
  revalidatePath('/home');
}
