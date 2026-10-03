import Link from 'next/link';
import type { UserProfileDto } from '@traderlab/contracts';
import { createSupabaseServerClient } from '../lib/supabase/server';
import { LogoutButton } from '../components/authentication/LogoutButton';

const roleNames: Record<UserProfileDto['role'], string> = {
  student: 'Aluno',
  mentor: 'Mentor',
  administrator: 'Administrador',
};

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return (
      <main className="home-page home-page-public">
        <header className="home-header">
          <Link className="brand-mark" href="/">
            <span className="brand-symbol" aria-hidden="true">
              T
            </span>
            <span>TraderLab</span>
          </Link>
          <nav aria-label="Acesso à plataforma">
            <Link className="text-link" href="/sign-in">
              Entrar
            </Link>
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

  const { data: sessionData } = await supabase.auth.getSession();
  let profile: UserProfileDto | null = null;
  if (sessionData.session?.access_token) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/authentication/me`,
        {
          headers: {
            authorization: `Bearer ${sessionData.session.access_token}`,
          },
          cache: 'no-store',
        },
      );
      if (response.ok) profile = (await response.json()) as UserProfileDto;
    } catch {
      profile = null;
    }
  }

  return (
    <main className="home-page">
      <header className="home-header">
        <Link className="brand-mark" href="/">
          <span className="brand-symbol" aria-hidden="true">
            T
          </span>
          <span>TraderLab</span>
        </Link>
        <div className="home-header-actions">
          <span className="profile-role">
            {profile ? roleNames[profile.role] : 'Conta TraderLab'}
          </span>
          <LogoutButton />
        </div>
      </header>
      <section className="welcome-panel">
        <p className="eyebrow">Sua área de aprendizagem</p>
        <h1>
          {profile?.name ? `Olá, ${profile.name}` : 'Bem-vindo ao TraderLab'}
        </h1>
        <p>
          {profile
            ? 'Sua conta está pronta. Em breve você encontrará seus cursos e poderá acompanhar seu progresso por aqui.'
            : 'Sua sessão foi validada, mas não conseguimos carregar seu perfil agora. Atualize a página em instantes.'}
        </p>
      </section>
    </main>
  );
}
