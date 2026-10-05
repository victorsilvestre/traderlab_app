import { homeClass } from './homeStyles';
import Link from 'next/link';
import { AccountMenu } from './AccountMenu';
import { HomeSearch } from './HomeSearch';
import { NotificationMenu } from './NotificationMenu';

export function StudentHeader({ name }: { name: string }) {
  return (
    <header className={homeClass('student-header')}>
      <Link className={homeClass('brand-mark')} href="/home" aria-label="TraderLab, início">
        <span className={homeClass('brand-symbol')} aria-hidden="true">T</span>
        <span>TraderLab</span>
      </Link>
      <div className={homeClass('student-header-actions')}>
        <HomeSearch />
        <NotificationMenu />
        <AccountMenu name={name} />
      </div>
    </header>
  );
}
