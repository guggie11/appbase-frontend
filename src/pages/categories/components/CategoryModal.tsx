import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import type { Category } from '@/shared/api/types'
import {
  useCreateCategory,
  useUpdateCategory,
} from '@/features/categories/queries'
import { buildCategoryTree } from '../tree'
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
  code: z
    .string()
    .optional()
    .refine((v) => !v || /^[a-z0-9-]+$/.test(v), {
      message: 'Lowercase letters, numbers and dashes only',
    }),
  parent_id: z.string().optional(),
  description: z.string().optional(),
  order_index: z.coerce.number().int().min(0),
})

type FormValues = z.infer<typeof schema>

interface CategoryModalProps {
  groupId: string
  edit: Category | null
  parentId: string | null
  siblings: Category[]
  onClose: () => void
}

export function CategoryModal({
  groupId,
  edit,
  parentId,
  siblings,
  onClose,
}: CategoryModalProps) {
  const create = useCreateCategory()
  const update = useUpdateCategory()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: edit?.name ?? '',
      code: edit?.code ?? '',
      parent_id: edit?.parent_id ?? parentId ?? '',
      description: edit?.description ?? '',
      order_index: edit?.order_index ?? 0,
    },
  })

  // A node cannot be its own parent, nor sit under its own descendant: the
  // API refuses both, so do not offer them.
  const rows = buildCategoryTree(siblings)
  const descendants = new Set<string>()
  if (edit) {
    const collect = (id: string) => {
      for (const s of siblings.filter((c) => c.parent_id === id)) {
        descendants.add(s.id)
        collect(s.id)
      }
    }
    descendants.add(edit.id)
    collect(edit.id)
  }
  const parentOptions = rows.filter((r) => !descendants.has(r.category.id))

  const submit = async (values: FormValues) => {
    try {
      if (edit) {
        await update.mutateAsync({
          id: edit.id,
          name: values.name,
          parent_id: values.parent_id || null,
          description: values.description || null,
          order_index: values.order_index,
        })
      } else {
        await create.mutateAsync({
          group_id: groupId,
          name: values.name,
          code: values.code || undefined,
          parent_id: values.parent_id || null,
          description: values.description || null,
          order_index: values.order_index,
        })
      }
      onClose()
    } catch (e: any) {
      setError('name', {
        message: e?.response?.data?.error?.message ?? 'Could not save this item',
      })
    }
  }

  return (
    <ModalShell
      title={edit ? 'Edit item' : 'New item'}
      subtitle={edit ? undefined : 'Nest it under another item, or leave it at the root.'}
      onClose={onClose}
    >
      <form onSubmit={handleSubmit(submit)}>
        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="category-name">
            Name
          </label>
          <input
            id="category-name"
            autoFocus
            style={inputStyle}
            {...register('name')}
          />
          {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="category-code">
            Code
          </label>
          <input
            id="category-code"
            disabled={Boolean(edit)}
            style={{
              ...inputStyle,
              fontFamily: "'Geist Mono', monospace",
              // Immutable once saved: it is the key other rows reference.
              background: edit ? 'var(--color-card-alt)' : '#fff',
              color: edit ? 'var(--color-text-meta)' : 'var(--color-text)',
            }}
            {...register('code')}
          />
          {edit && (
            <p
              style={{
                fontSize: 11,
                color: 'var(--color-text-meta)',
                marginTop: 5,
              }}
            >
              Codes cannot change — other data references this one.
            </p>
          )}
          {errors.code && <p style={errorStyle}>{errors.code.message}</p>}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="category-parent">
            Parent
          </label>
          <select id="category-parent" style={inputStyle} {...register('parent_id')}>
            <option value="">— none (top level) —</option>
            {parentOptions.map(({ category, depth }) => (
              <option key={category.id} value={category.id}>
                {'\u00A0\u00A0'.repeat(depth)}
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ marginBottom: 16 }}>
          <label style={labelStyle} htmlFor="category-description">
            Description
          </label>
          <input id="category-description" style={inputStyle} {...register('description')} />
        </div>

        <div style={{ marginBottom: 22 }}>
          <label style={labelStyle} htmlFor="category-order">
            Order
          </label>
          <input
            id="category-order"
            type="number"
            min={0}
            style={inputStyle}
            {...register('order_index')}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button type="button" onClick={onClose} style={secondaryButton}>
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} style={primaryButton}>
            {isSubmitting ? 'Saving…' : edit ? 'Save changes' : 'Create item'}
          </button>
        </div>
      </form>
    </ModalShell>
  )
}
