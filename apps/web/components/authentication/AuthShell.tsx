import type { ReactNode } from 'react';
import Link from 'next/link';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-story" aria-label="Sobre o TraderLab">
        <Link className="brand-mark" href="/" aria-label="TraderLab, página inicial">
          <span className="brand-symbol" aria-hidden="true">T</span>
          <span>TraderLab</span>
        </Link>
        <div className="story-copy">
          <p className="eyebrow">Aprenda com método</p>
          <h2>Seu próximo passo começa com uma boa base.</h2>
          <p>
            Acesse seus estudos, acompanhe seu progresso e evolua no seu ritmo.
          </p>
        </div>
        <div className="story-footnote">
          <span className="story-rule" />
          <span>Conhecimento que vira prática.</span>
        </div>
      </section>
      <section className="auth-content" aria-label="Acesso à plataforma">
        {children}
      </section>
    </main>
  );
}
