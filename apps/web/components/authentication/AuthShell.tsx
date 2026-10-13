import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import styles from './AuthShell.module.css';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.layout}>
      <section className={styles.content} aria-label="Acesso à plataforma">
        <Link className={styles.brand} href="/" aria-label="Trader Bruno Borges, página inicial">
          <Image className={styles.brandImage} src="/logos/logo-verde-fundo-claro.png" alt="Trader Bruno Borges" width={1137} height={306} priority />
        </Link>
        <div className={styles.formHost}>{children}</div>
      </section>

      <aside className={styles.visual} aria-label="Conheça o TraderLab">
        <Image
          className={styles.visualImage}
          src="/authentication-study.png"
          alt=""
          fill
          priority
          sizes="(max-width: 760px) 0vw, 55vw"
        />
        <div className={styles.visualShade} />
        <div className={styles.visualCopy}>
          <h2>Seu próximo passo começa com uma boa base.</h2>
          <p className={styles.visualFootnote}>Conhecimento que vira prática.</p>
        </div>
      </aside>
    </main>
  );
}
