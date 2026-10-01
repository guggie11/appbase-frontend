import type { Role } from '@/shared/api/types'

interface RoleSelectProps {
  roles: Role[]
  value: string[]
  onChange: (value: string[]) => void
  disabled?: boolean
}

export function RoleSelect({ roles, value, onChange, disabled }: RoleSelectProps) {
  const toggle = (id: string) => {
    if (value.includes(id)) {
      onChange(value.filter((v) => v !== id))
    } else {
      onChange([...value, id])
    }
  }

  return (
    <div
      style={{
        border: '1px solid var(--color-border-light)',
        borderRadius: 12,
        maxHeight: 192,
        overflowY: 'auto',
        background: 'var(--color-card)',
      }}
    >
      {roles.length === 0 && (
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--color-text-placeholder)',
            padding: 14,
            textAlign: 'center',
            margin: 0,
          }}
        >
          No roles available
        </p>
      )}
      {roles.map((role, i) => {
        const checked = value.includes(role.id)
        return (
          <label
            key={role.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '10px 13px',
              cursor: disabled ? 'not-allowed' : 'pointer',
              borderTop: i === 0 ? 'none' : '1px solid var(--color-border-light)',
              opacity: disabled ? 0.6 : 1,
            }}
          >
            {/* Square = multi-select. A round control would read as "pick one". */}
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(role.id)}
              disabled={disabled}
              style={{
                width: 16,
                height: 16,
                flexShrink: 0,
                borderRadius: 4,
                accentColor: 'var(--color-primary)',
                cursor: 'inherit',
                margin: 0,
              }}
            />
            <span style={{ fontSize: 13.5, color: 'var(--color-text-secondary)' }}>
              {role.name}
            </span>
            {role.is_system && (
              // Neutral, not primary: metadata, not an action. Kept next to the
              // name so it reads as a property of the role, not a column.
              <span
                title="Built-in role — cannot be deleted"
                style={{
                  fontFamily: "'Geist Mono', ui-monospace, monospace",
                  fontSize: 9,
                  letterSpacing: '0.07em',
                  textTransform: 'uppercase',
                  color: 'var(--color-text-muted)',
                  background: 'var(--color-card-alt)',
                  border: '1px solid var(--color-border-light)',
                  borderRadius: 6,
                  padding: '2px 6px',
                  flexShrink: 0,
                }}
              >
                System
              </span>
            )}
          </label>
        )
      })}
    </div>
  )
}
