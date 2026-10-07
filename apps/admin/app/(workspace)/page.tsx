import styles from './page.module.css';
import Link from 'next/link';

export default function WorkspaceHomePage() {
  return (
    <>
      <h1 className={styles.title}>Bem-vindo ao ambiente de gestão.</h1>
      <p className={styles.lead}>
        Este é o espaço de trabalho para administrar o TraderLab.
      </p>
      <section className={styles.notice} aria-label="Estado da gestão">
        <h2>Catálogo de cursos</h2>
        <p>
          Consulte cursos existentes, atualize suas informações e controle a
          publicação.
        </p>
        <Link href="/courses">Abrir catálogo de cursos</Link>
      </section>
    </>
  );
}
