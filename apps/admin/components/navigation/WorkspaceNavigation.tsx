'use client';

import Link from 'next/link';
import { Bell, BookOpen, House, Image, ListChecks, UserRound } from 'lucide-react';
import { usePathname } from 'next/navigation';
import styles from './WorkspaceNavigation.module.css';

const items = [
  {
    href: '/',
    label: 'Início',
    icon: House,
  },
  {
    href: '/users',
    label: 'Alunos',
    icon: UserRound,
  },
  {
    href: '/enrollments',
    label: 'Matrículas',
    icon: ListChecks,
  },
  {
    href: '/courses',
    label: 'Cursos',
    icon: BookOpen,
  },
  {
    href: '/banners',
    label: 'Banners',
    icon: Image,
  },
  {
    href: '/notifications',
    label: 'Notificações',
    icon: Bell,
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
            <item.icon aria-hidden="true" size={20} strokeWidth={1.8} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
