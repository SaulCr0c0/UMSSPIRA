import type { IframeHTMLAttributes, VideoHTMLAttributes } from 'react';

const RATIOS = {
  square: 'aspect-square',
  video: 'aspect-video',
  photo: 'aspect-[4/3]',
  portrait: 'aspect-[3/4]',
  banner: 'aspect-[21/9]',
} as const;

export type ResponsiveMediaRatio = keyof typeof RATIOS;

function join(...classes: Array<string | undefined | false>) {
  return classes.filter(Boolean).join(' ');
}

type ResponsiveVideoProps = Omit<
  VideoHTMLAttributes<HTMLVideoElement>,
  'width' | 'height'
> & {
  ratio?: ResponsiveMediaRatio;
  fit?: 'cover' | 'contain';
  containerClassName?: string;
};

export default function ResponsiveVideo({
  ratio = 'video',
  fit = 'contain',
  controls = true,
  playsInline = true,
  preload = 'metadata',
  className,
  containerClassName,
  children,
  ...rest
}: ResponsiveVideoProps) {
  return (
    <div
      className={join(
        'relative w-full overflow-hidden bg-black',
        RATIOS[ratio],
        containerClassName,
      )}
    >
      <video
        controls={controls}
        playsInline={playsInline}
        preload={preload}
        className={join(
          'absolute inset-0 h-full w-full',
          fit === 'cover' ? 'object-cover' : 'object-contain',
          className,
        )}
        {...rest}
      >
        {}
        {children}
      </video>
    </div>
  );
}


type ResponsiveEmbedProps = Omit<
  IframeHTMLAttributes<HTMLIFrameElement>,
  'width' | 'height' | 'title'
> & {
  title: string;
  ratio?: ResponsiveMediaRatio;
  containerClassName?: string;
};

export function ResponsiveEmbed({
  title,
  ratio = 'video',
  loading = 'lazy',
  className,
  containerClassName,
  ...rest
}: ResponsiveEmbedProps) {
  return (
    <div
      className={join(
        'relative w-full overflow-hidden bg-black',
        RATIOS[ratio],
        containerClassName,
      )}
    >
      <iframe
        title={title}
        loading={loading}
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
        className={join('absolute inset-0 h-full w-full border-0', className)}
        {...rest}
      />
    </div>
  );
}