import Link from 'next/link';
import { Eye, Plus } from 'lucide-react';
import type { ManagedNotificationPageDto } from '@traderlab/contracts';
import { AdminBackLink } from '../navigation/AdminBackLink';
import styles from './AdminNotificationCatalog.module.css';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

export function AdminNotificationCatalog({
  pageData,
  returnTo,
  errorMessage,
}: {
  pageData?: ManagedNotificationPageDto;
  returnTo: string;
  errorMessage?: string;
}) {
  const currentPage = pageData?.page ?? 1;
  const totalPages = pageData?.totalPages ?? 0;
  const currentHref = currentPage > 1 ? `/notifications?page=${currentPage}` : '/notifications';
  const originHref = returnTo !== '/'
    ? `${currentHref}${currentPage > 1 ? '&' : '?'}returnTo=${encodeURIComponent(returnTo)}`
    : currentHref;
  return (
    <section className={styles.page} aria-labelledby="notifications-title">
        <AdminBackLink href={returnTo} />
      <div className={styles.heading}>
        <div>
          <h1 id="notifications-title">Notificações</h1>
          <p>Consulte os disparos e acompanhe quem recebeu cada mensagem.</p>
        </div>
        <Link className={styles.addLink} href={`/notifications/new?returnTo=${encodeURIComponent(originHref)}`} aria-label="Nova notificação" data-tooltip="Nova notificação">
          <Plus aria-hidden="true" size={20} strokeWidth={1.8} />
        </Link>
      </div>
      {errorMessage ? (
        <div className={styles.feedback} role="alert">
          <p>{errorMessage}</p>
          <Link href={originHref}>Tentar novamente</Link>
        </div>
      ) : pageData && pageData.items.length === 0 ? (
        <div className={styles.empty}>
          <h2>Nenhuma notificação enviada</h2>
          <p>As notificações disparadas aparecerão nesta lista.</p>
          <Link href={`/notifications/new?returnTo=${encodeURIComponent(originHref)}`}>Criar notificação</Link>
        </div>
      ) : (
        <>
          <div className={styles.sectionTitle}>
            <h2>Enviadas</h2>
            <span>{pageData?.totalItems ?? 0} notificações · mais recentes primeiro</span>
          </div>
          <div className={styles.list}>
            {pageData?.items.map((notification) => (
              <article className={styles.card} key={notification.id}>
                <div className={styles.cardTop}>
                  <h3 className={styles.title}>{notification.title}</h3>
                  <Link className={styles.rowLink} href={`/notifications/${notification.id}?returnTo=${encodeURIComponent(originHref)}`} aria-label={`Ver detalhes da notificação ${notification.title}`} title="Ver detalhes" data-tooltip="Ver detalhes">
                    <Eye aria-hidden="true" size={18} strokeWidth={1.8} />
                  </Link>
                </div>
                <p className={styles.description}>{notification.description}</p>
                <div className={styles.meta}>
                  <span>Enviada em {formatDate(notification.sentAt)}</span>
                  <span className={styles.audience}>
                    {notification.audience === 'general' ? 'Público geral' : `Curso: ${notification.courseTitle ?? 'Curso removido'}`}
                  </span>
                  <span>{notification.recipientCount} {notification.recipientCount === 1 ? 'destinatário' : 'destinatários'}</span>
                </div>
              </article>
            ))}
          </div>
          {pageData && totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Paginação de notificações">
              <span>Página {currentPage} de {totalPages}</span>
              <div className={styles.paginationLinks}>
                <Link className={styles.pageLink} href={`/notifications?page=${Math.max(1, currentPage - 1)}`} aria-disabled={currentPage <= 1}>Anterior</Link>
                <Link className={styles.pageLink} href={`/notifications?page=${Math.min(totalPages, currentPage + 1)}`} aria-disabled={currentPage >= totalPages}>Próxima</Link>
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
