import Link from 'next/link'
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type Variant = 'dark' | 'light' | 'outline' | 'outline-light'

const variantClass: Record<Variant, string> = {
  dark: 'btn--dark',
  light: 'btn--light',
  outline: 'btn--outline',
  'outline-light': 'btn--outline-light',
}

/** Стрелка в углу кнопки — узнаваемая деталь макета */
export function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 14 14" aria-hidden className={cn('size-3.5 shrink-0', className)}>
      <path
        d="M3 3h8v8M11 3 3 11"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

type CommonProps = {
  variant?: Variant
  size?: 'md' | 'sm'
  wide?: boolean
  arrow?: boolean
  children: ReactNode
  className?: string
}

type ButtonAsButton = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'children'> & { href?: undefined }

type ButtonAsLink = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'children' | 'href'> & { href: string }

export function Button(props: ButtonAsButton | ButtonAsLink) {
  const { variant = 'dark', size = 'md', wide, arrow, className, children, ...rest } = props
  const classes = cn(
    'btn',
    variantClass[variant],
    size === 'sm' && 'btn--sm',
    wide && 'btn--wide',
    className,
  )
  const content = (
    <>
      {children}
      {arrow ? (
        // Стрелка в круглой «монетке»: при наведении поворачивается из ↗ в →
        <span aria-hidden className="btn__arrow">
          <ArrowIcon className="size-3" />
        </span>
      ) : null}
    </>
  )

  if ('href' in rest && typeof rest.href === 'string') {
    const { href, ...anchorProps } = rest as ButtonAsLink

    if (href.startsWith('/')) {
      return (
        <Link href={href} className={classes} {...anchorProps}>
          {content}
        </Link>
      )
    }

    return (
      <a href={href} className={classes} {...anchorProps}>
        {content}
      </a>
    )
  }

  const { type = 'button', ...buttonProps } = rest as ButtonAsButton
  return (
    <button type={type} className={classes} {...buttonProps}>
      {content}
    </button>
  )
}
