'use client';

import { useState, useTransition } from 'react';
import { markCourseContentComplete } from '../../lib/courses/actions';
import styles from './CourseScreen.module.css';

export function CourseCompletionButton({
  courseId,
  contentId,
  completed,
}: {
  courseId: number;
  contentId: number;
  completed: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState('');

  function complete() {
    setError('');
    startTransition(async () => {
      try {
        await markCourseContentComplete(courseId, contentId);
      } catch {
        setError('Não foi possível salvar seu progresso. Tente novamente.');
      }
    });
  }

  return (
    <div>
      {completed ? (
        <span className={styles.completionMessage}>Conteúdo concluído</span>
      ) : (
        <button
          className={styles.completionButton}
          type="button"
          onClick={complete}
          disabled={isPending}
        >
          {isPending ? 'Salvando...' : 'Marcar como concluído'}
        </button>
      )}
      {error && (
        <p className={styles.completionMessage} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
