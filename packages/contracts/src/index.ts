export type HealthStatus = {
  status: 'ok';
};

export type UserRole = 'student' | 'mentor' | 'administrator';

export type UserProfileDto = {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
};

export type SignInDto = {
  session: {
    accessToken: string;
    refreshToken: string;
    expiresAt: number | null;
  };
  user: UserProfileDto;
};

export type MessageDto = {
  message: string;
};

export type ApiErrorDto = {
  message: string;
};

export type CourseContentKindDto = 'lesson' | 'material';

export type CourseSummaryDto = {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  contentCount: number;
  completedCount: number;
  progressPercent: number;
};

export type CourseContentSummaryDto = {
  id: number;
  title: string;
  description: string;
  kind: CourseContentKindDto;
  completed: boolean;
  lastAccessedAt: string | null;
};

export type CourseModuleDto = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  contentCount: number;
  completedCount: number;
  progressPercent: number;
  contents: CourseContentSummaryDto[];
};

export type CourseDetailDto = CourseSummaryDto & {
  modules: CourseModuleDto[];
  lastAccessedContent: CourseContentSummaryDto | null;
};

export type CourseContentSearchResultDto = CourseContentSummaryDto & {
  moduleId: number;
  moduleTitle: string;
};

export type CourseModuleSearchResultDto = {
  id: number;
  title: string;
  description: string;
  kind: 'module';
  moduleId: number;
  moduleTitle: string;
  contentCount: number;
  completedCount: number;
  progressPercent: number;
};

export type CourseSearchResultDto =
  | CourseContentSearchResultDto
  | CourseModuleSearchResultDto;

export type CourseContentDto = CourseContentSummaryDto & {
  courseId: number;
  courseTitle: string;
  moduleId: number;
  moduleTitle: string;
  body: string;
  resourceUrl: string | null;
};

export type CourseSearchDto = {
  query: string;
  results: CourseSearchResultDto[];
};

export type StudentCourseSearchResultDto = {
  id: number;
  title: string;
  description: string;
  kind: 'course' | 'module' | CourseContentKindDto;
  courseId: number;
  courseTitle: string;
  moduleId: number | null;
  moduleTitle: string | null;
  completed: boolean;
};

export type CourseCompletionDto = {
  completed: true;
  completedAt: string;
};
