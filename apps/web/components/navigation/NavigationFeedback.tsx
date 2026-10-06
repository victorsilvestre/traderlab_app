'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import styles from './NavigationFeedback.module.css';

export function NavigationFeedback() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const pendingRef = useRef(false);
  const showTimerRef = useRef<number | null>(null);
  const safetyTimerRef = useRef<number | null>(null);

  const clearPending = useCallback(() => {
    pendingRef.current = false;
    if (showTimerRef.current !== null) window.clearTimeout(showTimerRef.current);
    if (safetyTimerRef.current !== null) window.clearTimeout(safetyTimerRef.current);
    showTimerRef.current = null;
    safetyTimerRef.current = null;
    setVisible(false);
  }, []);

  useEffect(() => {
    clearPending();
  }, [pathname, clearPending]);

  useEffect(() => {
    const startPending = () => {
      if (pendingRef.current) return;
      pendingRef.current = true;
      showTimerRef.current = window.setTimeout(() => setVisible(true), 160);
      safetyTimerRef.current = window.setTimeout(clearPending, 12000);
    };

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest('a[href]') as HTMLAnchorElement | null;
      if (
        !anchor ||
        anchor.hasAttribute('download') ||
        (anchor.target && anchor.target !== '_self')
      ) {
        return;
      }

      const destination = new URL(anchor.href, window.location.href);
      if (
        destination.origin !== window.location.origin ||
        destination.pathname === window.location.pathname
      ) {
        return;
      }
      startPending();
    };

    document.addEventListener('click', handleClick, true);
    window.addEventListener('popstate', startPending);
    return () => {
      document.removeEventListener('click', handleClick, true);
      window.removeEventListener('popstate', startPending);
      clearPending();
    };
  }, [clearPending]);

  if (!visible) return null;

  return (
    <div className={styles.indicator} role="status" aria-label="Carregando página">
      <span className={styles.spinner} aria-hidden="true" />
      <span className={styles.srOnly}>Carregando página</span>
    </div>
  );
}
