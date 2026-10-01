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

  // Collapsing the rail hides labels; close any open group so the flyout
  // starts from a predictable state when the user expands again.
  useEffect(() => {
    if (collapsed && !isChildActive) setOpen(false)
  }, [collapsed, isChildActive])

  const baseStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    // Archie: one content column. navPadX = 14 when open, 0 when collapsed.
    // Children already sit inside an indented rail container, so they reuse
    // the same inset instead of stacking a second indent on top of it.
    padding: collapsed ? '12px 0' : '12px 14px',
    borderRadius: 14,
    fontSize: 14,
    fontWeight: 400,
    cursor: 'pointer',
    transition: 'background 150ms, color 150ms',
    border: 'none',
    background: 'transparent',
    width: '100%',
    textDecoration: 'none',
    color: '#4a4c4e',
    fontFamily: "'Geist', Helvetica, Arial, sans-serif",
    justifyContent: collapsed ? 'center' : 'flex-start',
    position: 'relative',
    boxSizing: 'border-box',
  }

  const activeStyle: React.CSSProperties = {
    ...baseStyle,
    background: '#ffffff',
    color: '#1b1c1e',
    fontWeight: 600,
    // Archie's exact nav elevation.
    boxShadow: '0 1px 2px rgba(27,28,30,0.06)',
  }

  // A nested item must not outrank its own parent. Archie keeps the sidebar
  // flat apart from the single raised active card, so the child gets a tint
  // only — no second shadow stacked inside the group.
  const activeChildStyle: React.CSSProperties = {
    ...baseStyle,
    background: 'var(--color-primary-light)',
    color: 'var(--color-primary)',
    fontWeight: 600,
  }

  const inactiveStyle: React.CSSProperties = {
    ...baseStyle,
    color: '#4a4c4e',
  }

  if (hasChildren) {
    return (
      <div style={{ position: 'relative' }}>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={collapsed ? item.label : undefined}
          title={collapsed ? item.label : undefined}
          style={
            isChildActive
              ? {
                  // Parent of the active item: label emphasis only. A filled
                  // pill here competes with the active leaf for attention.
                  ...inactiveStyle,
                  color: '#1b1c1e',
                  fontWeight: 500,
                }
              : inactiveStyle
          }
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
            // Centre the rail under the parent icon: nav inset 14 + half of
            // the 19px icon ≈ 23. Anything less makes it hang outside the
            // column and read as a stray line.
            marginLeft: 23,
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

        {/* Collapsed rail: children would be unreachable, so surface them
            in a flyout anchored to the group button. */}
        {open && collapsed && (
          <div
            style={{
              position: 'absolute',
              left: 'calc(100% + 8px)',
              top: 0,
              zIndex: 40,
              minWidth: 190,
              background: '#ffffff',
              border: '1px solid var(--color-border-light)',
              borderRadius: 14,
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              padding: 6,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <div
              style={{
                fontFamily: "'Geist Mono', monospace",
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#8a8c8e',
                padding: '6px 10px 2px',
              }}
            >
              {item.label}
            </div>
            {item.children.map((child) => (
              <NavItem key={child.id} item={child} collapsed={false} />
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
      aria-current={isActive ? 'page' : undefined}
      aria-label={collapsed ? item.label : undefined}
      // Always expose the full label: narrow rails truncate it visually.
      title={item.label}
      style={isActive ? (depth > 0 ? activeChildStyle : activeStyle) : inactiveStyle}
      onMouseEnter={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.04)'
      }}
      onMouseLeave={(e) => {
        if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'
      }}
    >
      <Icon
        size={19}
        style={{
          flexShrink: 0,
          color: isActive ? (depth > 0 ? 'var(--color-primary)' : '#1b1c1e') : '#4a4c4e',
        }}
      />
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
  const { pathname } = useLocation()
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

  // Ctrl/Cmd+B toggles the rail — the convention users already know from
  // VS Code and similar tools.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault()
        toggleCollapse()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Profile is reachable from the user card at the bottom, so drop it from
  // the main list rather than offering the same destination twice.
  const nav = (menuTree && menuTree.length > 0 ? menuTree : STATIC_NAV).filter(
    (item) => item.path !== '/profile',
  )
  // Archie: 264px open, 84px collapsed.
  const width = collapsed ? 84 : 264

  const initials = user?.name
    ? user.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const roleLabel = (userDetail as unknown as { roles?: Array<{ name: string }> })?.roles?.[0]?.name ?? 'User'
  // Profile now lives on the user card, so the card carries the active state.
  const isProfile = pathname === '/profile' || pathname.startsWith('/profile/')

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
      {/* ── Header: logo + inline collapse toggle (Archie puts it here) ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          // Align the brand row with the nav column (navPadX 14).
          padding: collapsed ? '6px 0' : '6px 14px',
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

        {/* Archie: 28x28 icon square inside the brand row, no label. */}
        {!collapsed && (
          <button
            type="button"
            onClick={toggleCollapse}
            aria-expanded
            aria-controls="sidebar-nav"
            aria-label="Collapse sidebar"
            title="Collapse menu (Ctrl+B)"
            style={{
              width: 28,
              height: 28,
              flex: 'none',
              borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'var(--color-text-muted)',
              fontSize: 12,
              lineHeight: 1,
              padding: 0,
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#eeeeee' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
          >
            ‹
          </button>
        )}
      </div>

      {/* Collapsed: Archie hangs a 44x32 tab just under the logo. */}
      {collapsed && (
        <button
          type="button"
          onClick={toggleCollapse}
          aria-expanded={false}
          aria-controls="sidebar-nav"
          aria-label="Expand sidebar"
          title="Expand menu (Ctrl+B)"
          style={{
            width: 44,
            height: 32,
            margin: '-14px auto 0',
            borderRadius: 8,
            border: '1px solid var(--color-border)',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--color-text-muted)',
            fontSize: 12,
            lineHeight: 1,
            padding: 0,
            fontFamily: 'inherit',
            flex: 'none',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#eeeeee' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#fff' }}
        >
          ›
        </button>
      )}

      {/* ── Navigation ── */}
      <nav
        id="sidebar-nav"
        aria-label="Main"
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
              // Share the nav column's left edge (navPadX 14).
              margin: '0 0 4px 14px',
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
      <div style={{ marginTop: 'auto', flexShrink: 0 }} data-testid="sidebar-user">
        <Link
          to="/profile"
          aria-label={user ? `Profile — ${user.name}` : 'Profile'}
          aria-current={isProfile ? 'page' : undefined}
          title={collapsed && user ? `${user.name} — ${roleLabel}` : 'Open profile'}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: collapsed ? '6px 0' : '6px 10px',
            margin: collapsed ? 0 : '0 4px',
            justifyContent: collapsed ? 'center' : 'flex-start',
            textDecoration: 'none',
            borderRadius: 14,
            // A white card reads as "container" against the light sidebar, not
            // as a selection — use the same accent tint the nav uses.
            background: isProfile ? 'var(--color-primary-light)' : 'transparent',
            // Non-colour cue as well: colour alone disappears for colour-blind
            // users once the tint flattens toward the sidebar grey.
            boxShadow: isProfile ? 'inset 3px 0 0 var(--color-primary)' : 'none',
            transition: 'background 150ms',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => {
            if (!isProfile) e.currentTarget.style.background = 'rgba(0,0,0,0.04)'
          }}
          onMouseLeave={(e) => {
            if (!isProfile) e.currentTarget.style.background = 'transparent'
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
                  // Accent-on-tint at 13px needs the darker shade to clear
                  // WCAG AA; the base primary only reaches ~3.3:1 here.
                  color: isProfile ? 'var(--color-primary-hover)' : '#1b1c1e',
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

          {/* Affordance: without this the card reads as a static info block. */}
          {!collapsed && (
            <ChevronRight
              size={15}
              aria-hidden
              style={{
                marginLeft: 'auto',
                flexShrink: 0,
                color: isProfile ? 'var(--color-primary)' : '#a3a5a7',
              }}
            />
          )}
        </Link>
      </div>
    </aside>
  )
}
