import Image from 'next/image';
import logo from '../assets/images/logoumsspira.jpg';
import { BRAND } from './brand';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <Image
      src={logo}
      alt={`Logotipo ${BRAND.name}`}
      height={40}
      className={`h-10 w-auto ${className}`}
      priority
    />
  );
}
