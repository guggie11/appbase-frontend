/**
 * Admin Console tab definitions.
 *
 * Kept separate from the page so routing, the sidebar, and tests can agree on
 * one list instead of each hard-coding its own copy.
 */

export interface AdminTab {
  id: string
  label: string
  /** Permission required to see the tab at all. */
  permission: string
  /** Pre-console route, kept working as a redirect. */
  legacyPath: string
}

// Labels mirror the sidebar menu entries exactly. When they drifted ("Roles"
// here vs "Roles & Permissions" there) the two navigations read as separate
// systems covering the same ground.
export const ADMIN_TABS: AdminTab[] = [
  { id: 'users', label: 'Users', permission: 'users.read', legacyPath: '/users' },
  { id: 'roles', label: 'Roles & Permissions', permission: 'roles.read', legacyPath: '/roles' },
  { id: 'menus', label: 'Menu Management', permission: 'menu.read', legacyPath: '/menus' },
  { id: 'appearance', label: 'Settings', permission: 'settings.read', legacyPath: '/settings' },
]

/**
 * Decide which tab to show.
 *
 * `requested` comes from the URL and is therefore untrusted: deep-linking to a
 * tab the user may not see must fall back rather than expose it.
 */
export function resolveTab(requested: string | null, permitted: string[]): string | null {
  if (permitted.length === 0) return null
  if (requested && permitted.includes(requested)) return requested
  return permitted[0]
}

/**
 * Breadcrumb title for the console.
 *
 * Without this the layout's path map has no entry for /administration and
 * falls back to the app name, rendering "Appbase / Appbase".
 */
export function adminTitleFor(tabId: string | null): string {
  const tab = ADMIN_TABS.find((t) => t.id === tabId)
  return tab ? `Administration / ${tab.label}` : 'Administration'
}

/**
 * Whether a nav item pointing at a pre-console path is the open tab.
 *
 * Menu entries in the database still store `/users`, `/roles`, and so on, but
 * those routes are redirects now — matching on pathname alone leaves the
 * sidebar with nothing highlighted anywhere in the console.
 */
export function isAdminPathActive(
  itemPath: string,
  pathname: string,
  search: string,
): boolean {
  if (!pathname.startsWith('/administration')) return false

  const tab = ADMIN_TABS.find((t) => t.legacyPath === itemPath)
  if (!tab) return false

  const current = new URLSearchParams(search).get('tab') ?? ADMIN_TABS[0].id
  return tab.id === current
}
