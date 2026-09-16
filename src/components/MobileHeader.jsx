import { Menu, Bell } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useSidebar } from '@/context/SidebarContext'
import { useUnreadNotificationCount } from '@/api/hooks'
import Logo from '@/components/Logo'

export default function MobileHeader() {
  const { toggleMobile } = useSidebar()
  const { data: unreadCount } = useUnreadNotificationCount()
  const hasUnread = unreadCount > 0

  return (
    <header className="lg:hidden sticky top-0 z-30 flex h-14 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm">
      <button
        onClick={toggleMobile}
        className="flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
        aria-label="Ouvrir le menu"
      >
        <Menu className="size-5 text-foreground" />
      </button>

      <Link to="/" aria-label="Accueil">
        <Logo className="h-5 w-auto" />
      </Link>

      <Link
        to="/notifications"
        className="relative flex size-9 items-center justify-center rounded-full transition-colors hover:bg-muted"
        aria-label="Notifications"
      >
        <Bell className="size-4" />
        {hasUnread && (
          <span className="absolute right-1.5 top-1.5 flex size-2 items-center rounded-full bg-destructive">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-destructive opacity-75" />
            <span className="relative inline-flex size-2 rounded-full bg-destructive" />
          </span>
        )}
      </Link>
    </header>
  )
}