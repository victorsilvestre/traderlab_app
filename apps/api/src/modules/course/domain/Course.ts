export type PublicationState = 'DRAFT' | 'PUBLISHED';
export type CourseContentKind = 'LESSON' | 'MATERIAL';

export type CourseContentRecord = {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  kind: CourseContentKind;
  body: string;
  videoUrl: string | null;
  resourceUrl: string | null;
  position: number;
  status: PublicationState;
};

export type CourseModuleRecord = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  position: number;
  status: PublicationState;
  contents: CourseContentRecord[];
};

export type CourseRecord = {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  status: PublicationState;
  modules: CourseModuleRecord[];
};

export type CourseContentLocation = CourseContentRecord & {
  courseId: number;
  courseTitle: string;
  moduleTitle: string;
  materials: CourseMaterialRecord[];
};

export type CourseMaterialRecord = {
  id: number;
  contentId: number;
  name: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  position: number;
};

export type CourseContentSearchRecord = CourseContentRecord & {
  resultType: 'CONTENT';
  courseId: number;
  moduleTitle: string;
};

export type CourseModuleSearchRecord = {
  resultType: 'MODULE';
  id: number;
  title: string;
  description: string;
};

export type CourseSearchRecord =
  | CourseContentSearchRecord
  | CourseModuleSearchRecord;

export type CourseCatalogSearchRecord = {
  id: number;
  title: string;
  description: string;
  kind: 'COURSE' | 'MODULE' | CourseContentKind;
  courseId: number;
  courseTitle: string;
  moduleId: number | null;
  moduleTitle: string | null;
};

export interface CourseRepository {
  listAccessiblePublished(studentId: string): Promise<CourseRecord[]>;
  findPublishedCourse(courseId: number): Promise<CourseRecord | null>;
  findPublishedContent(
    courseId: number,
    contentId: number,
  ): Promise<CourseContentLocation | null>;
  findPublishedMaterial(
    courseId: number,
    contentId: number,
    materialId: number,
  ): Promise<CourseMaterialRecord | null>;
  searchPublishedCourseItems(
    courseId: number,
    query: string,
    limit: number,
  ): Promise<CourseSearchRecord[]>;
  searchAccessibleCatalog(
    studentId: string,
    query: string,
    limit: number,
  ): Promise<CourseCatalogSearchRecord[]>;
}

export interface CourseMaterialStorage {
  download(storagePath: string): Promise<Uint8Array>;
}
