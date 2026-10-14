export class AuthenticationError extends Error {
  readonly cause?: unknown;

  constructor(
    message: string,
    readonly statusCode: number,
    options?: { cause?: unknown },
  ) {
    super(message);
    this.cause = options?.cause;
    this.name = 'AuthenticationError';
  }
}
