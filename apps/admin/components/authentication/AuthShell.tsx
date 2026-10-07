import type { ReactNode } from 'react';
import styles from './AuthShell.module.css';

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className={styles.page}>
      <section className={styles.intro} aria-label="Ambiente de gestão">
        <div className={styles.mark} aria-hidden="true">
          T
        </div>
        <div>
          <h1>Um espaço para cuidar do conteúdo e acompanhar o aprendizado.</h1>
          <p>Área de trabalho de mentores e administradores.</p>
        </div>
        <small>TraderLab · Acesso da equipe</small>
      </section>
      <section className={styles.formArea}>{children}</section>
    </main>
  );
}
