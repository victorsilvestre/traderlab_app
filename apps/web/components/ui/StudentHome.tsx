import { homeClass } from './homeStyles';
import type {
  CourseSummaryDto,
  HomeBannerDto,
  RecentContentDto,
} from '@traderlab/contracts';
import { BannerCarousel } from './BannerCarousel';
import { CourseList } from './CourseList';
import { RecentContentList } from './RecentContentList';

export function StudentHome({
  courses,
  coursesUnavailable,
  recentContents,
  recentContentsUnavailable,
  banners,
}: {
  courses: CourseSummaryDto[];
  coursesUnavailable: boolean;
  recentContents: RecentContentDto[];
  recentContentsUnavailable: boolean;
  banners: HomeBannerDto[];
}) {
  return (
    <main className={homeClass('student-home')}>
      <div className={homeClass('student-content')}>
        <BannerCarousel banners={banners} />
        <RecentContentList
          contents={recentContents}
          unavailable={recentContentsUnavailable}
          courses={courses}
        />
        <CourseList courses={courses} unavailable={coursesUnavailable} />
        <footer className={homeClass('student-footer')}>
          <span>Aprenda com método, no seu ritmo.</span>
        </footer>
      </div>
    </main>
  );
}
