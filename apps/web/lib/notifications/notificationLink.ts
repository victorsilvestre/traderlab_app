export function getSafeNotificationLink(linkUrl: string | null) {
  if (!linkUrl) return null;
  if (linkUrl.startsWith('/') && !linkUrl.startsWith('//')) {
    return { href: linkUrl, external: false };
  }
  try {
    const url = new URL(linkUrl);
    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return { href: url.toString(), external: true };
    }
  } catch {
    return null;
  }
  return null;
}
