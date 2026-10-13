import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';
import { LogoutButton } from '../components/authentication/LogoutButton';
import { getCurrentUserProfile } from '../lib/authentication/getCurrentUserProfile';
import styles from './PublicLanding.module.css';

export default async function HomePage() {
  const { authenticated, profile } = await getCurrentUserProfile();

  if (!authenticated) {
    return (
      <main className={styles.page}>
        <header className={styles.header}>
          <Link className={styles.brand} href="/" aria-label="Trader Bruno Borges, página inicial">
            <Image className={styles.brandImage} src="/logos/logo-verde-fundo-claro.png" alt="Trader Bruno Borges" width={1137} height={306} priority />
          </Link>
          <nav className={styles.nav} aria-label="Acesso à plataforma">
            <Link className={styles.signIn} href="/sign-in">Entrar</Link>
            <Link className={styles.button} href="/sign-up">
              Criar conta
            </Link>
          </nav>
        </header>
        <section className={styles.hero}>
          <div className={styles.copy}>
            <h1>Construa conhecimento para operar com mais clareza.</h1>
            <p>Entre na plataforma para acompanhar seus estudos e avançar no seu ritmo.</p>
            <div className={styles.actions}>
              <Link className={styles.button} href="/sign-up">Começar agora</Link>
              <Link className={styles.signIn} href="/sign-in">Já tenho uma conta</Link>
            </div>
          </div>
          <div className={styles.imagePanel}>
            <Image className={styles.image} src="/authentication-study.png" alt="Mesa de estudos diante da cidade ao entardecer" fill priority sizes="(max-width: 680px) 100vw, 52vw" />
            <div className={styles.imageShade} />
            <p className={styles.imageCaption}>Conhecimento que vira prática.</p>
          </div>
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
        <section className={styles.profileError}>
          <h1>Não conseguimos carregar seu perfil.</h1>
          <p>Atualize a página em instantes. Sua sessão continua protegida.</p>
        </section>
      </main>
    );
  }

  redirect(profile.phone.trim() ? '/home' : '/profile?complete=1');
}
