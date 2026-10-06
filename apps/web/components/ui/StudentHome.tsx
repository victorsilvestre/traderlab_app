import { homeClass } from './homeStyles';
import type { CourseSummaryDto, HomeBannerDto, RecentContentDto, UserProfileDto } from '@traderlab/contracts';
import { BannerCarousel } from './BannerCarousel';
import { CourseList } from './CourseList';
import { RecentContentList } from './RecentContentList';
import { StudentHeader } from './StudentHeader';

export function StudentHome({
  profile,
  courses,
  coursesUnavailable,
  recentContents,
  recentContentsUnavailable,
  banners,
}: {
  profile: UserProfileDto;
  courses: CourseSummaryDto[];
  coursesUnavailable: boolean;
  recentContents: RecentContentDto[];
  recentContentsUnavailable: boolean;
  banners: HomeBannerDto[];
}) {
  const firstName = profile.name?.trim().split(/\s+/)[0] || 'aluno';

  return (
    <main className={homeClass('student-home')}>
      <StudentHeader name={profile.name} />
      <div className={homeClass('student-content')}>
        <div className={homeClass('student-greeting')}>
          <div>
            <p className="eyebrow">SUA ÁREA DE APRENDIZAGEM</p>
            <h1>Olá, {firstName}.</h1>
          </div>
          <p>Um bom estudo começa pelo próximo passo.</p>
        </div>
        <BannerCarousel banners={banners} />
        <RecentContentList
          contents={recentContents}
          unavailable={recentContentsUnavailable}
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
