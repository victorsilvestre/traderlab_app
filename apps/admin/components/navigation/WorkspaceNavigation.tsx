'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './WorkspaceNavigation.module.css';

const items = [
  {
    href: '/',
    label: 'Início',
    icon: <><path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V10Z" /><path d="M9 21v-7h6v7" /></>,
  },
  {
    href: '/users',
    label: 'Alunos',
    icon: <><circle cx="12" cy="8" r="4" /><path d="M5 21a7 7 0 0 1 14 0" /></>,
  },
  {
    href: '/enrollments',
    label: 'Matrículas',
    icon: <><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></>,
  },
  {
    href: '/courses',
    label: 'Cursos',
    icon: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h6" /></>,
  },
  {
    href: '/banners',
    label: 'Banners',
    icon: <><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="8.5" cy="9" r="1.5" /><path d="m21 15-5-5L5 20" /></>,
  },
  {
    href: '/notifications',
    label: 'Notificações',
    icon: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
  },
];

export function WorkspaceNavigation({
  isAdministrator,
}: {
  isAdministrator: boolean;
}) {
  const pathname = usePathname();
  const visibleItems = items.filter(
    (item) =>
      isAdministrator ||
      (item.href !== '/notifications' && item.href !== '/banners' && item.href !== '/users' && item.href !== '/enrollments'),
  );
  return (
    <nav className={styles.nav} aria-label="Navegação de gestão">
      {visibleItems.map((item) => {
        const current = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={current ? 'page' : undefined}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              {item.icon}
            </svg>
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
