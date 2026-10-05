import styles from './CourseScreen.module.css';

export function CourseLoadingState({ content = false }: { content?: boolean }) {
  return (
    <main className={styles.page} aria-busy="true" aria-live="polite">
      <div className={styles.loadingState}>
        <div className={styles.loadingTopbar}>
          <span className={`${styles.loadingBlock} ${styles.loadingBrand}`} />
          <span className={`${styles.loadingBlock} ${styles.loadingActions}`} />
        </div>
        <span
          className={`${styles.loadingBlock} ${styles.loadingBreadcrumb}`}
        />
        {content ? (
          <section className={styles.contentArticle}>
            <span
              className={`${styles.loadingBlock} ${styles.loadingLineShort}`}
            />
            <span className={`${styles.loadingBlock} ${styles.loadingTitle}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingLine}`} />
            <span className={`${styles.loadingBlock} ${styles.loadingLine}`} />
          </section>
        ) : (
          <>
            <section className={styles.loadingHero}>
              <span
                className={`${styles.loadingBlock} ${styles.loadingCover}`}
              />
              <div>
                <span
                  className={`${styles.loadingBlock} ${styles.loadingTitle}`}
                />
                <span
                  className={`${styles.loadingBlock} ${styles.loadingLine}`}
                />
                <span
                  className={`${styles.loadingBlock} ${styles.loadingLineShort}`}
                />
              </div>
            </section>
            <span
              className={`${styles.loadingBlock} ${styles.loadingResume}`}
            />
            <span
              className={`${styles.loadingBlock} ${styles.loadingHeading}`}
            />
            <div className={styles.loadingModules}>
              <span
                className={`${styles.loadingBlock} ${styles.loadingModule}`}
              />
              <span
                className={`${styles.loadingBlock} ${styles.loadingModule}`}
              />
            </div>
          </>
        )}
        <span className={styles.srOnly}>Carregando curso...</span>
      </div>
    </main>
  );
}
