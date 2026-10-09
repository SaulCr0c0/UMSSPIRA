import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

type Crumb = { label: string; href?: string }

export function PageHeading({
  crumbs,
  title,
  description,
  action,
  variant = 'form',
}: {
  crumbs: Crumb[]
  title: string
  description?: string
  action?: React.ReactNode
  variant?: 'form' | 'list'
}) {
  const isList = variant === 'list'

  const navigation = (
    <nav aria-label="Ruta de navegación" className={isList ? 'mb-2' : undefined}>
      <ol className={cn('flex flex-wrap items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[oklch(0.5_0.01_60)]', isList && 'gap-1 font-normal tracking-wide text-zinc-600')}>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1
          const activeClass = isList ? 'font-semibold text-zinc-900' : 'text-[oklch(0.68_0.18_48)]'

          return (
            <li key={crumb.label} className={cn('flex items-center gap-1.5', isList && 'gap-1')}>
              {crumb.href && !isLast ? (
                <Link href={crumb.href} className={cn('transition-colors hover:text-[oklch(0.68_0.18_48)]', isList && 'hover:text-orange-600')}>
                  {crumb.label}
                </Link>
              ) : (
                <span aria-current={isLast ? 'page' : undefined} className={isLast ? activeClass : undefined}>
                  {crumb.label}
                </span>
              )}
              {!isLast && <ChevronRight className={isList ? 'size-3' : 'size-3.5'} aria-hidden="true" />}
            </li>
          )
        })}
      </ol>
    </nav>
  )

  if (isList) {
    return (
      <div className="mb-7">
        {navigation}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900">{title}</h1>
            {description && <p className="mt-1 max-w-xs text-sm leading-6 text-zinc-600">{description}</p>}
          </div>
          {action}
        </div>
      </div>
    )
  }

  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="flex flex-col gap-2">
        {navigation}
        <h1 className="text-2xl font-bold text-balance text-[oklch(0.22_0.01_60)]">{title}</h1>
        {description && <p className="text-sm text-pretty text-[oklch(0.5_0.01_60)]">{description}</p>}
      </div>
      {action}
    </div>
  )
}

export const PROFILE_CRUMB = { label: 'Perfil de vinculación', href: '/perfil/formacion' }
export const EDUCATION_CRUMB = { label: 'Mi formación académica', href: '/perfil/formacion' }
