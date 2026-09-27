import { useState, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { User, Lock, Monitor, Upload, Eye, EyeOff } from 'lucide-react'
import {
  useProfile,
  useUpdateProfile,
  useUploadAvatar,
  useChangePassword,
  useSessions,
  useRevokeSession,
  useRevokeAllSessions,
} from '@/features/profile/queries'

// ── Schemas ────────────────────────────────────────────────────────────────

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required'),
})

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'Minimum 8 characters')
      .regex(/[A-Z]/, 'Must contain uppercase letter')
      .regex(/[a-z]/, 'Must contain lowercase letter')
      .regex(/[0-9]/, 'Must contain digit')
      .regex(/[^A-Za-z0-9]/, 'Must contain symbol'),
    confirm_password: z.string().min(1, 'Confirm password is required'),
  })
  .refine((d) => d.new_password === d.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

type Tab = 'profile' | 'password' | 'sessions'

// ── Sub-components ─────────────────────────────────────────────────────────

function EditProfileTab() {
  const { data: profile, isLoading } = useProfile()
  const updateProfile = useUpdateProfile()
  const uploadAvatar = useUploadAvatar()
  const fileRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: profile?.name ?? '' },
  })

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPendingFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => setPreview(ev.target?.result as string)
    reader.readAsDataURL(file)
  }

  async function handleAvatarUpload() {
    if (!pendingFile) return
    try {
      await uploadAvatar.mutateAsync(pendingFile)
      toast.success('Avatar updated')
      setPreview(null)
      setPendingFile(null)
    } catch {
      toast.error('Failed to upload avatar')
    }
  }

  async function onSubmit(data: ProfileForm) {
    try {
      await updateProfile.mutateAsync(data)
      toast.success('Profile updated')
    } catch {
      toast.error('Failed to update profile')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  const initials = profile?.name
    ? profile.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : '?'

  const avatarSrc = preview ?? profile?.avatar

  return (
    <div className="max-w-lg space-y-6">
      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 flex-shrink-0">
          {avatarSrc ? (
            <img
              src={avatarSrc}
              alt="Avatar"
              className="h-20 w-20 rounded-full object-cover border-2 border-gray-200"
            />
          ) : (
            <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xl font-semibold border-2 border-gray-200">
              {initials}
            </div>
          )}
        </div>
        <div className="space-y-2">
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Upload className="h-4 w-4" />
            Choose photo
          </button>
          {pendingFile && (
            <button
              type="button"
              onClick={handleAvatarUpload}
              disabled={uploadAvatar.isPending}
              className="ml-2 inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
            >
              {uploadAvatar.isPending ? 'Uploading…' : 'Upload'}
            </button>
          )}
          <p className="text-xs text-gray-500">JPG, PNG, GIF up to 2MB</p>
        </div>
      </div>

      {/* Profile info (read-only) */}
      <div className="grid gap-1">
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Email</label>
        <p className="text-sm text-gray-700">{profile?.email}</p>
      </div>

      {/* Edit form */}
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            {...register('name')}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </div>
  )
}

function ChangePasswordTab() {
  const changePassword = useChangePassword()
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  async function onSubmit(data: PasswordForm) {
    try {
      await changePassword.mutateAsync(data)
      toast.success('Password changed successfully')
      reset()
    } catch {
      toast.error('Failed to change password')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="max-w-lg space-y-4">
      {/* Current password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current password</label>
        <div className="relative">
          <input
            {...register('current_password')}
            type={showCurrent ? 'text' : 'password'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => setShowCurrent((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.current_password && (
          <p className="mt-1 text-xs text-red-600">{errors.current_password.message}</p>
        )}
      </div>

      {/* New password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">New password</label>
        <div className="relative">
          <input
            {...register('new_password')}
            type={showNew ? 'text' : 'password'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => setShowNew((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.new_password && (
          <p className="mt-1 text-xs text-red-600">{errors.new_password.message}</p>
        )}
        <p className="mt-1 text-xs text-gray-500">
          Min 8 chars, uppercase, lowercase, digit, symbol
        </p>
      </div>

      {/* Confirm password */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm new password</label>
        <div className="relative">
          <input
            {...register('confirm_password')}
            type={showConfirm ? 'text' : 'password'}
            className="w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="button"
            onClick={() => setShowConfirm((v) => !v)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {errors.confirm_password && (
          <p className="mt-1 text-xs text-red-600">{errors.confirm_password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
      >
        {isSubmitting ? 'Changing…' : 'Change password'}
      </button>
    </form>
  )
}

function ActiveSessionsTab() {
  const { data: sessions, isLoading } = useSessions()
  const revokeSession = useRevokeSession()
  const revokeAll = useRevokeAllSessions()
  const [confirmAll, setConfirmAll] = useState(false)

  async function handleRevoke(id: string) {
    try {
      await revokeSession.mutateAsync(id)
      toast.success('Session revoked')
    } catch {
      toast.error('Failed to revoke session')
    }
  }

  async function handleRevokeAll() {
    try {
      await revokeAll.mutateAsync()
      toast.success('All sessions revoked')
      setConfirmAll(false)
    } catch {
      toast.error('Failed to revoke all sessions')
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    )
  }

  const nonCurrentCount = sessions?.filter((s) => !s.is_current).length ?? 0

  return (
    <div className="space-y-4">
      {/* Revoke All button */}
      {nonCurrentCount > 0 && (
        <div className="flex items-center gap-3">
          {confirmAll ? (
            <>
              <span className="text-sm text-gray-700">Revoke all other sessions?</span>
              <button
                onClick={handleRevokeAll}
                disabled={revokeAll.isPending}
                className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {revokeAll.isPending ? 'Revoking…' : 'Confirm'}
              </button>
              <button
                onClick={() => setConfirmAll(false)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={() => setConfirmAll(true)}
              className="px-3 py-1.5 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100"
            >
              Revoke all other sessions
            </button>
          )}
        </div>
      )}

      {/* Sessions list */}
      <div className="space-y-2">
        {sessions?.map((session) => (
          <div
            key={session.id}
            className="flex items-start justify-between gap-4 p-4 border border-gray-200 rounded-lg bg-white"
          >
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
                  {session.user_agent ?? 'Unknown browser'}
                </span>
                {session.is_current && (
                  <span className="flex-shrink-0 px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                    Current
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">
                IP: {session.ip_address ?? 'Unknown'} &bull; Created:{' '}
                {new Date(session.created_at).toLocaleString()} &bull; Expires:{' '}
                {new Date(session.expires_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleRevoke(session.id)}
              disabled={session.is_current || revokeSession.isPending}
              className="flex-shrink-0 px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded-md hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Revoke
            </button>
          </div>
        ))}
        {sessions?.length === 0 && (
          <p className="text-sm text-gray-500 py-4 text-center">No active sessions found.</p>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Edit Profile', icon: <User className="h-4 w-4" /> },
  { key: 'password', label: 'Change Password', icon: <Lock className="h-4 w-4" /> },
  { key: 'sessions', label: 'Active Sessions', icon: <Monitor className="h-4 w-4" /> },
]

export function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Profile</h1>

      {/* Tab nav */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex gap-6">
          {TABS.map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={[
                'flex items-center gap-2 pb-3 text-sm font-medium border-b-2 transition-colors',
                tab === key
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              ].join(' ')}
            >
              {icon}
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab content */}
      <div>
        {tab === 'profile' && <EditProfileTab />}
        {tab === 'password' && <ChangePasswordTab />}
        {tab === 'sessions' && <ActiveSessionsTab />}
      </div>
    </div>
  )
}
