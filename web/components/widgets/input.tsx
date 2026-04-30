import clsx from 'clsx'
import {ComponentPropsWithoutRef, forwardRef, Ref} from 'react'
import {Row} from 'web/components/layout/row'

/** Text input. Wraps html `<input>` */
export const Input = forwardRef(
  (
    props: {
      error?: boolean
      searchIcon?: boolean
    } & ComponentPropsWithoutRef<'input'>,
    ref: Ref<HTMLInputElement>,
  ) => {
    const {error, searchIcon, className, ...rest} = props

    const rowClassName =
      'bg-canvas-50 h-12 rounded-xl border border-canvas-200 px-4 shadow-sm transition-colors items-center gap-2'
    const elem = (
      <input
        ref={ref}
        step={0.001} // default to 3 decimal places
        className={clsx(
          'bg-canvas-50 invalid:border-error invalid:text-error  invalid:placeholder-rose-700 focus:outline-none focus:ring-1 disabled:cursor-not-allowed md:text-sm [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:m-0 [&::-webkit-outer-spin-button]:m-0',
          error
            ? 'border-error text-error focus:border-error focus:ring-error placeholder-rose-700' // matches invalid: styles
            : 'focus:border-canvas-200 focus:ring-transparent',
          !searchIcon && rowClassName,
          className,
        )}
        {...rest}
      />
    )

    if (searchIcon)
      return (
        <Row className={clsx(rowClassName)}>
          {searchIcon && <span className="search-icon">🔍</span>}
          {elem}
        </Row>
      )

    return elem
  },
)
