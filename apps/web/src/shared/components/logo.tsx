import React from 'react';
import Image, { type StaticImageData } from 'next/image';

interface LogoProps {
  /** Imagen importada estáticamente (conserva el tamaño real y evita saltos de layout) */
  src: StaticImageData;
  alt?: string;
  /** Altura del logo por breakpoint. El ancho se calcula solo para conservar la proporción */
  heightClassName?: string;
  /** Límite de ancho para que nunca desborde su contenedor */
  maxWidthClassName?: string;
  sizes?: string;
  priority?: boolean;
}

/**
 * Logo adaptable de UMSSPIRA.
 * - Se controla por ALTURA y el ancho es automático (w-auto): mantiene la proporción.
 * - max-w-* evita el desborde en pantallas angostas (ej. móvil en vertical).
 * - object-contain garantiza que nunca se deforme si max-w entra en acción.
 */
export default function Logo({
  src,
  alt = 'Logo UMSSPIRA',
  heightClassName = 'h-10 sm:h-12 md:h-14',
  maxWidthClassName = 'max-w-[45vw]',
  sizes = '(max-width: 640px) 45vw, 200px',
  priority = true,
}: LogoProps) {
  return (
    <Image
      src={src}
      alt={alt}
      priority={priority}
      sizes={sizes}
      className={`block ${heightClassName} ${maxWidthClassName} w-auto object-contain object-left`}
    />
  );
}