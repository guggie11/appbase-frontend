import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ADMIN_TABS, resolveTab, adminTitleFor, isAdminPathActive } from '@/pages/administration/tabs'
import { AdministrationPage } from '@/pages/administration'

// The four panels are heavy (tables, queries, drag handlers); stub them so the
// test is about the console shell, not their internals.
vi.mock('@/pages/users', () => ({ UsersPage: () => <div>users-panel</div> }))
vi.mock('@/pages/roles', () => ({ RolesPage: () => <div>roles-panel</div> }))
vi.mock('@/pages/menus', () => ({ MenusPage: () => <div>menus-panel</div> }))
vi.mock('@/pages/settings', () => ({ SettingsPage: () => <div>settings-panel</div> }))
vi.mock('@/pages/appearance', () => ({ AppearancePage: () => <div>appearance-panel</div> }))

const granted = new Set<string>()
vi.mock('@/features/auth/usePermission', () => ({
  usePermission: (slug: string) => granted.has(slug),
}))

beforeEach(() => {
  granted.clear()
  for (const t of ADMIN_TABS) granted.add(t.permission)
})

function renderConsole(initial = '/administration') {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[initial]}>
        <Routes>
          <Route path="/administration" element={<AdministrationPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('resolveTab', () => {
  it('falls back to the first permitted tab when the query is absent', () => {
    expect(resolveTab(null, ['users', 'roles'])).toBe('users')
  })

  it('honours a valid tab from the query string', () => {
    expect(resolveTab('menus', ['users', 'roles', 'menus'])).toBe('menus')
  })

  it('ignores a tab the user may not see', () => {
    // Deep-linking to a forbidden tab must not expose it.
    expect(resolveTab('menus', ['users'])).toBe('users')
  })

  it('ignores an unknown tab id', () => {
    expect(resolveTab('nonsense', ['users', 'roles'])).toBe('users')
  })

  it('returns null when nothing is permitted', () => {
    expect(resolveTab('users', [])).toBeNull()
  })
})

describe('adminTitleFor', () => {
  it('names the active area so the breadcrumb is not "Appbase / Appbase"', () => {
    expect(adminTitleFor('users')).toBe('Administration / Users')
    expect(adminTitleFor('appearance')).toBe('Administration / Appearance')
  })

  it('falls back to the console name for an unknown tab', () => {
    expect(adminTitleFor('nonsense')).toBe('Administration')
    expect(adminTitleFor(null)).toBe('Administration')
  })
})

describe('isAdminPathActive', () => {
  it('keeps a legacy admin link highlighted while its tab is open', () => {
    // Menu items still store /users; the console lives at /administration.
    expect(isAdminPathActive('/users', '/administration', '?tab=users')).toBe(true)
    expect(isAdminPathActive('/settings', '/administration', '?tab=settings')).toBe(true)
    expect(isAdminPathActive('/appearance', '/administration', '?tab=appearance')).toBe(true)
  })

  it('does not highlight a link for a different tab', () => {
    expect(isAdminPathActive('/users', '/administration', '?tab=roles')).toBe(false)
  })

  it('treats a missing tab as the first one', () => {
    expect(isAdminPathActive('/users', '/administration', '')).toBe(true)
  })

  it('ignores routes outside the console', () => {
    expect(isAdminPathActive('/users', '/dashboard', '')).toBe(false)
    expect(isAdminPathActive('/profile', '/administration', '?tab=users')).toBe(false)
  })
})

describe('AdministrationPage', () => {
  it('renders one tab per admin area', () => {
    renderConsole()
    const tabs = screen.getAllByRole('tab')
    expect(tabs).toHaveLength(ADMIN_TABS.length)
  })

  it('shows the Users panel by default', () => {
    renderConsole()
    expect(screen.getByText('users-panel')).toBeInTheDocument()
    expect(screen.queryByText('roles-panel')).not.toBeInTheDocument()
  })

  it('opens the tab named in the query string', () => {
    renderConsole('/administration?tab=menus')
    expect(screen.getByText('menus-panel')).toBeInTheDocument()
  })

  it('switches panels on click', async () => {
    renderConsole()
    await userEvent.click(screen.getByRole('tab', { name: /roles/i }))
    expect(screen.getByText('roles-panel')).toBeInTheDocument()
    expect(screen.queryByText('users-panel')).not.toBeInTheDocument()
  })

  it('marks the active tab for assistive tech', async () => {
    renderConsole()
    const users = screen.getByRole('tab', { name: /users/i })
    expect(users).toHaveAttribute('aria-selected', 'true')

    await userEvent.click(screen.getByRole('tab', { name: /^settings$/i }))
    expect(screen.getByRole('tab', { name: /^settings$/i })).toHaveAttribute('aria-selected', 'true')
    expect(users).toHaveAttribute('aria-selected', 'false')
  })

  it('hides tabs the user lacks permission for', () => {
    granted.clear()
    granted.add('users.read')
    renderConsole()

    expect(screen.getAllByRole('tab')).toHaveLength(1)
    expect(screen.queryByRole('tab', { name: /roles/i })).not.toBeInTheDocument()
  })

  it('does not render a forbidden panel even when deep-linked', () => {
    granted.clear()
    granted.add('users.read')
    renderConsole('/administration?tab=menus')

    expect(screen.queryByText('menus-panel')).not.toBeInTheDocument()
    expect(screen.getByText('users-panel')).toBeInTheDocument()
  })

  it('exposes the tablist as a labelled group', () => {
    renderConsole()
    expect(screen.getByRole('tablist', { name: /administration/i })).toBeInTheDocument()
  })
})
