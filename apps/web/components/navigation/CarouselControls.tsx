'use client';

import { homeClass } from '../ui/homeStyles';

export function CarouselControls({
  activeIndex,
  itemCount,
  onSelect,
  onPrevious,
  onNext,
}: {
  activeIndex: number;
  itemCount: number;
  onSelect(index: number): void;
  onPrevious(): void;
  onNext(): void;
}) {
  return (
    <div className={homeClass('featured-controls')}>
      <div className={homeClass('banner-dots')} aria-label="Navegação dos banners">
        {Array.from({ length: itemCount }, (_, index) => (
          <button
            key={index}
            type="button"
            aria-label={`Exibir banner ${index + 1}`}
            aria-current={activeIndex === index}
            onClick={() => onSelect(index)}
          />
        ))}
      </div>
      <div className={homeClass('banner-arrows')}>
        <button type="button" aria-label="Banner anterior" onClick={onPrevious}>
          ←
        </button>
        <button type="button" aria-label="Próximo banner" onClick={onNext}>
          →
        </button>
      </div>
    </div>
  );
}
