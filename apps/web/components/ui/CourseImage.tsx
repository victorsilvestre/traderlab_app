import Image from 'next/image';

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
  return (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill
      sizes={sizes}
      quality={90}
    />
  );
}
