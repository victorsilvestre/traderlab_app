'use client';

import { homeClass } from './homeStyles';
import type { HomeBannerDto } from '@traderlab/contracts';

import { useState } from 'react';
import { CarouselControls } from '../navigation/CarouselControls';
import { EmptyState } from './EmptyState';

export function BannerCarousel({ banners }: { banners: HomeBannerDto[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeBanner = banners[activeIndex];

  function move(direction: -1 | 1) {
    setActiveIndex((current) =>
      (current + direction + banners.length) % banners.length,
    );
  }

  let destinationUrl: string | null = null;
  if (activeBanner?.destinationUrl) {
    try {
      const destination = new URL(activeBanner.destinationUrl);
      if (destination.protocol === 'https:' || destination.protocol === 'http:') {
        destinationUrl = destination.toString();
      }
    } catch {
      destinationUrl = null;
    }
  }

  return (
    <section className={homeClass('featured-banner')} aria-label="Destaques TraderLab">
      {activeBanner ? (
        <>
          <div
            className={homeClass('featured-art')}
            style={{ backgroundImage: `url(${activeBanner.imagePath})` }}
            role="img"
            aria-label={activeBanner.altText}
          />
          {destinationUrl && (
            <a
              className={homeClass('featured-destination')}
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir ${activeBanner.title} em uma nova aba`}
            />
          )}
          <div className={homeClass('featured-shade')} aria-hidden="true" />
          <div className={homeClass('featured-copy')} key={activeIndex}>
            <p className={homeClass('featured-eyebrow')}><span /> COMUNICAÇÃO</p>
            <h2>{activeBanner.title}</h2>
          </div>
          <CarouselControls
            activeIndex={activeIndex}
            itemCount={banners.length}
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
