export class AuthenticationError extends Error {
  constructor(
    message: string,
    readonly statusCode: number,
    options?: { cause?: unknown },
  ) {
    super(message);
    if (options?.cause !== undefined) {
      Object.defineProperty(this, 'cause', { value: options.cause });
    }
    this.name = 'AuthenticationError';
  }
}
