import { useState, useRef, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell, CheckCircle, Mail, Briefcase, Scissors, Clock,
  Inbox, ChevronRight, Loader2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import {
  useNotifications,
  useUnreadNotificationCount,
} from '@/api/hooks'

const typeConfig = {
  nouvelle_offre: { icon: Briefcase, color: 'text-primary-500', bg: 'bg-primary-500/10' },
  candidature: { icon: CheckCircle, color: 'text-secondary-500', bg: 'bg-secondary-500/10' },
  email: { icon: Mail, color: 'text-purple-500', bg: 'bg-purple-500/10' },
  scrapping: { icon: Scissors, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  rappel: { icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
}

export default function NotificationDropdown() {
  const [open, setOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5)
  const ref = useRef(null)
  const navigate = useNavigate()

  const { data: unreadData } = useUnreadNotificationCount()
  const unreadCount = unreadData ?? 0

  const { data, isLoading } = useNotifications({ limit: 20 })

  const notifications = data?.notifications ?? []

  const visibleNotifications = notifications.slice(0, visibleCount)
  const hasMore = notifications.length > visibleCount

  const handleClickOutside = useCallback((e) => {
    if (ref.current && !ref.current.contains(e.target)) setOpen(false)
  }, [])

  useEffect(() => {
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, handleClickOutside])

  const handleClickNotification = (id, e) => {
    e.stopPropagation()
    setOpen(false)
    navigate(`/notifications?id=${id}`)
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 transition"
      >
        <Bell className="w-5 h-5 text-surface-600 dark:text-surface-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-danger-500 text-white text-[10px] font-bold px-1 leading-none">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-surface-100 dark:border-surface-700">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-surface-900 dark:text-white">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-primary-500 text-white text-[10px] font-bold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <Link
                to="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs font-medium text-primary-500 hover:text-primary-600 transition"
              >
                Voir tout
              </Link>
            </div>

            {/* List */}
            <div className="overflow-y-auto max-h-[340px] divide-y divide-surface-100 dark:divide-surface-700">
              {isLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
                </div>
              ) : visibleNotifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 px-4">
                  <div className="p-3 bg-surface-100 dark:bg-surface-800 rounded-xl mb-3">
                    <Inbox size={24} className="text-surface-400 dark:text-surface-500" />
                  </div>
                  <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Aucune notification</p>
                  <p className="text-xs text-surface-400 dark:text-surface-500 mt-0.5">Vous êtes à jour !</p>
                </div>
              ) : (
                visibleNotifications.map((notif) => {
                  const config = typeConfig[notif.type] || typeConfig.email
                  const Icon = config.icon
                  const timeAgo = formatDistanceToNow(new Date(notif.createdAt), {
                    addSuffix: true,
                    locale: fr,
                  })

                  return (
                    <div
                      key={notif._id}
                      onClick={(e) => handleClickNotification(notif._id, e)}
                      className={`flex items-start gap-3 px-5 py-3.5 cursor-pointer transition-colors hover:bg-surface-50 dark:hover:bg-surface-800 ${
                        !notif.isRead ? 'bg-primary-500/[0.03]' : ''
                      }`}
                    >
                      <div className={`flex-shrink-0 p-2 rounded-lg ${config.bg}`}>
                        <Icon size={16} className={config.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className={`text-sm truncate ${
                            !notif.isRead ? 'font-semibold text-surface-900 dark:text-white' : 'font-medium text-surface-700 dark:text-surface-300'
                          }`}>
                            {notif.title}
                          </p>
                          {!notif.isRead && (
                            <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary-500 rounded-full" />
                          )}
                        </div>
                        <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5 line-clamp-1">
                          {notif.message}
                        </p>
                        <p className="text-[11px] text-surface-400 dark:text-surface-500 mt-1">
                          {timeAgo}
                        </p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Footer */}
            {hasMore && (
              <div className="border-t border-surface-100 dark:border-surface-700">
                <button
                  onClick={() => setVisibleCount((c) => c + 5)}
                  className="w-full flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-medium text-primary-500 hover:bg-primary-500/5 transition"
                >
                  Voir plus
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
            {!hasMore && visibleNotifications.length > 0 && (
              <div className="border-t border-surface-100 dark:border-surface-700">
                <Link
                  to="/notifications"
                  onClick={() => setOpen(false)}
                  className="flex items-center justify-center gap-1.5 px-5 py-3 text-xs font-medium text-surface-400 dark:text-surface-500 hover:text-primary-500 transition"
                >
                  Voir toutes les notifications
                  <ChevronRight size={14} />
                </Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
