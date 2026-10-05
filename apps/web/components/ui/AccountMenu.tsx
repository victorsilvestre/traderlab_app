'use client';

import { homeClass } from './homeStyles';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { LogoutButton } from '../authentication/LogoutButton';

export function AccountMenu({ name }: { name: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toLocaleUpperCase('pt-BR');
  const avatarLabel = initials || 'AL';

  return (
    <div
      className={homeClass('header-popover-wrap', 'account-popover-wrap')}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        className={homeClass('avatar-trigger')}
        type="button"
        aria-label="Abrir opções da conta"
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(true)}
      >
        {avatarLabel}
      </button>
      {open && (
        <div className={homeClass('header-popover', 'account-popover')}>
          <div className={homeClass('account-summary')}>
            <span className={homeClass('account-avatar')}>{avatarLabel}</span>
            <span>
              <strong>{name || 'Aluno TraderLab'}</strong>
              <small>Aluno</small>
            </span>
          </div>
          <Link href="/profile" className={homeClass('account-link')}>
            Acessar Perfil <span aria-hidden="true">↗</span>
          </Link>
          <div className={homeClass('account-logout')}>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
