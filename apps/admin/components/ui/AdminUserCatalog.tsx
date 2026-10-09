import Link from 'next/link';
import { Eye } from 'lucide-react';
import type { AdminUserPageDto } from '@traderlab/contracts';
import { AdminBackLink } from '../navigation/AdminBackLink';
import styles from './AdminUserCatalog.module.css';

function formatDate(value: string | null) {
  if (!value) return 'Nunca';
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
}

function roleLabel(role: string) {
  const knownRoles: Record<string, string> = {
    student: 'Aluno',
    administrator: 'Administrador',
    mentor: 'Mentor',
  };
  return knownRoles[role.toLowerCase()] ?? role;
}

export function AdminUserCatalog({
  pageData,
  query,
  returnTo,
  errorMessage,
}: {
  pageData?: AdminUserPageDto;
  query: string;
  returnTo: string;
  errorMessage?: string;
}) {
  const users = pageData?.items ?? [];
  const currentPage = pageData?.page ?? 1;
  const params = new URLSearchParams();
  if (query) params.set('query', query);
  if (currentPage > 1) params.set('page', String(currentPage));
  if (returnTo !== '/') params.set('returnTo', returnTo);
  const currentHref = `/users${params.size ? `?${params.toString()}` : ''}`;
  const originParams = new URLSearchParams(params);
  if (returnTo !== '/') originParams.set('returnTo', returnTo);
  const originHref = `/users${originParams.size ? `?${originParams.toString()}` : ''}`;
  const firstItem = pageData ? (pageData.page - 1) * pageData.pageSize + 1 : 0;
  const lastItem = pageData
    ? Math.min(pageData.page * pageData.pageSize, pageData.totalItems)
    : 0;

  return (
    <section className={styles.catalog} aria-labelledby="users-title">
      <AdminBackLink href={returnTo} />
      <div className={styles.heading}>
        <div>
          <h1 id="users-title">Alunos</h1>
          <p>Consulte os usuários cadastrados e o papel de cada pessoa.</p>
        </div>
      </div>
      <form className={styles.searchForm} method="get" action="/users">
        <label htmlFor="user-query">Pesquisar por nome, e-mail ou telefone</label>
        <div className={styles.searchControls}>
          <input
            id="user-query"
            type="search"
            name="query"
            defaultValue={query}
            maxLength={120}
            placeholder="Digite um nome, e-mail ou telefone"
          />
          <button type="submit">Pesquisar</button>
          {query && <Link href="/users">Limpar</Link>}
        </div>
      </form>

      {errorMessage ? (
        <div className={styles.feedback} role="alert">
          <p>{errorMessage}</p>
                  <Link href={currentHref}>
            Tentar novamente
          </Link>
        </div>
      ) : users.length === 0 ? (
        <div className={styles.emptyState}>
          <h2>{query ? 'Nenhum usuário encontrado' : 'Nenhum usuário cadastrado'}</h2>
          <p>
            {query
              ? 'Confira o termo pesquisado ou limpe a busca para ver todos os usuários.'
              : 'Os usuários cadastrados na plataforma aparecerão aqui.'}
          </p>
          {query && <Link href="/users">Limpar busca</Link>}
        </div>
      ) : (
        <>
          <p className={styles.resultCount}>
            Exibindo {firstItem}–{lastItem} de {pageData?.totalItems} usuários
          </p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">E-mail</th>
                  <th scope="col">Telefone</th>
                  <th scope="col">Cadastro</th>
                  <th scope="col">Último login</th>
                  <th scope="col">Papel</th>
                  <th scope="col"><span className={styles.srOnly}>Ações</span></th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const detailsHref = `/users/${encodeURIComponent(user.id)}?returnTo=${encodeURIComponent(originHref)}`;
                  return (
                    <tr key={user.id} className={styles.userRow}>
                      <td className={styles.nameCell} data-label="Nome">
                        <Link className={styles.userName} href={detailsHref}>
                          {user.name || 'Nome não informado'}
                        </Link>
                      </td>
                      <td className={styles.emailCell} data-label="E-mail">{user.email || 'Indisponível'}</td>
                      <td data-label="Telefone">{user.phone || 'Indisponível'}</td>
                      <td data-label="Cadastro">{formatDate(user.createdAt)}</td>
                      <td data-label="Último login">{formatDate(user.lastLoginAt)}</td>
                      <td data-label="Papel"><span className={styles.role}>{roleLabel(user.role)}</span></td>
                      <td className={styles.actionCell} data-label="Ações">
                        <Link
                          className={styles.detailLink}
                          href={detailsHref}
                          aria-label={`Visualizar ${user.name || 'usuário'}`}
                        >
                          <Eye aria-hidden="true" size={18} strokeWidth={1.8} />
                          <span className={styles.srOnly}>Visualizar</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {pageData && pageData.totalPages > 1 && (
            <nav className={styles.pagination} aria-label="Paginação de usuários">
              <span>Página {pageData.page} de {pageData.totalPages}</span>
              <div>
                <PaginationLink page={pageData.page - 1} query={query} returnTo={returnTo} disabled={pageData.page <= 1}>
                  Anterior
                </PaginationLink>
                <PaginationLink page={pageData.page + 1} query={query} returnTo={returnTo} disabled={pageData.page >= pageData.totalPages}>
                  Próxima
                </PaginationLink>
              </div>
            </nav>
          )}
        </>
      )}
    </section>
  );
}

function PaginationLink({
  page,
  query,
  returnTo,
  disabled,
  children,
}: {
  page: number;
  query: string;
  returnTo: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) return <span className={styles.pageDisabled}>{children}</span>;
  const params = new URLSearchParams({ page: String(page) });
  if (query) params.set('query', query);
  if (returnTo !== '/') params.set('returnTo', returnTo);
  return <Link className={styles.pageLink} href={`/users?${params.toString()}`}>{children}</Link>;
}
