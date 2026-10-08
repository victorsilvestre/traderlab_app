import styles from '../../../components/ui/AdminUserCatalog.module.css';

export default function AdminUsersLoading() {
  return (
    <section className={styles.loading} aria-label="Carregando usuários" aria-busy="true">
      <span />
      <span />
      <span />
    </section>
  );
}
