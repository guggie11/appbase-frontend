import { useState, useEffect } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import * as LucideIcons from 'lucide-react'
import type { Menu } from '@/shared/api/types'
import { permissionExists, knownPermissions } from '../permissions'
import type { Role } from '@/shared/api/types'
import {
  useCreateMenu,
  useUpdateMenu,
} from '@/features/menus/queries'

// ── Schema ─────────────────────────────────────────────────────────────────

/** Mirrors Sidebar's getLucideIcon() so the form rejects what it would render blank. */
export function iconExists(name: string): boolean {
  const pascal = name
    .split(/[-_\s]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join('')
  return Boolean((LucideIcons as unknown as Record<string, unknown>)[pascal])
}

export const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  // An unknown name silently degrades to a blank circle in the sidebar,
  // which is how "administration" shipped unnoticed.
  icon: z
    .string()
    .optional()
    .refine((v) => !v || iconExists(v), {
      message: 'Unknown icon — use a Lucide name such as ShieldCheck or Users',
    }),
  path: z.string().optional(),
  // A typo here hides the menu from everyone with no error anywhere — the
  // gate simply never matches. Validate against the real catalogue.
  required_permission: z
    .string()
    .optional()
    .refine((v) => permissionExists(v ?? ''), {
      message: 'Unknown permission — pick one from the list',
    }),
  parent_id: z.string().optional(),
  is_active: z.boolean(),
  role_ids: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

interface MenuModalProps {
  open: boolean
  onClose: () => void
  editMenu?: Menu | null
  menus: Menu[]
  roles: Role[]
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  padding: '9px 12px',
  fontFamily: 'Geist, Helvetica, Arial, sans-serif',
  fontSize: 14,
  color: 'var(--color-text-primary)',
  background: '#fff',
  outline: 'none',
  transition: 'border-color 150ms, box-shadow 150ms',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'Geist Mono, monospace',
  fontSize: 11,
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  color: 'var(--color-text-meta)',
  marginBottom: 6,
}

export function MenuModal({ open, onClose, editMenu, menus, roles }: MenuModalProps) {
  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()
  const [error, setError] = useState<string | null>(null)
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: {
      label: '',
      icon: '',
      path: '',
      parent_id: '',
      required_permission: '',
      is_active: true,
      role_ids: [],
    },
  })

  const selectedRoleIds = watch('role_ids')

  useEffect(() => {
    if (open) {
      reset(editMenu
        ? {
            label: editMenu.label,
            icon: editMenu.icon ?? '',
            path: editMenu.path ?? '',
            required_permission: editMenu.required_permission ?? '',
            parent_id: editMenu.parent_id ?? '',
            is_active: editMenu.is_active,
            role_ids: (editMenu.roles ?? []).map((r) => r.id.toString()),
          }
        : {
            label: '',
            icon: '',
            path: '',
            parent_id: '',
            required_permission: '',
            is_active: true,
            role_ids: [],
          })
      setError(null)
    }
  }, [open, editMenu, reset])

  function toggleRole(id: string) {
    const current = watch('role_ids')
    if (current.includes(id)) {
      setValue('role_ids', current.filter((r) => r !== id))
    } else {
      setValue('role_ids', [...current, id])
    }
  }

  async function onSubmit(values: FormValues) {
    setError(null)
    try {
      const payload = {
        label: values.label,
        icon: values.icon || null,
        path: values.path || null,
        parent_id: values.parent_id || null,
        // Empty string clears the requirement; the backend reads "" as public.
        required_permission: values.required_permission ?? '',
        is_active: values.is_active,
        role_ids: values.role_ids,
      }
      if (editMenu) {
        await updateMenu.mutateAsync({ id: editMenu.id, ...payload })
      } else {
        await createMenu.mutateAsync(payload)
      }
      reset()
      onClose()
    } catch {
      setError('Failed to save menu. Please try again.')
    }
  }

  if (!open) return null

  const parentOptions = menus.filter(
    (m) => m.parent_id === null && m.id !== editMenu?.id,
  )

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'rgba(27,28,30,0.35)',
        backdropFilter: 'blur(2px)',
      }}
      onClick={onClose}
    >
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 520,
          background: '#fff',
          borderRadius: 16,
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          padding: '28px 28px 24px',
          margin: '0 16px',
          maxHeight: '90vh',
          overflowY: 'auto',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', letterSpacing: '-0.01em' }}>
            {editMenu ? 'Edit Menu' : 'Create Menu'}
          </h2>
          <button
            onClick={onClose}
            style={{
              width: 28, height: 28, borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: 'var(--color-text-muted)',
              transition: 'background 150ms',
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-card-alt)' }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            marginBottom: 16,
            background: 'var(--color-error-bg)',
            border: '1px solid #f5cec5',
            borderLeft: '3px solid var(--color-primary)',
            borderRadius: 8,
            padding: '10px 14px',
            fontSize: 13,
            color: 'var(--color-primary)',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FormValues>)}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Label */}
            <div>
              <label style={labelStyle}>
                Label <span style={{ color: 'var(--color-primary)' }}>*</span>
              </label>
              <input
                {...register('label')}
                placeholder="e.g. Dashboard"
                style={{
                  ...inputStyle,
                  borderColor: focusedField === 'label' ? 'var(--color-primary)' : errors.label ? '#f5cec5' : 'var(--color-border)',
                  boxShadow: focusedField === 'label' ? '0 0 0 3px rgba(216,69,42,0.1)' : 'none',
                }}
                onFocus={() => setFocusedField('label')}
                onBlur={() => setFocusedField(null)}
              />
              {errors.label && (
                <p style={{ marginTop: 4, fontSize: 12, color: 'var(--color-primary)' }}>
                  {errors.label.message}
                </p>
              )}
            </div>

            {/* Icon */}
            <div>
              <label style={labelStyle}>Icon (Lucide name)</label>
              <input
                {...register('icon')}
                placeholder="e.g. layout-dashboard"
                style={{
                  ...inputStyle,
                  borderColor: focusedField === 'icon' ? 'var(--color-primary)' : 'var(--color-border)',
                  boxShadow: focusedField === 'icon' ? '0 0 0 3px rgba(216,69,42,0.1)' : 'none',
                }}
                onFocus={() => setFocusedField('icon')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Path */}
            <div>
              <label style={labelStyle}>Path</label>
              <input
                {...register('path')}
                placeholder="e.g. /dashboard"
                style={{
                  ...inputStyle,
                  borderColor: focusedField === 'path' ? 'var(--color-primary)' : 'var(--color-border)',
                  boxShadow: focusedField === 'path' ? '0 0 0 3px rgba(216,69,42,0.1)' : 'none',
                }}
                onFocus={() => setFocusedField('path')}
                onBlur={() => setFocusedField(null)}
              />
            </div>

            {/* Required permission — what a user must hold to see this item */}
            <div>
              <label style={labelStyle}>Required permission</label>
              <input
                {...register('required_permission')}
                list="permission-catalogue"
                placeholder="Leave empty to show to everyone"
                data-testid="required-permission-input"
                style={{
                  ...inputStyle,
                  borderColor: errors.required_permission
                    ? '#c0392b'
                    : focusedField === 'perm'
                      ? 'var(--color-primary)'
                      : 'var(--color-border)',
                  boxShadow: focusedField === 'perm' ? '0 0 0 3px rgba(216,69,42,0.1)' : 'none',
                }}
                onFocus={() => setFocusedField('perm')}
                onBlur={() => setFocusedField(null)}
              />
              <datalist id="permission-catalogue">
                {knownPermissions().map((slug) => (
                  <option key={slug} value={slug} />
                ))}
              </datalist>
              {errors.required_permission ? (
                <p style={{ marginTop: 5, fontSize: 12, color: '#c0392b' }}>
                  {errors.required_permission.message as string}
                </p>
              ) : (
                <p style={{ marginTop: 5, fontSize: 12, color: '#6c6e70' }}>
                  Anyone holding this permission sees the item — including roles
                  created later.
                </p>
              )}
            </div>

            {/* Parent Menu */}
            <div>
              <label style={labelStyle}>Parent Menu</label>
              <select
                {...register('parent_id')}
                style={{
                  ...inputStyle,
                  borderColor: focusedField === 'parent' ? 'var(--color-primary)' : 'var(--color-border)',
                  boxShadow: focusedField === 'parent' ? '0 0 0 3px rgba(216,69,42,0.1)' : 'none',
                  cursor: 'pointer',
                }}
                onFocus={() => setFocusedField('parent')}
                onBlur={() => setFocusedField(null)}
              >
                <option value="">— Top level —</option>
                {parentOptions.map((m) => (
                  <option key={m.id} value={m.id}>{m.label}</option>
                ))}
              </select>
            </div>

            {/* Active */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input
                id="is_active"
                type="checkbox"
                {...register('is_active')}
                style={{ width: 16, height: 16, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
              />
              <label htmlFor="is_active" style={{ fontSize: 14, color: 'var(--color-text-secondary)', cursor: 'pointer' }}>
                Active
              </label>
            </div>

            {/* Roles */}
            <div>
              <label style={labelStyle}>Roles</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {roles.map((role) => {
                  const selected = selectedRoleIds.includes(role.id)
                  return (
                    <button
                      key={role.id}
                      type="button"
                      onClick={() => toggleRole(role.id)}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '5px 12px',
                        borderRadius: 999,
                        fontSize: 12,
                        fontWeight: 500,
                        border: `1px solid ${selected ? 'var(--color-primary)' : 'var(--color-border)'}`,
                        background: selected ? 'var(--color-primary)' : '#fff',
                        color: selected ? '#fff' : 'var(--color-text-secondary)',
                        cursor: 'pointer',
                        transition: 'all 150ms',
                        fontFamily: 'Geist, Helvetica, Arial, sans-serif',
                      }}
                    >
                      {role.name}
                    </button>
                  )
                })}
              </div>
            </div>

          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'var(--color-border-light)', margin: '24px 0 20px' }} />

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 18px',
                borderRadius: 10,
                border: '1px solid var(--color-border)',
                background: '#fff',
                fontSize: 13,
                fontWeight: 500,
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontFamily: 'Geist, Helvetica, Arial, sans-serif',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-card-alt)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = '#fff' }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                padding: '9px 20px',
                borderRadius: 10,
                border: 'none',
                background: 'var(--color-primary)',
                fontSize: 13,
                fontWeight: 600,
                color: '#fff',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                opacity: isSubmitting ? 0.6 : 1,
                fontFamily: 'Geist, Helvetica, Arial, sans-serif',
                transition: 'background 150ms',
              }}
              onMouseEnter={(e) => { if (!isSubmitting) (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-hover)' }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary)' }}
            >
              {isSubmitting ? 'Saving…' : editMenu ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
