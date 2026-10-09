import Link from 'next/link';
import { BookOpen, Filter, Pencil, Plus, Search, X } from 'lucide-react';
import type {
  ManagedCourseDto,
  ManagedCoursePageDto,
  ManagedCourseStatusDto,
} from '@traderlab/contracts';
import { CoursePublicationButton } from './CoursePublicationButton';
import { AdminBackLink } from '../navigation/AdminBackLink';
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
  returnTo,
  errorMessage,
}: {
  courses: ManagedCourseDto[];
  pageData?: ManagedCoursePageDto;
  query: string;
  status: '' | ManagedCourseStatusDto;
  returnTo: string;
  errorMessage?: string;
}) {
  const catalogParams = new URLSearchParams();
  if (query) catalogParams.set('query', query);
  if (status) catalogParams.set('status', status);
  if (pageData && pageData.page > 1) catalogParams.set('page', String(pageData.page));
  const catalogHref = `/courses${catalogParams.size ? `?${catalogParams.toString()}` : ''}`;
  const originParams = new URLSearchParams(catalogParams);
  if (returnTo !== '/') originParams.set('returnTo', returnTo);
  const originHref = `/courses${originParams.size ? `?${originParams.toString()}` : ''}`;
  const detailsHref = (courseId: number) => `/courses/${courseId}?returnTo=${encodeURIComponent(originHref)}`;
  const newCourseHref = `/courses/new?returnTo=${encodeURIComponent(originHref)}`;
  return (
    <section className={styles.catalog} aria-labelledby="courses-title">
      <AdminBackLink href={returnTo} />
      <div className={styles.heading}>
        <div>
          <h1 id="courses-title">Cursos</h1>
          <p>Consulte e mantenha o catálogo de cursos da plataforma.</p>
        </div>
        <Link
          className={styles.primaryLink}
          href={newCourseHref}
          aria-label="Novo curso"
          data-tooltip="Novo curso"
        >
          <Plus aria-hidden="true" size={20} strokeWidth={1.8} />
        </Link>
      </div>

      <form className={styles.filters} method="get" action="/courses">
        <label className={styles.search}>
          <span className={styles.srOnly}>Buscar cursos pelo título</span>
          <Search aria-hidden="true" size={18} strokeWidth={1.8} />
          <input
            name="query"
            defaultValue={query}
            placeholder="Buscar cursos pelo título"
          />
          {query && (
            <button
              className={styles.iconButton}
              type="reset"
              aria-label="Limpar Pesquisa"
              data-tooltip="Limpar Pesquisa"
              onClick={(event) => {
                event.preventDefault();
                const form = event.currentTarget.form;
                if (!form) return;
                const search = form.elements.namedItem('query');
                if (search instanceof HTMLInputElement) search.value = '';
                form.requestSubmit();
              }}
            >
              <X aria-hidden="true" size={17} strokeWidth={1.8} />
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
        <button
          className={`${styles.iconButton} ${styles.filterButton}`}
          type="submit"
          aria-label="Filtrar"
          data-tooltip="Filtrar"
        >
          <Filter aria-hidden="true" size={18} strokeWidth={1.8} />
        </button>
      </form>

      {errorMessage ? (
        <div className={styles.feedback} role="alert">
          <p>{errorMessage}</p>
          <Link href={catalogHref}>Tentar novamente</Link>
        </div>
      ) : courses.length === 0 ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon} aria-hidden="true">
            <BookOpen aria-hidden="true" size={24} strokeWidth={1.7} />
          </span>
          <h2>
            {query || status
              ? 'Nenhum curso encontrado'
              : 'Seu catálogo começa aqui'}
          </h2>
          <p>
            {query || status
              ? 'Ajuste a busca ou o filtro para ver outros cursos.'
              : 'Cadastre o primeiro curso para começar a organizar o conteúdo.'}
          </p>
          {!query && !status && (
            <Link href={newCourseHref}>Cadastrar curso</Link>
          )}
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table>
            <thead>
              <tr>
                <th>Curso</th>
                <th>Módulos</th>
                <th>Atualizado</th>
                <th>Estado</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className={styles.courseRow}>
                  <td className={styles.courseCell} data-label="Curso">
                    <Link href={detailsHref(course.id)}>{course.title}</Link>
                    <small>{course.description}</small>
                  </td>
                  <td data-label="Módulos">{course.moduleCount}</td>
                  <td data-label="Atualizado">{formatDate(course.updatedAt)}</td>
                  <td data-label="Estado">
                    <span
                      className={
                        course.status === 'published'
                          ? styles.published
                          : styles.draft
                      }
                    >
                      <span aria-hidden="true" />
                      {course.status === 'published' ? 'Publicado' : 'Rascunho'}
                    </span>
                  </td>
                  <td className={styles.actionCell} data-label="Ações">
                    <div className={styles.actions}>
                      <Link
                        className={styles.iconButton}
                        href={detailsHref(course.id)}
                        aria-label={`Editar ${course.title}`}
                        data-tooltip="Editar"
                      >
                        <Pencil aria-hidden="true" size={18} strokeWidth={1.8} />
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
          <span>
            Exibindo {(pageData.page - 1) * pageData.pageSize + 1}–
            {Math.min(pageData.page * pageData.pageSize, pageData.totalItems)}{' '}
            de {pageData.totalItems} cursos
          </span>
          <div className={styles.paginationControls}>
            <PageLink
              page={pageData.page - 1}
              label="Página anterior"
              query={query}
              status={status}
              returnTo={returnTo}
              disabled={pageData.page <= 1}
            >
              ‹
            </PageLink>
            {visiblePages(pageData.page, pageData.totalPages).map((page) => (
              <PageLink
                key={page}
                page={page}
                label={`Página ${page}`}
                query={query}
                status={status}
                returnTo={returnTo}
                current={page === pageData.page}
              >
                {page}
              </PageLink>
            ))}
            <PageLink
              page={pageData.page + 1}
              label="Próxima página"
              query={query}
              status={status}
              returnTo={returnTo}
              disabled={pageData.page >= pageData.totalPages}
            >
              ›
            </PageLink>
          </div>
        </nav>
      )}
    </section>
  );
}

function PageLink({
  page,
  label,
  query,
  status,
  returnTo,
  disabled = false,
  current = false,
  children,
}: {
  page: number;
  label: string;
  query: string;
  status: string;
  returnTo: string;
  disabled?: boolean;
  current?: boolean;
  children: React.ReactNode;
}) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (status) params.set('status', status);
  params.set('page', String(page));
  params.set('returnTo', returnTo);
  if (disabled) {
    return (
      <span className={styles.pageLink} aria-label={label} aria-disabled="true">
        {children}
      </span>
    );
  }
  return (
    <Link
      className={styles.pageLink}
      href={`/courses?${params.toString()}`}
      aria-label={label}
      aria-current={current ? 'page' : undefined}
    >
      {children}
    </Link>
  );
}

function visiblePages(current: number, total: number): number[] {
  const start = Math.max(1, Math.min(current - 2, total - 4));
  const end = Math.min(total, start + 4);
  return Array.from({ length: end - start + 1 }, (_, index) => start + index);
}
