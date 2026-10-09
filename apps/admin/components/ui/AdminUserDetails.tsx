import { AdminBackLink } from '../navigation/AdminBackLink';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import styles from './AdminUserDetails.module.css';

function formatDate(value: string | null) {
  if (!value) return 'Indisponível';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

function roleLabel(role: string) {
  const labels: Record<string, string> = {
    student: 'Aluno',
    administrator: 'Administrador',
    mentor: 'Mentor',
  };
  return labels[role.toLowerCase()] ?? role;
}

function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    purchase: 'Compra',
    invitation: 'Convite',
    manual: 'Manual',
  };
  return labels[source.toLowerCase()] ?? source;
}

export type AdminUserView = {
  id: string;
  name: string;
  email: string | null;
  phone: string;
  role: string;
  createdAt: string;
  lastLoginAt: string | null;
  avatarUrl: string | null;
  enrollments: Array<{
    courseId: number;
    courseTitle: string;
    status: 'active' | 'revoked';
    source: string;
    grantedAt: string;
  }>;
  progressSummary: {
    accessedContents: number;
    completedContents: number;
    lastActivityAt: string | null;
  };
  notificationSummary: { receivedCount: number; unreadCount: number };
};

export function AdminUserDetails({
  user,
  backHref,
  enrollmentReturnTo,
}: {
  user: AdminUserView;
  backHref: string;
  enrollmentReturnTo: string;
}) {
  return (
    <section className={styles.details} aria-labelledby="user-title">
      <AdminBackLink href={backHref} />
      <div className={styles.heading}>
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img className={styles.avatar} src={user.avatarUrl} alt="" />
        ) : (
          <span className={styles.avatarFallback} aria-hidden="true">
            {user.name.trim().charAt(0).toUpperCase() || '?'}
          </span>
        )}
        <div>
          <h1 id="user-title">{user.name || 'Nome não informado'}</h1>
          <p>{roleLabel(user.role)}</p>
        </div>
      </div>
      <div className={styles.sections}>
        <section className={styles.card} aria-labelledby="profile-heading">
          <h2 id="profile-heading">Dados cadastrais</h2>
          <dl>
            <div><dt>E-mail</dt><dd>{user.email || 'E-mail indisponível'}</dd></div>
            <div><dt>Telefone</dt><dd>{user.phone || 'Telefone indisponível'}</dd></div>
            <div><dt>Papel</dt><dd>{roleLabel(user.role)}</dd></div>
            <div><dt>Data de cadastro</dt><dd>{formatDate(user.createdAt)}</dd></div>
            <div><dt>Último login</dt><dd>{formatDate(user.lastLoginAt)}</dd></div>
          </dl>
        </section>
        <section className={styles.card} aria-labelledby="enrollments-heading">
          <div className={styles.cardHeading}>
            <div className={styles.enrollmentHeading}>
              <h2 id="enrollments-heading">Matrículas</h2>
              <span>{user.enrollments.length}</span>
            </div>
            <Link className={styles.addEnrollment} href={`/enrollments/new?userId=${encodeURIComponent(user.id)}&returnTo=${encodeURIComponent(enrollmentReturnTo)}`} aria-label={`Matricular ${user.name} em um curso`} title="Matricular em curso">
              <Plus aria-hidden="true" size={20} strokeWidth={1.8} />
            </Link>
          </div>
          {user.enrollments.length ? (
            <ul className={styles.enrollmentList}>
              {user.enrollments.map((enrollment) => (
                <li key={enrollment.courseId}>
                  <div className={styles.enrollmentMain}>
                    <strong>{enrollment.courseTitle}</strong>
                    <span className={enrollment.status === 'active' ? styles.active : styles.revoked}>
                      {enrollment.status === 'active' ? 'Ativa' : 'Revogada'}
                    </span>
                  </div>
                  <div className={styles.enrollmentMeta}>
                    <span>Origem: {sourceLabel(enrollment.source)}</span>
                    <span>Concedida em {formatDate(enrollment.grantedAt)}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : <p className={styles.empty}>Este usuário ainda não tem matrículas.</p>}
        </section>
        <section className={styles.card} aria-labelledby="progress-heading">
          <h2 id="progress-heading">Progresso de aprendizagem</h2>
          <div className={styles.metrics}>
            <div><strong>{user.progressSummary.accessedContents}</strong><span>Aulas acessadas</span></div>
            <div><strong>{user.progressSummary.completedContents}</strong><span>Aulas concluídas</span></div>
          </div>
          <p className={styles.lastActivity}>Última atividade de aprendizagem: {formatDate(user.progressSummary.lastActivityAt)}</p>
        </section>
        <section className={styles.card} aria-labelledby="notifications-heading">
          <h2 id="notifications-heading">Notificações</h2>
          <div className={styles.metrics}>
            <div><strong>{user.notificationSummary.receivedCount}</strong><span>Recebidas</span></div>
            <div><strong>{user.notificationSummary.unreadCount}</strong><span>Não lidas</span></div>
          </div>
        </section>
      </div>
    </section>
  );
}
