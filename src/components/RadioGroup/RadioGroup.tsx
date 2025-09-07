import React from 'react'
import cx from 'clsx'
import { cva, type VariantProps } from 'class-variance-authority'


const buttonVariants = cva(
  'flex items-center justify-center rounded-md w-full cursor-pointer',
  {
    variants: {
      size: {
        default: 'h-7 py-2 px-1',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  }
)

type RadioGroupProps<ID extends string | number> = {
  className?: string
  items: {
    id: ID
    title: string
    active?: string
  }[]
  activeItem: ID
  onClick: (id: ID) => void
} & VariantProps<typeof buttonVariants>

export const RadioGroup = <ID extends string | number>(props: RadioGroupProps<ID>) => {
  const { className, items, activeItem, size, onClick } = props

  return (
    <div className={cx('flex items-center border border-border rounded-md overflow-hidden p-1', className)}>
      {
        items.map(({ id, title, active }) => {
          const isActive = id === activeItem

          return (
            <button
              key={id}
              className={
                cx(buttonVariants({ size }), {
                  'bg-secondary text-foreground': isActive && !active,
                  [`${active}`]: isActive && active,
                  'text-foreground-muted hover:text-foreground': !isActive,
                })
              }
              onClick={() => onClick(id)}
            >
              {title}
            </button>
          )
        })
      }
    </div>
  )
}
