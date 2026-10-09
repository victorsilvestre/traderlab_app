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

export type UserProfileDetailsDto = UserProfileDto & {
  email: string | null;
  avatarUrl: string | null;
};

export type AdminUserSummaryDto = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
};

export type AdminUserPageDto = {
  items: AdminUserSummaryDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AdminUserEnrollmentDto = {
  courseId: number;
  courseTitle: string;
  status: 'active' | 'revoked';
  source: string;
  grantedAt: string;
};

export type AdminUserDetailsDto = AdminUserSummaryDto & {
  avatarUrl: string | null;
  enrollments: AdminUserEnrollmentDto[];
  progressSummary: {
    accessedContents: number;
    completedContents: number;
    lastActivityAt: string | null;
  };
  notificationSummary: {
    receivedCount: number;
    unreadCount: number;
  };
};

export type AdminEnrollmentDto = {
  id: number;
  userId: string;
  userName: string;
  userEmail: string | null;
  userPhone: string;
  userRole: string;
  courseId: number;
  courseTitle: string;
  source: 'purchase' | 'invitation' | 'manual';
  status: 'active' | 'revoked';
  grantedAt: string;
};

export type AdminEnrollmentPageDto = {
  items: AdminEnrollmentDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type AdminEnrollmentUserOptionDto = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
};

export type AdminEnrollmentOptionsDto = {
  users: AdminEnrollmentUserOptionDto[];
  courses: Array<{ id: number; title: string }>;
  publishedCourses: Array<{ id: number; title: string }>;
};

export type AdminEnrollmentInputDto = { userId: string; courseId: number };

export type AdminEnrollmentCreatedDto = { id: number; grantedAt: string };

export type AvatarUploadDto = {
  path: string;
  token: string;
};

export type CourseImageUploadDto = {
  path: string;
  token: string;
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
  eyebrowText: string | null;
  description: string;
  overlayText: string | null;
  imageUrl: string;
  destinationUrl: string | null;
  altText: string;
  displayOrder: number;
};

export type ManagedHomeBannerDto = HomeBannerDto & {
  internalName: string;
  description: string;
  status: 'published' | 'draft';
  imagePath: string;
};

export type ManagedHomeBannersDto = {
  items: ManagedHomeBannerDto[];
  activeCount: number;
  activeLimit: 5;
};

export type ManagedHomeBannerInputDto = {
  internalName: string;
  description: string;
  eyebrowText: string;
  overlayText: string;
  imagePath: string;
  destinationUrl: string;
  altText: string;
};

export type ReorderHomeBannersDto = { ids: number[] };

export type HomeBannerImageUploadRequestDto = {
  contentType: string;
  sizeBytes: number;
};

export type HomeBannerImageUploadDto = {
  path: string;
  token: string;
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

export type ManagedNotificationAudienceDto = 'general' | 'course';

export type ManagedNotificationDto = {
  id: number;
  title: string;
  description: string;
  linkUrl: string | null;
  audience: ManagedNotificationAudienceDto;
  courseId: number | null;
  courseTitle: string | null;
  sentAt: string;
  recipientCount: number;
};

export type ManagedNotificationPageDto = {
  items: ManagedNotificationDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ManagedNotificationRecipientDto = {
  name: string;
  email: string | null;
  sentAt: string;
};

export type ManagedNotificationDetailsDto = ManagedNotificationDto & {
  recipients: ManagedNotificationRecipientDto[];
  recipientPage: number;
  recipientPageSize: number;
  totalRecipients: number;
  totalRecipientPages: number;
};

export type ManagedNotificationCourseDto = {
  id: number;
  title: string;
};

export type ManagedNotificationInputDto = {
  title: string;
  description: string;
  linkUrl?: string | null;
  audience: ManagedNotificationAudienceDto;
  courseId?: number | null;
};

export type ManagedNotificationCreatedDto = {
  id: number;
  sentAt: string;
  recipientCount: number;
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

export type ManagedCourseStatusDto = 'draft' | 'published';

export type ManagedCourseDto = {
  id: number;
  title: string;
  description: string;
  coverImageUrl: string | null;
  coverImagePath: string | null;
  status: ManagedCourseStatusDto;
  moduleCount: number;
  updatedAt: string;
};

export type ManagedCoursePageDto = {
  items: ManagedCourseDto[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type ManagedCourseInputDto = {
  title: string;
  description: string;
  coverImagePath?: string | null;
};

export type ManagedCourseUpdateDto = Partial<ManagedCourseInputDto> & {
  status?: ManagedCourseStatusDto;
};

export type ManagedCourseModuleDto = {
  id: number;
  courseId: number;
  title: string;
  description: string;
  imageUrl: string | null;
  imagePath: string | null;
  position: number;
  status: ManagedCourseStatusDto;
  contentCount: number;
  contents: ManagedCourseContentDto[];
  updatedAt: string;
};

export type ManagedCourseContentDto = {
  id: number;
  title: string;
  description: string;
  imageUrl: string | null;
  imagePath: string | null;
  kind: CourseContentKindDto;
  status: ManagedCourseStatusDto;
  position: number;
  materials: Array<{
    id: number;
    name: string;
    description: string;
    mimeType: string;
    sizeBytes: number;
    position: number;
  }>;
};

export type ManagedLessonDto = {
  id: number;
  moduleId: number;
  title: string;
  description: string;
  body: string;
  videoUrl: string | null;
  imageUrl: string | null;
  imagePath: string | null;
  status: ManagedCourseStatusDto;
  position: number;
  materials: ManagedLessonMaterialDto[];
};

export type ManagedLessonMaterialDto = {
  id: number;
  name: string;
  description: string;
  mimeType: string;
  sizeBytes: number;
  position: number;
};

export type ManagedLessonMaterialInputDto = Partial<
  Pick<ManagedLessonMaterialDto, 'id'>
> &
  Omit<ManagedLessonMaterialDto, 'id'> & { uploadPath?: string };

export type ManagedLessonInputDto = {
  title: string;
  description?: string;
  body?: string;
  videoUrl?: string | null;
  materials?: ManagedLessonMaterialInputDto[];
};

export type ManagedLessonUpdateDto = Partial<ManagedLessonInputDto> & {
  imagePath?: string | null;
  status?: ManagedCourseStatusDto;
};

export type ReorderCourseLessonsDto = { orderedIds: number[] };

export type CourseMaterialUploadRequestDto = {
  courseId: number;
  moduleId: number;
  contentId: number;
  contentType: string;
  sizeBytes: number;
};

export type CourseMaterialUploadDto = { path: string; token: string };

export type ManagedCourseModulesDto = {
  course: Pick<ManagedCourseDto, 'id' | 'title' | 'status'>;
  items: ManagedCourseModuleDto[];
};

export type ManagedCourseModuleInputDto = {
  title: string;
  description?: string;
};

export type ManagedCourseModuleUpdateDto =
  Partial<ManagedCourseModuleInputDto> & {
    imagePath?: string | null;
    status?: ManagedCourseStatusDto;
  };

export type ReorderCourseModulesDto = {
  orderedIds: number[];
};

export type CourseImageTargetDto = {
  kind: 'course' | 'module' | 'content';
  id: number;
};

export type CourseImageUploadRequestDto = CourseImageTargetDto & {
  contentType: string;
  sizeBytes: number;
};

export type CourseContentSummaryDto = {
  id: number;
  title: string;
  description: string;
  kind: CourseContentKindDto;
  imageUrl: string | null;
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
  imageUrl: string | null;
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
  description: string;
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
