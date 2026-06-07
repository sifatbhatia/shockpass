import Link from 'next/link'
import { cn } from '@/lib/cn'

type ButtonVariant = 'primary' | 'ghost' | 'hot' | 'electric' | 'outline'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-acid text-bg hover:bg-acid-dim active:scale-[0.98] shadow-glow-acid',
  ghost:
    'bg-transparent text-text border border-border hover:bg-panel-2 hover:border-white/25 active:bg-panel',
  hot: 'bg-hot text-bg hover:opacity-95 active:scale-[0.98] shadow-glow-hot',
  electric: 'bg-electric text-bg hover:opacity-95 active:scale-[0.98]',
  outline:
    'border border-acid/45 text-acid hover:bg-acid/12 hover:border-acid/70 active:bg-acid/15',
}

type ButtonProps = {
  variant?: ButtonVariant
  className?: string
  children: React.ReactNode
  href?: string
  type?: 'button' | 'submit'
  disabled?: boolean
  onClick?: () => void
}

export function Button({
  variant = 'primary',
  className,
  children,
  href,
  type = 'button',
  disabled,
  onClick,
}: ButtonProps) {
  const base = cn(
    'inline-flex items-center justify-center min-h-11 rounded-full px-6 py-2.5',
    'text-sm font-medium font-sans tracking-tight transition-[color,background,transform,box-shadow] duration-200',
    'focus-ring disabled:opacity-45 disabled:pointer-events-none disabled:shadow-none',
    variants[variant],
    className
  )

  if (href) {
    return (
      <Link href={href} className={base}>
        {children}
      </Link>
    )
  }

  return (
    <button type={type} className={base} disabled={disabled} onClick={onClick}>
      {children}
    </button>
  )
}
