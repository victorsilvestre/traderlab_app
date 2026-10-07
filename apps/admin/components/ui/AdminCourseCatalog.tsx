import Link from 'next/link';
import type { ManagedCourseDto, ManagedCoursePageDto, ManagedCourseStatusDto } from '@traderlab/contracts';
import { CoursePublicationButton } from './CoursePublicationButton';
import styles from './AdminCourseCatalog.module.css';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'medium',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

export function AdminCourseCatalog({
  courses,
  pageData,
  query,
  status,
  errorMessage,
}: {
  courses: ManagedCourseDto[];
  pageData?: ManagedCoursePageDto;
  query: string;
  status: '' | ManagedCourseStatusDto;
  errorMessage?: string;
}) {
  return (
    <section className={styles.catalog} aria-labelledby="courses-title">
      <div className={styles.heading}>
        <div>
          <h1 id="courses-title">Cursos</h1>
          <p>Consulte e mantenha o catálogo de cursos da plataforma.</p>
        </div>
        <Link className={styles.primaryLink} href="/courses/new" aria-label="Novo curso" data-tooltip="Novo curso">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
        </Link>
      </div>

      <form className={styles.filters} method="get" action="/courses">
        <label className={styles.search}>
          <span className={styles.srOnly}>Buscar cursos pelo título</span>
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
            <circle cx="10.8" cy="10.8" r="6.8" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input name="query" defaultValue={query} placeholder="Buscar cursos pelo título" />
          {query && (
            <button className={styles.iconButton} type="reset" aria-label="Limpar Pesquisa" data-tooltip="Limpar Pesquisa" onClick={(event) => {
              event.preventDefault();
              const form = event.currentTarget.form;
              if (!form) return;
              const search = form.elements.namedItem('query');
              if (search instanceof HTMLInputElement) search.value = '';
              form.requestSubmit();
            }}>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <path d="m6 6 12 12M18 6 6 18" />
              </svg>
            </button>
          )}
        </label>
        <label className={styles.statusFilter}>
          <span>Publicação</span>
          <select name="status" defaultValue={status}>
            <option value="">Todos os estados</option>
            <option value="draft">Rascunhos</option>
            <option value="published">Publicados</option>
          </select>
        </label>
        <button className={`${styles.iconButton} ${styles.filterButton}`} type="submit" aria-label="Filtrar" data-tooltip="Filtrar">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 6h16M7 12h10m-7 6h4" />
          </svg>
        </button>
      </form>

      {errorMessage ? (
        <div className={styles.feedback} role="alert">
          <p>{errorMessage}</p>
          <Link href="/courses">Tentar novamente</Link>
        </div>
      ) : courses.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21V5.5Z" />
              <path d="M4 18.5A2.5 2.5 0 0 1 6.5 16H20M8 7h8M8 10h6" />
            </svg>
          </span>
          <h2>{query || status ? 'Nenhum curso encontrado' : 'Seu catálogo começa aqui'}</h2>
          <p>
            {query || status
              ? 'Ajuste a busca ou o filtro para ver outros cursos.'
              : 'Cadastre o primeiro curso para começar a organizar o conteúdo.'}
          </p>
          {!query && !status && <Link href="/courses/new">Cadastrar curso</Link>}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr><th>Curso</th><th>Módulos</th><th>Atualizado</th><th>Estado</th><th>Ações</th></tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id}>
                  <td className={styles.courseCell}>
                    <Link href={`/courses/${course.id}`}>{course.title}</Link>
                    <small>{course.description}</small>
                  </td>
                  <td>{course.moduleCount}</td>
                  <td>{formatDate(course.updatedAt)}</td>
                  <td>
                    <span className={course.status === 'published' ? styles.published : styles.draft}>
                      <span aria-hidden="true" />
                      {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className={styles.actionCell}>
                    <div className={styles.actions}>
                      <Link className={styles.iconButton} href={`/courses/${course.id}`} aria-label={`Editar ${course.title}`} data-tooltip="Editar">
                        <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m14 5 5 5M4 20l4.2-.8L19 8.4 15.6 5 4.8 15.8 4 20Z" />
                        </svg>
                      </Link>
                      <CoursePublicationButton course={course} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!errorMessage && pageData && pageData.totalPages > 1 && (
        <nav className={styles.pagination} aria-label="Paginação dos cursos">
          <span>Exibindo {((pageData.page - 1) * pageData.pageSize) + 1}–{Math.min(pageData.page * pageData.pageSize, pageData.totalItems)} de {pageData.totalItems} cursos</span>
          <div className={styles.paginationControls}>
            <PageLink page={pageData.page - 1} label="Página anterior" query={query} status={status} disabled={pageData.page <= 1}>‹</PageLink>
            {visiblePages(pageData.page, pageData.totalPages).map((page) => (
              <PageLink key={page} page={page} label={`Página ${page}`} query={query} status={status} current={page === pageData.page}>{page}</PageLink>
            ))}
            <PageLink page={pageData.page + 1} label="Próxima página" query={query} status={status} disabled={pageData.page >= pageData.totalPages}>›</PageLink>
          </div>
        </nav>
      )}
    </section>
  );
}

function PageLink({
  page, label, query, status, disabled = false, current = false, children,
}: {
  page: number; label: string; query: string; status: string; disabled?: boolean; current?: boolean; children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (status) params.set('status', status);
  params.set('page', String(page));
  if (disabled) {
    return <span className={styles.pageLink} aria-label={label} aria-disabled="true">{children}</span>;
  }
  return (
    <Link
      className={styles.pageLink}
      href={`/courses?${params.toString()}`}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
    >{children}</Link>
  );
}

function visiblePages(current: number, total: number): number[] {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
