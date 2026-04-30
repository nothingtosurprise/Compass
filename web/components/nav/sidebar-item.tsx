import clsx from 'clsx'
import Link from 'next/link'
import {useT} from 'web/lib/locale'
import {track} from 'web/lib/service/analytics'

export type Item = {
  name: string
  key: string
  children?: React.ReactNode
  trackingEventName?: string
  href?: string
  dataId?: string
  onClick?: () => void
  icon?: React.ComponentType<{className?: string}>
}

export function SidebarItem(props: {item: Item; currentPage?: string}) {
  const {item, currentPage} = props

  const t = useT()

  const currentBasePath = '/' + (currentPage?.split('/')[1] ?? '')
  const isCurrentPage = item.href != null && currentBasePath === item.href.split('?')[0]

  const onClick = () => {
    item.onClick?.()
    track('sidebar: ' + item.name)
  }

  const sidebarClass = clsx(
    isCurrentPage ? 'bg-canvas-900 text-primary-600' : 'sidebar-text hover:text-primary-600',
    'group flex items-center rounded-xl px-3 py-2 text-sm font-medium',
    'focus-visible:bg-ink-100 outline-none transition-all',
  )

  const sidebarItem = (
    <>
      {item.icon && (
        <item.icon
          className={clsx(
            isCurrentPage
              ? 'text-primary-700'
              : 'text-[#574f45] group-hover:text-primary-700 group-hover:translate-x-[2px]',
            '-ml-1 mr-3 h-6 w-6 flex-shrink-0 transition-all',
          )}
          aria-hidden="true"
        />
      )}
      <span className="truncate">{item.children ?? t(item.key, item.name)}</span>
    </>
  )

  if (item.href) {
    return (
      <Link
        href={item.href}
        aria-current={isCurrentPage ? 'page' : undefined}
        onClick={onClick}
        className={sidebarClass}
      >
        {sidebarItem}
      </Link>
    )
  } else {
    return (
      <button onClick={onClick} className={sidebarClass}>
        {sidebarItem}
      </button>
    )
  }
}
