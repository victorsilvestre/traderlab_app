'use client';

import { homeClass } from './homeStyles';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { LogoutButton } from '../authentication/LogoutButton';

export function AccountMenu({
  name,
  avatarUrl,
  roleLabel = 'Aluno',
}: {
  name: string;
  avatarUrl?: string | null;
  roleLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    function closeOnOutside(event: PointerEvent) {
      if (
        event.target instanceof Node &&
        !menuRef.current?.contains(event.target)
      )
        setOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    document.addEventListener('pointerdown', closeOnOutside);
    return () => {
      window.removeEventListener('keydown', closeOnEscape);
      document.removeEventListener('pointerdown', closeOnOutside);
    };
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
      ref={menuRef}
      className={homeClass('header-popover-wrap', 'account-popover-wrap')}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setOpen(false);
        }
      }}
    >
      <Link
        className={homeClass('avatar-trigger')}
        href="/profile"
        aria-label="Acessar perfil"
        onClick={() => setOpen(false)}
        onFocus={() => setOpen(true)}
      >
        {avatarUrl && !imageFailed ? (
          <img
            className={homeClass('account-avatar-image')}
            src={avatarUrl}
            alt=""
            onError={() => setImageFailed(true)}
          />
        ) : (
          avatarLabel
        )}
      </Link>
      {open && (
        <div className={homeClass('header-popover', 'account-popover')}>
          <div className={homeClass('account-summary')}>
            <span className={homeClass('account-avatar')}>
              {avatarUrl && !imageFailed ? (
                <img
                  className={homeClass('account-avatar-image')}
                  src={avatarUrl}
                  alt=""
                  onError={() => setImageFailed(true)}
                />
              ) : (
                avatarLabel
              )}
            </span>
            <span>
              <strong>{name || 'Aluno TraderLab'}</strong>
              <small>{roleLabel}</small>
            </span>
          </div>
          <Link
            href="/profile"
            className={homeClass('account-link')}
            onClick={() => setOpen(false)}
          >
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
