export function isManagedCourseImageUrl(url?: string | null): boolean {
  return Boolean(url && (
    url.includes('/storage/v1/object/sign/traderlab-course-images/') ||
    url.includes('/storage/v1/object/public/traderlab-course-images/') ||
    url.includes('/storage/v1/render/image/public/traderlab-course-images/')
  ));
}
