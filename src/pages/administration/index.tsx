import { useSearchParams } from 'react-router-dom'
import { usePermission } from '@/features/auth/usePermission'
import { UsersPage } from '@/pages/users'
import { RolesPage } from '@/pages/roles'
import { MenusPage } from '@/pages/menus'
import { SettingsPage } from '@/pages/settings'
import { ADMIN_TABS, resolveTab } from './tabs'

const PANELS: Record<string, () => React.ReactElement> = {
  users: UsersPage,
  roles: RolesPage,
  menus: MenusPage,
  appearance: SettingsPage,
}

export function AdministrationPage() {
  const [params, setParams] = useSearchParams()

  // Hooks must run unconditionally, so every permission is read up front.
  const canUsers = usePermission('users.read')
  const canRoles = usePermission('roles.read')
  const canMenus = usePermission('menu.read')
  const canAppearance = usePermission('settings.read')

  const allowed: Record<string, boolean> = {
    users: canUsers,
    roles: canRoles,
    menus: canMenus,
    appearance: canAppearance,
  }

  const permitted = ADMIN_TABS.filter((t) => allowed[t.id]).map((t) => t.id)
  const active = resolveTab(params.get('tab'), permitted)

  if (!active) {
    return (
      <div style={{ padding: 28, color: 'var(--color-text-muted)', fontSize: 14 }}>
        You do not have access to any administration area.
      </div>
    )
  }

  const Panel = PANELS[active]

  function selectTab(id: string) {
    // replace: false so Back returns to the previous tab, as users expect.
    setParams({ tab: id })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* The console owns the heading: eyebrow carries the section, the h1
          names the open area. Putting "Administration" in both lines echoed
          the same word twice. */}
      <div>
        <span
          style={{
            fontFamily: "'Geist Mono', ui-monospace, monospace",
            fontSize: 10,
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            color: 'var(--color-text-meta)',
          }}
        >
          Administration
        </span>
        <h1
          style={{
            margin: '6px 0 0',
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
          }}
        >
          {ADMIN_TABS.find((t) => t.id === active)?.label ?? 'Administration'}
        </h1>
      </div>

      <div
        role="tablist"
        aria-label="Administration"
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--color-border-light)',
          overflowX: 'auto',
        }}
      >
        {ADMIN_TABS.filter((t) => allowed[t.id]).map((tab) => {
          const isActive = tab.id === active
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`admin-tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`admin-panel-${tab.id}`}
              onClick={() => selectTab(tab.id)}
              style={{
                appearance: 'none',
                border: 'none',
                background: 'transparent',
                padding: '10px 14px',
                fontSize: 13.5,
                fontFamily: 'inherit',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                borderBottom: `2px solid ${isActive ? 'var(--color-primary)' : 'transparent'}`,
                marginBottom: -1,
                whiteSpace: 'nowrap',
              }}
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div
        role="tabpanel"
        id={`admin-panel-${active}`}
        aria-labelledby={`admin-tab-${active}`}
      >
        <Panel />
      </div>
    </div>
  )
}
