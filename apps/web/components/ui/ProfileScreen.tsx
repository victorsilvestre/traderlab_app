import Link from 'next/link';
import type { UserProfileDetailsDto } from '@traderlab/contracts';
import { homeClass } from './homeStyles';
import { ProfileForm } from './ProfileForm';
import { ProfileCompletionModal } from './ProfileCompletionModal';
import { StudentHeader } from './StudentHeader';
import styles from './ProfileScreen.module.css';

export function ProfileScreen({ profile }: { profile: UserProfileDetailsDto }) {
  const completionRequired = !profile.phone.trim();
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
          {!completionRequired && (
            <section className={styles.card} aria-label="Dados do perfil">
              <ProfileForm profile={profile} />
            </section>
          )}
        </div>
      </div>
      {completionRequired && (
        <ProfileCompletionModal>
          <p className={styles.eyebrow}>QUASE LÁ</p>
          <h2 id="complete-profile-title">Complete seus dados</h2>
          <p>Informe seu telefone para concluir o cadastro e acessar a plataforma.</p>
          <ProfileForm profile={profile} completionRequired />
        </ProfileCompletionModal>
      )}
    </main>
  );
}
