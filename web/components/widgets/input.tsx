import clsx from 'clsx'
import {ComponentPropsWithoutRef, forwardRef, Ref} from 'react'
import {Row} from 'web/components/layout/row'

/** Text input. Wraps html `<input>` */
export const Input = forwardRef(
  (
    props: {
      error?: boolean
    } & ComponentPropsWithoutRef<'input'>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const {error, className, ...rest} = props

    return (
      <Row
        className={clsx(
          'bg-canvas-50 h-12 rounded-xl border px-4 shadow-sm transition-colors items-center gap-2',
          error
            ? 'border-error text-error focus:border-error focus:ring-error placeholder-rose-700' // matches invalid: styles
            : 'border-ink-300 placeholder-ink-400 focus:ring-primary-500 focus:border-primary-500',
          className,
        )}
      >
        <span className="search-icon">🔍</span>
        <input
          ref={ref}
          step={0.001} // default to 3 decimal places
          className={clsx(
            'bg-canvas-50 invalid:border-error invalid:text-error  invalid:placeholder-rose-700 focus:outline-none focus:ring-1 disabled:cursor-not-allowed md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0',
            error
              ? 'border-error text-error focus:border-error focus:ring-error placeholder-rose-700' // matches invalid: styles
              : '',
            className,
          )}
          {...rest}
        />
      </Row>
    )
  },
)
