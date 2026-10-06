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

export type HomeBannerDto = {
  id: number;
  title: string;
  imagePath: string;
  destinationUrl: string | null;
  altText: string;
  displayOrder: number;
};

export type NotificationAudienceDto = 'general' | 'course';

export type NotificationDto = {
  id: number;
  title: string;
  description: string;
  linkUrl: string | null;
  audience: NotificationAudienceDto;
  courseId: number | null;
  courseTitle: string | null;
  sentAt: string;
  readAt: string | null;
};

export type NotificationListDto = {
  items: NotificationDto[];
  unreadCount: number;
  nextOffset: number | null;
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

export type RecentContentDto = {
  contentId: number;
  title: string;
  kind: CourseContentKindDto;
  courseId: number;
  courseTitle: string;
  moduleId: number;
  moduleTitle: string;
  completed: boolean;
  lastAccessedAt: string;
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
  CourseContentSearchResultDto | CourseModuleSearchResultDto;

export type CourseContentDto = CourseContentSummaryDto & {
  courseId: number;
  courseTitle: string;
  moduleId: number;
  moduleTitle: string;
  body: RichTextDocumentDto;
  videoUrl: string | null;
  resourceUrl: string | null;
  materials: CourseMaterialDto[];
};

export type RichTextMarkDto = 'bold' | 'italic' | 'underline';

export type RichTextNodeDto =
  | { type: 'text'; text: string; marks?: RichTextMarkDto[] }
  | { type: 'link'; text: string; href: string }
  | { type: 'paragraph'; children: RichTextNodeDto[] }
  | { type: 'heading'; level: 2 | 3; children: RichTextNodeDto[] }
  | { type: 'bulletList' | 'orderedList'; children: RichTextNodeDto[] }
  | { type: 'listItem'; children: RichTextNodeDto[] }
  | { type: 'blockquote'; children: RichTextNodeDto[] };

export type RichTextDocumentDto = {
  type: 'doc';
  children: RichTextNodeDto[];
};

export type CourseMaterialDto = {
  id: number;
  name: string;
  mimeType: string;
  sizeBytes: number;
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
