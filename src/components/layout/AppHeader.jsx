import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import { useUnreadNotificationCount } from '@/api/hooks'
import {
  Bell, Sun, Moon, Search, User, LogOut, LayoutDashboard,
  Briefcase, Send, FileText, Users, Network, Bookmark, BarChart3,
  Building2, ClipboardList, UserCheck, SearchCode,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command'
import { motion } from 'framer-motion'

const candidateNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: Briefcase, label: 'Offres d\'emploi', path: '/jobs' },
  { icon: Bookmark, label: 'Offres sauvegardées', path: '/jobs/saved' },
  { icon: Send, label: 'Candidatures', path: '/applications' },
  { icon: Users, label: 'Explorateur Recruteurs', path: '/recruiters' },
  { icon: Network, label: 'Réseau', path: '/network' },
  { icon: FileText, label: 'Templates Emails', path: '/applications/templates' },
  { icon: SearchCode, label: 'Profils de Recherche', path: '/profile/search-preferences' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: Building2, label: 'Annuaire Entreprises', path: '/company-emails' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
]

const recruiterNav = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/recruiter-space/dashboard' },
  { icon: Briefcase, label: 'Mes Offres', path: '/recruiter-space/jobs' },
  { icon: UserCheck, label: 'Candidats', path: '/recruiter-space/candidates' },
  { icon: ClipboardList, label: 'Candidatures', path: '/recruiter-space/applications' },
  { icon: Building2, label: 'Profil Entreprise', path: '/recruiter-space/profile' },
  { icon: Bell, label: 'Notifications', path: '/notifications' },
]

const breadcrumbMap = {
  '/dashboard': [{ label: 'Tableau de bord' }],
  '/jobs': [{ label: 'Offres d\'emploi' }],
  '/jobs/saved': [{ label: 'Offres d\'emploi', path: '/jobs' }, { label: 'Sauvegardées' }],
  '/applications': [{ label: 'Candidatures' }],
  '/applications/templates': [{ label: 'Candidatures', path: '/applications' }, { label: 'Templates' }],
  '/applications/internal': [{ label: 'Candidatures', path: '/applications' }, { label: 'Internes' }],
  '/recruiters': [{ label: 'Explorateur Recruteurs' }],
  '/network': [{ label: 'Réseau' }],
  '/profile': [{ label: 'Profil' }],
  '/profile/cv': [{ label: 'Profil', path: '/profile' }, { label: 'CV' }],
  '/profile/portfolio': [{ label: 'Profil', path: '/profile' }, { label: 'Portfolio' }],
  '/profile/search-preferences': [{ label: 'Profil', path: '/profile' }, { label: 'Profils de recherche' }],
  '/analytics': [{ label: 'Analytics' }],
  '/notifications': [{ label: 'Notifications' }],
  '/messages': [{ label: 'Messages' }],
  '/company-emails': [{ label: 'Annuaire Entreprises' }],
  '/recruiter-space/dashboard': [{ label: 'Tableau de bord' }],
  '/recruiter-space/jobs': [{ label: 'Offres' }],
  '/recruiter-space/candidates': [{ label: 'Candidats' }],
  '/recruiter-space/applications': [{ label: 'Candidatures' }],
  '/recruiter-space/profile': [{ label: 'Profil Entreprise' }],
}

function Breadcrumbs() {
  const location = useLocation()
  const segments = location.pathname.split('/').filter(Boolean)
  const items = []
  const mapped = breadcrumbMap[location.pathname]
  if (mapped) {
    items.push(...mapped)
  } else if (segments.length) {
    const label = segments[segments.length - 1]
      .replace(/-/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
    items.push({ label })
  }
  return (
    <nav className="hidden md:flex items-center gap-1 text-sm text-muted-foreground">
      <Link to="/" className="transition-colors hover:text-foreground">Accueil</Link>
      {items.map((item, i) => (
        <span key={i} className="flex items-center gap-1">
          <span aria-hidden>/</span>
          {item.path ? (
            <Link to={item.path} className="transition-colors hover:text-foreground">{item.label}</Link>
          ) : (
            <span className="font-medium text-foreground">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  )
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'
  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="size-9 rounded-full"
      aria-label={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
    >
      <motion.div
        key={theme}
        initial={{ rotate: -30, scale: 0.8, opacity: 0 }}
        animate={{ rotate: 0, scale: 1, opacity: 1 }}
        transition={{ duration: 0.25 }}
        className="flex items-center justify-center"
      >
        {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </motion.div>
    </Button>
  )
}

function NotificationBell() {
  const { data: unreadCount } = useUnreadNotificationCount()
  const hasUnread = unreadCount > 0
  return (
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
  )
}

function HeaderUserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const isRecruiter = user?.role === 'recruiter'
  const initials = user
    ? (user.firstName?.[0] ?? '') + (user.lastName?.[0] ?? '') || user.email?.[0]?.toUpperCase()
    : ''
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary transition-colors hover:bg-primary/20">
          {user?.avatar ? (
            <img src={user.avatar} alt="" className="size-full rounded-full object-cover" />
          ) : (
            initials
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => navigate(isRecruiter ? '/recruiter-space/profile' : '/profile')}>
          <User className="mr-2 size-4" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => { logout(); navigate('/') }} className="text-destructive focus:text-destructive">
          <LogOut className="mr-2 size-4" />
          Déconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CommandMenu({ open, setOpen }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isRecruiter = user?.role === 'recruiter'
  const items = isRecruiter ? recruiterNav : candidateNav

  useEffect(() => {
    const down = (e) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || e.key === 'Meta') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [setOpen])

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Rechercher une page..." />
      <CommandList>
        <CommandEmpty>Aucun résultat.</CommandEmpty>
        <CommandGroup heading="Navigation">
          {items.map((item) => (
            <CommandItem
              key={item.path}
              value={item.label}
              onSelect={() => { navigate(item.path); setOpen(false) }}
            >
              <item.icon className="mr-2 size-4" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  )
}

export default function AppHeader() {
  const [cmdOpen, setCmdOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-30 hidden h-16 items-center gap-4 border-b bg-background/80 px-6 backdrop-blur-sm lg:flex">
        <div className="flex-1">
          <Breadcrumbs />
        </div>

        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-9 w-64 rounded-full px-3 text-muted-foreground xl:w-80"
            onClick={() => setCmdOpen(true)}
          >
            <Search className="mr-2 size-4" />
            <span className="flex-1 text-left text-xs">Rechercher...</span>
            <kbd className="pointer-events-none flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-60">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          <ThemeToggle />
          <NotificationBell />
          <Separator orientation="vertical" className="h-6" />
          <HeaderUserMenu />
        </div>
      </header>

      <CommandMenu open={cmdOpen} setOpen={setCmdOpen} />
    </>
  )
}