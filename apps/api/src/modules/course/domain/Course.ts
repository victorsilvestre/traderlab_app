export type PublicationState = 'DRAFT' | 'PUBLISHED';
export type CourseContentKind = 'LESSON' | 'MATERIAL';

export type ManagedCourse = {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  coverImagePath: string | null;
  status: PublicationState;
  moduleCount: number;
  updatedAt: Date;
};

export type NewManagedCourse = {
  createdById: string;
  title: string;
  description: string;
  coverImageUrl: string | null;
  coverImagePath: string | null;
};

export type ManagedCourseChanges = Partial<
  Pick<NewManagedCourse, 'title' | 'description' | 'coverImagePath'>
> & { status?: PublicationState };

export type ManagedCourseModule = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  imageUrl: string | null;
  imagePath: string | null;
  position: number;
  status: PublicationState;
  contentCount: number;
  contents: ManagedCourseContent[];
  updatedAt: Date;
};

export type ManagedCourseContent = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  imagePath: string | null;
  kind: CourseContentKind;
  status: PublicationState;
  position: number;
  materials: Array<
    Pick<
      CourseMaterialRecord,
      'id' | 'name' | 'description' | 'mimeType' | 'sizeBytes' | 'position'
    >
  >;
};

export type ManagedCourseModuleChanges = Partial<
  Pick<ManagedCourseModule, 'title' | 'description' | 'imagePath' | 'status'>
>;

export type NewManagedCourseModule = {
  title: string;
  description: string;
};

export type ManagedCourseModuleContext = {
  course: { id: number; title: string; status: PublicationState };
  items: ManagedCourseModule[];
};

export interface CourseManagementRepository {
  listManaged(
    query: string,
    status: PublicationState | undefined,
    skip: number,
    take: number,
  ): Promise<{ items: ManagedCourse[]; totalItems: number }>;
  getManaged(courseId: number): Promise<ManagedCourse | null>;
  createManaged(input: NewManagedCourse): Promise<ManagedCourse>;
  updateManaged(
    courseId: number,
    changes: ManagedCourseChanges,
  ): Promise<ManagedCourse | null>;
  listManagedModules(
    courseId: number,
  ): Promise<ManagedCourseModuleContext | null>;
  createManagedModule(
    courseId: number,
    input: NewManagedCourseModule,
  ): Promise<ManagedCourseModule | null>;
  updateManagedModule(
    courseId: number,
    moduleId: number,
    changes: ManagedCourseModuleChanges,
  ): Promise<ManagedCourseModule | null>;
  reorderManagedModules(
    courseId: number,
    orderedIds: number[],
  ): Promise<boolean>;
  lessonExists(
    courseId: number,
    moduleId: number,
    contentId: number,
  ): Promise<boolean>;
  getManagedLesson(
    courseId: number,
    moduleId: number,
    contentId: number,
  ): Promise<ManagedLessonRecord | null>;
  createManagedLesson(
    moduleId: number,
    input: ManagedLessonChanges,
  ): Promise<ManagedLessonRecord>;
  updateManagedLesson(
    courseId: number,
    moduleId: number,
    contentId: number,
    changes: ManagedLessonChanges,
  ): Promise<ManagedLessonRecord | null>;
  reorderManagedLessons(
    moduleId: number,
    orderedIds: number[],
  ): Promise<boolean>;
  imageTargetExists(kind: CourseImageTarget, id: number): Promise<boolean>;
}

export type ManagedLessonMaterial = {
  id?: number;
  name: string;
  description: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  position: number;
};

export type ManagedLessonChanges = {
  title: string;
  description: string;
  body: string;
  videoUrl: string | null;
  imagePath: string | null;
  status?: PublicationState;
  materials: Array<
    Omit<ManagedLessonMaterial, 'storagePath'> & { storagePath?: string }
  >;
};

export type ManagedLessonRecord = Omit<ManagedLessonChanges, 'materials'> & {
  id: number;
  moduleId: number;
  position: number;
  materials: Array<ManagedLessonMaterial & { id: number }>;
};

export type CourseContentRecord = {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  kind: CourseContentKind;
  body: string;
  videoUrl: string | null;
  resourceUrl: string | null;
  imagePath: string | null;
  position: number;
  status: PublicationState;
};

export type CourseModuleRecord = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  imagePath: string | null;
  position: number;
  status: PublicationState;
  contents: CourseContentRecord[];
};

export type CourseRecord = {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  coverImagePath: string | null;
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
  description: string;
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
  CourseContentSearchRecord | CourseModuleSearchRecord;

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
  createUpload(path: string): Promise<{ token: string }>;
  exists(storagePath: string): Promise<boolean>;
}

export interface CourseImageStorage {
  createUpload(path: string): Promise<{ token: string }>;
  createReadUrl(path: string): Promise<string>;
  exists(path: string): Promise<boolean>;
}

export type CourseImageTarget = 'course' | 'module' | 'content';
