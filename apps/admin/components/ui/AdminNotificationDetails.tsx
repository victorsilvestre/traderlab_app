import Link from 'next/link';
import type { ManagedNotificationDetailsDto } from '@traderlab/contracts';
import { AdminBackLink } from '../navigation/AdminBackLink';
import styles from './AdminNotificationDetails.module.css';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

export function AdminNotificationDetails({
  details,
  returnTo,
  errorMessage,
}: {
  details?: ManagedNotificationDetailsDto;
  returnTo: string;
  errorMessage?: string;
}) {
  if (!details) {
    return <div className={styles.feedback} role="alert">{errorMessage ?? 'Não foi possível carregar os detalhes.'}</div>;
  }
  const basePath = `/notifications/${details.id}`;
  return (
    <section className={styles.page} aria-labelledby="notification-title">
      <AdminBackLink href={returnTo} />
      <div className={styles.heading}>
        <div>
          <h1 id="notification-title">{details.title}</h1>
          <p>Detalhes da notificação enviada</p>
        </div>
      </div>
      <section className={styles.panel} aria-label="Informações do disparo">
        <div className={styles.meta}>
          <span>Enviada em {formatDate(details.sentAt)}</span>
          <span>{details.audience === 'general' ? 'Público geral' : `Curso: ${details.courseTitle ?? 'Curso removido'}`}</span>
          <span>{details.recipientCount} {details.recipientCount === 1 ? 'destinatário' : 'destinatários'}</span>
        </div>
        <p className={styles.message}>{details.description}</p>
        {details.linkUrl && <p><strong>Link: </strong><Link className={styles.link} href={details.linkUrl}>{details.linkUrl}</Link></p>}
      </section>
      <section className={styles.panel} aria-labelledby="recipients-title">
        <h2 id="recipients-title">Destinatários</h2>
        {details.recipients.length === 0 ? (
          <div className={styles.empty}>Nenhum destinatário registrado para este disparo.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Aluno</th><th>E-mail</th><th>Enviado em</th></tr></thead>
              <tbody>
                {details.recipients.map((recipient, index) => (
                  <tr key={`${recipient.email ?? recipient.name}-${index}`}>
                    <td data-label="Aluno">{recipient.name}</td>
                    <td data-label="E-mail">{recipient.email ?? 'E-mail indisponível'}</td>
                    <td data-label="Enviado em">{formatDate(recipient.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {details.totalRecipientPages > 1 && (
          <nav className={styles.pagination} aria-label="Paginação dos destinatários">
            <span>Página {details.recipientPage} de {details.totalRecipientPages}</span>
            <span>
              <Link aria-disabled={details.recipientPage <= 1} href={`${basePath}?page=${Math.max(1, details.recipientPage - 1)}&returnTo=${encodeURIComponent(returnTo)}`}>Anterior</Link>
              {'　'}
              <Link aria-disabled={details.recipientPage >= details.totalRecipientPages} href={`${basePath}?page=${Math.min(details.totalRecipientPages, details.recipientPage + 1)}&returnTo=${encodeURIComponent(returnTo)}`}>Próxima</Link>
            </span>
          </nav>
        )}
      </section>
    </section>
  );
}
