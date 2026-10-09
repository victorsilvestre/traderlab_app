'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import styles from './ProfileScreen.module.css';

export function ProfileCompletionModal({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className={styles.completionDialog}
      aria-labelledby="complete-profile-title"
      onCancel={(event) => event.preventDefault()}
    >
      {children}
    </dialog>
  );
}
