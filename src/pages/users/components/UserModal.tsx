import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X } from 'lucide-react'
import type { UserWithRoles } from '@/shared/api/types'
import { useCreateUser, useUpdateUser, useRolesForSelect } from '@/features/users/queries'
import { RoleSelect } from './RoleSelect'

const createSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role_ids: z.array(z.string()),
})

const editSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email'),
  role_ids: z.array(z.string()),
})

type FormData = z.infer<typeof createSchema>

interface UserModalProps {
  open: boolean
  onClose: () => void
  user?: UserWithRoles | null
}

export function UserModal({ open, onClose, user }: UserModalProps) {
  const isEdit = !!user
  const schema = isEdit ? editSchema : createSchema
  const createUser = useCreateUser()
  const updateUser = useUpdateUser()
  const { data: roles = [] } = useRolesForSelect()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', email: '', role_ids: [] },
  })

  const roleIds = watch('role_ids')

  useEffect(() => {
    if (open) {
      if (user) {
        reset({
          name: user.name,
          email: user.email,
          role_ids: user.roles?.map((r) => r.id) ?? [],
        })
      } else {
        reset({ name: '', email: '', role_ids: [] })
      }
    }
  }, [open, user, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit && user) {
        await updateUser.mutateAsync({
          id: user.id,
          name: data.name,
          email: data.email,
          role_ids: data.role_ids,
        })
      } else {
        await createUser.mutateAsync(data)
      }
      onClose()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } }
      const msg = error?.response?.data?.error?.message ?? 'An error occurred'
      setError('root', { message: msg })
    }
  }

  if (!open) return null

  const isPending = createUser.isPending || updateUser.isPending

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontFamily: "'Geist Mono', ui-monospace, monospace",
    fontSize: 10,
    letterSpacing: '0.09em',
    textTransform: 'uppercase',
    color: 'var(--color-text-meta)',
    marginBottom: 7,
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    background: 'var(--color-card)',
    padding: '10px 13px',
    fontSize: 13.5,
    color: 'var(--color-text-primary)',
    fontFamily: 'inherit',
    outline: 'none',
  }

  const errorStyle: React.CSSProperties = {
    marginTop: 6,
    fontSize: 12,
    color: 'var(--color-primary)',
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={isEdit ? 'Edit User' : 'Create User'}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <div
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'rgba(27,28,30,0.45)' }}
      />

      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 460,
          background: 'var(--color-card)',
          borderRadius: 16,
          border: '1px solid var(--color-border-light)',
          boxShadow: '0 18px 44px rgba(27,28,30,0.18)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            padding: '18px 22px',
            borderBottom: '1px solid var(--color-border-light)',
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 16,
              fontWeight: 600,
              letterSpacing: '-0.012em',
              color: 'var(--color-text-primary)',
            }}
          >
            {isEdit ? 'Edit User' : 'Create User'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            style={{
              display: 'grid',
              placeItems: 'center',
              width: 32,
              height: 32,
              borderRadius: 9,
              border: 'none',
              background: 'transparent',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle} htmlFor="user-name">
                Name
              </label>
              <input id="user-name" {...register('name')} style={inputStyle} />
              {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
            </div>

            <div>
              <label style={labelStyle} htmlFor="user-email">
                Email
              </label>
              <input id="user-email" {...register('email')} type="email" style={inputStyle} />
              {errors.email && <p style={errorStyle}>{errors.email.message}</p>}
            </div>

            <div>
              <label style={labelStyle}>Roles</label>
              <RoleSelect
                roles={roles}
                value={roleIds}
                onChange={(v) => setValue('role_ids', v)}
                disabled={isPending}
              />
            </div>

            {errors.root && (
              <p
                style={{
                  margin: 0,
                  fontSize: 12.5,
                  color: 'var(--color-primary)',
                  background: 'var(--color-primary-light)',
                  border: '1px solid #f5cec5',
                  padding: '9px 12px',
                  borderRadius: 10,
                }}
              >
                {errors.root.message}
              </p>
            )}
          </div>

          {/* Footer */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 10,
              // One separator only: a hairline. A tinted band on top of it made
              // the small card read as three stacked boxes.
              padding: '18px 22px',
              borderTop: '1px solid var(--color-border-light)',
            }}
          >
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '9px 16px',
                fontSize: 13,
                fontWeight: 500,
                borderRadius: 11,
                border: '1px solid var(--color-border)',
                background: 'var(--color-card)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 7,
                padding: '9px 17px',
                fontSize: 13,
                fontWeight: 600,
                borderRadius: 11,
                border: 'none',
                background: 'var(--color-primary)',
                color: '#fff',
                cursor: isPending ? 'not-allowed' : 'pointer',
                opacity: isPending ? 0.6 : 1,
                fontFamily: 'inherit',
              }}
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
