import styles from '../../../../../../components/navigation/NavigationFeedback.module.css';

export default function CourseContentLoading() {
  return (
    <div className={styles.indicator} role="status" aria-label="Carregando aula">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.srOnly}>Carregando aula</span>
    </div>
  );
}
