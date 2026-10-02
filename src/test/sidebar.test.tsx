import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Sidebar } from '@/shared/ui/Sidebar'
import type { MenuTree } from '@/shared/api/types'

const NAV: MenuTree[] = [
  {
    id: 'dashboard', label: 'Dashboard', icon: 'layout-dashboard', path: '/dashboard',
    parent_id: null, order_index: 0, is_active: true, roles: [], children: [],
  },
  // The real backend ships a Profile menu; the sidebar must not render it
  // alongside the user card, which already links there.
  {
    id: 'profile', label: 'Profile', icon: 'user', path: '/profile',
    parent_id: null, order_index: 1, is_active: true, roles: [], children: [],
  },
  {
    id: 'admin', label: 'Administration', icon: 'shield', path: null,
    parent_id: null, order_index: 1, is_active: true, roles: [],
    children: [
      {
        id: 'users', label: 'Users', icon: 'users', path: '/users',
        parent_id: 'admin', order_index: 0, is_active: true, roles: [], children: [],
      },
    ],
  },
]

vi.mock('@/features/menus/queries', () => ({
  useMyMenu: () => ({ data: NAV, isLoading: false }),
}))
vi.mock('@/features/auth/store', () => ({
  useAuthStore: (sel: (s: unknown) => unknown) =>
    sel({ user: { name: 'Ada Lovelace', roles: [{ name: 'Super Admin' }] } }),
}))
vi.mock('@/shared/config/theme', () => ({
  useThemeStore: () => ({ appName: 'Appbase', appSubtitle: 'App Template', logoUrl: '' }),
}))

function renderSidebar(route = '/dashboard') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[route]}>
        <Sidebar />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  try {
    globalThis.localStorage?.clear()
  } catch { /* jsdom without storage */ }
})

describe('Sidebar collapse control', () => {
  it('exposes an accessible name and expanded state', async () => {
    renderSidebar()
    const toggle = screen.getByRole('button', { name: /collapse sidebar/i })
    expect(toggle).toHaveAttribute('aria-expanded', 'true')

    await userEvent.click(toggle)

    const expand = screen.getByRole('button', { name: /expand sidebar/i })
    expect(expand).toHaveAttribute('aria-expanded', 'false')
  })

  it('labels the navigation landmark', () => {
    renderSidebar()
    expect(screen.getByRole('navigation', { name: /main/i })).toBeInTheDocument()
  })

  it('keeps a single toggle in the DOM across states', async () => {
    renderSidebar()
    await userEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }))
    expect(screen.getAllByRole('button', { name: /sidebar/i })).toHaveLength(1)
  })
})

describe('Sidebar Archie v4 spec', () => {
  it('elevates only the active item, never its parent', async () => {
    renderSidebar('/users')

    const parent = screen.getByRole('button', { name: /administration/i })
    // The parent of the active child must stay flat — a raised white card
    // there outranks the item that is actually selected. A quiet tint is
    // allowed so the ancestor is still locatable.
    expect(parent.style.boxShadow).toBe('')
    expect(parent.style.background).not.toBe('#ffffff')
  })

  it('uses Archie elevation on the active top-level card', () => {
    renderSidebar('/dashboard')
    const active = screen.getByRole('link', { name: 'Dashboard' })
    expect(active.style.boxShadow).toBe('0 1px 2px rgba(27,28,30,0.06)')
  })

  it('keeps the active child flat inside its group', () => {
    renderSidebar('/users')
    const child = screen.getByRole('link', { name: 'Users' })
    // Tint only: a second shadow nested in the group reads as double elevation.
    expect(child.style.boxShadow).toBe('')
  })
})

describe('Sidebar navigation semantics', () => {
  it('opens Profile from the user card at the bottom', async () => {
    renderSidebar('/dashboard')

    const card = screen.getByTestId('sidebar-user')
    const link = within(card).getByRole('link', { name: /profile/i })
    expect(link).toHaveAttribute('href', '/profile')
  })

  it('marks the user card as current while on Profile', () => {
    renderSidebar('/profile')
    const card = screen.getByTestId('sidebar-user')
    expect(within(card).getByRole('link', { name: /profile/i })).toHaveAttribute(
      'aria-current',
      'page',
    )
  })

  it('does not offer Profile twice', () => {
    renderSidebar('/dashboard')
    const toProfile = screen
      .getAllByRole('link')
      .filter((a) => a.getAttribute('href') === '/profile')
    expect(toProfile, 'Profile should only be reachable from the user card').toHaveLength(1)
  })

  it('marks the active route for assistive tech', () => {
    renderSidebar('/dashboard')
    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('aria-current', 'page')
  })

  it('exposes submenu expansion state', async () => {
    renderSidebar()
    const group = screen.getByRole('button', { name: /administration/i })
    expect(group).toHaveAttribute('aria-expanded', 'false')

    await userEvent.click(group)
    expect(group).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
  })

  it('auto-opens the group containing the active route', () => {
    renderSidebar('/users')
    expect(screen.getByRole('button', { name: /administration/i })).toHaveAttribute('aria-expanded', 'true')
  })

  it('keeps child links reachable when collapsed', async () => {
    renderSidebar('/dashboard')
    await userEvent.click(screen.getByRole('button', { name: /collapse sidebar/i }))

    // A collapsed rail must still allow reaching children — via a flyout.
    await userEvent.click(screen.getByRole('button', { name: /administration/i }))
    expect(screen.getByRole('link', { name: 'Users' })).toBeInTheDocument()
  })
})

describe('Sidebar primary action', () => {
  it('does not render a dead button when no handler is wired', () => {
    renderSidebar()
    // The old build shipped a "New Feature" button with no onClick.
    expect(screen.queryByRole('button', { name: /new feature/i })).not.toBeInTheDocument()
  })

  it('renders the user identity region', () => {
    renderSidebar()
    const region = screen.getByTestId('sidebar-user')
    expect(within(region).getByText('Ada Lovelace')).toBeInTheDocument()
  })
})
