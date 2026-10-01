import { useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { NotificationBell } from './NotificationBell'
import { useAuthStore } from '@/features/auth/store'
import { useThemeStore } from '@/shared/config/theme'
import type { UserDetail } from '@/shared/api/types'

interface AppLayoutProps {
  children: React.ReactNode
}

function getPageTitle(pathname: string): string {
  const map: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/users': 'Users',
    '/roles': 'Roles & Permissions',
    '/menus': 'Menu Management',
    '/audit-logs': 'Audit Log',
    '/settings': 'App Settings',
    '/profile': 'Profile',
  }
  for (const [path, title] of Object.entries(map)) {
    if (pathname.startsWith(path)) return title
  }
  return 'Appbase'
}

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation()
  const user = useAuthStore((s) => s.user)
  const { appName } = useThemeStore()
  const title = getPageTitle(location.pathname)
  const userDetail = user as unknown as UserDetail | null

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#e9eaea' }}>
      {/* Sidebar */}
      <div style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header
          style={{
            background: '#e9eaea',
            borderBottom: '1px solid #dcdddd',
            display: 'flex',
            alignItems: 'center',
            padding: '20px 28px',
            gap: 20,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            zIndex: 2,
          }}
        >
          {/* Breadcrumb / title */}
          <div style={{ flex: '0 0 auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: '#8a8c8e', fontFamily: "'Geist', Helvetica, Arial, sans-serif" }}>
              {appName}
            </span>
            <span style={{ fontSize: 13, color: '#8a8c8e' }}>/</span>
            <span style={{ fontSize: 13, color: '#1b1c1e', fontWeight: 500, fontFamily: "'Geist', Helvetica, Arial, sans-serif" }}>
              {title}
            </span>
          </div>

          {/* Search bar — centered */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                width: '100%',
                maxWidth: 520,
                background: '#fff',
                border: '1px solid #e2e3e3',
                borderRadius: 14,
                padding: '11px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <Search size={14} style={{ color: '#a3a5a7', flexShrink: 0 }} />
              <input
                placeholder="Search..."
                style={{
                  flex: 1,
                  border: 'none',
                  outline: 'none',
                  fontSize: 11,
                  fontFamily: "'Geist Mono', monospace",
                  color: '#1b1c1e',
                  background: 'transparent',
                }}
                onFocus={(e) => {
                  const parent = (e.target as HTMLInputElement).closest('div') as HTMLElement
                  if (parent) parent.style.borderColor = 'var(--color-primary)'
                }}
                onBlur={(e) => {
                  const parent = (e.target as HTMLInputElement).closest('div') as HTMLElement
                  if (parent) parent.style.borderColor = '#e2e3e3'
                }}
              />
              <span
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 11,
                  color: '#a3a5a7',
                  marginLeft: 'auto',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                }}
              >
                ⌘K
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginLeft: 'auto', flexShrink: 0 }}>
            {/* Notification bell */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#fff',
                border: '1px solid #e2e3e3',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <NotificationBell />
            </div>

            {/* Avatar */}
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: '50%',
                background: '#dcdddd',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#4a4c4e',
                fontSize: 13,
                fontWeight: 600,
                cursor: 'pointer',
                overflow: 'hidden',
                flexShrink: 0,
              }}
              title={user?.name ?? 'Profile'}
            >
              {userDetail?.avatar
                ? <img src={userDetail.avatar} style={{ width: 38, height: 38, objectFit: 'cover', borderRadius: '50%' }} alt="" />
                : initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '32px 28px',
          }}
        >
          <div style={{ maxWidth: 1400, margin: '0 auto' }}>
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
