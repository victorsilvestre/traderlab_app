'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { searchAccessibleCourseContents } from '../../lib/courses/searchAction';
import type { StudentCourseSearchResultDto } from '@traderlab/contracts';
import { homeClass } from './homeStyles';

type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

export function HomeSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StudentCourseSearchResultDto[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target;
      const isTypingTarget =
        target instanceof HTMLElement &&
        (target.isContentEditable ||
          ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));

      if (event.key === 'Escape') setOpen(false);
      if (event.key === '/' && !isTypingTarget) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!open || !normalizedQuery) return;

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setStatus('loading');
      try {
        const nextResults =
          await searchAccessibleCourseContents(normalizedQuery);
        if (!cancelled) {
          setResults(nextResults);
          setStatus('ready');
        }
      } catch {
        if (!cancelled) {
          setResults([]);
          setStatus('error');
        }
      }
    }, 220);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, query]);

  return (
    <div className={homeClass('home-search')}>
      <button
        className={homeClass('search-trigger', open && 'is-active')}
        type="button"
        aria-expanded={open}
        aria-controls="home-search-panel"
        onClick={() => {
          if (!open) setStatus(query.trim() ? 'loading' : 'idle');
          setOpen((current) => !current);
        }}
      >
        <span className={homeClass('search-icon')} aria-hidden="true" />
        <span>Pesquisar</span>
        <kbd>/</kbd>
      </button>

      {open && (
        <div className={homeClass('search-panel')} id="home-search-panel">
          <div className={homeClass('search-input-wrap')}>
            <span className={homeClass('search-icon')} aria-hidden="true" />
            <input
              autoFocus
              value={query}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setQuery(nextQuery);
                setResults([]);
                setStatus(nextQuery.trim() ? 'loading' : 'idle');
              }}
              placeholder="Busque cursos, módulos e aulas"
              aria-label="Buscar cursos, módulos e aulas"
              maxLength={120}
            />
            <button type="button" onClick={() => setOpen(false)}>
              Fechar
            </button>
          </div>
          <div className={homeClass('suggestion-list')} aria-live="polite">
            {!query.trim() ? (
              <div className={homeClass('search-hint')}>
                <span>
                  Pesquise conteúdos dos cursos liberados para sua conta.
                </span>
              </div>
            ) : status === 'loading' || status === 'idle' ? (
              <p className={homeClass('search-hint')}>Buscando conteúdos...</p>
            ) : status === 'error' ? (
              <p className={homeClass('search-hint')} role="status">
                Não conseguimos pesquisar agora. Tente novamente.
              </p>
            ) : results.length ? (
              <>
                {results.map((item) => (
                  <Link
                    key={`${item.courseId}:${item.id}`}
                    className={homeClass('suggestion-item')}
                    href={
                      item.kind === 'course'
                        ? `/courses/${encodeURIComponent(item.courseId)}`
                        : item.kind === 'module'
                          ? `/courses/${encodeURIComponent(item.courseId)}#module-${encodeURIComponent(item.moduleId ?? '')}`
                          : `/courses/${encodeURIComponent(item.courseId)}/contents/${encodeURIComponent(item.id)}`
                    }
                    onClick={() => setOpen(false)}
                  >
                    <span className={homeClass('suggestion-kind')}>
                      {item.kind === 'course'
                        ? 'Curso'
                        : item.kind === 'module'
                          ? 'Módulo'
                          : item.kind === 'material'
                            ? 'Material'
                            : 'Aula'}
                    </span>
                    <span className={homeClass('suggestion-copy')}>
                      <strong>{item.title}</strong>
                      <small>
                        {item.kind === 'course'
                          ? 'Curso disponível para sua conta'
                          : item.kind === 'module'
                            ? item.courseTitle
                            : `${item.courseTitle} · ${item.moduleTitle}`}
                      </small>
                    </span>
                    <span
                      className={homeClass('suggestion-arrow')}
                      aria-hidden="true"
                    />
                  </Link>
                ))}
                <p className={homeClass('demo-note')}>
                  Exibindo conteúdos publicados de cursos disponíveis para sua
                  conta.
                </p>
              </>
            ) : (
              <div className={homeClass('search-hint')}>
                <span>
                  Não encontramos resultados. Tente outro título ou descrição.
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
