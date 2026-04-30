import clsx from 'clsx'
import {ComponentPropsWithoutRef, forwardRef} from 'react'

export const Select = forwardRef<HTMLSelectElement, ComponentPropsWithoutRef<'select'>>(
  (props, ref) => {
    const {className, children, ...rest} = props

    return (
      <select
        ref={ref}
        className={clsx(
          'bg-canvas-50 text-ink-1000 border-ink-300 focus:border-primary-500 focus:ring-primary-500 h-12 cursor-pointer self-start overflow-hidden rounded-xl border pl-4 pr-10 text-sm shadow-sm focus:outline-none',
          className,
        )}
        {...rest}
      >
        {children}
      </select>
    )
  },
)
