import Link from 'next/link';
import styles from './AdminBackLink.module.css';

export function AdminBackLink({ href }: { href: string }) {
  return (
    <Link className={styles.link} href={href}>
      ← Voltar
    </Link>
  );
}
