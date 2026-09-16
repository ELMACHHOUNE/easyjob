import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useSidebar } from '@/context/SidebarContext'
import { useTheme } from '@/context/ThemeContext'
import {
  LayoutDashboard, Briefcase, Send, FileText, Users, Network,
  Bookmark, Search, BarChart3, Bell, MessageSquare, LogOut, User,
  Building2, ClipboardList, UserCheck, PanelLeftClose, PanelLeftOpen, Sun, Moon,
} from 'lucide-react'
import { useUnreadNotificationCount } from '@/api/hooks'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Sheet, SheetContent } from '@/components/ui/sheet'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

const candidateGroups = [
  {
    label: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Briefcase, label: 'Offres d\'emploi', path: '/jobs' },
      { icon: Bookmark, label: 'Offres sauvegardées', path: '/jobs/saved' },
      { icon: Send, label: 'Candidatures', path: '/applications' },
      { icon: Users, label: 'Explorateur Recruteurs', path: '/recruiters' },
      { icon: Network, label: 'Réseau', path: '/network' },
    ],
  },
  {
    label: 'Outils',
    items: [
      { icon: FileText, label: 'Templates Emails', path: '/applications/templates' },
      { icon: Search, label: 'Profils de Recherche', path: '/profile/search-preferences' },
      { icon: BarChart3, label: 'Analytics', path: '/analytics' },
      { icon: Building2, label: 'Annuaire Entreprises', path: '/company-emails' },
    ],
  },
  {
    label: 'Autre',
    items: [
      { icon: MessageSquare, label: 'Messages', path: '/messages' },
      { icon: Bell, label: 'Notifications', path: '/notifications', badge: true },
      { icon: User, label: 'Profil', path: '/profile' },
    ],
  },
]

const recruiterGroups = [
  {
    label: 'Principal',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/recruiter-space/dashboard' },
      { icon: Briefcase, label: 'Mes Offres', path: '/recruiter-space/jobs' },
      { icon: UserCheck, label: 'Candidats', path: '/recruiter-space/candidates' },
      { icon: ClipboardList, label: 'Candidatures', path: '/recruiter-space/applications' },
      { icon: Building2, label: 'Profil Entreprise', path: '/recruiter-space/profile' },
      { icon: Bell, label: 'Notifications', path: '/notifications', badge: true },
    ],
  },
]

function SidebarNav({ collapsed, onNav }) {
  const { user } = useAuth()
  const { data: unreadCount } = useUnreadNotificationCount()
  const isRecruiter = user?.role === 'recruiter'
  const groups = isRecruiter ? recruiterGroups : candidateGroups

  return (
    <nav className="space-y-6 px-2">
      {groups.map(group => (
        <div key={group.label}>
          {!collapsed && (
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {group.label}
            </p>
          )}
          <div className="space-y-0.5">
            {group.items.map(item => {
              const showBadge = item.badge && unreadCount > 0
              return (
                <Tooltip key={item.path} delayDuration={0}>
                  <TooltipTrigger asChild>
                    <NavLink
                      to={item.path}
                      onClick={onNav}
                      className={({ isActive }) =>
                        cn(
                          'group relative flex items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium transition-colors',
                          isActive
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                          collapsed && 'justify-center px-2',
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && (
                            <span className="absolute left-0 top-1/2 h-4/5 w-0.5 -translate-y-1/2 rounded-r bg-primary" />
                          )}
                          <div className="relative flex shrink-0 items-center justify-center">
                            <item.icon className="size-4" />
                            {showBadge && (
                              <span className="absolute -right-1.5 -top-1.5 flex size-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                                {unreadCount > 99 ? '99' : ''}
                              </span>
                            )}
                          </div>
                          {!collapsed && <span className="truncate">{item.label}</span>}
                          {collapsed && showBadge && (
                            <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-destructive" />
                          )}
                        </>
                      )}
                    </NavLink>
                  </TooltipTrigger>
                  {collapsed && (
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  )}
                </Tooltip>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

function UserMenu({ collapsed }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isRecruiter = user?.role === 'recruiter'
  const initials = user
    ? (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '') || user.email?.[0]?.toUpperCase()
    : ''

  const handleLogout = () => { logout(); navigate('/') }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-3 rounded-md p-1.5 text-left transition-colors hover:bg-muted/60">
          <Avatar className="size-8">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="size-full rounded-full object-cover" />
            ) : (
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{user?.firstName} {user?.lastName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent side="top" align="start" className="w-56">
        <DropdownMenuItem onClick={() => navigate(isRecruiter ? '/recruiter-space/profile' : '/profile')}>
          <User className="mr-2 size-4" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function InnerSidebar({ collapsed, onToggle, onNav }) {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex h-full flex-col bg-card">
        <div className={cn('flex items-center border-b border-border pt-4 pb-3', collapsed ? 'flex-col gap-3' : 'justify-between gap-2 px-4')}>
          <div className={cn('flex items-center', collapsed ? 'flex-col gap-2' : 'gap-3')}>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
              <Briefcase className="size-5" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="truncate text-base font-semibold leading-tight tracking-tight">
                  JobConnect AI
                </p>
                <p className="mt-0.5 truncate text-[11px] leading-none text-muted-foreground">
                  Assistant emploi
                </p>
              </div>
            )}
          </div>
          {!collapsed ? (
            <button
              onClick={onToggle}
              className="hidden size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground lg:flex"
              title="Réduire le menu"
            >
              <PanelLeftClose className="size-4" />
            </button>
          ) : (
            <button
              onClick={onToggle}
              className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
              title="Étendre le menu"
            >
              <PanelLeftOpen className="size-4" />
            </button>
          )}
        </div>

        <ScrollArea className="flex-1 py-3">
          <SidebarNav collapsed={collapsed} onNav={onNav} />
        </ScrollArea>

        <div className="space-y-1 border-t border-border p-2">
          <button
            onClick={toggleTheme}
            className={cn(
              'flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground',
              collapsed && 'justify-center px-2',
            )}
            title={collapsed ? (isDark ? 'Mode sombre' : 'Mode clair') : undefined}
          >
            {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
            {!collapsed && (isDark ? 'Mode sombre' : 'Mode clair')}
          </button>

          <button
            onClick={onToggle}
            className="hidden w-full items-center gap-3 rounded-md px-2.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground lg:flex"
          >
            {collapsed ? <PanelLeftOpen className="size-4" /> : <PanelLeftClose className="size-4" />}
            {!collapsed && <span>Réduire</span>}
          </button>

          <UserMenu collapsed={collapsed} />
        </div>
      </div>
    </TooltipProvider>
  )
}

export default function AppSidebar() {
  const { collapsed, toggleCollapse, mobileOpen, closeMobile } = useSidebar()

  return (
    <>
      <aside
        className="hidden lg:flex fixed inset-y-0 left-0 z-40 flex-col border-r bg-card transition-[width] duration-200 ease-in-out"
        style={{ width: collapsed ? 72 : 260 }}
      >
        <InnerSidebar collapsed={collapsed} onToggle={toggleCollapse} />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={(open) => (open ? null : closeMobile())}>
        <SheetContent side="left" className="w-72 p-0" showClose={false}>
          <InnerSidebar collapsed={false} onNav={closeMobile} />
        </SheetContent>
      </Sheet>
    </>
  )
}