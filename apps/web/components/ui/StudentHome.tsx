import { homeClass } from './homeStyles';
import type {
  CourseSummaryDto,
  HomeBannerDto,
  NotificationListDto,
  RecentContentDto,
  UserProfileDetailsDto,
} from '@traderlab/contracts';
import { BannerCarousel } from './BannerCarousel';
import { CourseList } from './CourseList';
import { RecentContentList } from './RecentContentList';
import { StudentHeader } from './StudentHeader';
import { StudentDock } from './StudentDock';

export function StudentHome({
  profile,
  courses,
  coursesUnavailable,
  recentContents,
  recentContentsUnavailable,
  banners,
  notificationInbox,
}: {
  profile: UserProfileDetailsDto;
  courses: CourseSummaryDto[];
  coursesUnavailable: boolean;
  recentContents: RecentContentDto[];
  recentContentsUnavailable: boolean;
  banners: HomeBannerDto[];
  notificationInbox: NotificationListDto | null;
}) {
  return (
    <main className={homeClass('student-home')}>
      <StudentDock
        name={profile.name}
        avatarUrl={profile.avatarUrl}
        role={profile.role}
      />
      <StudentHeader
        name={profile.name}
        avatarUrl={profile.avatarUrl}
        role={profile.role}
        notificationInbox={notificationInbox}
        showAccount={false}
      />
      <div className={homeClass('student-content')}>
        <BannerCarousel banners={banners} />
        <RecentContentList
          contents={recentContents}
          unavailable={recentContentsUnavailable}
          courses={courses}
        />
        <CourseList courses={courses} unavailable={coursesUnavailable} />
        <footer className={homeClass('student-footer')}>
          <span>TraderLab</span>
          <span>Aprenda com método, no seu ritmo.</span>
        </footer>
      </div>
    </main>
  );
}
