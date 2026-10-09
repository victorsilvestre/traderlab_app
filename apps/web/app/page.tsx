import Link from 'next/link';
import { redirect } from 'next/navigation';
import { LogoutButton } from '../components/authentication/LogoutButton';
import { getCurrentUserProfile } from '../lib/authentication/getCurrentUserProfile';

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

  redirect(profile.phone.trim() ? '/home' : '/profile?complete=1');
}
