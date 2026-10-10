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
    <section
      id="home-banner"
      className={homeClass('featured-banner')}
      aria-label="Destaques TraderLab"
    >
      {activeBanner ? (
        <>
          <div
            className={homeClass('featured-art')}
            style={{ backgroundImage: `url(${activeBanner.imageUrl})` }}
            role="img"
            aria-label={activeBanner.altText}
          />
          {destinationUrl && (
            <a
              className={homeClass('featured-destination')}
              href={destinationUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Abrir banner ${activeBanner.displayOrder} em uma nova aba`}
            />
          )}
          {activeBanner.overlayText && <>
            <div className={homeClass('featured-shade')} aria-hidden="true" />
            <div className={homeClass('featured-copy')} key={activeIndex}>
              <h2>{activeBanner.overlayText}</h2>
              {activeBanner.eyebrowText && <p className={homeClass('featured-banner-intro')}>{activeBanner.eyebrowText}</p>}
              {activeBanner.description && <p>{activeBanner.description}</p>}
            </div>
          </>}
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
