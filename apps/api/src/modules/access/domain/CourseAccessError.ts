export class CourseAccessError extends Error {
  readonly statusCode = 404;

  constructor() {
    super('Curso não encontrado.');
    this.name = 'CourseAccessError';
  }
}
