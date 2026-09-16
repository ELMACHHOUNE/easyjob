import { createContext, useContext, useState } from 'react'

const SidebarContext = createContext(null)

export function SidebarProvider({ children }) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  const toggleCollapse = () => setCollapsed(c => !c)
  const toggleMobile = () => setMobileOpen(m => !m)
  const closeMobile = () => setMobileOpen(false)

  return (
    <SidebarContext.Provider value={{ collapsed, mobileOpen, toggleCollapse, toggleMobile, closeMobile }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
