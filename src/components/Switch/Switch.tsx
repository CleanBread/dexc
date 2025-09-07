'use client'

import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'

import cn from 'clsx'


function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={
        cn(
          'peer data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-neutral-500 focus-visible:border-ring focus-visible:ring-ring/50 inline-flex h-6 w-11 shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:ring-[3px] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
          className
        )
      }
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={
          cn(
            'bg-white pointer-events-none block size-5 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-[2px]'
          )
        }
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
