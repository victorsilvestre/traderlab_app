'use client';

import type {
  AdminEnrollmentCreatedDto,
  AdminEnrollmentOptionsDto,
  AdminEnrollmentUserOptionDto,
} from '@traderlab/contracts';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import styles from './AdminEnrollmentForm.module.css';

function roleLabel(role: string) {
  const labels: Record<string, string> = { student: 'Aluno', administrator: 'Administrador', mentor: 'Mentor' };
  return labels[role.toLowerCase()] ?? role;
}

function userDetails(user: AdminEnrollmentUserOptionDto) {
  return [user.email, user.phone].filter(Boolean).join(' · ');
}

export function AdminEnrollmentForm({
  options, initialCourseId, initialUserId, returnTo, initialError,
}: {
  options?: AdminEnrollmentOptionsDto;
  initialCourseId?: number;
  initialUserId?: string;
  returnTo: string;
  initialError?: string;
}) {
  const router = useRouter();
  const [courses, setCourses] = useState(options?.publishedCourses ?? []);
  const initialUser = options?.users.find((user) => user.id === initialUserId) ?? null;
  const [selectedUser, setSelectedUser] = useState<AdminEnrollmentUserOptionDto | null>(initialUser);
  const [courseId, setCourseId] = useState(initialCourseId ? String(initialCourseId) : '');
  const [userQuery, setUserQuery] = useState('');
  const [users, setUsers] = useState<AdminEnrollmentUserOptionDto[]>([]);
  const [searchState, setSearchState] = useState<'idle' | 'prompt' | 'loading' | 'results' | 'empty' | 'error'>('idle');
  const [searchError, setSearchError] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(initialError ?? '');
  const busyRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = 'enrollment-user-options';

  useEffect(() => {
    const query = userQuery.trim();
    if (selectedUser || query.length < 2) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setSearchState('loading');
      setIsOpen(true);
      setActiveIndex(-1);
      try {
        const response = await fetch(
          `/api/admin/enrollments/options?query=${encodeURIComponent(query)}`,
          { cache: 'no-store', signal: controller.signal },
        );
        const data = await response.json().catch(() => null) as
          | AdminEnrollmentOptionsDto
          | { message?: string }
          | null;
        if (!response.ok || !data || !('users' in data)) {
          throw new Error(
            data && 'message' in data && data.message
              ? data.message
              : 'Não foi possível pesquisar usuários.',
          );
        }
        setUsers(data.users);
        setCourses(data.publishedCourses);
        setSearchState(data.users.length ? 'results' : 'empty');
        setSearchError('');
      } catch (cause) {
        if (controller.signal.aborted) return;
        setUsers([]);
        setSearchState('error');
        setSearchError(cause instanceof Error ? cause.message : 'Não foi possível pesquisar usuários.');
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [userQuery, selectedUser]);

  function chooseUser(user: AdminEnrollmentUserOptionDto) {
    setSelectedUser(user);
    setUserQuery('');
    setUsers([]);
    setIsOpen(false);
    setActiveIndex(-1);
    setSearchState('idle');
    setSearchError('');
    setError('');
  }

  function clearSelectedUser() {
    setSelectedUser(null);
    setUserQuery('');
    setUsers([]);
    setIsOpen(false);
    setSearchState('idle');
    window.requestAnimationFrame(() => inputRef.current?.focus());
  }

  function handleSearchKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setIsOpen(true);
      if (users.length) setActiveIndex((current) => Math.min(current + 1, users.length - 1));
      return;
    }
    if (event.key === 'ArrowUp' && users.length) {
      event.preventDefault();
      setActiveIndex((current) => current <= 0 ? users.length - 1 : current - 1);
      return;
    }
    if (event.key === 'Enter' && isOpen) {
      event.preventDefault();
      const user = users[activeIndex] ?? (users.length === 1 ? users[0] : undefined);
      if (user) chooseUser(user);
      return;
    }
    if (event.key === 'Escape' && isOpen) {
      event.preventDefault();
      setIsOpen(false);
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (busyRef.current) return;
    if (!selectedUser || !courseId) {
      setError('Selecione um usuário e um curso publicado.');
      return;
    }
    busyRef.current = true;
    setBusy(true);
    setError('');
    try {
      const response = await fetch('/api/admin/enrollments', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, courseId: Number(courseId) }),
      });
      const result = await response.json().catch(() => ({})) as
        | AdminEnrollmentCreatedDto
        | { message?: string };
      if (!response.ok || !('id' in result)) {
        throw new Error('message' in result && result.message ? result.message : 'Não foi possível criar a matrícula.');
      }
      const destination = new URLSearchParams({
        returnTo,
      });
      if (courseId) destination.set('courseId', courseId);
      router.push(`/enrollments?${destination.toString()}`);
      router.refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Não foi possível criar a matrícula. Tente novamente.');
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  const liveMessage = searchState === 'loading'
    ? 'Buscando usuários…'
    : searchState === 'prompt'
      ? 'Digite pelo menos 2 caracteres para buscar.'
      : searchState === 'empty'
        ? `Nenhum usuário encontrado para “${userQuery.trim()}”.`
        : searchState === 'results'
          ? `${users.length} ${users.length === 1 ? 'usuário encontrado' : 'usuários encontrados'}. Use as setas para navegar e Enter para selecionar.`
          : searchState === 'error'
            ? searchError
            : '';

  return (
    <form className={styles.form} onSubmit={submit}>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.field}>
        <span id="enrollment-user-label">Usuário cadastrado</span>
        {selectedUser ? (
          <div className={styles.selectedUser}>
            <span className={styles.userMark} aria-hidden="true">{selectedUser.name.trim().charAt(0).toLocaleUpperCase('pt-BR') || '?'}</span>
            <span className={styles.userIdentity}>
              <strong>{selectedUser.name || 'Nome não informado'}</strong>
              <span>{roleLabel(selectedUser.role)}{userDetails(selectedUser) ? ` · ${userDetails(selectedUser)}` : ''}</span>
            </span>
            <button className={styles.changeUser} type="button" onClick={clearSelectedUser} disabled={busy}>Trocar</button>
          </div>
        ) : (
          <div className={styles.autocomplete}>
            <input
              ref={inputRef}
              className={styles.searchInput}
              type="search"
              role="combobox"
              aria-labelledby="enrollment-user-label"
              aria-autocomplete="list"
              aria-expanded={isOpen}
              aria-controls={listboxId}
              aria-activedescendant={isOpen && activeIndex >= 0 ? `${listboxId}-option-${activeIndex}` : undefined}
              aria-describedby="enrollment-user-search-status"
              value={userQuery}
              onChange={(event) => {
                const nextQuery = event.target.value;
                setUserQuery(nextQuery);
                setUsers([]);
                setActiveIndex(-1);
                setSearchState(nextQuery.trim().length >= 2 ? 'loading' : nextQuery.trim() ? 'prompt' : 'idle');
                setIsOpen(Boolean(nextQuery.trim()));
              }}
              onFocus={() => { if (searchState !== 'idle') setIsOpen(true); }}
              onBlur={() => window.setTimeout(() => setIsOpen(false), 120)}
              onKeyDown={handleSearchKeyDown}
              maxLength={120}
              placeholder="Digite um nome, e-mail ou telefone"
              autoComplete="off"
              disabled={busy}
            />
            <ul className={styles.options} id={listboxId} role="listbox" hidden={!isOpen}>
              {searchState === 'loading' && <li className={styles.optionMessage} role="presentation">Buscando usuários…</li>}
              {searchState === 'prompt' && <li className={styles.optionMessage} role="presentation">Digite pelo menos 2 caracteres para buscar.</li>}
              {searchState === 'empty' && <li className={styles.optionMessage} role="presentation">Nenhum usuário encontrado.</li>}
              {searchState === 'error' && <li className={styles.optionMessage} role="presentation">{searchError}</li>}
              {users.map((user, index) => (
                <li
                  className={`${styles.option} ${activeIndex === index ? styles.optionActive : ''}`}
                  id={`${listboxId}-option-${index}`}
                  key={user.id}
                  role="option"
                  aria-selected={activeIndex === index}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => chooseUser(user)}
                >
                  <span className={styles.userMark} aria-hidden="true">{user.name.trim().charAt(0).toLocaleUpperCase('pt-BR') || '?'}</span>
                  <span className={styles.optionIdentity}>
                    <strong>{user.name || 'Nome não informado'}</strong>
                    <span>{roleLabel(user.role)}{userDetails(user) ? ` · ${userDetails(user)}` : ''}</span>
                  </span>
                </li>
              ))}
            </ul>
            <span className={styles.searchStatus} id="enrollment-user-search-status" role="status" aria-live="polite">
              {liveMessage}
            </span>
          </div>
        )}
        <span>Digite para buscar por nome, e-mail ou telefone. Todos os papéis podem ser matriculados.</span>
      </div>
      <label className={styles.field}>
        Curso publicado
        <select value={courseId} onChange={(event) => setCourseId(event.target.value)} required>
          <option value="">Selecione um curso</option>
          {courses.map((course) => <option key={course.id} value={course.id}>{course.title}</option>)}
        </select>
        {!courses.length && <span>Não há cursos publicados disponíveis para matrícula.</span>}
      </label>
      <p className={styles.notice}>A matrícula será concedida imediatamente e é vitalícia nesta versão.</p>
      <div className={styles.actions}>
        <button className={styles.cancel} type="button" onClick={() => router.push(returnTo)} disabled={busy}>Cancelar</button>
        <button className={styles.primary} type="submit" disabled={busy || !selectedUser || !courses.length}>{busy ? 'Matriculando…' : 'Matricular usuário'}</button>
      </div>
    </form>
  );
}
