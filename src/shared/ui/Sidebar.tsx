import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  PanelLeft,
  Circle,
  LayoutDashboard,
  Users,
  Shield,
  Menu as MenuIcon,
} from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useMyMenu } from '@/features/menus/queries'
import type { MenuTree } from '@/shared/api/types'

// ── Helpers ────────────────────────────────────────────────────────────────

const SIDEBAR_KEY = 'sidebar_collapsed'

function getLucideIcon(name: string | null): LucideIcon {
  if (!name) return Circle
  // Convert kebab-case or PascalCase to PascalCase
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
    <div className="space-y-2 px-3 pt-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="h-9 rounded-md bg-slate-700/50 animate-pulse"
          style={{ animationDelay: `${i * 80}ms` }}
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

  // Auto-open if a child is active
  useEffect(() => {
    if (isChildActive) setOpen(true)
  }, [isChildActive])

  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setOpen((o) => !o)}
          title={collapsed ? item.label : undefined}
          className={[
            'w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
            isChildActive
              ? 'bg-indigo-700/30 text-indigo-300'
              : 'text-slate-300 hover:bg-slate-700 hover:text-white',
            depth > 0 ? 'pl-6' : '',
          ].join(' ')}
        >
          <Icon size={18} className="shrink-0" />
          {!collapsed && (
            <>
              <span className="flex-1 truncate text-left">{item.label}</span>
              {open ? (
                <ChevronDown size={14} className="shrink-0" />
              ) : (
                <ChevronRight size={14} className="shrink-0" />
              )}
            </>
          )}
        </button>

        {/* Accordion children */}
        {open && !collapsed && (
          <div className="mt-0.5 ml-3 border-l border-slate-700 pl-2 space-y-0.5">
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
      className={[
        'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
        isActive
          ? 'bg-indigo-600 text-white'
          : 'text-slate-300 hover:bg-slate-700 hover:text-white',
        depth > 0 ? 'pl-6' : '',
      ].join(' ')}
    >
      <Icon size={18} className="shrink-0" />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </Link>
  )
}

// ── Fallback static nav when API hasn't loaded yet ─────────────────────────

const STATIC_NAV: MenuTree[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: 'layout-dashboard',
    path: '/dashboard',
    parent_id: null,
    order_index: 0,
    is_active: true,
    roles: [],
    children: [],
  },
  {
    id: 'users',
    label: 'Users',
    icon: 'users',
    path: '/users',
    parent_id: null,
    order_index: 1,
    is_active: true,
    roles: [],
    children: [],
  },
  {
    id: 'roles',
    label: 'Roles',
    icon: 'shield',
    path: '/roles',
    parent_id: null,
    order_index: 2,
    is_active: true,
    roles: [],
    children: [],
  },
  {
    id: 'menus',
    label: 'Menus',
    icon: 'menu',
    path: '/menus',
    parent_id: null,
    order_index: 3,
    is_active: true,
    roles: [],
    children: [],
  },
]

// Ensure lucide icons from static nav actually exist — suppress unused import warning
void [LayoutDashboard, Users, Shield, MenuIcon]

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

  function toggleCollapse() {
    setCollapsed((c) => {
      const next = !c
      try {
        localStorage.setItem(SIDEBAR_KEY, String(next))
      } catch {
        /* noop */
      }
      return next
    })
  }

  const nav = menuTree && menuTree.length > 0 ? menuTree : STATIC_NAV

  return (
    <aside
      className={[
        'relative flex flex-col bg-slate-800 text-white h-screen transition-all duration-300 ease-in-out',
        collapsed ? 'w-16' : 'w-64',
      ].join(' ')}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-slate-700 min-h-[64px]">
        <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center shrink-0">
          <PanelLeft size={16} />
        </div>
        {!collapsed && (
          <span className="font-bold text-lg tracking-tight">Appbase</span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {isLoading ? (
          <MenuSkeleton />
        ) : (
          nav.map((item) => (
            <NavItem key={item.id} item={item} collapsed={collapsed} />
          ))
        )}
      </nav>

      {/* Collapse toggle */}
      <div className="border-t border-slate-700 p-2">
        <button
          onClick={toggleCollapse}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="w-full flex items-center justify-center rounded-md p-2 text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  )
}
