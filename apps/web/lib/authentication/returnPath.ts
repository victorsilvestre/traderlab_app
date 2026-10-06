const appOrigin = 'http://traderlab.local';

export function getSafeReturnPath(value: string | null | undefined): string {
  if (
    !value ||
    !value.startsWith('/') ||
    value.startsWith('//') ||
    value.includes('\\') ||
    /[\r\n]/.test(value)
  ) {
    return '/';
  }

  try {
    const destination = new URL(value, appOrigin);
    if (destination.origin !== appOrigin) return '/';
    if (
      destination.pathname !== '/home' &&
      destination.pathname !== '/courses' &&
      !destination.pathname.startsWith('/courses/')
    ) {
      return '/';
    }
    return `${destination.pathname}${destination.search}${destination.hash}`;
  } catch {
    return '/';
  }
}

export function getSignInPath(returnPath: string): string {
  const safePath = getSafeReturnPath(returnPath);
  return safePath === '/'
    ? '/sign-in'
    : `/sign-in?next=${encodeURIComponent(safePath)}`;
}
