import styles from '../../../../../../components/navigation/NavigationFeedback.module.css';
import { StudentWorkspaceShell } from '../../../../../../components/ui/StudentWorkspaceShell';
import { getCurrentUserProfile } from '../../../../../../lib/authentication/getCurrentUserProfile';

export default async function CourseContentLoading() {
  const { authenticated, profile } = await getCurrentUserProfile();
  const indicator = (
    <div className={styles.indicator} role="status" aria-label="Carregando aula">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.srOnly}>Carregando aula</span>
    </div>
  );

  if (!authenticated || !profile) return indicator;

  return (
    <StudentWorkspaceShell profile={profile}>
      <main className="course-content-loading-page">{indicator}</main>
    </StudentWorkspaceShell>
  );
}
