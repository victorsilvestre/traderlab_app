export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  try {
    const browserOrigin = new URL(origin);
    const requestHost =
      request.headers.get('x-forwarded-host') ?? request.headers.get('host');
    const requestProtocol =
      request.headers.get('x-forwarded-proto') ??
      new URL(request.url).protocol.slice(0, -1);
    return (
      browserOrigin.host === requestHost &&
      browserOrigin.protocol === `${requestProtocol}:`
    );
  } catch {
    return false;
  }
}
