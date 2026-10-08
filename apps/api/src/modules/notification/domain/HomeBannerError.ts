export class HomeBannerError extends Error {
  constructor(message: string, readonly statusCode: number) {
    super(message);
    this.name = 'HomeBannerError';
  }
}
