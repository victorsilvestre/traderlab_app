'use client';

import Image from 'next/image';
import { Bell, BookOpen, House, Menu, Search, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { UserProfileDetailsDto } from '@traderlab/contracts';
import { AccountMenu } from './AccountMenu';
import { homeClass } from './homeStyles';

const navigationItems = [
  { href: '/home', label: 'Início', Icon: House },
  { href: '/courses', label: 'Cursos', Icon: BookOpen },
  { href: '/search', label: 'Pesquisar', Icon: Search },
  { href: '/notifications', label: 'Notificações', Icon: Bell },
];

export function StudentDock({
  name,
  avatarUrl,
  role,
  unreadCount,
}: {
  name: string;
  avatarUrl?: string | null;
  role: UserProfileDetailsDto['role'];
  unreadCount: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const pathname = usePathname();
  const roleLabel = {
    student: 'Aluno',
    mentor: 'Mentor',
    administrator: 'Administrador',
  }[role];

  return (
    <aside
      className={homeClass('student-dock', expanded && 'student-dock-expanded')}
      data-expanded={expanded}
    >
      <Link className={homeClass('dock-brand')} href="/home" aria-label="Trader Bruno Borges, início">
        <Image
          className={homeClass('dock-brand-icon')}
          src="/logos/logo_icon-black_new.png"
          alt="BB"
          width={42}
          height={36}
          priority
        />
        <Image
          className={homeClass('dock-brand-full')}
          src="/logos/logo-preta-fundo-claro.png"
          alt="Trader Bruno Borges"
          width={170}
          height={46}
          priority
        />
      </Link>
      <button
        className={homeClass('dock-toggle')}
        type="button"
        aria-label={expanded ? 'Recolher menu' : 'Expandir menu'}
        aria-controls="student-home-navigation"
        aria-expanded={expanded}
        title={expanded ? 'Recolher menu' : 'Expandir menu'}
        onClick={() => setExpanded((current) => !current)}
      >
        {expanded ? <X aria-hidden="true" size={20} /> : <Menu aria-hidden="true" size={20} />}
        <span className={homeClass('dock-label')}>{expanded ? 'Recolher menu' : 'Abrir menu'}</span>
      </button>

      <nav
        id="student-home-navigation"
        className={homeClass('dock-nav')}
        aria-label="Navegação principal"
      >
        {navigationItems.map(({ href, label, Icon }) => {
          const active = href === '/courses'
            ? pathname === '/courses' || pathname.startsWith('/courses/')
            : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              className={homeClass('dock-link', active && 'dock-link-active')}
              href={href}
              aria-current={active ? 'page' : undefined}
              aria-label={label === 'Notificações' && unreadCount > 0 ? `${label}, ${unreadCount} não lidas` : label}
              title={label}
              key={href}
            >
              <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
              <span className={homeClass('dock-label')}>{label}</span>
              {label === 'Notificações' && unreadCount > 0 && (
                <span className={homeClass('dock-notification-count')} aria-hidden="true">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <span className={homeClass('dock-spacer')} aria-hidden="true" />
      <AccountMenu name={name} avatarUrl={avatarUrl} roleLabel={roleLabel} />
    </aside>
  );
}
