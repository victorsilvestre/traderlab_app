'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { homeClass } from './homeStyles';
import type { NotificationListDto } from '@traderlab/contracts';
import {
  markAllNotificationsReadAction,
  updateNotificationReadAction,
} from '../../lib/notifications/notificationActions';
import { getSafeNotificationLink } from '../../lib/notifications/notificationLink';

export function NotificationMenu({
  inbox,
  unavailable = false,
}: {
  inbox: NotificationListDto;
  unavailable?: boolean;
}) {
  const unreadCount = inbox.unreadCount;
  const menuRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    function closeWhenClickingOutside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      ) {
        menuRef.current?.removeAttribute('open');
      }
    }

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        menuRef.current?.removeAttribute('open');
      }
    }

    document.addEventListener('pointerdown', closeWhenClickingOutside);
    document.addEventListener('keydown', closeOnEscape);

    return () => {
      document.removeEventListener('pointerdown', closeWhenClickingOutside);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, []);

  return (
    <details
      className={homeClass('header-popover-wrap', 'notification-menu')}
      ref={menuRef}
    >
      <summary
        className={homeClass('header-icon-button', 'notification-trigger')}
        aria-label={`Notificações, ${unreadCount} não lidas`}
      >
        <span className={homeClass('notification-bell')} aria-hidden="true" />
        {unreadCount > 0 && (
          <span className={homeClass('notification-count')}>{unreadCount}</span>
        )}
      </summary>
      <div className={homeClass('header-popover', 'notifications-popover')}>
        <div className={homeClass('popover-heading')}>
          <strong>Notificações</strong>
          <span>{unreadCount} não lidas</span>
        </div>
        {inbox.items.length ? (
          <div className={homeClass('notification-list')}>
            {inbox.items.map((notification) => {
              const safeLink = getSafeNotificationLink(notification.linkUrl);
              return (
                <div
                  className={homeClass(
                    'notification-item',
                    !notification.readAt && 'notification-item-unread',
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
                  <div>
                    {safeLink ? (
                      <Link
                        className={homeClass('notification-title-link')}
                        href={safeLink.href}
                        onClick={() => menuRef.current?.removeAttribute('open')}
                        target={safeLink.external ? '_blank' : undefined}
                        rel={
                          safeLink.external ? 'noopener noreferrer' : undefined
                        }
                      >
                        {notification.title}
                      </Link>
                    ) : (
                      <strong>{notification.title}</strong>
                    )}
                    <p>{notification.description}</p>
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
                      <button className={homeClass('mark-read')} type="submit">
                        {notification.readAt
                          ? 'Marcar como não lida'
                          : 'Marcar como lida'}
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        ) : unavailable ? (
          <p className={homeClass('popover-footnote')} role="status">
            Não foi possível carregar as notificações. Tente novamente em
            instantes.
          </p>
        ) : (
          <p className={homeClass('popover-footnote')}>
            Suas notificações aparecerão aqui.
          </p>
        )}
        <div className={homeClass('notification-footer')}>
          {unreadCount > 0 && (
            <form action={markAllNotificationsReadAction}>
              <button className={homeClass('mark-read')} type="submit">
                Marcar todas como lidas
              </button>
            </form>
          )}
          <Link
            className={homeClass('all-notifications-link')}
            href="/notifications"
            onClick={() => menuRef.current?.removeAttribute('open')}
          >
            Ver todas as notificações
          </Link>
        </div>
      </div>
    </details>
  );
}
