import { forwardRef } from 'react'
import { cn } from '@/lib/cn'

type InputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  mono?: boolean
  error?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, mono, error, ...props },
  ref
) {
  return (
    <input
      ref={ref}
      className={cn(
        'w-full min-w-0 max-w-full min-h-11 rounded-drop border bg-panel-2 px-4 py-2.5',
        'text-sm text-text placeholder:text-muted/80 font-sans',
        'transition-colors duration-150 focus-ring',
        error ? 'border-danger/60' : 'border-border focus:border-acid/45',
        mono && 'font-mono',
        className
      )}
      {...props}
    />
  )
})

export function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <label className={cn('mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted font-sans', className)}>
      {children}
    </label>
  )
}

export function FieldHint({ children, error }: { children: React.ReactNode; error?: boolean }) {
  return (
    <p className={cn('mt-1.5 text-xs font-sans', error ? 'text-danger' : 'text-muted')}>
      {children}
    </p>
  )
}
