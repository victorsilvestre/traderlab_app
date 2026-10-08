import Link from 'next/link';
import type { AdminEnrollmentPageDto } from '@traderlab/contracts';
import { AdminBackLink } from '../navigation/AdminBackLink';
import styles from './AdminEnrollmentCatalog.module.css';

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeZone: 'America/Sao_Paulo' }).format(new Date(value));
}

function roleLabel(role: string) {
  const labels: Record<string, string> = { student: 'Aluno', administrator: 'Administrador', mentor: 'Mentor' };
  return labels[role.toLowerCase()] ?? role;
}

export function AdminEnrollmentCatalog({
  pageData, courses, query, courseId, status, returnTo, errorMessage,
}: {
  pageData?: AdminEnrollmentPageDto;
  courses: Array<{ id: number; title: string }>;
  query: string;
  courseId?: number;
  status: string;
  returnTo: string;
  errorMessage?: string;
}) {
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (courseId) params.set('courseId', String(courseId));
  if (status) params.set('status', status);
  const currentPage = pageData?.page ?? 1;
  const makeHref = (page: number) => {
    const next = new URLSearchParams(params);
    if (page > 1) next.set('page', String(page));
    return `/enrollments${next.size ? `?${next.toString()}` : ''}`;
  };
  const currentHref = makeHref(currentPage);
  const originParams = new URLSearchParams();
  if (query) originParams.set('query', query);
  if (courseId) originParams.set('courseId', String(courseId));
  if (status) originParams.set('status', status);
  if (currentPage > 1) originParams.set('page', String(currentPage));
  if (returnTo !== '/') originParams.set('returnTo', returnTo);
  const originHref = returnTo !== '/'
    ? `/enrollments?${originParams.toString()}`
    : currentHref;
  const newEnrollmentParams = new URLSearchParams();
  if (courseId) newEnrollmentParams.set('courseId', String(courseId));
  newEnrollmentParams.set('returnTo', originHref);
  const newEnrollmentHref = `/enrollments/new?${newEnrollmentParams.toString()}`;
  const userDetailsHref = (userId: string) => `/users/${encodeURIComponent(userId)}?returnTo=${encodeURIComponent(originHref)}`;
  const courseDetailsHref = (id: number) => `/courses/${id}?returnTo=${encodeURIComponent(originHref)}`;
  const firstItem = pageData?.totalItems ? (currentPage - 1) * (pageData.pageSize) + 1 : 0;
  const lastItem = pageData ? Math.min(currentPage * pageData.pageSize, pageData.totalItems) : 0;
  return (
    <section className={styles.catalog} aria-labelledby="enrollments-title">
      <AdminBackLink href={returnTo} />
      <div className={styles.heading}>
        <div><h1 id="enrollments-title">Matrículas</h1><p>Consulte o acesso aos cursos e matricule usuários cadastrados.</p></div>
        <Link className={styles.addButton} href={newEnrollmentHref} aria-label="Matricular usuário" data-tooltip="Matricular usuário">
          <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </Link>
      </div>
      <form
        key={`${query}|${courseId ?? ''}|${status}`}
        className={styles.filters}
        method="get"
        action="/enrollments"
      >
        <label className={styles.search}>Pesquisar por nome, e-mail, telefone ou curso
          <input type="search" name="query" defaultValue={query} maxLength={120} placeholder="Digite nome, e-mail, telefone ou curso" />
        </label>
        <label>Curso
          <select name="courseId" defaultValue={courseId ? String(courseId) : ''}>
            <option value="">Todos os cursos</option>
            {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
          </select>
        </label>
        <label>Situação
          <select name="status" defaultValue={status}>
            <option value="">Todas</option><option value="active">Ativa</option><option value="revoked">Revogada</option>
          </select>
        </label>
        <button type="submit">Pesquisar</button>
        {(query || courseId || status) && <Link href={returnTo ? `/enrollments?returnTo=${encodeURIComponent(returnTo)}` : '/enrollments'}>Limpar</Link>}
      </form>
      {errorMessage ? (
        <div className={styles.feedback} role="alert"><p>{errorMessage}</p><Link href={makeHref(currentPage)}>Tentar novamente</Link></div>
      ) : !pageData?.items.length ? (
        <div className={styles.empty}>
          <h2>{query || courseId || status ? 'Nenhuma matrícula encontrada' : 'Nenhuma matrícula cadastrada'}</h2>
          <p>
            {query && status
              ? `Não encontramos matrículas para “${query}” com situação ${status === 'revoked' ? 'Revogada' : 'Ativa'}. A busca verifica nome, e-mail, telefone e curso; confira se o filtro de situação está compatível.`
              : query || courseId || status
                ? 'A busca verifica nome, e-mail, telefone e curso. Ajuste os filtros ou a busca e tente novamente.'
                : 'As matrículas existentes aparecerão nesta lista.'}
          </p>
          {(query || courseId || status) && <Link href={returnTo ? `/enrollments?returnTo=${encodeURIComponent(returnTo)}` : '/enrollments'}>Limpar filtros</Link>}
          {!query && !courseId && !status && <Link href={newEnrollmentHref}>Matricular usuário</Link>}
        </div>
      ) : (
        <>
          <p className={styles.count}>Exibindo {firstItem}–{lastItem} de {pageData.totalItems} matrículas</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead><tr><th>Aluno</th><th>E-mail</th><th>Papel</th><th>Curso</th><th>Concedida em</th><th>Origem</th><th>Situação</th><th><span className={styles.srOnly}>Ações</span></th></tr></thead>
              <tbody>{pageData.items.map((item) => (
                <tr key={item.id}>
                  <td data-label="Aluno"><Link className={styles.userLink} href={userDetailsHref(item.userId)}>{item.userName || 'Nome não informado'}</Link></td>
                  <td data-label="E-mail">{item.userEmail || 'Indisponível'}</td>
                  <td data-label="Papel"><span className={styles.role}>{roleLabel(item.userRole)}</span></td>
                  <td data-label="Curso"><Link className={styles.courseLink} href={courseDetailsHref(item.courseId)}>{item.courseTitle}</Link></td>
                  <td data-label="Concedida em">{formatDate(item.grantedAt)}</td>
                  <td data-label="Origem">{{ manual: 'Manual', purchase: 'Compra', invitation: 'Convite' }[item.source]}</td>
                  <td data-label="Situação"><span className={item.status === 'active' ? styles.active : styles.revoked}>{item.status === 'active' ? 'Ativa' : 'Revogada'}</span></td>
                  <td data-label="Ações"><Link className={styles.viewLink} href={userDetailsHref(item.userId)} aria-label={`Visualizar ${item.userName}`} title="Visualizar usuário"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M2.5 12s3.3-6 9.5-6 9.5 6 9.5 6-3.3 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg></Link></td>
                </tr>
              ))}</tbody>
            </table>
          </div>
          {pageData.totalPages > 1 && <nav className={styles.pagination} aria-label="Paginação de matrículas"><span>Página {currentPage} de {pageData.totalPages}</span><div>{currentPage > 1 ? <Link href={makeHref(currentPage - 1)}>Anterior</Link> : <span>Anterior</span>}{currentPage < pageData.totalPages ? <Link href={makeHref(currentPage + 1)}>Próxima</Link> : <span>Próxima</span>}</div></nav>}
        </>
      )}
    </section>
  );
}
