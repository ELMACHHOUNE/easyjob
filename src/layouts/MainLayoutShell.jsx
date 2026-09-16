import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { SidebarProvider, useSidebar } from '@/context/SidebarContext'
import AppSidebar from '@/components/layout/AppSidebar'
import AppHeader from '@/components/layout/AppHeader'
import MobileHeader from '@/components/MobileHeader'

function Layout() {
  const { collapsed } = useSidebar()
  const location = useLocation()

  return (
    <div className="flex min-h-screen w-full overflow-x-clip bg-background text-foreground">
      <AppSidebar />
      <div
        className="flex min-w-0 flex-1 flex-col transition-[margin-left] duration-200 ease-in-out lg:ml-[var(--w)]"
        style={{ '--w': collapsed ? '72px' : '260px' }}
      >
        <MobileHeader />
        <AppHeader />
        <main className="min-w-0 flex-1 overflow-x-clip p-4 md:p-6 lg:p-8">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}

export default function MainLayoutShell() {
  return (
    <SidebarProvider>
      <Layout />
    </SidebarProvider>
  )
}