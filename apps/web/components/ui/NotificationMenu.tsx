'use client';

import { homeClass } from './homeStyles';

import { useState } from 'react';

const demoNotifications = [
  {
    title: 'Boas-vindas ao TraderLab',
    description: 'Seu espaço de estudos está pronto para você.',
  },
  {
    title: 'Continue no seu ritmo',
    description: 'Retome seus estudos quando quiser.',
  },
];

export function NotificationMenu() {
  const [unread, setUnread] = useState(demoNotifications.map(() => true));
  const unreadCount = unread.filter(Boolean).length;

  return (
    <details className={homeClass('header-popover-wrap', 'notification-menu')}>
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
        {demoNotifications.length ? (
          demoNotifications.map((notification, index) => (
            <div className={homeClass('notification-item')} key={notification.title}>
              <span
                className={homeClass(
                  'notification-dot',
                  unread[index] && 'is-unread',
                )}
                aria-hidden="true"
              />
              <div>
                <strong>{notification.title}</strong>
                <p>{notification.description}</p>
                {unread[index] && (
                  <button
                    className={homeClass('mark-read')}
                    type="button"
                    onClick={() =>
                      setUnread((current) =>
                        current.map((value, itemIndex) =>
                          itemIndex === index ? false : value,
                        ),
                      )
                    }
                  >
                    Marcar como lida
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className={homeClass('popover-footnote')}>
            Suas notificações aparecerão aqui.
          </p>
        )}
        {unreadCount === 0 && (
          <p className={homeClass('popover-footnote')}>Você está em dia.</p>
        )}
        <p className={homeClass('demo-note')}>Exemplos visuais de notificação</p>
      </div>
    </details>
  );
}
