'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export function CourseImage({
  src,
  alt,
  className,
  sizes,
}: {
  src: string;
  alt: string;
  className: string;
  sizes: string;
}) {
  const [failedSource, setFailedSource] = useState('');

  useEffect(() => {
    setFailedSource('');
  }, [src]);

  if (failedSource === src) return null;

  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill
      sizes={sizes}
      unoptimized
      onError={() => setFailedSource(src)}
    />
  );
}
