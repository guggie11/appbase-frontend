import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  ModalShell,
  errorStyle,
  inputStyle,
  labelStyle,
  primaryButton,
  secondaryButton,
} from './ModalShell'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  // Derived from the name when left blank. Immutable afterwards, because
  // other features fetch by it.
  code: z
    .string()
    .optional()
    .refine((v) => !v || /^[a-z0-9-]+$/.test(v), {
      message: 'Lowercase letters, numbers and dashes only',
    }),
  description: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface GroupModalProps {
  onClose: () => void
  onSubmit: (payload: {
    name: string
    code?: string
    description?: string | null
  }) => Promise<void>
}

export function GroupModal({ onClose, onSubmit }: GroupModalProps) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) })

  const submit = async (values: FormValues) => {
    try {
      await onSubmit({
        name: values.name,
        code: values.code || undefined,
        description: values.description || null,
      })
    } catch (e: any) {
      setError('code', {
        message:
          e?.response?.data?.error?.message ?? 'Could not create this group',
      })
    }
  }

  return (
    <ModalShell
      title="New group"
      subtitle="A themed container other features fetch by code."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(submit)}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="group-name">
            Name
          </label>
          <input
            id="group-name"
            autoFocus
            placeholder="Order Status"
            style={inputStyle}
            {...register('name')}
          />
          {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="group-code">
            Code
          </label>
          <input
            id="group-code"
            placeholder="order-status"
            style={{ ...inputStyle, fontFamily: "'Geist Mono', monospace" }}
            {...register('code')}
          />
          <p
            style={{
              fontSize: 11,
              color: 'var(--color-text-meta)',
              marginTop: 5,
            }}
          >
            Left blank, it is derived from the name. It cannot be changed later
            — other features reference it.
          </p>
          {errors.code && <p style={errorStyle}>{errors.code.message}</p>}
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle} htmlFor="group-description">
            Description
          </label>
          <input
            id="group-description"
            placeholder="What this classification is for"
            style={inputStyle}
            {...register('description')}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} style={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} style={primaryButton}>
            {isSubmitting ? 'Creating…' : 'Create group'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
