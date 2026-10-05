'use client';

import { homeClass } from './homeStyles';

import { useEffect, useState, type MouseEvent, type ReactNode } from 'react';
import type { DemoContent } from '../../lib/home/demoHomeData';

export function ContentPreviewButton({
  content,
  className,
  children,
  label,
  onActivate,
}: {
  content: DemoContent;
  className: string;
  children: ReactNode;
  label?: string;
  onActivate?: () => void;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }

    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);

  function closeOnBackdrop(event: MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) setOpen(false);
  }

  return (
    <>
      <button
        className={className}
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          onActivate?.();
          setOpen(true);
        }}
        aria-label={label}
      >
        {children}
      </button>
      {open && (
        <div
          className={homeClass('content-modal-backdrop')}
          role="presentation"
          onMouseDown={closeOnBackdrop}
        >
          <section
            className={homeClass('content-modal')}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`preview-${content.id}`}
          >
            <button
              className={homeClass('modal-close')}
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              autoFocus
            >
              ×
            </button>
            <p className="eyebrow">PRÉVIA DE CONTEÚDO · EXEMPLO</p>
            <h2 id={`preview-${content.id}`}>{content.title}</h2>
            <p className={homeClass('modal-content-kind')}>
              {content.kind} · {content.course}
            </p>
            <p className={homeClass('modal-description')}>
              {content.description}
            </p>
            <div className={homeClass('modal-demo-message')}>
              Esta prévia demonstra a navegação da página. O conteúdo real e a
              validação de acesso serão conectados em uma próxima etapa.
            </div>
            <button
              className={homeClass('modal-action')}
              type="button"
              onClick={() => setOpen(false)}
            >
              Voltar para a página inicial
            </button>
          </section>
        </div>
      )}
    </>
  );
}
