import clsx from 'clsx'
import Link from 'next/link'

export const GeneralButton = (props: {url: string; content: string; color?: string}) => {
  const {url, content, color} = props

  return (
    <div className="rounded-xl p-3 flex flex-col  group">
      <Link
        href={url}
        className={clsx(
          'w-fit px-6 py-3 rounded-xl border-2 font-medium text-md',
          'hover:translate-y-[-2px] transition-transform duration-200 ease-in-out',
          color ??
            'bg-canvas-50 hover:bg-canvas-100 dark:hover:bg-gray-800/50 border-primary-200 dark:border-gray-600 text-gray-800 dark:text-white',
        )}
        target={url.startsWith('http') ? '_blank' : undefined}
        rel={url.startsWith('http') ? 'noopener noreferrer' : undefined}
      >
        <div className="flex items-center justify-center w-full h-full flex-col text-center">
          <div className="flex items-center justify-center">{content}</div>
        </div>
      </Link>
    </div>
  )
}
