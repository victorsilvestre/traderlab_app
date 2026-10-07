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
    href: '/courses',
    label: 'Cursos',
    icon: <><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" /><path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h6" /></>,
  },
];

export function WorkspaceNavigation() {
  const pathname = usePathname();
  return (
    <nav className={styles.nav} aria-label="Navegação de gestão">
      {items.map((item) => {
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

