import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, X } from 'lucide-react'
import type { Role } from '@/shared/api/types'
import { useCreateRole, useUpdateRole } from '@/features/roles/queries'

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  is_active: z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface RoleModalProps {
  open: boolean
  onClose: () => void
  role?: Role | null
}

export function RoleModal({ open, onClose, role }: RoleModalProps) {
  const isEdit = !!role
  const createRole = useCreateRole()
  const updateRole = useUpdateRole()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setError,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { name: '', description: '', is_active: true },
  })

  useEffect(() => {
    if (open) {
      if (role) {
        reset({
          name: role.name,
          description: role.description ?? '',
          is_active: role.is_active,
        })
      } else {
        reset({ name: '', description: '', is_active: true })
      }
    }
  }, [open, role, reset])

  const onSubmit = async (data: FormData) => {
    try {
      if (isEdit && role) {
        await updateRole.mutateAsync({ id: role.id, ...data })
      } else {
        await createRole.mutateAsync({ name: data.name, description: data.description })
      }
      onClose()
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } }
      const msg = error?.response?.data?.error?.message ?? 'An error occurred'
      setError('root', { message: msg })
    }
  }

  if (!open) return null

  const isPending = createRole.isPending || updateRole.isPending

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? 'Edit Role' : 'Create Role'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D94F3D]"
            />
            {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              {...register('description')}
              rows={3}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#D94F3D] resize-none"
            />
          </div>

          {isEdit && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_active"
                {...register('is_active')}
                className="h-4 w-4 rounded border-gray-300 text-[#D94F3D] focus:ring-[#D94F3D]"
              />
              <label htmlFor="is_active" className="text-sm text-gray-700">
                Active
              </label>
            </div>
          )}

          {errors.root && (
            <p className="text-xs text-red-500 bg-red-50 px-3 py-2 rounded-lg">
              {errors.root.message}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-[#D94F3D] text-white hover:bg-[#C0392B] disabled:opacity-60 transition-colors"
            >
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEdit ? 'Save Changes' : 'Create Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
