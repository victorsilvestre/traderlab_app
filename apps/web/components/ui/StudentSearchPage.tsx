'use client';

import Link from 'next/link';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { StudentCourseSearchResultDto } from '@traderlab/contracts';
import { searchAccessibleCourseContents } from '../../lib/courses/searchAction';
import { homeClass } from './homeStyles';

type SearchStatus = 'idle' | 'loading' | 'ready' | 'error';

function resultHref(item: StudentCourseSearchResultDto) {
  return item.kind === 'course'
    ? `/courses/${encodeURIComponent(item.courseId)}`
    : item.kind === 'module'
      ? `/courses/${encodeURIComponent(item.courseId)}#module-${encodeURIComponent(item.moduleId ?? '')}`
      : `/courses/${encodeURIComponent(item.courseId)}/contents/${encodeURIComponent(item.id)}`;
}

export function StudentSearchPage() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<StudentCourseSearchResultDto[]>([]);
  const [status, setStatus] = useState<SearchStatus>('idle');

  useEffect(() => {
    function handleShortcut(event: KeyboardEvent) {
      const target = event.target;
      const isTypingTarget = target instanceof HTMLElement &&
        (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName));
      if (event.key === '/' && !isTypingTarget) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleShortcut);
    return () => window.removeEventListener('keydown', handleShortcut);
  }, []);

  useEffect(() => {
    const normalizedQuery = query.trim();
    if (!normalizedQuery) {
      setResults([]);
      setStatus('idle');
      return;
    }

    let cancelled = false;
    const timer = window.setTimeout(async () => {
      setStatus('loading');
      try {
        const nextResults = await searchAccessibleCourseContents(normalizedQuery);
        if (!cancelled) {
          setResults(nextResults.slice(0, 5));
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
  }, [query]);

  return (
    <main className={homeClass('student-home')}>
      <div className={homeClass('student-content')}>
        <section className={homeClass('search-page')} aria-labelledby="student-search-title">
          <Link className={homeClass('search-back')} href="/home"><ArrowLeft aria-hidden="true" size={15} /> Voltar à home</Link>
          <h1 id="student-search-title">Encontre o que você quer estudar</h1>
          <p className={homeClass('search-description')}>Busque cursos, módulos, aulas e materiais disponíveis para sua conta.</p>
          <label className={homeClass('search-page-field')} htmlFor="student-search-query">
            <Search size={19} aria-hidden="true" />
            <input
              ref={inputRef}
              autoFocus
              id="student-search-query"
              type="search"
              maxLength={120}
              placeholder="Digite um curso, módulo ou conteúdo"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <kbd>/</kbd>
          </label>
          <div className={homeClass('search-page-results')} aria-live="polite">
            {!query.trim() ? (
              <p className={homeClass('search-page-message')}>Pesquise conteúdos dos cursos liberados para sua conta.</p>
            ) : status === 'idle' || status === 'loading' ? (
              <p className={homeClass('search-page-message')} role="status">Buscando conteúdos...</p>
            ) : status === 'error' ? (
              <p className={homeClass('search-page-message')} role="alert">Não conseguimos pesquisar agora. Tente novamente.</p>
            ) : results.length === 0 ? (
              <p className={homeClass('search-page-message')}>Não encontramos resultados. Tente outro título ou descrição.</p>
            ) : (
              <>
                <p className={homeClass('search-page-count')}>{results.length} {results.length === 1 ? 'resultado' : 'resultados'}</p>
                <ul className={homeClass('search-page-list')}>
                  {results.map((item) => (
                    <li key={`${item.courseId}:${item.id}`}>
                      <Link className={homeClass('search-page-result')} href={resultHref(item)}>
                        <span className={homeClass('search-page-kind')}>
                          {item.kind === 'course' ? 'Curso' : item.kind === 'module' ? 'Módulo' : item.kind === 'material' ? 'Material' : 'Aula'}
                        </span>
                        <span className={homeClass('search-page-copy')}>
                          <strong>{item.title}</strong>
                          <small>{item.kind === 'course' ? 'Curso disponível para sua conta' : item.kind === 'module' ? item.courseTitle : `${item.courseTitle} · ${item.moduleTitle}`}</small>
                        </span>
                        <ArrowRight aria-hidden="true" size={17} />
                      </Link>
                    </li>
                  ))}
                </ul>
                <p className={homeClass('search-page-footnote')}>Exibindo conteúdos publicados de cursos disponíveis para sua conta.</p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
