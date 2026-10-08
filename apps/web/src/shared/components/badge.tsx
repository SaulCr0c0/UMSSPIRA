import { cn } from '@/shared/utils/cn'
import { HTMLAttributes } from 'react'

type Variant = 'navy' | 'orange' | 'cream' | 'outline'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant
}

const variants: Record<Variant, string> = {
  navy: 'bg-umss-navy text-white',
  orange: 'bg-umss-orange text-white',
  cream: 'bg-umss-cream text-umss-navy',
  outline: 'border border-umss-navy/20 text-umss-navy',
}

export default function Badge({ className, variant = 'navy', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold',
        variants[variant],
        className
      )}
      {...props}
    />
  )
}