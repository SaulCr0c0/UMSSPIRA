import React from 'react';
import Image, { type StaticImageData } from 'next/image';

import { cn } from '@/shared/utils/cn';

interface LogoProps {
  /** Modo imagen: imagen importada estáticamente (conserva el tamaño real y evita saltos de layout).
   *  Si se omite, se muestra el logo vectorial de marca. */
  src?: StaticImageData;
  alt?: string;
  /** Modo imagen: altura por breakpoint. El ancho se calcula solo para conservar la proporción */
  heightClassName?: string;
  /** Modo imagen: límite de ancho para que nunca desborde su contenedor */
  maxWidthClassName?: string;
  sizes?: string;
  priority?: boolean;
  /** Modo vectorial: tamaño del ícono en px */
  size?: number;
  /** Modo vectorial: logo completo o solo el ícono */
  variant?: 'full' | 'icon';
  className?: string;
}

/**
 * Logo de UMSSPIRA.
 * - Con `src`: imagen adaptable. Se controla por ALTURA y el ancho es automático (w-auto):
 *   mantiene la proporción. max-w-* evita el desborde en pantallas angostas y
 *   object-contain garantiza que nunca se deforme. `sizes` coincide con los max-w de los
 *   navbars (45vw / 16vw / 240px) para que al rotar el dispositivo el navegador no pida
 *   otra versión de la imagen.
 * - Sin `src`: logo vectorial (SVG) con texto de marca.
 */
export default function Logo({
  src,
  alt = 'Logo UMSSPIRA',
  heightClassName = 'h-10 sm:h-12 md:h-14',
  maxWidthClassName = 'max-w-[45vw]',
  sizes = '(max-width: 768px) 45vw, (max-width: 1024px) 16vw, 240px',
  priority = true,
  size = 40,
  variant = 'full',
  className,
}: LogoProps) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        priority={priority}
        sizes={sizes}
        className={`block ${heightClassName} ${maxWidthClassName} w-auto object-contain object-left ${className ?? ''}`}
      />
    );
  }

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M32 8 L58 20 L32 32 L6 20 Z" fill="#1E3A5F" />
        <path d="M14 24 V38 C14 42 22 46 32 46 C42 46 50 42 50 38 V24 L32 32 Z" fill="#E85D3A" />
        <circle cx="32" cy="42" r="4" fill="#1E3A5F" />
      </svg>

      {variant === 'full' && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-extrabold tracking-tight text-umss-navy">
            UMSS<span className="text-umss-orange">PIRA</span>
          </span>
          <span className="text-[10px] font-medium text-umss-navy/70">
            Egresados que inspiran
          </span>
        </div>
      )}
    </div>
  );
}