import { homeClass } from './homeStyles';
export function EmptyState({
  mark,
  title,
  description,
}: {
  mark: string;
  title: string;
  description: string;
}) {
  return (
    <div className={homeClass('learning-empty')}>
      <span className={homeClass('learning-empty-mark')} aria-hidden="true">
        {mark}
      </span>
      <strong>{title}</strong>
      <p>{description}</p>
    </div>
  );
}
