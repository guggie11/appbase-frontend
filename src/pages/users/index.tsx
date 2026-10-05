import { useState, useMemo, useRef } from 'react'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Download, Upload, X } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { UserWithRoles } from '@/shared/api/types'
import {
  useUsers,
  useDeleteUser,
  useUpdateUserStatus,
  useBulkRoles,
  useBulkStatus,
  useImportUsers,
  type ImportReport,
} from '@/features/users/queries'
import { lastActiveLabel, toggleSelection, selectAllState, describeBulkAction } from './bulk'
import { useAuthStore } from '@/features/auth/store'
import { useRoles } from '@/features/roles/queries'
import { apiClient } from '@/shared/api/client'
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog'
import { UserModal } from './components/UserModal'
import { DataTable } from '@/shared/ui/DataTable'

const STATUS_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'pending', label: 'Pending' },
  { value: 'suspended', label: 'Suspended' },
]

const selectStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 6,
  background: 'white',
  color: '#374151',
  fontSize: 13,
  padding: '8px 12px',
  outline: 'none',
  cursor: 'pointer',
}

export function UsersPage() {
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [rawSearch, setRawSearch] = useState('')
  const [status, setStatus] = useState('')
  const [roleId, setRoleId] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editUser, setEditUser] = useState<UserWithRoles | null>(null)
  const [deleteUser, setDeleteUser] = useState<UserWithRoles | null>(null)
  const [exporting, setExporting] = useState(false)

  const { data, isLoading } = useUsers({ page, per_page: 10, search, status, role_id: roleId })
  const { data: rolesData } = useRoles(1, 100)
  const deleteMutation = useDeleteUser()
  const updateStatusMutation = useUpdateUserStatus()

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await apiClient.get('/users/export?format=csv', {
        responseType: 'blob'
      })
      const url = URL.createObjectURL(response.data)
      const a = document.createElement('a')
      a.href = url
      a.download = `users_${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setRawSearch(val)
    clearTimeout((window as unknown as Record<string, ReturnType<typeof setTimeout>>)['_searchTimer'])
    ;(window as unknown as Record<string, ReturnType<typeof setTimeout>>)['_searchTimer'] = setTimeout(() => {
      setSearch(val)
      setPage(1)
    }, 300)
  }

  const users: UserWithRoles[] = data?.data ?? []
  const meta = data?.meta
  const roleOptions = rolesData?.data ?? []

  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [importOpen, setImportOpen] = useState(false)
  const [importResult, setImportResult] = useState<ImportReport | null>(null)
  const [hasFile, setHasFile] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const bulkRoles = useBulkRoles()
  const bulkStatus = useBulkStatus()
  const importUsers = useImportUsers()
  const myId = useAuthStore((s) => s.user?.id)

  const allState = selectAllState(users.map((u) => u.id), selected)
  // The backend refuses bulk actions on the caller; mirror that here so the
  // refusal is never a surprise.
  const selectedIds = [...selected].filter((id) => id !== myId)
  const selfSelected = selected.has(myId ?? '')

  const columns = useMemo<ColumnDef<UserWithRoles, unknown>[]>(
    () => [
      {
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            aria-label="Select all users on this page"
            data-testid="select-all"
            checked={allState === 'all'}
            ref={(el) => {
              // Partial selection is neither checked nor unchecked; the
              // indeterminate dash is the only honest state.
              if (el) el.indeterminate = allState === 'some'
            }}
            onChange={() =>
              setSelected(
                allState === 'all'
                  ? new Set()
                  : new Set(users.map((u) => u.id)),
              )
            }
            style={{ width: 15, height: 15, borderRadius: 4, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            aria-label={`Select ${row.original.name}`}
            data-testid={`select-${row.original.id}`}
            checked={selected.has(row.original.id)}
            onChange={() => setSelected((prev) => toggleSelection(prev, row.original.id))}
            style={{ width: 15, height: 15, borderRadius: 4, accentColor: 'var(--color-primary)', cursor: 'pointer' }}
          />
        ),
      },
      {
        id: 'avatar',
        header: '',
        cell: ({ row }) => {
          const user = row.original
          return (
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--color-primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: 'var(--color-primary)', overflow: 'hidden' }}>
              {user.avatar
                ? <img src={user.avatar} style={{ width: 32, height: 32, objectFit: 'cover', borderRadius: '50%' }} alt="" />
                : (user.name?.[0]?.toUpperCase() ?? '?')}
            </div>
          )
        },
      },
      {
        accessorKey: 'name',
        header: 'Name',
        cell: ({ getValue }) => (
          <span style={{ fontWeight: 500, color: '#1A1A1A' }}>{getValue() as string}</span>
        ),
      },
      {
        accessorKey: 'email',
        header: 'Email',
        cell: ({ getValue }) => (
          <span style={{ color: '#6B7280' }}>{getValue() as string}</span>
        ),
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const user = row.original
          // One control, not two: a badge next to a select stating the same
          // fact read as two different things and cost ~110px of width.
          return (
            <select
              value={user.status}
              aria-label={`Status of ${user.name}`}
              onChange={(e) => updateStatusMutation.mutate({ id: user.id, status: e.target.value })}
              style={{
                fontSize: 12,
                fontWeight: 500,
                border: '1px solid #e2e3e3',
                borderRadius: 999,
                background: user.status === 'active' ? '#e4f3ea' : '#f4f4f4',
                color: user.status === 'active' ? '#1d7a4c' : '#55585b',
                padding: '3px 8px',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          )
        },
      },
      {
        id: 'roles',
        header: 'Roles',
        cell: ({ row }) => (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {row.original.roles?.map((r) => (
              <span key={r.id} style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 8px', borderRadius: 9999, fontSize: 11, fontWeight: 500, background: 'var(--color-primary-light)', color: '#d8452a' }}>
                {r.name}
              </span>
            ))}
          </div>
        ),
      },
      {
        id: 'last_active',
        header: 'Last Active',
        cell: ({ row }) => {
          const value = row.original.last_login_at
          return (
            <span
              data-testid={`last-active-${row.original.id}`}
              style={{ fontSize: 13, color: value ? '#44474a' : '#8a8c8e' }}
            >
              {lastActiveLabel(value)}
            </span>
          )
        },
      },
      {
        id: 'created_at',
        header: 'Created At',
        cell: ({ row }) => (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            {row.original.created_at
              ? new Date(row.original.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
              : '—'}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const user = row.original
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => { setEditUser(user); setModalOpen(true) }}
                aria-label={`Edit ${user.name}`}
                title="Edit user"
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', display: 'flex', transition: 'color 150ms, background 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#d8452a' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setDeleteUser(user)}
                aria-label={`Delete ${user.name}`}
                title="Delete user"
                // Destructive by default, not only on hover: an identical grey
                // icon next to Edit gives no warning before the click.
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#b0564c', display: 'flex', marginLeft: 4, transition: 'color 150ms, background 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#fdecea'; (e.currentTarget as HTMLElement).style.color = '#8a1c13' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#b0564c' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        },
      },
    ],
    [updateStatusMutation, selected, allState, users],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {/* Heading lives on the Admin Console tab; repeating it here showed
              "Users" twice within 60px. */}
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Manage user accounts and roles</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={handleExport}
            disabled={exporting}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 6,
              border: '1px solid #E5E7EB', background: 'white',
              color: '#374151', fontSize: 13, fontWeight: 500,
              cursor: exporting ? 'not-allowed' : 'pointer',
              opacity: exporting ? 0.6 : 1
            }}
          >
            <Download size={14} />
            {exporting ? 'Exporting...' : 'Export CSV'}
          </button>
          <button
            onClick={() => { setImportResult(null); setHasFile(false); setImportOpen(true) }}
            data-testid="open-import"
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px', borderRadius: 6,
              border: '1px solid #E5E7EB', background: 'white',
              color: '#374151', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Upload size={14} />
            Import CSV
          </button>
          <button
            onClick={() => { setEditUser(null); setModalOpen(true) }}
            className="btn-primary"
          >
            <Plus size={14} />
            Create User
          </button>
        </div>
      </div>

      {/* Bulk action bar — only while a selection exists */}
      {selected.size > 0 && (
        <div
          data-testid="bulk-bar"
          style={{
            display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 10,
            padding: '12px 14px', borderRadius: 12,
            border: '1px solid #e2e3e3', background: '#f4f4f4',
          }}
        >
          <span style={{ fontSize: 13, fontWeight: 500, color: '#1b1c1e' }}>
            {describeBulkAction('Selected', selected.size)}
          </span>

          {selfSelected && (
            <span data-testid="self-excluded" style={{ fontSize: 12, color: '#6b4f14' }}>
              Your own account is excluded from bulk actions.
            </span>
          )}

          <span style={{ flex: 1 }} />

          <select
            data-testid="bulk-role-select"
            aria-label="Add role to selected users"
            defaultValue=""
            onChange={(e) => {
              const roleId = e.target.value
              if (!roleId || selectedIds.length === 0) return
              bulkRoles.mutate({ user_ids: selectedIds, role_ids: [roleId], action: 'add' })
              e.target.value = ''
              setSelected(new Set())
            }}
            style={{ padding: '7px 10px', fontSize: 13, borderRadius: 10, border: '1px solid #e2e3e3', background: '#fff' }}
          >
            <option value="">Add role…</option>
            {roleOptions.map((r) => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </select>

          <button
            data-testid="bulk-activate"
            disabled={selectedIds.length === 0}
            onClick={() => {
              bulkStatus.mutate({ user_ids: selectedIds, status: 'active' })
              setSelected(new Set())
            }}
            style={{ padding: '7px 12px', fontSize: 13, borderRadius: 10, border: '1px solid #e2e3e3', background: '#fff', color: '#1b1c1e', cursor: 'pointer' }}
          >
            Activate
          </button>

          <button
            data-testid="bulk-deactivate"
            disabled={selectedIds.length === 0}
            onClick={() => {
              const noun = selectedIds.length === 1 ? 'user' : 'users'
              if (!window.confirm(`Deactivate ${selectedIds.length} ${noun}? They will not be able to sign in.`)) return
              bulkStatus.mutate({ user_ids: selectedIds, status: 'inactive' })
              setSelected(new Set())
            }}
            style={{ padding: '7px 12px', fontSize: 13, fontWeight: 500, borderRadius: 10, border: '1px solid #f0cfca', background: '#fff', color: '#8a1c13', cursor: 'pointer', marginLeft: 6 }}
          >
            Deactivate
          </button>

          <button
            onClick={() => setSelected(new Set())}
            aria-label="Clear selection"
            style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: '#6c6e70', cursor: 'pointer', display: 'flex' }}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#9CA3AF' }} />
          <input
            value={rawSearch}
            onChange={handleSearchChange}
            placeholder="Search users..."
            style={{ ...selectStyle, paddingLeft: 36, width: '100%' }}
          />
        </div>
        <select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1) }}
          style={selectStyle}
        >
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select
          value={roleId}
          onChange={(e) => { setRoleId(e.target.value); setPage(1) }}
          style={selectStyle}
        >
          <option value="">All Roles</option>
          {roleOptions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>

      {/* DataTable */}
      <DataTable
        data={users}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No users found"
      />

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>
            Page {meta.page} of {meta.total_pages} — {meta.total} total
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{ padding: 6, borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.4 : 1, display: 'flex' }}
            >
              <ChevronLeft size={14} />
            </button>
            <button
              onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
              disabled={page >= meta.total_pages}
              style={{ padding: 6, borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', cursor: page >= meta.total_pages ? 'not-allowed' : 'pointer', opacity: page >= meta.total_pages ? 0.4 : 1, display: 'flex' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {/* Import CSV */}
      {importOpen && (
        <div
          role="dialog"
          aria-label="Import users from CSV"
          data-testid="import-dialog"
          style={{
            position: 'fixed', inset: 0, zIndex: 60,
            background: 'rgba(27,28,30,0.45)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setImportOpen(false) }}
        >
          <div style={{ width: '100%', maxWidth: 520, background: '#fff', borderRadius: 16, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: '#1b1c1e' }}>Import users</h2>
              <button
                onClick={() => setImportOpen(false)}
                aria-label="Close"
                style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', color: '#6c6e70', cursor: 'pointer', display: 'flex' }}
              >
                <X size={16} />
              </button>
            </div>

            <p style={{ fontSize: 13, color: '#55585b', marginBottom: 14, lineHeight: 1.5 }}>
              Upload a .csv with one <code>email</code> per row. A <code>name</code> column is optional.
              Imported accounts start as pending and set their own password via
              the invitation email.
            </p>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              data-testid="import-file"
              onChange={(e) => setHasFile(Boolean(e.target.files?.length))}
              style={{ fontSize: 13, marginBottom: 16 }}
            />

            {importResult && (
              <div
                data-testid="import-report"
                style={{ marginBottom: 14, padding: '11px 13px', borderRadius: 12, background: '#f4f4f4', border: '1px solid #e2e3e3' }}
              >
                <p style={{ fontSize: 13, color: '#1b1c1e', marginBottom: importResult.errors.length ? 8 : 0 }}>
                  {importResult.created} created, {importResult.failed} failed
                </p>
                {/* Per-row reasons: "import failed" alone is unusable. */}
                {importResult.errors.length > 0 && (
                  <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#8a1c13' }}>
                    {importResult.errors.slice(0, 8).map((e: { row: number; reason: string }, i: number) => (
                      <li key={i}>Row {e.row}: {e.reason}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
              <button
                onClick={() => setImportOpen(false)}
                style={{ padding: '9px 14px', fontSize: 13, borderRadius: 10, border: '1px solid #e2e3e3', background: '#fff', color: '#1b1c1e', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                data-testid="import-submit"
                disabled={importUsers.isPending || !hasFile}
                onClick={async () => {
                  const file = fileRef.current?.files?.[0]
                  if (!file) return
                  const report = await importUsers.mutateAsync(file)
                  setImportResult(report)
                }}
                className="btn-primary"
              >
                {importUsers.isPending ? 'Importing…' : 'Import'}
              </button>
            </div>
          </div>
        </div>
      )}

      <UserModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditUser(null) }}
        user={editUser}
      />
      <DeleteConfirmDialog
        open={!!deleteUser}
        title="Delete User"
        description={`Delete "${deleteUser?.name}"? This action cannot be undone.`}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteUser) {
            deleteMutation.mutate(deleteUser.id, { onSuccess: () => setDeleteUser(null) })
          }
        }}
        onCancel={() => setDeleteUser(null)}
      />
    </div>
  )
}
