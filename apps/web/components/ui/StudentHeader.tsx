import { homeClass } from './homeStyles';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { AccountMenu } from './AccountMenu';
import type { UserProfileDetailsDto } from '@traderlab/contracts';

export async function StudentHeader({
  name,
  avatarUrl,
  role,
  homeHref,
  showAccount = true,
}: {
  name: string;
  avatarUrl?: string | null;
  role?: UserProfileDetailsDto['role'];
  homeHref?: string;
  showAccount?: boolean;
}) {
  return (
    <header className={homeClass('student-header')}>
      <div className={homeClass('student-header-actions')}>
        <Link className={homeClass('student-home-link')} href={homeHref ?? '/home'}>
          <ArrowLeft aria-hidden="true" size={15} /> Início
        </Link>
        {showAccount ? (
          <AccountMenu
            name={name}
            avatarUrl={avatarUrl}
            roleLabel={
              role
                ? {
                    student: 'Aluno',
                    mentor: 'Mentor',
                    administrator: 'Administrador',
                  }[role]
                : 'Aluno'
            }
          />
        ) : (
          <span className={homeClass('student-profile-label')}>{name}</span>
        )}
      </div>
    </header>
  );
}
