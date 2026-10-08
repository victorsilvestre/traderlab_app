import type { ReactNode } from 'react';
import type { UserProfileDto } from '@traderlab/contracts';
import Link from 'next/link';
import { SignOutButton } from '../authentication/SignOutButton';
import { WorkspaceNavigation } from '../navigation/WorkspaceNavigation';
import styles from './WorkspaceShell.module.css';

const roleLabel = { mentor: 'Mentor', administrator: 'Administrador' } as const;

export function WorkspaceShell({
  profile,
  children,
}: {
  profile: UserProfileDto;
  children: ReactNode;
}) {
  const label =
    profile.role === 'mentor' || profile.role === 'administrator'
      ? roleLabel[profile.role]
      : 'Equipe';
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            T
          </span>
          <span>
            TraderLab <small>Gestão</small>
          </span>
        </div>
        <WorkspaceNavigation isAdministrator={profile.role === 'administrator'} />
        <p className={styles.sidebarNote}>
          Novas áreas administrativas serão acrescentadas em etapas.
        </p>
      </aside>
      <div className={styles.mainArea}>
        <header className={styles.header}>
          <span>Ambiente de gestão</span>
          <div className={styles.account}>
            <span className={styles.avatar} aria-hidden="true">
              {profile.name.trim().charAt(0).toLocaleUpperCase('pt-BR') || 'T'}
            </span>
            <span>
              {profile.name} <small>· {label}</small>
            </span>
            <SignOutButton />
          </div>
        </header>
        <main className={styles.content}>{children}</main>
      </div>
    </div>
  );
}
