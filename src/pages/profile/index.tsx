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

const inputStyle: React.CSSProperties = {
  width: '100%',
  border: '1px solid #E5E7EB',
  borderRadius: 6,
  padding: '8px 12px',
  fontSize: 14,
  color: '#1A1A1A',
  background: 'white',
  outline: 'none',
}

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 14,
  fontWeight: 500,
  color: '#374151',
  marginBottom: 6,
}

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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <div className="spinner" />
      </div>
    )
  }

  const initials = profile?.name
    ? profile.name.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  const avatarSrc = preview ?? profile?.avatar

  return (
    <div style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Avatar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
        <div style={{ position: 'relative', width: 80, height: 80, flexShrink: 0 }}>
          {avatarSrc ? (
            <img src={avatarSrc} alt="Avatar" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '2px solid #E5E7EB' }} />
          ) : (
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#FFF5F3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#d8452a', border: '2px solid #E5E7EB' }}>
              {initials}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="btn-ghost"
            style={{ fontSize: 13, padding: '6px 12px' }}
          >
            <Upload size={13} />
            Choose photo
          </button>
          {pendingFile && (
            <button
              type="button"
              onClick={handleAvatarUpload}
              disabled={uploadAvatar.isPending}
              className="btn-primary"
              style={{ fontSize: 13, padding: '6px 12px' }}
            >
              {uploadAvatar.isPending ? 'Uploading…' : 'Upload'}
            </button>
          )}
          <p style={{ fontSize: 11, color: '#9CA3AF' }}>JPG, PNG, GIF up to 2MB</p>
        </div>
      </div>

      {/* Email (read-only) */}
      <div>
        <div className="section-label" style={{ marginBottom: 4 }}>Email</div>
        <p style={{ fontSize: 14, color: '#374151' }}>{profile?.email}</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={labelStyle}>Name</label>
          <input
            {...register('name')}
            style={inputStyle}
            onFocus={(e) => { e.target.style.borderColor = '#d8452a'; e.target.style.boxShadow = '0 0 0 3px rgba(216,69,42,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
          />
          {errors.name && <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>{errors.name.message}</p>}
        </div>
        <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
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

  function PasswordField({ id, label, show, setShow }: { id: keyof PasswordForm; label: string; show: boolean; setShow: (v: boolean) => void }) {
    return (
      <div>
        <label style={labelStyle}>{label}</label>
        <div style={{ position: 'relative' }}>
          <input
            {...register(id)}
            type={show ? 'text' : 'password'}
            style={{ ...inputStyle, paddingRight: 40 }}
            onFocus={(e) => { e.target.style.borderColor = '#d8452a'; e.target.style.boxShadow = '0 0 0 3px rgba(216,69,42,0.1)' }}
            onBlur={(e) => { e.target.style.borderColor = '#E5E7EB'; e.target.style.boxShadow = 'none' }}
          />
          <button
            type="button"
            onClick={() => setShow(!show)}
            style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#9CA3AF', display: 'flex' }}
          >
            {show ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        </div>
        {errors[id] && <p style={{ marginTop: 4, fontSize: 12, color: '#EF4444' }}>{errors[id]?.message}</p>}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ maxWidth: 480, display: 'flex', flexDirection: 'column', gap: 16 }}>
      <PasswordField id="current_password" label="Current password" show={showCurrent} setShow={setShowCurrent} />
      <PasswordField id="new_password" label="New password" show={showNew} setShow={setShowNew} />
      <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: -8 }}>
        Min 8 chars, uppercase, lowercase, digit, symbol
      </p>
      <PasswordField id="confirm_password" label="Confirm new password" show={showConfirm} setShow={setShowConfirm} />
      <button type="submit" disabled={isSubmitting} className="btn-primary" style={{ alignSelf: 'flex-start' }}>
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
      <div style={{ display: 'flex', justifyContent: 'center', padding: '48px 0' }}>
        <div className="spinner" />
      </div>
    )
  }

  const nonCurrentCount = sessions?.filter((s) => !s.is_current).length ?? 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {nonCurrentCount > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {confirmAll ? (
            <>
              <span style={{ fontSize: 13, color: '#374151' }}>Revoke all other sessions?</span>
              <button onClick={handleRevokeAll} disabled={revokeAll.isPending} style={{ padding: '6px 12px', fontSize: 12, background: '#EF4444', color: 'white', border: 'none', borderRadius: 6, cursor: 'pointer', opacity: revokeAll.isPending ? 0.5 : 1 }}>
                {revokeAll.isPending ? 'Revoking…' : 'Confirm'}
              </button>
              <button onClick={() => setConfirmAll(false)} className="btn-ghost" style={{ fontSize: 12, padding: '6px 12px' }}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setConfirmAll(true)} style={{ padding: '6px 12px', fontSize: 12, background: '#FEF2F2', color: '#DC2626', border: '1px solid #FECACA', borderRadius: 6, cursor: 'pointer' }}>
              Revoke all other sessions
            </button>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sessions?.map((session) => (
          <div key={session.id} style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, padding: 16, border: '1px solid #E5E7EB', borderRadius: 8, background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 280 }}>
                  {session.user_agent ?? 'Unknown browser'}
                </span>
                {session.is_current && (
                  <span className="badge badge-active" style={{ fontSize: 11, flexShrink: 0 }}>Current</span>
                )}
              </div>
              <p style={{ fontSize: 11, color: '#9CA3AF' }}>
                IP: {session.ip_address ?? 'Unknown'} · Created: {new Date(session.created_at).toLocaleString()} · Expires: {new Date(session.expires_at).toLocaleString()}
              </p>
            </div>
            <button
              onClick={() => handleRevoke(session.id)}
              disabled={session.is_current || revokeSession.isPending}
              style={{ flexShrink: 0, padding: '6px 12px', fontSize: 12, color: '#DC2626', border: '1px solid #FECACA', background: 'white', borderRadius: 6, cursor: session.is_current ? 'not-allowed' : 'pointer', opacity: session.is_current ? 0.4 : 1 }}
            >
              Revoke
            </button>
          </div>
        ))}
        {sessions?.length === 0 && (
          <p style={{ fontSize: 13, color: '#9CA3AF', textAlign: 'center', padding: '32px 0' }}>No active sessions found.</p>
        )}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: 'profile', label: 'Edit Profile', icon: <User size={14} /> },
  { key: 'password', label: 'Change Password', icon: <Lock size={14} /> },
  { key: 'sessions', label: 'Active Sessions', icon: <Monitor size={14} /> },
]

export function ProfilePage() {
  const [tab, setTab] = useState<Tab>('profile')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>Profile</h1>
        <p style={{ fontSize: 13, color: '#6B7280' }}>Manage your account settings</p>
      </div>

      {/* Tab pills */}
      <div style={{ display: 'flex', gap: 6 }}>
        {TABS.map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              borderRadius: 9999,
              border: tab === key ? 'none' : '1px solid #E5E7EB',
              background: tab === key ? '#d8452a' : 'white',
              color: tab === key ? 'white' : '#6B7280',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
          >
            {icon}
            {label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="card">
        {tab === 'profile' && <EditProfileTab />}
        {tab === 'password' && <ChangePasswordTab />}
        {tab === 'sessions' && <ActiveSessionsTab />}
      </div>
    </div>
  )
}
