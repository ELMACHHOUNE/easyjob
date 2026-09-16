import { useState, useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle, Mail, Briefcase, Scissors, Clock,
  CheckCheck, Inbox, AlertTriangle, Loader2
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/api/hooks';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const filters = ['Toutes', 'Non lues', 'Offres', 'Candidatures', 'Rappels'];

const typeConfig = {
  nouvelle_offre: {
    icon: Briefcase,
    color: 'text-primary',
    bg: 'bg-primary/10'
  },
  candidature: {
    icon: CheckCircle,
    color: 'text-accent',
    bg: 'bg-accent/10'
  },
  email: {
    icon: Mail,
    color: 'text-purple-500',
    bg: 'bg-purple-500/10'
  },
  scrapping: {
    icon: Scissors,
    color: 'text-orange-500',
    bg: 'bg-orange-500/10'
  },
  rappel: {
    icon: Clock,
    color: 'text-yellow-500',
    bg: 'bg-yellow-500/10'
  }
};

const filterToApiType = {
  'Non lues': { unreadOnly: 'true' },
  'Offres': { type: 'nouvelle_offre' },
  'Candidatures': { type: 'candidature' },
  'Rappels': { type: 'rappel' },
};

const fadeIn = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 }
};

const listItem = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 16 }
};

const container = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

function NotificationSkeleton() {
  return (
    <div className="space-y-0">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="flex items-start gap-4 p-4 sm:p-5 border-b border-border last:border-0">
          <div className="h-10 w-10 animate-pulse rounded-lg bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-48 animate-pulse rounded bg-muted" />
            <div className="h-3 w-64 animate-pulse rounded bg-muted" />
            <div className="h-3 w-20 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function NotificationsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeFilter, setActiveFilter] = useState('Toutes');
  const [page, setPage] = useState(1);
  const [highlightedId, setHighlightedId] = useState(null);
  const highlightTimeoutRef = useRef(null);

  const apiFilters = useMemo(() => {
    const filters = { page, limit: 20 };
    const extra = filterToApiType[activeFilter];
    if (extra) Object.assign(filters, extra);
    return filters;
  }, [activeFilter, page]);

  const { data, isLoading, error, refetch } = useNotifications(apiFilters);
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();

  const notifications = data?.notifications ?? [];
  const unreadCount = data?.unreadCount ?? 0;

  const highlightId = searchParams.get('id');

  useEffect(() => {
    if (highlightId && notifications.length > 0) {
      setHighlightedId(highlightId);
      const timer = setTimeout(() => {
        const el = document.getElementById(`notif-${highlightId}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      highlightTimeoutRef.current = setTimeout(() => {
        setHighlightedId(null);
        searchParams.delete('id');
        setSearchParams(searchParams, { replace: true });
      }, 3000);
      return () => {
        clearTimeout(timer);
        clearTimeout(highlightTimeoutRef.current);
      };
    }
  }, [highlightId, notifications.length, searchParams, setSearchParams]);

  const markAsRead = (id) => {
    markRead.mutate(id);
  };

  const markAllAsRead = () => {
    markAllRead.mutate();
  };

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/10 py-12">
          <AlertTriangle className="mb-3 h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-destructive">{error?.message || 'Une erreur est survenue.'}</p>
          <Button onClick={() => refetch()} variant="destructive" className="mt-4 px-4 py-2 text-sm font-semibold">
            Réessayer
          </Button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={fadeIn} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
          {unreadCount > 0 && (
            <Badge
              variant="default"
              className="px-2.5 py-0.5 text-xs font-medium rounded-full"
            >
              {unreadCount}
            </Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            onClick={markAllAsRead}
            disabled={markAllRead.isPending}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 disabled:opacity-60"
          >
            {markAllRead.isPending ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <CheckCheck size={16} />
            )}
            Tout marquer comme lu
          </Button>
        )}
      </motion.div>

      <motion.div variants={fadeIn} className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {filters.map(filter => (
          <Button
            key={filter}
            variant={activeFilter === filter ? "default" : "ghost"}
            onClick={() => { setActiveFilter(filter); setPage(1) }}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap transition-all ${
              activeFilter === filter
                ? 'bg-primary text-white shadow-[var(--shadow-md)]'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            {filter}
          </Button>
        ))}
      </motion.div>

      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
        {isLoading ? (
          <NotificationSkeleton />
        ) : (
          <AnimatePresence mode="popLayout">
            {notifications.length === 0 ? (
              <motion.div
                key="empty"
                variants={fadeIn}
                initial="hidden"
                animate="visible"
                exit="hidden"
                className="flex flex-col items-center justify-center py-16 px-6 text-center"
              >
                <div className="p-4 bg-muted rounded-xl mb-4">
                  <Inbox size={32} className="text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Aucune notification</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Vous n'avez rien dans cette catégorie pour le moment.
                </p>
              </motion.div>
            ) : (
              notifications.map((notification, index) => {
                const config = typeConfig[notification.type] || typeConfig.email;
                const Icon = config.icon;
                const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
                  addSuffix: true,
                  locale: fr
                });

                return (
                  <motion.div
                    key={notification.id}
                    id={`notif-${notification._id || notification.id}`}
                    variants={listItem}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.03 }}
                    onClick={() => markAsRead(notification.id)}
                    className={`flex items-start gap-4 p-4 sm:p-5 border-b border-border last:border-0 cursor-pointer transition-all duration-500 hover:bg-muted ${
                      highlightedId === (notification._id || notification.id)
                        ? 'bg-primary/[0.08] ring-2 ring-ring/40 shadow-lg shadow-primary/10'
                        : !notification.read ? 'bg-primary/[0.03]' : ''
                    }`}
                  >
                    <div className={`flex-shrink-0 p-2.5 rounded-lg ${config.bg}`}>
                      <Icon size={20} className={config.color} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm text-foreground truncate ${
                          !notification.read ? 'font-semibold' : 'font-medium'
                        }`}>
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <span className="flex-shrink-0 w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1.5">
                        {timeAgo}
                      </p>
                    </div>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
}