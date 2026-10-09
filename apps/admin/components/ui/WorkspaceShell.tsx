import type { ReactNode } from 'react';
import Image from 'next/image';
import type { UserProfileDto } from '@traderlab/contracts';
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
          <Image
            className={styles.brandLogo}
            src="/logos/logo-verde-fundo-claro.png"
            alt="Trader Bruno Borges"
            width={220}
            height={50}
            priority
          />
        </div>
        <WorkspaceNavigation isAdministrator={profile.role === 'administrator'} />
        <p className={styles.sidebarNote}>
          Novas áreas administrativas serão acrescentadas em etapas.
        </p>
      </aside>
      <div className={styles.mainArea}>
        <header className={styles.header}>
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
