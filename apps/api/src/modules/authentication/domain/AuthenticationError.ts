export class AuthenticationError extends Error {
  override readonly cause?: unknown;

  constructor(
    message: string,
    readonly statusCode: number,
    options?: { cause?: unknown },
  ) {
    super(message, options);
    this.cause = options?.cause;
    this.name = 'AuthenticationError';
  }
}
