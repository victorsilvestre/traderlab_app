const allowedPath = /^\/(?:courses|users|enrollments|notifications|banners)(?:\/|$)/;

export function safeAdminReturnTo(value: string | undefined, fallback: string): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return fallback;
  }
  try {
    const target = new URL(value, 'https://admin.invalid');
    if (target.origin !== 'https://admin.invalid') return fallback;
    if (target.pathname !== '/' && !allowedPath.test(target.pathname)) return fallback;
    return `${target.pathname}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}
