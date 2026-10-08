import { redirect } from 'next/navigation';
import type { CourseSummaryDto } from '@traderlab/contracts';
import type { RecentContentDto } from '@traderlab/contracts';
import { StudentHome } from '../../../components/ui/StudentHome';
import { StudentSessionUnavailable } from '../../../components/ui/CourseContentView';
import { getCurrentUserProfile } from '../../../lib/authentication/getCurrentUserProfile';
import { getSignInPath } from '../../../lib/authentication/returnPath';
import { getStudentCourses } from '../../../lib/courses/courseApi';
import { getStudentRecentContents } from '../../../lib/progress/progressApi';
import { getHomeBanners } from '../../../lib/home/homeBannerApi';
import { getNotifications } from '../../../lib/notifications/notificationApi';

function isUnauthorized(error: unknown): boolean {
  return (
    typeof error === 'object' &&
    error !== null &&
    'statusCode' in error &&
    error.statusCode === 401
  );
}

export default async function StudentHomePage() {
  const signInPath = getSignInPath('/home');
  const { authenticated, profile, accessToken } = await getCurrentUserProfile();

  if (!authenticated) redirect(signInPath);
  if (!profile) return <StudentSessionUnavailable returnTo="/home" />;

  if (!accessToken) redirect(signInPath);

  const [coursesResult, recentResult, bannersResult, notificationsResult] =
    await Promise.allSettled([
      getStudentCourses(accessToken),
      getStudentRecentContents(accessToken),
      getHomeBanners(accessToken),
      getNotifications(accessToken, { filter: 'unread', limit: 4 }),
    ]);
  if (
    (coursesResult.status === 'rejected' &&
      isUnauthorized(coursesResult.reason)) ||
    (recentResult.status === 'rejected' &&
      isUnauthorized(recentResult.reason)) ||
    (bannersResult.status === 'rejected' &&
      isUnauthorized(bannersResult.reason)) ||
    (notificationsResult.status === 'rejected' &&
      isUnauthorized(notificationsResult.reason))
  ) {
    redirect(signInPath);
  }

  const courses: CourseSummaryDto[] =
    coursesResult.status === 'fulfilled' ? coursesResult.value : [];
  const recentContents: RecentContentDto[] =
    recentResult.status === 'fulfilled' ? recentResult.value : [];

  return (
    <StudentHome
      profile={profile}
      courses={courses}
      coursesUnavailable={coursesResult.status === 'rejected'}
      recentContents={recentContents}
      recentContentsUnavailable={recentResult.status === 'rejected'}
      banners={bannersResult.status === 'fulfilled' ? bannersResult.value : []}
      notificationInbox={
        notificationsResult.status === 'fulfilled'
          ? notificationsResult.value
          : null
      }
    />
  );
}
