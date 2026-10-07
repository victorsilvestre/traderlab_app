import Link from 'next/link';
import type {
  NotificationListDto,
  UserProfileDetailsDto,
} from '@traderlab/contracts';
import {
  markAllNotificationsReadAction,
  updateNotificationReadAction,
} from '../../lib/notifications/notificationActions';
import { getSafeNotificationLink } from '../../lib/notifications/notificationLink';
import { homeClass } from './homeStyles';
import { StudentHeader } from './StudentHeader';

export function NotificationCenter({
  inbox,
  filter,
  offset,
  unavailable,
  profile,
}: {
  inbox: NotificationListDto | null;
  filter: 'all' | 'unread';
  offset: number;
  unavailable: boolean;
  profile: UserProfileDetailsDto | null;
}) {
  const items = inbox?.items ?? [];

  return (
    <main className={homeClass('student-home')}>
      {profile ? (
        <StudentHeader
          name={profile.name}
          avatarUrl={profile.avatarUrl}
          role={profile.role}
          homeHref="/home"
        />
      ) : (
        <header className={homeClass('student-header')}>
          <Link className={homeClass('brand-mark')} href="/">
            <span className={homeClass('brand-symbol')} aria-hidden="true">
              T
            </span>
            <span>TraderLab</span>
          </Link>
        </header>
      )}
      <section
        className={homeClass('notification-center')}
        aria-labelledby="notification-title"
      >
        <div className={homeClass('notification-center-heading')}>
          <div>
            <p className="eyebrow">SUA CONTA</p>
            <h1 id="notification-title">Notificações</h1>
            <p>
              Acompanhe os avisos gerais e dos cursos vinculados à sua conta.
            </p>
          </div>
          {inbox && inbox.unreadCount > 0 && (
            <form action={markAllNotificationsReadAction}>
              <button className={homeClass('mark-all-read')} type="submit">
                Marcar todas como lidas
              </button>
            </form>
          )}
        </div>

        <nav
          className={homeClass('notification-filters')}
          aria-label="Filtrar notificações"
        >
          <Link
            className={homeClass(
              'notification-filter',
              filter === 'all' && 'notification-filter-active',
            )}
            href="/notifications"
            aria-current={filter === 'all' ? 'page' : undefined}
          >
            Todas
          </Link>
          <Link
            className={homeClass(
              'notification-filter',
              filter === 'unread' && 'notification-filter-active',
            )}
            href="/notifications?filter=unread"
            aria-current={filter === 'unread' ? 'page' : undefined}
          >
            Não lidas {inbox?.unreadCount ? `(${inbox.unreadCount})` : ''}
          </Link>
        </nav>

        {unavailable ? (
          <div className={homeClass('notification-center-state')} role="alert">
            <strong>Não conseguimos carregar suas notificações.</strong>
            <p>Atualize a página para tentar novamente.</p>
          </div>
        ) : items.length ? (
          <div className={homeClass('notification-center-list')}>
            {items.map((notification) => {
              const safeLink = getSafeNotificationLink(notification.linkUrl);
              return (
                <article
                  className={homeClass(
                    'notification-card',
                    !notification.readAt && 'notification-card-unread',
                  )}
                  key={notification.id}
                >
                  <span
                    className={homeClass(
                      'notification-dot',
                      !notification.readAt && 'notification-dot-unread',
                    )}
                    aria-hidden="true"
                  />
                  <div className={homeClass('notification-card-content')}>
                    <div className={homeClass('notification-card-meta')}>
                      <span>
                        {notification.audience === 'course'
                          ? (notification.courseTitle ?? 'Aviso de curso')
                          : 'Aviso geral'}
                      </span>
                      <time dateTime={notification.sentAt}>
                        {new Date(notification.sentAt).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </time>
                    </div>
                    <h2>{notification.title}</h2>
                    <p className={homeClass('notification-description')}>
                      {notification.description}
                    </p>
                    <div className={homeClass('notification-card-actions')}>
                      <form action={updateNotificationReadAction}>
                        <input
                          type="hidden"
                          name="notificationId"
                          value={notification.id}
                        />
                        <input
                          type="hidden"
                          name="isRead"
                          value={notification.readAt ? 'false' : 'true'}
                        />
                        <button type="submit">
                          {notification.readAt
                            ? 'Marcar como não lida'
                            : 'Marcar como lida'}
                        </button>
                      </form>
                      {safeLink &&
                        (safeLink.external ? (
                          <a
                            href={safeLink.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Abrir link ↗
                          </a>
                        ) : (
                          <Link href={safeLink.href}>Abrir link →</Link>
                        ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className={homeClass('notification-center-state')}>
            <span
              className={homeClass('notification-empty-mark')}
              aria-hidden="true"
            >
              ✓
            </span>
            <strong>
              {offset > 0
                ? 'Não há notificações anteriores.'
                : filter === 'unread'
                  ? 'Você está em dia.'
                  : 'Você ainda não tem notificações.'}
            </strong>
            <p>
              {offset > 0
                ? 'Volte para ver os avisos mais recentes.'
                : filter === 'unread'
                  ? 'Não há avisos pendentes de leitura.'
                  : 'Quando houver um aviso para você, ele aparecerá aqui.'}
            </p>
          </div>
        )}

        {(offset > 0 ||
          (inbox?.nextOffset !== null && inbox?.nextOffset !== undefined)) &&
          !unavailable && (
            <div className={homeClass('notification-pagination')}>
              {offset > 0 && (
                <Link
                  href={`/notifications?filter=${filter}&offset=${Math.max(0, offset - 20)}`}
                >
                  ← Mais recentes
                </Link>
              )}
              {inbox?.nextOffset !== null &&
                inbox?.nextOffset !== undefined && (
                  <Link
                    href={`/notifications?filter=${filter}&offset=${inbox.nextOffset}`}
                  >
                    Ver notificações anteriores →
                  </Link>
                )}
            </div>
          )}
      </section>
    </main>
  );
}
