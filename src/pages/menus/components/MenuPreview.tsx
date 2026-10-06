import type { MenuTree } from '@/shared/api/types'
import { useMenuPreview } from '@/features/menus/queries'
import { previewLabel } from '../permissions'

interface Props {
  roles: { id: string; slug: string; name: string }[]
  roleSlug: string | null
  onChange: (slug: string | null) => void
}

function Tree({ nodes, depth = 0 }: { nodes: MenuTree[]; depth?: number }) {
  return (
    <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
      {nodes.map((n) => (
        <li key={n.id}>
          <div
            style={{
              padding: '6px 0 6px ' + (10 + depth * 18) + 'px',
              fontSize: 13,
              color: depth === 0 ? '#1b1c1e' : '#44474a',
              fontWeight: depth === 0 ? 500 : 400,
            }}
          >
            {n.label}
          </div>
          {n.children?.length > 0 && <Tree nodes={n.children} depth={depth + 1} />}
        </li>
      ))}
    </ul>
  )
}

/**
 * Answers "what does a holder of this role actually see?" without logging
 * out. Reading the permission column row by row cannot answer it, because
 * parents are pulled in by their visible children.
 */
export function MenuPreview({ roles, roleSlug, onChange }: Props) {
  const { data: tree = [], isLoading } = useMenuPreview(roleSlug)

  return (
    <section
      data-testid="menu-preview"
      style={{
        border: '1px solid #e2e3e3',
        borderRadius: 14,
        background: '#fff',
        padding: 16,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1b1c1e' }}>
          {previewLabel(roleSlug)}
        </h3>
        <select
          data-testid="preview-role-select"
          aria-label="Preview menu as role"
          value={roleSlug ?? ''}
          onChange={(e) => onChange(e.target.value || null)}
          style={{
            padding: '7px 10px',
            fontSize: 13,
            borderRadius: 10,
            border: '1px solid #e2e3e3',
            background: '#fff',
            color: '#1b1c1e',
          }}
        >
          <option value="">Preview as role…</option>
          {roles.map((r) => (
            <option key={r.id} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
      </div>

      {!roleSlug ? (
        <p style={{ fontSize: 13, color: '#8a8c8e', margin: 0 }}>
          Pick a role to see the navigation exactly as its holders do.
        </p>
      ) : isLoading ? (
        <p style={{ fontSize: 13, color: '#8a8c8e', margin: 0 }}>Loading…</p>
      ) : tree.length === 0 ? (
        <p data-testid="preview-empty" style={{ fontSize: 13, color: '#8a1c13', margin: 0 }}>
          This role sees no menu items at all.
        </p>
      ) : (
        <Tree nodes={tree} />
      )}
    </section>
  )
}
