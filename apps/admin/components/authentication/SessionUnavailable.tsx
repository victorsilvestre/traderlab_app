'use client';

import styles from './SessionState.module.css';

export function SessionUnavailable() {
  return (
    <main className={styles.page}>
      <section className={styles.card} role="alert">
        <p className={styles.eyebrow}>TraderLab / Gestão</p>
        <h1>Não conseguimos verificar sua sessão agora.</h1>
        <p>
          Seus dados de acesso foram preservados. Tente novamente em instantes.
        </p>
        <button type="button" onClick={() => window.location.reload()}>
          Tentar novamente
        </button>
      </section>
    </main>
  );
}
