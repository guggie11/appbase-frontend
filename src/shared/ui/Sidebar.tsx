import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronRight,
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
import { useThemeStore } from '@/shared/config/theme'
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '4px 0' }}>
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          style={{
            height: 44,
            borderRadius: 14,
            background: 'rgba(0,0,0,0.06)',
            animationDelay: `${i * 80}ms`,
          }}
          className="animate-pulse"
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
    gap: 12,
    padding: '12px 10px',
    paddingLeft: depth > 0 ? 20 : 10,
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 400,
    cursor: 'pointer',
    transition: 'background 150ms',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textDecoration: 'none',
    color: '#4a4c4e',
    fontFamily: "'Geist', Helvetica, Arial, sans-serif",
    justifyContent: collapsed ? 'center' : 'flex-start',
  }

  const activeStyle: React.CSSProperties = {
    ...baseStyle,
    background: '#ffffff',
    color: '#1b1c1e',
    fontWeight: 600,
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  }

  const inactiveStyle: React.CSSProperties = {
    ...baseStyle,
    color: '#4a4c4e',
  }

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          title={collapsed ? item.label : undefined}
          style={isChildActive ? { ...inactiveStyle, background: '#ffffff', color: '#1b1c1e', fontWeight: 600, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' } : inactiveStyle}
          onMouseEnter={(e) => {
            if (!isChildActive) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'
          }}
          onMouseLeave={(e) => {
            if (!isChildActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
          }}
        >
          <Icon size={19} style={{ flexShrink: 0, color: isChildActive ? '#1b1c1e' : '#4a4c4e' }} />
          {!collapsed && (
            <>
              <span style={{ flex: 1, textAlign: 'left', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.label}</span>
              <ChevronRight size={12} style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 150ms', color: '#8a8c8e' }} />
            </>
          )}
        </button>

        {open && !collapsed && (
          <div style={{
            marginLeft: 10,
            paddingLeft: 12,
            borderLeft: '1.5px solid #e2e3e3',
            marginTop: 2,
            marginBottom: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 2,
          }}>
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
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <Icon size={19} style={{ flexShrink: 0, color: isActive ? '#1b1c1e' : '#4a4c4e' }} />
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
  const { appName, appSubtitle, logoUrl } = useThemeStore()

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
  const width = collapsed ? 68 : 240

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const roleLabel = (userDetail as unknown as { roles?: Array<{ name: string }> })?.roles?.[0]?.name ?? 'User'

  return (
    <aside
      style={{
        width,
        minWidth: width,
        maxWidth: width,
        background: '#f4f4f4',
        borderRight: '1px solid #dcdddd',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        transition: 'width 220ms ease, min-width 220ms ease',
        overflow: 'hidden',
        position: 'relative',
        flexShrink: 0,
        gap: 26,
        padding: collapsed ? '22px 10px' : '22px 16px',
      }}
    >
      {/* ── Header: logo + collapse ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '6px 8px',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          {/* Logo circle */}
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={appName}
              style={{
                width: 34,
                height: 34,
                objectFit: 'contain',
                borderRadius: '50%',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1.5px solid #1b1c1e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                }}
              />
            </div>
          )}

          {/* App name + subtitle */}
          {!collapsed && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 1, whiteSpace: 'nowrap', minWidth: 0 }}>
              <span style={{ fontSize: 14, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: '#1b1c1e', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {appName}
              </span>
              <span style={{ fontFamily: "'Geist Mono', monospace", fontSize: 10, color: '#8a8c8e', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {appSubtitle}
              </span>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        {!collapsed && (
          <button
            onClick={toggleCollapse}
            title="Collapse menu"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: '1px solid #dcdddd',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6c6e70',
              fontSize: 12,
              flexShrink: 0,
              fontFamily: 'monospace',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#eeeeee' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
          >
            ‹
          </button>
        )}

        {/* Expand button when collapsed */}
        {collapsed && (
          <button
            onClick={toggleCollapse}
            title="Expand menu"
            style={{
              width: 28,
              height: 28,
              borderRadius: 8,
              border: '1px solid #dcdddd',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#6c6e70',
              fontSize: 12,
              flexShrink: 0,
              fontFamily: 'monospace',
              position: 'absolute',
              right: 10,
              top: 28,
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#eeeeee' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
          >
            ›
          </button>
        )}
      </div>

      {/* ── New Item CTA ── */}
      <button
        style={{
          fontFamily: "'Geist', Helvetica, Arial, sans-serif",
          fontSize: 14,
          fontWeight: 600,
          color: '#fff',
          background: 'var(--color-primary)',
          border: 'none',
          borderRadius: 12,
          padding: collapsed ? '13px 0' : '13px 16px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          minHeight: 44,
          width: '100%',
          flexShrink: 0,
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-hover)' }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary)' }}
      >
        {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>New Feature</span>}
        <span style={{ fontSize: 16 }}>＋</span>
      </button>

      {/* ── Navigation ── */}
      <nav
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {!collapsed && (
          <div
            style={{
              fontFamily: "'Geist Mono', monospace",
              fontSize: 11,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              color: '#8a8c8e',
              margin: '0 0 4px 10px',
            }}
          >
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

      {/* ── Bottom: user row ── */}
      <div style={{ marginTop: 'auto', flexShrink: 0 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '6px 8px',
            justifyContent: collapsed ? 'center' : 'flex-start',
          }}
        >
          {/* Avatar */}
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: '#dcdddd',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 12,
              fontWeight: 600,
              color: '#4a4c4e',
              flexShrink: 0,
              overflow: 'hidden',
            }}
          >
            {userDetail?.avatar
              ? <img src={userDetail.avatar} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%' }} alt="" />
              : initials}
          </div>

          {/* Name + role */}
          {!collapsed && user && (
            <div style={{ overflow: 'hidden', minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 500,
                  color: '#1b1c1e',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {user.name}
              </div>
              <div
                style={{
                  fontFamily: "'Geist Mono', monospace",
                  fontSize: 10,
                  color: '#8a8c8e',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {roleLabel}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  )
}
