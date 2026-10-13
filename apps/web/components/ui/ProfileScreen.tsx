import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import type { UserProfileDetailsDto } from '@traderlab/contracts';
import { homeClass } from './homeStyles';
import { ProfileForm } from './ProfileForm';
import { ProfileCompletionModal } from './ProfileCompletionModal';
import { LogoutButton } from '../authentication/LogoutButton';
import styles from './ProfileScreen.module.css';

export function ProfileScreen({ profile }: { profile: UserProfileDetailsDto }) {
  const completionRequired = !profile.phone.trim();
  return (
    <main className={homeClass('student-home')}>
      <div className={homeClass('student-content')}>
        <div className={styles.content}>
          <Link
            className={styles.backLink}
            href="/home"
          >
            <ArrowLeft aria-hidden="true" size={15} /> Voltar
          </Link>
          <div className={styles.heading}>
            <h1>Meu perfil</h1>
            <p>Visualize e atualize seus dados pessoais.</p>
          </div>
          {!completionRequired && (
            <>
              <section className={styles.card} aria-label="Dados do perfil">
                <ProfileForm profile={profile} />
              </section>
              <div className={styles.profileLogout}>
                <p>Deseja encerrar sua sessão?</p>
                <LogoutButton />
              </div>
            </>
          )}
        </div>
      </div>
      {completionRequired && (
        <ProfileCompletionModal>
          <h2 id="complete-profile-title">Complete seus dados</h2>
          <p>Informe seu telefone para concluir o cadastro e acessar a plataforma.</p>
          <ProfileForm profile={profile} completionRequired />
        </ProfileCompletionModal>
      )}
    </main>
  );
}
