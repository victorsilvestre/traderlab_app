import { homeClass } from './homeStyles';
import { demoCatalog, demoRecent } from '../../lib/home/demoHomeData';
import { ContentPreviewButton } from './ContentPreviewButton';
import { EmptyState } from './EmptyState';

export function RecentContentList() {
  return (
    <section className={homeClass('learning-section')} aria-labelledby="continue-title">
      <div className={homeClass('section-heading')}>
        <div>
          <p className="eyebrow">RETOME SEU CAMINHO</p>
          <h2 id="continue-title">Continue Onde Parou</h2>
        </div>
        <span className={homeClass('section-count')}>{demoRecent.length} recentes</span>
      </div>
      {demoRecent.length ? (
        <div className={homeClass('recent-list')}>
          {demoRecent.map((item, index) => {
            const content = demoCatalog.find(({ id }) => id === item.id);
            if (!content) return null;

            return (
              <ContentPreviewButton
                key={item.id}
                content={content}
                className={homeClass('recent-item')}
                label={`Ver prévia da aula ${item.title}`}
              >
                <span className={homeClass('recent-index')}>0{index + 1}</span>
                <span className={homeClass('recent-play')} aria-hidden="true">▶</span>
                <span className={homeClass('recent-main')}>
                  <span className={homeClass('recent-course')}>{item.course}</span>
                  <strong>{item.title}</strong>
                  <span className={homeClass('recent-meta')}>{item.time}</span>
                </span>
                <span className={homeClass('recent-progress')}>
                  <span className={homeClass('progress-track')}>
                    <span style={{ width: `${item.progress}%` }} />
                  </span>
                  <small>{item.progress}%</small>
                </span>
                <span className={homeClass('recent-arrow')} aria-hidden="true">↗</span>
              </ContentPreviewButton>
            );
          })}
          <p className={homeClass('demo-note', 'section-demo-note')}>
            Conteúdo de exemplo · seu histórico de estudos ainda não está
            conectado
          </p>
        </div>
      ) : (
        <EmptyState
          mark="▶"
          title="Você ainda não começou uma aula"
          description="Seus conteúdos recentes vão aparecer aqui quando iniciar seus estudos."
        />
      )}
    </section>
  );
}
