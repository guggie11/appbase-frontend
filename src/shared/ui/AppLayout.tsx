import { useLocation } from 'react-router-dom'
import { Bell, Search } from 'lucide-react'
import { Sidebar } from './Sidebar'
import { useAuthStore } from '@/features/auth/store'
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
  const title = getPageTitle(location.pathname)
  const userDetail = user as unknown as UserDetail | null

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F5F5F5' }}>
      {/* Sidebar */}
      <div style={{ flexShrink: 0 }}>
        <Sidebar />
      </div>

      {/* Main area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>
        {/* Topbar */}
        <header
          style={{
            height: 64,
            background: '#FFFFFF',
            borderBottom: '1px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            padding: '0 24px',
            gap: 16,
            flexShrink: 0,
          }}
        >
          {/* Page title / breadcrumb */}
          <div style={{ flex: '0 0 auto' }}>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', margin: 0 }}>{title}</h1>
          </div>

          {/* Search bar */}
          <div style={{ flex: 1, display: 'flex', justifyContent: 'center' }}>
            <div
              style={{
                position: 'relative',
                width: 300,
              }}
            >
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                }}
              />
              <input
                placeholder="Search…"
                style={{
                  width: '100%',
                  background: '#F3F4F6',
                  border: '1px solid transparent',
                  borderRadius: 9999,
                  padding: '8px 16px 8px 34px',
                  fontSize: 13,
                  color: '#1A1A1A',
                  outline: 'none',
                  transition: 'border-color 150ms',
                }}
                onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = '#D94F3D' }}
                onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = 'transparent' }}
              />
              <span
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  fontSize: 10,
                  color: '#9CA3AF',
                  fontWeight: 600,
                  border: '1px solid #E5E7EB',
                  borderRadius: 4,
                  padding: '1px 5px',
                }}
              >
                ⌘K
              </span>
            </div>
          </div>

          {/* Right actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <button
              style={{
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
            </button>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: '#D94F3D',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: 13,
                fontWeight: 700,
                cursor: 'pointer',
                overflow: 'hidden',
              }}
              title={user?.name ?? 'Profile'}
            >
              {userDetail?.avatar
                ? <img src={userDetail.avatar} style={{ width: 36, height: 36, objectFit: 'cover', borderRadius: '50%' }} alt="" />
                : initials}
            </div>
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 24,
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
