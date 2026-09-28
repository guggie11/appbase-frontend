import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronRight,
  ChevronLeft,
  Circle,
  LayoutDashboard,
  Users,
  Shield,
  Menu as MenuIcon,
  ClipboardList,
  Settings,
  User,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMyMenu } from '@/features/menus/queries'
import { useAuthStore } from '@/features/auth/store'
import type { MenuTree, UserDetail } from '@/shared/api/types'

// ── Helpers ────────────────────────────────────────────────────────────────

const SIDEBAR_KEY = 'sidebar_collapsed'

function getLucideIcon(name: string | null): LucideIcon {
  if (!name) return Circle
  const pascal = name
    .split(/[-_\s]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  const icon = (LucideIcons as unknown as Record<string, LucideIcon>)[pascal]
  return icon ?? Circle
}

// ── Skeleton ───────────────────────────────────────────────────────────────

function MenuSkeleton() {
  return (
    <div className="space-y-1 px-3 pt-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-10 rounded-md animate-pulse"
          style={{ background: '#F3F4F6', animationDelay: `${i * 80}ms` }}
        />
      ))}
    </div>
  )
}

// ── Nav Item ───────────────────────────────────────────────────────────────

interface NavItemProps {
  item: MenuTree
  collapsed: boolean
  depth?: number
}

function NavItem({ item, collapsed, depth = 0 }: NavItemProps) {
  const location = useLocation()
  const [open, setOpen] = useState(false)

  const Icon = getLucideIcon(item.icon)
  const hasChildren = item.children && item.children.length > 0
  const isActive =
    item.path !== null && location.pathname.startsWith(item.path)
  const isChildActive =
    hasChildren &&
    item.children.some(
      (c) => c.path !== null && location.pathname.startsWith(c.path),
    )

  useEffect(() => {
    if (isChildActive) setOpen(true)
  }, [isChildActive])

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    height: 44,
    padding: '0 16px',
    paddingLeft: depth > 0 ? 28 : 16,
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background 150ms',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textDecoration: 'none',
  }

  const activeStyle: React.CSSProperties = {
    ...baseStyle,
    background: '#F3F4F6',
    borderLeft: '3px solid #D94F3D',
    paddingLeft: depth > 0 ? 25 : 13,
    color: '#D94F3D',
  }

  const inactiveStyle: React.CSSProperties = {
    ...baseStyle,
    color: '#6B7280',
  }

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          title={collapsed ? item.label : undefined}
          style={isChildActive ? activeStyle : inactiveStyle}
          onMouseEnter={(e) => {
            if (!isChildActive) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'
          }}
          onMouseLeave={(e) => {
            if (!isChildActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <Icon size={16} className="shrink-0" />
          {!collapsed && (
            <>
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              <ChevronRight size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms' }} />
            </>
          )}
        </button>

        {open && !collapsed && (
          <div style={{ marginLeft: 8, borderLeft: '1px solid #E5E7EB', paddingLeft: 4 }}>
            {item.children.map((child) => (
              <NavItem
                key={child.id}
                item={child}
                collapsed={collapsed}
                depth={depth + 1}
              />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!item.path) return null

  return (
    <Link
      to={item.path}
      title={collapsed ? item.label : undefined}
      style={isActive ? activeStyle : inactiveStyle}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && (
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {item.label}
        </span>
      )}
    </Link>
  )
}

// ── Fallback static nav ────────────────────────────────────────────────────

const STATIC_NAV: MenuTree[] = [
  { id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard', parent_id: null, order_index: 0, is_active: true, roles: [], children: [] },
  { id: 'users', label: 'Users', icon: 'users', path: '/users', parent_id: null, order_index: 1, is_active: true, roles: [], children: [] },
  { id: 'roles', label: 'Roles & Permissions', icon: 'shield', path: '/roles', parent_id: null, order_index: 2, is_active: true, roles: [], children: [] },
  { id: 'menus', label: 'Menu Management', icon: 'menu', path: '/menus', parent_id: null, order_index: 3, is_active: true, roles: [], children: [] },
  { id: 'audit-logs', label: 'Audit Log', icon: 'clipboard-list', path: '/audit-logs', parent_id: null, order_index: 4, is_active: true, roles: [], children: [] },
  { id: 'settings', label: 'Settings', icon: 'settings', path: '/settings', parent_id: null, order_index: 5, is_active: true, roles: [], children: [] },
  { id: 'profile', label: 'Profile', icon: 'user', path: '/profile', parent_id: null, order_index: 6, is_active: true, roles: [], children: [] },
]

// Ensure lucide icons from static nav actually exist
void [LayoutDashboard, Users, Shield, MenuIcon, ClipboardList, Settings, User]

// ── Sidebar ────────────────────────────────────────────────────────────────

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      return localStorage.getItem(SIDEBAR_KEY) === 'true'
    } catch {
      return false
    }
  })

  const { data: menuTree, isLoading } = useMyMenu()
  const user = useAuthStore((s) => s.user)
  const userDetail = user as unknown as UserDetail | null

  function toggleCollapse() {
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next))
      } catch { /* noop */ }
      return next
    })
  }

  const nav = menuTree && menuTree.length > 0 ? menuTree : STATIC_NAV
  const width = collapsed ? 64 : 220

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    <aside
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        background: '#FFFFFF',
        borderRight: '1px solid #E5E7EB',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 300ms ease-in-out, min-width 300ms ease-in-out',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      {/* Logo area */}
      <div
        style={{
          padding: '0 16px',
          height: 64,
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          borderBottom: '1px solid #E5E7EB',
          flexShrink: 0,
          overflow: 'hidden',
        }}
      >
        {/* Red circle with "A" */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: '#D94F3D',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 700,
            fontSize: 16,
            flexShrink: 0,
          }}
        >
          A
        </div>
        {!collapsed && (
          <div style={{ overflow: 'hidden' }}>
            <div style={{ fontWeight: 700, fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#1A1A1A', whiteSpace: 'nowrap' }}>
              APPBASE
            </div>
            <div style={{ fontSize: 9, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#9CA3AF', whiteSpace: 'nowrap' }}>
              APP TEMPLATE
            </div>
          </div>
        )}
      </div>

      {/* New Feature CTA */}
      {!collapsed && (
        <div style={{ padding: '12px 12px 4px' }}>
          <button
            style={{
              width: '100%',
              padding: '8px 16px',
              background: '#D94F3D',
              color: 'white',
              fontWeight: 600,
              fontSize: 13,
              borderRadius: 6,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 6,
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#C0392B' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#D94F3D' }}
          >
            New Feature +
          </button>
        </div>
      )}

      {/* Navigation */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* Section label */}
        {!collapsed && (
          <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#9CA3AF', margin: '8px 0 4px 8px' }}>
            Navigation
          </div>
        )}
        {isLoading ? (
          <MenuSkeleton />
        ) : (
          nav.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} />
          ))
        )}
      </nav>

      {/* Bottom: User info + collapse toggle */}
      <div style={{ borderTop: '1px solid #E5E7EB', flexShrink: 0 }}>
        {/* User info */}
        {!collapsed && user && (
          <div style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid #F3F4F6' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: '#D94F3D',
                flexShrink: 0,
                overflow: 'hidden',
              }}
            >
              {userDetail?.avatar
                ? <img src={userDetail.avatar} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%' }} alt="" />
                : initials}
            </div>
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </div>
              <div style={{ fontSize: 11, color: '#9CA3AF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.email}
              </div>
            </div>
          </div>
        )}

        {/* Collapse toggle */}
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: '#9CA3AF',
            transition: 'color 150ms',
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#D94F3D' }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          {!collapsed && <span style={{ fontSize: 11, marginLeft: 4, color: '#9CA3AF' }}>Collapse</span>}
        </button>
      </div>
    </aside>
  )
}
