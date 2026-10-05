import { useState } from 'react'
import { AlertTriangle, Check, Loader2, Lock, Save } from 'lucide-react'
import type { Role } from '@/shared/api/types'
import {
  useRolePermissions,
  usePermissions,
  useUpdateRolePermissions,
} from '@/features/roles/queries'
import { groupPermissions, isRoleLocked, summarise } from '../model'

interface PermissionMatrixProps {
  roleId: string
  role?: Role
}

export function PermissionMatrix({ roleId, role }: PermissionMatrixProps) {
  const { data: allPermissions = [], isLoading: loadingAll } = usePermissions()
  const { data: rolePermissions = [], isLoading: loadingRole } = useRolePermissions(roleId)
  const updateMutation = useUpdateRolePermissions()

  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [initialized, setInitialized] = useState(false)

  if (!initialized && !loadingRole && rolePermissions.length >= 0) {
    setSelected(new Set(rolePermissions.map((p) => p.id)))
    setInitialized(true)
  }

  const locked = role ? isRoleLocked(role) : false

  const toggle = (id: string) => {
    if (locked) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const handleSave = () => {
    updateMutation.mutate({ roleId, permission_ids: Array.from(selected) })
  }

  const groups = groupPermissions(allPermissions)
  const { selected: selectedCount, total } = summarise(allPermissions, selected)

  if (loadingAll || loadingRole) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-[var(--color-primary)]" />
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        {/* The card header already names the role; repeating it here put the
            same words on screen four times within 60px. */}
        <span
          data-testid="permission-counter"
          style={{ fontSize: 13, color: '#55585b' }}
        >
          {selectedCount} of {total} permissions granted
        </span>

        {locked ? (
          <span
            data-testid="role-locked-notice"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 10px',
              borderRadius: 10,
              // Neutral, not red: being locked is protective information,
              // not an error, and red here competes with the DANGER flags.
              background: '#efeff0',
              color: '#44474a',
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            <Lock size={13} aria-hidden="true" />
            Locked
          </span>
        ) : (
          <button
            onClick={handleSave}
            disabled={updateMutation.isPending}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 10,
              border: 'none',
              background: 'var(--color-primary)',
              color: '#fff',
              cursor: updateMutation.isPending ? 'default' : 'pointer',
              opacity: updateMutation.isPending ? 0.6 : 1,
            }}
          >
            {updateMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save size={14} aria-hidden="true" />
            )}
            Save
          </button>
        )}
      </div>

      {locked && (
        <p
          data-testid="locked-banner"
          style={{
            margin: 0,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 9,
            padding: '11px 14px',
            borderRadius: 12,
            background: '#fdf6e9',
            // Amber, not grey: "could lock everyone out" is the most severe
            // sentence here and was quieter than a single DANGER chip.
            border: '1px solid #f0dfbc',
            fontSize: 13,
            color: '#6b4f14',
          }}
        >
          <AlertTriangle size={15} style={{ flexShrink: 0, marginTop: 1 }} aria-hidden="true" />
          <span>
            This role is managed by the platform and cannot be edited. Changing it
            could lock everyone out of the application.
          </span>
        </p>
      )}

      {groups.map((group) => (
        <section
          key={group.name}
          style={{
            border: '1px solid #e2e3e3',
            borderRadius: 14,
            overflow: 'hidden',
            background: '#fff',
          }}
        >
          <header
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid #e2e3e3',
              background: '#f4f4f4',
            }}
          >
            <h4
              style={{
                fontFamily: 'Geist Mono, monospace',
                fontSize: 10,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#6c6e70',
              }}
            >
              {group.name}
            </h4>
          </header>

          <div>
            {group.permissions.map((p, i) => (
              <label
                key={p.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 14px',
                  borderTop: i === 0 ? 'none' : '1px solid #f0f0f0',
                  cursor: locked ? 'default' : 'pointer',
                }}
              >
                {locked ? (
                  /* A disabled grey checkbox reads as "unchecked" at a glance.
                     Show the granted state plainly instead of a dead control. */
                  <span
                    data-testid={`granted-${p.slug}`}
                    role="img"
                    aria-label={
                      selected.has(p.id) ? `${p.name}: granted` : `${p.name}: not granted`
                    }
                    style={{
                      marginTop: 1,
                      width: 18,
                      height: 18,
                      borderRadius: 5,
                      flexShrink: 0,
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: selected.has(p.id) ? '#eceded' : '#f8f8f8',
                      color: selected.has(p.id) ? '#1b1c1e' : '#c6c7c8',
                      border: `1px solid ${selected.has(p.id) ? '#d6d7d8' : '#eeeeef'}`,
                    }}
                  >
                    {selected.has(p.id) && <Check size={12} strokeWidth={3} aria-hidden="true" />}
                  </span>
                ) : (
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggle(p.id)}
                    aria-label={p.name}
                    style={{
                      marginTop: 2,
                      width: 16,
                      height: 16,
                      // Square: a round box reads as a radio, which implies
                      // choosing only one.
                      borderRadius: 4,
                      accentColor: 'var(--color-primary)',
                      flexShrink: 0,
                    }}
                  />
                )}

                <div style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ fontSize: 13, fontWeight: 500, color: '#1b1c1e' }}>
                    {p.name}
                  </span>

                  {p.description && (
                    <p style={{ marginTop: 2, fontSize: 12, color: '#55585b', lineHeight: 1.45 }}>
                      {p.description}
                    </p>
                  )}
                </div>

                {/* Risk flags get their own fixed column so they stack into a
                    scannable band instead of shifting with each title. */}
                <span style={{ width: 86, flexShrink: 0, marginTop: 1 }}>
                  {p.is_dangerous && (
                    <span
                      data-testid={`danger-${p.slug}`}
                      title="Destructive — removes data or access"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        borderRadius: 999,
                        background: '#fdecea',
                        // Deeper than brand orange so destructive does not
                        // blend into the primary button colour.
                        color: '#8a1c13',
                        fontSize: 11,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                      }}
                    >
                      <AlertTriangle size={11} aria-hidden="true" />
                      DANGER
                    </span>
                  )}
                </span>

                <code
                  style={{
                    fontFamily: 'Geist Mono, monospace',
                    fontSize: 11,
                    color: '#8a8c8e',
                    flexShrink: 0,
                    marginTop: 1,
                    // Fixed width, left-aligned: right-aligning monospace
                    // throws away the alignment it exists for.
                    width: 150,
                  }}
                >
                  {p.slug}
                </code>
              </label>
            ))}
          </div>
        </section>
      ))}

      {allPermissions.length === 0 && (
        <p style={{ fontSize: 13, color: '#8a8c8e', textAlign: 'center', padding: '24px 0' }}>
          No permissions found
        </p>
      )}

      {updateMutation.isSuccess && (
        <p role="status" style={{ fontSize: 12, color: '#1d7a4c' }}>
          Permissions saved
        </p>
      )}
    </div>
  )
}
