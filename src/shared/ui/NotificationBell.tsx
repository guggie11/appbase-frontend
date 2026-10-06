import { useRef, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell, Info, AlertTriangle, AlertCircle, CheckCircle } from 'lucide-react'
import { useUnreadCount, useNotifications, useMarkRead, useMarkAllRead } from '@/features/notifications/queries'
import type { Notification } from '@/shared/api/types'

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const diff = now - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return new Date(dateStr).toLocaleDateString()
}

function NotifIcon({ type }: { type: Notification['type'] }) {
  const size = 16
  if (type === 'info') return <Info size={size} style={{ color: '#3B82F6', flexShrink: 0 }} />
  if (type === 'warning') return <AlertTriangle size={size} style={{ color: '#F59E0B', flexShrink: 0 }} />
  if (type === 'error') return <AlertCircle size={size} style={{ color: '#EF4444', flexShrink: 0 }} />
  return <CheckCircle size={size} style={{ color: '#10B981', flexShrink: 0 }} />
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const navigate = useNavigate()

  const { data: unreadData, isLoading: countLoading } = useUnreadCount()
  const { data: notifications, isLoading: notifLoading } = useNotifications({ unread: false, page: 1, per_page: 10 })
  const markRead = useMarkRead()
  const markAllRead = useMarkAllRead()

  const count = unreadData?.count ?? 0
  const badgeLabel = count > 99 ? '99+' : String(count)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  function handleItemClick(n: Notification) {
    markRead.mutate(n.id)
    setOpen(false)
    if (n.link) navigate(n.link)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((v) => !v)}
        style={{
          position: 'relative',
          width: 36,
          height: 36,
          borderRadius: '50%',
          background: '#F3F4F6',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#6B7280',
          transition: 'background 150ms',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#E5E7EB' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6' }}
        title="Notifications"
      >
        <Bell size={16} />
        {/* Badge */}
        {!countLoading && count > 0 && (
          <span
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              background: 'var(--color-primary)',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              borderRadius: 9999,
              minWidth: 18,
              height: 18,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
              lineHeight: 1,
              transform: 'translate(4px, -4px)',
            }}
          >
            {badgeLabel}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div
          style={{
            position: 'absolute',
            right: 0,
            top: 'calc(100% + 8px)',
            zIndex: 50,
            width: 360,
            background: '#FFFFFF',
            border: '1px solid #E5E7EB',
            borderRadius: 8,
            boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
          }}
        >
          {/* Header */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 16px',
              borderBottom: '1px solid #E5E7EB',
            }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>Notifications</span>
            <button
              onClick={() => markAllRead.mutate()}
              style={{
                fontSize: 12,
                color: 'var(--color-primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                fontWeight: 500,
              }}
            >
              Mark all read
            </button>
          </div>

          {/* List */}
          <div style={{ maxHeight: 400, overflowY: 'auto' }}>
            {notifLoading ? (
              // Skeleton
              Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                  }}
                >
                  <div style={{ width: 16, height: 16, background: '#E5E7EB', borderRadius: '50%', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ height: 12, background: '#E5E7EB', borderRadius: 4, marginBottom: 6, width: '60%' }} />
                    <div style={{ height: 10, background: '#F3F4F6', borderRadius: 4, width: '90%' }} />
                  </div>
                </div>
              ))
            ) : !notifications || notifications.length === 0 ? (
              // Empty state
              <div
                style={{
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                  color: '#9CA3AF',
                }}
              >
                <Bell size={32} style={{ color: '#D1D5DB' }} />
                <span style={{ fontSize: 13 }}>No notifications</span>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  onClick={() => handleItemClick(n)}
                  style={{
                    padding: '12px 16px',
                    borderBottom: '1px solid #F3F4F6',
                    display: 'flex',
                    gap: 10,
                    alignItems: 'flex-start',
                    background: n.is_read ? '#FFFFFF' : 'var(--color-primary-light)',
                    cursor: 'pointer',
                    transition: 'background 150ms',
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F9FAFB' }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = n.is_read ? '#FFFFFF' : 'var(--color-primary-light)' }}
                >
                  <NotifIcon type={n.type} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: n.is_read ? 400 : 600,
                        color: '#1A1A1A',
                        marginBottom: 2,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {n.title}
                    </div>
                    <div
                      style={{
                        fontSize: 12,
                        color: '#6B7280',
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {n.message}
                    </div>
                    <div style={{ fontSize: 11, color: '#9CA3AF', marginTop: 4 }}>
                      {relativeTime(n.created_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
