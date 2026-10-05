'use server';

import type { StudentCourseSearchResultDto } from '@traderlab/contracts';
import { getCurrentAccessToken } from '../authentication/getCurrentAccessToken';
import { searchStudentContents } from './courseApi';

export async function searchAccessibleCourseContents(
  query: string,
): Promise<StudentCourseSearchResultDto[]> {
  const accessToken = await getCurrentAccessToken();
  if (!accessToken) throw new Error('Entre novamente para pesquisar.');
  return searchStudentContents(accessToken, query.slice(0, 120));
}
