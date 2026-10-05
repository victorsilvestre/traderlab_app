import Link from 'next/link';
import { redirect } from 'next/navigation';
import type { UserProfileDto } from '@traderlab/contracts';
import { LogoutButton } from '../components/authentication/LogoutButton';
import { getCurrentUserProfile } from '../lib/authentication/getCurrentUserProfile';

const roleNames: Record<UserProfileDto['role'], string> = {
  student: 'Aluno',
  mentor: 'Mentor',
  administrator: 'Administrador',
};

export default async function HomePage() {
  const { authenticated, profile } = await getCurrentUserProfile();

  if (!authenticated) {
    return (
      <main className="home-page home-page-public">
        <header className="home-header">
          <Link className="brand-mark" href="/">
            <span className="brand-symbol" aria-hidden="true">T</span>
            <span>TraderLab</span>
          </Link>
          <nav aria-label="Acesso à plataforma">
            <Link className="text-link" href="/sign-in">Entrar</Link>
            <Link className="primary-button header-button" href="/sign-up">
              Criar conta
            </Link>
          </nav>
        </header>
        <section className="home-intro">
          <p className="eyebrow">Aprenda com método</p>
          <h1>Construa conhecimento para operar com mais clareza.</h1>
          <p>
            Entre na plataforma para acompanhar seus estudos e avançar no seu
            ritmo.
          </p>
          <Link className="primary-button intro-button" href="/sign-up">
            Começar agora
          </Link>
        </section>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="home-page">
        <header className="home-header">
          <Link className="brand-mark" href="/">
            <span className="brand-symbol" aria-hidden="true">T</span>
            <span>TraderLab</span>
          </Link>
          <LogoutButton />
        </header>
        <section className="welcome-panel">
          <p className="eyebrow">SUA ÁREA DE APRENDIZAGEM</p>
          <h1>Não conseguimos carregar seu perfil.</h1>
          <p>Atualize a página em instantes. Sua sessão continua protegida.</p>
        </section>
      </main>
    );
  }

  if (profile.role === 'student') redirect('/home');

  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="brand-mark" href="/" aria-label="TraderLab, início">
          <span className="brand-symbol" aria-hidden="true">T</span>
          <span>TraderLab</span>
        </Link>
        <div className="home-header-actions">
          <span className="profile-role">{roleNames[profile.role]}</span>
          <LogoutButton />
        </div>
      </header>
      <section className="welcome-panel workspace-pending">
        <p className="eyebrow">ÁREA DE TRABALHO</p>
        <h1>Olá, {profile.name?.split(' ')[0] || roleNames[profile.role]}.</h1>
        <p>
          Esta página inicial é dedicada aos alunos. O espaço de trabalho do seu
          perfil será disponibilizado em uma área própria.
        </p>
      </section>
    </main>
  );
}
