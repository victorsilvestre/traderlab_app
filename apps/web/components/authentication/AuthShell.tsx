import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="auth-layout">
      <section className="auth-content" aria-label="Acesso à plataforma">
        <Link className="brand-mark auth-brand" href="/" aria-label="TraderLab, página inicial">
          <span className="brand-symbol" aria-hidden="true">T</span>
          <span>TraderLab</span>
        </Link>
        <div className="auth-form-host">{children}</div>
      </section>

      <aside className="auth-visual" aria-label="Conheça o TraderLab">
        <Image
          className="auth-visual-image"
          src="/authentication-study.png"
          alt=""
          fill
          priority
          sizes="(max-width: 850px) 0vw, 75vw"
        />
        <div className="auth-visual-shade" />
        <div className="auth-visual-copy">
          <p className="eyebrow">Aprenda com método</p>
          <h2>Seu próximo passo começa com uma boa base.</h2>
          <p>Conhecimento que vira prática.</p>
        </div>
      </aside>
    </main>
  );
}
