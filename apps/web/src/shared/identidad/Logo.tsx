import Image from 'next/image';
import logo from '../assets/images/logoumsspira.jpg';
import { BRAND } from './brand';

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <Image src={logo} alt={`Logotipo ${BRAND.name}`} height={40} className="h-10 w-auto" priority />
      <span className="font-heading text-lg font-bold">{BRAND.name}</span>
    </span>
  );
}
