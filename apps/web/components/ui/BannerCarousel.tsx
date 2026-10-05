'use client';

import { homeClass } from './homeStyles';

import { useState } from 'react';
import { demoBanners } from '../../lib/home/demoHomeData';
import { CarouselControls } from '../navigation/CarouselControls';
import { EmptyState } from './EmptyState';

export function BannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBanner = demoBanners[activeIndex];

  function move(direction: -1 | 1) {
    setActiveIndex((current) =>
      (current + direction + demoBanners.length) % demoBanners.length,
    );
  }

  return (
    <section className={homeClass('featured-banner')} aria-label="Destaques TraderLab">
      {activeBanner ? (
        <>
          <div
            className={homeClass('featured-art')}
            style={{ backgroundImage: `url(${activeBanner.image})` }}
            aria-hidden="true"
          />
          <div className={homeClass('featured-shade')} aria-hidden="true" />
          <div className={homeClass('featured-copy')} key={activeIndex}>
            <p className={homeClass('featured-eyebrow')}>
              <span /> {activeBanner.eyebrow}
            </p>
            <h2>{activeBanner.title}</h2>
            <p>{activeBanner.detail}</p>
            <span className={homeClass('featured-label')}>COMUNICAÇÃO DE EXEMPLO</span>
          </div>
          <CarouselControls
            activeIndex={activeIndex}
            itemCount={demoBanners.length}
            onSelect={setActiveIndex}
            onPrevious={() => move(-1)}
            onNext={() => move(1)}
          />
        </>
      ) : (
        <EmptyState
          mark="✳"
          title="Novidades aparecerão aqui"
          description="Quando houver uma comunicação, você poderá vê-la nesta área."
        />
      )}
    </section>
  );
}
