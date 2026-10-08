import Image, { type ImageProps } from 'next/image';

/**
 * Proporciones disponibles. Las clases van completas (no construidas con
 * template strings) para que Tailwind las detecte al compilar.
 */
const RATIOS = {
  square: 'aspect-square',
  video: 'aspect-video',
  photo: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
  banner: 'aspect-[21/9]',
} as const;

export type ResponsiveImageRatio = keyof typeof RATIOS;

const DEFAULT_SIZES =
  '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';

type ResponsiveImageProps = Omit<
  ImageProps,
  'fill' | 'width' | 'height' | 'alt'
> & {
  /** Obligatorio por accesibilidad. Usa alt="" si la imagen es decorativa. */
  alt: string;
  /** Proporción del contenedor. Por defecto 16:9. */
  ratio?: ResponsiveImageRatio;
  /** cover recorta para llenar; contain muestra la imagen completa. */
  fit?: 'cover' | 'contain';
  /** Clases extra para el contenedor (bordes redondeados, sombras, etc.). */
  containerClassName?: string;
};

function join(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

export default function ResponsiveImage({
  alt,
  ratio = 'video',
  fit = 'cover',
  sizes = DEFAULT_SIZES,
  className,
  containerClassName,
  ...rest
}: ResponsiveImageProps) {
  return (
    <div
      className={join(
        'relative w-full overflow-hidden',
        RATIOS[ratio],
        containerClassName,
      )}
    >
      <Image
        fill
        alt={alt}
        sizes={sizes}
        className={join(
          fit === 'cover' ? 'object-cover' : 'object-contain',
          className,
        )}
        {...rest}
      />
    </div>
  );
}