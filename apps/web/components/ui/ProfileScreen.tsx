import Link from 'next/link';
import type { UserProfileDetailsDto } from '@traderlab/contracts';
import { homeClass } from './homeStyles';
import { ProfileForm } from './ProfileForm';
import { StudentHeader } from './StudentHeader';
import styles from './ProfileScreen.module.css';

export function ProfileScreen({ profile }: { profile: UserProfileDetailsDto }) {
  return (
    <main className={homeClass('student-home')}>
      <StudentHeader
        name={profile.name}
        avatarUrl={profile.avatarUrl}
        role={profile.role}
        homeHref="/home"
      />
      <div className={homeClass('student-content')}>
        <div className={styles.content}>
          <Link
            className={styles.backLink}
            href="/home"
          >
            ← Voltar
          </Link>
          <div className={styles.heading}>
            <p className={styles.eyebrow}>SUA CONTA</p>
            <h1>Meu perfil</h1>
            <p>Visualize e atualize seus dados pessoais.</p>
          </div>
          <section className={styles.card} aria-label="Dados do perfil">
            <ProfileForm profile={profile} />
          </section>
        </div>
      </div>
    </main>
  );
}
