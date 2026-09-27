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
        await updateUser.mutateAsync({ id: user.id, name: data.name, email: data.email })
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-xl shadow-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {isEdit ? 'Edit User' : 'Create User'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name
            </label>
            <input
              {...register('name')}
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              {...register('email')}
              type="email"
              className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Roles
            </label>
            <RoleSelect
              roles={roles}
              value={roleIds}
              onChange={(v) => setValue('role_ids', v)}
              disabled={isPending}
            />
          </div>

          {errors.root && (
            <p className="text-xs text-red-500 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {errors.root.message}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-60 transition-colors"
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
