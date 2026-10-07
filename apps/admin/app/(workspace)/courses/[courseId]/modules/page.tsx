import { notFound, redirect } from 'next/navigation';

type PageProps = { params: Promise<{ courseId: string }> };

export default async function LegacyCourseModulesPage({ params }: PageProps) {
  const { courseId } = await params;
  if (!/^\d+$/.test(courseId) || Number(courseId) < 1) notFound();
  redirect(`/courses/${courseId}`);
}
