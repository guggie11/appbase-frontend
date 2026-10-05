/**
 * Known permission slugs, kept in a module-level set so the zod schema can
 * validate synchronously. Populated from /permissions when the menu page
 * loads; empty means "not loaded yet", in which case validation stays
 * permissive rather than rejecting everything.
 */
let catalogue = new Set<string>()

export function setPermissionCatalogue(slugs: string[]): void {
  catalogue = new Set(slugs)
}

export function permissionExists(slug: string): boolean {
  if (!slug) return true // empty means public
  // Unknown catalogue: do not block the admin on a failed fetch.
  if (catalogue.size === 0) return true
  return catalogue.has(slug)
}

export function knownPermissions(): string[] {
  return [...catalogue].sort()
}

/** Plain sentence for the menu table and the form hint. */
export function describeRequirement(slug: string | null | undefined): string {
  if (!slug) return 'Visible to everyone'
  return `Requires ${slug}`
}

/** Heading for the preview panel. */
export function previewLabel(roleSlug: string | null | undefined): string {
  if (!roleSlug) return 'Your own menu'
  return `Menu as seen by ${roleSlug}`
}
