'use client';

import { useRouter } from 'next/navigation';
import styles from './CourseScreen.module.css';

export function RetryPageButton() {
  const router = useRouter();
  return (
    <button className={styles.retryButton} onClick={() => router.refresh()} type="button">
      Tentar novamente
    </button>
  );
}
