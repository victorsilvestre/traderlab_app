'use client';

import Link from 'next/link';
import {
  useEffect,
  useRef,
  useState,
  useTransition,
  type FormEvent,
} from 'react';
import type {
  CourseModuleDto,
  CourseSearchResultDto,
} from '@traderlab/contracts';
import { searchCourse } from '../../lib/courses/actions';
import styles from './CourseScreen.module.css';

function SearchIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <circle cx="8.6" cy="8.6" r="5.4" />
      <path d="m12.6 12.6 4.1 4.1" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <rect x="3.4" y="3.4" width="5.1" height="5.1" rx="0.8" />
      <rect x="11.5" y="3.4" width="5.1" height="5.1" rx="0.8" />
      <rect x="3.4" y="11.5" width="5.1" height="5.1" rx="0.8" />
      <rect x="11.5" y="11.5" width="5.1" height="5.1" rx="0.8" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="M7.2 5h9M7.2 10h9m-9 5h9" />
      <circle cx="4" cy="5" r=".7" fill="currentColor" stroke="none" />
      <circle cx="4" cy="10" r=".7" fill="currentColor" stroke="none" />
      <circle cx="4" cy="15" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path d="m5 5 10 10M15 5 5 15" />
    </svg>
  );
}

function ContentState({ completed }: { completed: boolean }) {
  return (
    <span className={completed ? styles.contentDone : styles.contentPending}>
      {completed ? 'Concluído' : 'Não iniciado'}
    </span>
  );
}

function ContentLink({
  courseId,
  content,
  moduleTitle,
}: {
  courseId: number;
  moduleTitle: string;
  content: {
    id: number;
    title: string;
    kind: string;
    completed: boolean;
    lastAccessedAt: string | null;
  };
}) {
  return (
    <Link
      className={styles.contentLink}
      aria-label={`Abrir ${content.title}, módulo ${moduleTitle}`}
      href={`/courses/${encodeURIComponent(courseId)}/contents/${encodeURIComponent(content.id)}`}
    >
      <span className={styles.contentName}>
        <span>{content.title}</span>
        <small>{content.kind === 'material' ? 'Material' : 'Aula'}</small>
      </span>
      <ContentState completed={content.completed} />
      <span className={styles.contentArrow} aria-hidden="true" />
    </Link>
  );
}

export function CourseModuleExplorer({
  courseId,
  modules,
}: {
  courseId: number;
  modules: CourseModuleDto[];
}) {
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [searchResults, setSearchResults] =
    useState<CourseSearchResultDto[] | null>(null);
  const [searchError, setSearchError] = useState(false);
  const [isPending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (searchOpen && !dialog.open) dialog.showModal();
    if (!searchOpen && dialog.open) dialog.close();
  }, [searchOpen]);

  function openSearch() {
    setSearchTerm('');
    setSubmittedQuery('');
    setSearchResults(null);
    setSearchError(false);
    setSearchOpen(true);
  }

  function closeSearch() {
    setSearchOpen(false);
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = searchTerm.trim().slice(0, 120);
    if (!query) return;

    setSubmittedQuery(query);
    setSearchResults(null);
    setSearchError(false);
    startTransition(async () => {
      try {
        const response = await searchCourse(courseId, query);
        setSearchResults(response.results);
      } catch {
        setSearchError(true);
      }
    });
  }

  return (
    <section
      className={styles.moduleSection}
      id="modules"
      aria-labelledby="modules-title"
    >
      <div className={styles.sectionHeading}>
        <div>
          <h2 id="modules-title">Módulos do curso</h2>
          <p>Escolha um conteúdo para continuar seus estudos.</p>
        </div>
        <div className={styles.moduleTools}>
          <button
            className={styles.iconControl}
            type="button"
            aria-label="Pesquisar módulos e conteúdos neste curso"
            title="Pesquisar módulos e conteúdos"
            onClick={openSearch}
          >
            <SearchIcon />
          </button>
          <div
            className={styles.viewControls}
            role="group"
            aria-label="Exibição dos módulos"
          >
            <button
              type="button"
              aria-label="Exibir módulos em grade"
              title="Exibir em grade"
              aria-pressed={view === 'grid'}
              onClick={() => setView('grid')}
            >
              <GridIcon />
            </button>
            <button
              type="button"
              aria-label="Exibir módulos em lista"
              title="Exibir em lista"
              aria-pressed={view === 'list'}
              onClick={() => setView('list')}
            >
              <ListIcon />
            </button>
          </div>
        </div>
      </div>

      {modules.length ? (
        <div
          className={view === 'grid' ? styles.moduleGrid : styles.moduleList}
        >
          {modules.map((module, index) => (
            <article
              className={styles.module}
              id={`module-${module.id}`}
              key={module.id}
            >
              <div className={styles.moduleHead}>
                <div
                  className={styles.moduleImage}
                  role={module.imageUrl ? 'img' : undefined}
                  aria-label={
                    module.imageUrl
                      ? `Imagem do módulo ${module.title}`
                      : undefined
                  }
                  style={
                    module.imageUrl
                      ? { backgroundImage: `url(${module.imageUrl})` }
                      : undefined
                  }
                >
                  {!module.imageUrl && (
                    <span>{String(index + 1).padStart(2, '0')}</span>
                  )}
                </div>
                <div className={styles.moduleInfo}>
                  <h3>{module.title}</h3>
                  <p className={styles.moduleDescription}>
                    {module.description}
                  </p>
                  <div className={styles.moduleProgress}>
                    <span className={styles.moduleProgressTrack}>
                      <span style={{ width: `${module.progressPercent}%` }} />
                    </span>
                    <span>
                      {module.completedCount}/{module.contentCount}
                    </span>
                  </div>
                </div>
              </div>
              {view === 'list' &&
                (module.contents.length ? (
                  <details className={styles.contentDisclosure} open>
                    <summary>
                      Conteúdos do módulo
                      <span>{module.contentCount}</span>
                    </summary>
                    <ul className={styles.contentList}>
                      {module.contents.map((content) => (
                        <li key={content.id}>
                          <ContentLink
                            courseId={courseId}
                            moduleTitle={module.title}
                            content={content}
                          />
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <p className={styles.moduleEmpty}>
                    Este módulo ainda não tem conteúdos publicados.
                  </p>
                ))}
            </article>
          ))}
        </div>
      ) : (
        <div className={styles.emptyModules}>
          <strong>Este curso ainda não tem módulos publicados.</strong>
          <p>Os módulos aparecerão aqui quando estiverem disponíveis.</p>
        </div>
      )}

      <dialog
        ref={dialogRef}
        className={styles.searchDialog}
        aria-labelledby="course-search-title"
        onClose={() => setSearchOpen(false)}
        onClick={(event) => {
          if (event.target === event.currentTarget) closeSearch();
        }}
      >
        <div className={styles.searchDialogHead}>
          <div>
            <h2 id="course-search-title">Pesquisar neste curso</h2>
            <p>Busque módulos e conteúdos por título ou descrição.</p>
          </div>
          <button
            className={styles.iconControl}
            type="button"
            aria-label="Fechar pesquisa"
            onClick={closeSearch}
          >
            <CloseIcon />
          </button>
        </div>
        <form className={styles.searchDialogForm} onSubmit={submitSearch}>
          <label htmlFor="course-search-query">Módulo ou conteúdo</label>
          <input
            id="course-search-query"
            autoFocus
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Digite um módulo ou conteúdo"
            maxLength={120}
            required
          />
          <button type="submit" disabled={isPending || !searchTerm.trim()}>
            {isPending ? 'Pesquisando…' : 'Pesquisar'}
          </button>
        </form>
        <div
          className={styles.searchDialogResults}
          aria-live="polite"
          aria-busy={isPending}
        >
          {isPending ? (
            <p role="status">Pesquisando módulos e conteúdos…</p>
          ) : searchError ? (
            <p role="alert">
              Não foi possível pesquisar agora. Tente novamente.
            </p>
          ) : searchResults ? (
            searchResults.length ? (
              <>
                <p className={styles.searchResultCount}>
                  {searchResults.length}{' '}
                  {searchResults.length === 1
                    ? 'resultado encontrado'
                    : 'resultados encontrados'}
                </p>
                <ul className={styles.searchResults}>
                  {searchResults.map((result) => (
                    <li key={`${result.kind}:${result.id}`}>
                      {result.kind === 'module' ? (
                        <Link
                          className={styles.contentLink}
                          aria-label={`Abrir módulo ${result.title}`}
                          href={`/courses/${encodeURIComponent(courseId)}#module-${encodeURIComponent(result.moduleId)}`}
                          onClick={closeSearch}
                        >
                          <span className={styles.contentName}>
                            <span>{result.title}</span>
                            <small>Módulo</small>
                          </span>
                          <span className={styles.contentPending}>
                            {result.completedCount}/{result.contentCount} conteúdos
                          </span>
                          <span className={styles.contentArrow} aria-hidden="true" />
                        </Link>
                      ) : (
                        <ContentLink
                          courseId={courseId}
                          moduleTitle={result.moduleTitle}
                          content={result}
                        />
                      )}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p role="status">
                Nenhum módulo ou conteúdo encontrado para “{submittedQuery}”.
              </p>
            )
          ) : (
            <p>Os resultados aparecerão aqui depois da pesquisa.</p>
          )}
        </div>
      </dialog>
    </section>
  );
}
