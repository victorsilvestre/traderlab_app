'use client';

import Image from 'next/image';
import Link from 'next/link';
import { BookOpen, House, Menu, RotateCcw, X } from 'lucide-react';
import { useState } from 'react';
import type { UserProfileDetailsDto } from '@traderlab/contracts';
import { AccountMenu } from './AccountMenu';
import { homeClass } from './homeStyles';

const navigationItems = [
  { href: '#home-banner', label: 'Início', Icon: House },
  { href: '#continue-section', label: 'Continue de onde parou', Icon: RotateCcw },
  { href: '#courses-section', label: 'Meus cursos', Icon: BookOpen },
];

export function StudentDock({
  name,
  avatarUrl,
  role,
}: {
  name: string;
  avatarUrl?: string | null;
  role: UserProfileDetailsDto['role'];
}) {
  const [expanded, setExpanded] = useState(false);
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
      <Link className={homeClass('dock-brand')} href="/home" aria-label="TraderLab, início">
        <Image
          className={homeClass('dock-brand-image')}
          src="/logos/logo_icon-black_new.png"
          alt=""
          width={42}
          height={42}
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
        {navigationItems.map(({ href, label, Icon }, index) => (
          <a
            className={homeClass('dock-link', index === 0 && 'dock-link-active')}
            href={href}
            aria-current={index === 0 ? 'page' : undefined}
            aria-label={label}
            title={label}
            key={href}
          >
            <Icon aria-hidden="true" size={20} strokeWidth={1.8} />
            <span className={homeClass('dock-label')}>{label}</span>
          </a>
        ))}
      </nav>

      <span className={homeClass('dock-spacer')} aria-hidden="true" />
      <AccountMenu name={name} avatarUrl={avatarUrl} roleLabel={roleLabel} />
    </aside>
  );
}
