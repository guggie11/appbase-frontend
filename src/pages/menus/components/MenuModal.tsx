import { useState } from 'react'
import { useForm, type SubmitHandler } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import type { Menu } from '@/shared/api/types'
import type { Role } from '@/shared/api/types'
import {
  useCreateMenu,
  useUpdateMenu,
} from '@/features/menus/queries'

// ── Schema ─────────────────────────────────────────────────────────────────

const schema = z.object({
  label: z.string().min(1, 'Label is required'),
  icon: z.string().optional(),
  path: z.string().optional(),
  parent_id: z.string().optional(),
  order_index: z.coerce.number().int().min(0),
  is_active: z.boolean(),
  role_ids: z.array(z.string()),
})

type FormValues = z.infer<typeof schema>

// ── Props ──────────────────────────────────────────────────────────────────

interface MenuModalProps {
  open: boolean
  onClose: () => void
  editMenu?: Menu | null
  menus: Menu[]
  roles: Role[]
}

// ── Modal ──────────────────────────────────────────────────────────────────

export function MenuModal({ open, onClose, editMenu, menus, roles }: MenuModalProps) {
  const createMenu = useCreateMenu()
  const updateMenu = useUpdateMenu()

  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema) as never,
    defaultValues: editMenu
      ? {
          label: editMenu.label,
          icon: editMenu.icon ?? '',
          path: editMenu.path ?? '',
          parent_id: editMenu.parent_id ?? '',
          order_index: editMenu.order_index,
          is_active: editMenu.is_active,
          role_ids: (editMenu.roles ?? []).map((r) => r.id),
        }
      : {
          label: '',
          icon: '',
          path: '',
          parent_id: '',
          order_index: 0,
          is_active: true,
          role_ids: [],
        },
  })

  const selectedRoleIds = watch('role_ids')

  function toggleRole(id: string) {
    const current = watch('role_ids')
    if (current.includes(id)) {
      setValue(
        'role_ids',
        current.filter((r) => r !== id),
      )
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
        order_index: values.order_index,
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

  // Top-level menus as parent options
  const parentOptions = menus.filter(
    (m) => m.parent_id === null && m.id !== editMenu?.id,
  )

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-white shadow-xl p-6 mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-[#1A1A1A]">
            {editMenu ? 'Edit Menu' : 'Create Menu'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-[#4B5563] transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 border border-red-200 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit as SubmitHandler<FormValues>)} className="space-y-4">
          {/* Label */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Label <span className="text-red-500">*</span>
            </label>
            <input
              {...register('label')}
              placeholder="Menu label"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94F3D]"
            />
            {errors.label && (
              <p className="mt-1 text-xs text-red-600">{errors.label.message}</p>
            )}
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Icon (Lucide name)
            </label>
            <input
              {...register('icon')}
              placeholder="e.g. layout-dashboard"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94F3D]"
            />
          </div>

          {/* Path */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Path
            </label>
            <input
              {...register('path')}
              placeholder="e.g. /dashboard"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94F3D]"
            />
          </div>

          {/* Parent */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Parent Menu
            </label>
            <select
              {...register('parent_id')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94F3D]"
            >
              <option value="">— Top level —</option>
              {parentOptions.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          {/* Order Index */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-1">
              Order Index
            </label>
            <input
              type="number"
              {...register('order_index')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#D94F3D]"
            />
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              id="is_active"
              type="checkbox"
              {...register('is_active')}
              className="h-4 w-4 rounded border-gray-300 text-[#D94F3D]"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-[#374151]">
              Active
            </label>
          </div>

          {/* Roles */}
          <div>
            <label className="block text-sm font-medium text-[#374151] mb-2">
              Roles
            </label>
            <div className="flex flex-wrap gap-2">
              {roles.map((role) => {
                const selected = selectedRoleIds.includes(role.id)
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => toggleRole(role.id)}
                    className={[
                      'rounded-full px-3 py-1 text-xs font-medium border transition-colors',
                      selected
                        ? 'bg-[#D94F3D] text-white border-[#D94F3D]'
                        : 'bg-white text-[#4B5563] border-gray-300 hover:border-[#D94F3D]',
                    ].join(' ')}
                  >
                    {role.name}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md px-4 py-2 text-sm font-medium text-[#4B5563] hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-[#D94F3D] px-4 py-2 text-sm font-medium text-white hover:bg-[#C0392B] transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving…' : editMenu ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
