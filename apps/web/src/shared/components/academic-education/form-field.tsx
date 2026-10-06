import { ChevronDown } from 'lucide-react'
import { cn } from '@/shared/utils/cn'

export const controlClassName =
  'w-full rounded-lg border border-[#d9d8df] bg-white px-3.5 py-2.5 text-sm text-[#101c35] outline-none transition-colors placeholder:text-[#858a95] focus:border-[#ff5b1f] focus:ring-2 focus:ring-[#ff5b1f]/20 disabled:cursor-not-allowed disabled:bg-[#f1f0f4] disabled:text-[#737987] aria-invalid:border-red-600'

export function FormField({
  id,
  label,
  required,
  error,
  hint,
  className,
  children,
}: {
  id: string
  label: string
  required?: boolean
  error?: string
  hint?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="text-sm font-medium text-[#101c35]">
        {label}
        {required && <span className="ml-0.5 text-red-600" aria-hidden="true">*</span>}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="text-xs font-medium text-red-700" role="alert">{error}</p>
      ) : (
        hint && <p id={`${id}-hint`} className="text-xs text-gray-500">{hint}</p>
      )}
    </div>
  )
}

export function SelectControl({
  className,
  placeholder,
  options,
  ...props
}: React.ComponentProps<'select'> & {
  placeholder: string
  options: readonly { value: string; label: string }[]
}) {
  return (
    <div className="relative">
      <select className={cn(controlClassName, 'appearance-none pr-10', className)} {...props}>
        <option value="" disabled>{placeholder}</option>
        {options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#737987]" aria-hidden="true" />
    </div>
  )
}

export function fieldA11y(id: string, error?: string, hasHint?: boolean) {
  return {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? `${id}-error` : hasHint ? `${id}-hint` : undefined,
  } as const
}