'use client';

import { homeClass } from './homeStyles';
import type { HomeBannerDto } from '@traderlab/contracts';
import Image from 'next/image';

import { useState } from 'react';
import { CarouselControls } from '../navigation/CarouselControls';
import { EmptyState } from './EmptyState';

function BannerArtwork({
  src,
  alt,
  priority,
}: {
  src: string;
  alt: string;
  priority: boolean;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <div className={homeClass('featured-art')} role="img" aria-label={alt} />;
  }

  return (
    <Image
      className={homeClass('featured-art')}
      src={src}
      alt={alt}
      fill
      sizes="(min-width: 1280px) 1280px, 100vw"
      unoptimized
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}

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
          <BannerArtwork
            key={activeBanner.imageUrl}
            src={activeBanner.imageUrl}
            alt={activeBanner.altText}
            priority={activeIndex === 0}
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
