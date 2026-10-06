import type {
  CourseCompletionDto,
  CourseContentDto,
  CourseMaterialDto,
  CourseContentSearchResultDto,
  CourseContentSummaryDto,
  CourseDetailDto,
  CourseModuleDto,
  CourseModuleSearchResultDto,
  CourseSearchDto,
  CourseSummaryDto,
  StudentCourseSearchResultDto,
} from '@traderlab/contracts';
import { RequireCourseAccess } from '../../access/application/RequireCourseAccess.js';
import type { ContentProgressRecord } from '../../progress/domain/ContentProgress.js';
import {
  ContentProgressService,
  newestAccessed,
  toProgressPercent,
} from '../../progress/application/ContentProgressService.js';
import type {
  CourseContentLocation,
  CourseContentRecord,
  CourseContentSearchRecord,
  CourseCatalogSearchRecord,
  CourseRecord,
  CourseRepository,
  CourseSearchRecord,
  CourseMaterialStorage,
} from '../domain/Course.js';
import { CourseError } from '../domain/CourseError.js';
import { toRichTextDocument } from './RichTextDocument.js';

const searchLimit = 30;

function toContentSummary(
  content: CourseContentRecord,
  progress: ContentProgressRecord | undefined,
): CourseContentSummaryDto {
  return {
    id: content.id,
    title: content.title,
    description: content.description,
    kind: content.kind.toLowerCase() as CourseContentSummaryDto['kind'],
    completed: Boolean(progress?.completedAt),
    lastAccessedAt: progress?.lastAccessedAt.toISOString() ?? null,
  };
}

function progressByContent(records: ContentProgressRecord[]) {
  return new Map(records.map((record) => [record.contentId, record]));
}

function moduleDto(
  module: CourseRecord['modules'][number],
  progress: Map<number, ContentProgressRecord>,
): CourseModuleDto {
  const contents = module.contents.map((content) =>
    toContentSummary(content, progress.get(content.id)),
  );
  const completedCount = contents.filter((content) => content.completed).length;

  return {
    id: module.id,
    title: module.title,
    description: module.description,
    imageUrl: module.imageUrl,
    contentCount: contents.length,
    completedCount,
    progressPercent: toProgressPercent(contents.length, completedCount),
    contents,
  };
}

function courseSummary(
  course: CourseRecord,
  progress: Map<number, ContentProgressRecord>,
): CourseSummaryDto {
  const contents = course.modules.flatMap((module) => module.contents);
  const completedCount = contents.filter(
    (content) => progress.get(content.id)?.completedAt,
  ).length;

  return {
    id: course.id,
    title: course.title,
    description: course.description,
    coverImageUrl: course.coverImageUrl,
    contentCount: contents.length,
    completedCount,
    progressPercent: toProgressPercent(contents.length, completedCount),
  };
}

function contentDto(
  content: CourseContentLocation,
  progress: ContentProgressRecord | null,
): CourseContentDto {
  return {
    ...toContentSummary(content, progress ?? undefined),
    courseId: content.courseId,
    courseTitle: content.courseTitle,
    moduleId: content.moduleId,
    moduleTitle: content.moduleTitle,
    body: toRichTextDocument(content.body),
    videoUrl: content.videoUrl ?? content.resourceUrl,
    resourceUrl: content.resourceUrl,
    materials: content.materials.map(
      (material): CourseMaterialDto => ({
        id: material.id,
        name: material.name,
        mimeType: material.mimeType,
        sizeBytes: material.sizeBytes,
      }),
    ),
  };
}

export class CourseService {
  constructor(
    private readonly courses: CourseRepository,
    private readonly access: RequireCourseAccess,
    private readonly progress: ContentProgressService,
    private readonly materialStorage: CourseMaterialStorage,
  ) {}

  async listForStudent(studentId: string): Promise<CourseSummaryDto[]> {
    const courses = await this.courses.listAccessiblePublished(studentId);
    return Promise.all(
      courses.map(async (course) => {
        const records = await this.progress.listForCourse(studentId, course.id);
        return courseSummary(course, progressByContent(records));
      }),
    );
  }

  async getCourse(
    studentId: string,
    courseId: number,
  ): Promise<CourseDetailDto> {
    await this.access.execute(studentId, courseId);
    const course = await this.courses.findPublishedCourse(courseId);
    if (!course) throw new CourseError('Curso não encontrado.', 404);

    const progressRecords = await this.progress.listForCourse(
      studentId,
      courseId,
    );
    const progress = progressByContent(progressRecords);
    const summary = courseSummary(course, progress);
    const modules = course.modules.map((module) => moduleDto(module, progress));
    const latest = newestAccessed(progressRecords);
    const lastAccessedContent = latest
      ? course.modules
          .flatMap((module) => module.contents)
          .find((content) => content.id === latest.contentId)
      : undefined;

    return {
      ...summary,
      modules,
      lastAccessedContent: lastAccessedContent
        ? toContentSummary(lastAccessedContent, latest ?? undefined)
        : null,
    };
  }

  async searchCourse(
    studentId: string,
    courseId: number,
    rawQuery: string,
  ): Promise<CourseSearchDto> {
    await this.access.execute(studentId, courseId);
    const course = await this.courses.findPublishedCourse(courseId);
    if (!course) throw new CourseError('Curso não encontrado.', 404);

    const query = rawQuery.trim().slice(0, 120);
    if (!query) return { query, results: [] };

    const matches = await this.courses.searchPublishedCourseItems(
      courseId,
      query,
      searchLimit,
    );
    const progress = progressByContent(
      await this.progress.listForCourse(studentId, courseId),
    );
    const modulesById = new Map(course.modules.map((module) => [module.id, module]));
    const rankedMatches = matches
      .map((match) => ({ match, rank: this.searchRank(match, query) }))
      .sort(
        (left, right) =>
          left.rank - right.rank ||
          left.match.title.localeCompare(right.match.title),
      )
      .slice(0, searchLimit);

    return {
      query,
      results: rankedMatches.map(({ match }) => {
        if (match.resultType === 'MODULE') {
          const courseModule = modulesById.get(match.id);
          if (!courseModule) throw new CourseError('Módulo não encontrado.', 404);
          return this.toModuleSearchResult(courseModule, progress);
        }

        return this.toSearchResult(match, progress.get(match.id));
      }),
    };
  }

  async searchAccessibleCatalog(
    studentId: string,
    rawQuery: string,
  ): Promise<StudentCourseSearchResultDto[]> {
    const query = rawQuery.trim().slice(0, 120);
    if (!query) return [];

    const matches = await this.courses.searchAccessibleCatalog(
      studentId,
      query,
      30,
    );
    const rankedMatches = matches
      .map((match) => ({
        match,
        rank: this.searchRank(match, query),
      }))
      .sort(
        (left, right) =>
          left.rank - right.rank ||
          left.match.title.localeCompare(right.match.title),
      )
      .slice(0, 5)
      .map(({ match }) => match);
    const contentMatches = rankedMatches.filter(
      (match) => match.kind === 'LESSON' || match.kind === 'MATERIAL',
    );
    const courseIds = [
      ...new Set(contentMatches.map((match) => match.courseId)),
    ];
    const progressEntries = await Promise.all(
      courseIds.map(async (courseId) => {
        const records = await this.progress.listForCourse(studentId, courseId);
        return [courseId, progressByContent(records)] as const;
      }),
    );
    const progressByCourse = new Map(progressEntries);

    return rankedMatches.map((match) => ({
      id: match.id,
      title: match.title,
      description: match.description,
      kind: match.kind.toLowerCase() as StudentCourseSearchResultDto['kind'],
      courseId: match.courseId,
      courseTitle: match.courseTitle,
      moduleId: match.moduleId,
      moduleTitle: match.moduleTitle,
      completed:
        progressByCourse.get(match.courseId)?.get(match.id)?.completedAt !=
        null,
    }));
  }

  async openContent(
    studentId: string,
    courseId: number,
    contentId: number,
  ): Promise<CourseContentDto> {
    await this.access.execute(studentId, courseId);
    const content = await this.courses.findPublishedContent(
      courseId,
      contentId,
    );
    if (!content) throw new CourseError('Conteúdo não encontrado.', 404);
    const progress = await this.progress.recordAccess(studentId, contentId);
    return contentDto(content, progress);
  }

  async completeContent(
    studentId: string,
    courseId: number,
    contentId: number,
  ): Promise<CourseCompletionDto> {
    await this.access.execute(studentId, courseId);
    const content = await this.courses.findPublishedContent(
      courseId,
      contentId,
    );
    if (!content) throw new CourseError('Conteúdo não encontrado.', 404);
    const progress = await this.progress.markCompleted(studentId, contentId);
    return {
      completed: true,
      completedAt: progress.completedAt!.toISOString(),
    };
  }

  async downloadMaterial(
    studentId: string,
    courseId: number,
    contentId: number,
    materialId: number,
  ): Promise<{ bytes: Uint8Array; name: string; mimeType: string; sizeBytes: number }> {
    await this.access.execute(studentId, courseId);
    const material = await this.courses.findPublishedMaterial(
      courseId,
      contentId,
      materialId,
    );
    if (!material) throw new CourseError('Material não encontrado.', 404);
    let bytes: Uint8Array;
    try {
      bytes = await this.materialStorage.download(material.storagePath);
    } catch {
      throw new CourseError('NÃ£o foi possÃ­vel acessar este material agora.', 503);
    }
    return {
      bytes,
      name: material.name,
      mimeType: material.mimeType,
      sizeBytes: material.sizeBytes,
    };
  }

  private toSearchResult(
    content: CourseContentSearchRecord,
    progress: ContentProgressRecord | undefined,
  ): CourseContentSearchResultDto {
    return {
      ...toContentSummary(content, progress),
      moduleId: content.moduleId,
      moduleTitle: content.moduleTitle,
    };
  }

  private toModuleSearchResult(
    module: CourseRecord['modules'][number],
    progress: Map<number, ContentProgressRecord>,
  ): CourseModuleSearchResultDto {
    const completedCount = module.contents.filter(
      (content) => progress.get(content.id)?.completedAt,
    ).length;

    return {
      id: module.id,
      title: module.title,
      description: module.description,
      kind: 'module',
      moduleId: module.id,
      moduleTitle: module.title,
      contentCount: module.contents.length,
      completedCount,
      progressPercent: toProgressPercent(module.contents.length, completedCount),
    };
  }

  private searchRank(record: CourseCatalogSearchRecord | CourseSearchRecord, query: string) {
    const normalizedTitle = record.title.toLocaleLowerCase('pt-BR');
    const normalizedQuery = query.toLocaleLowerCase('pt-BR');
    if (normalizedTitle.startsWith(normalizedQuery)) return 0;
    if (normalizedTitle.includes(normalizedQuery)) return 1;
    return 2;
  }
}
