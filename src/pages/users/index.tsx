import { useState, useMemo } from 'react'
import { Plus, Search, Pencil, Trash2, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { UserWithRoles } from '@/shared/api/types'
import { useUsers, useDeleteUser, useUpdateUserStatus } from '@/features/users/queries'
import { useRoles } from '@/features/roles/queries'
import { apiClient } from '@/shared/api/client'
import { StatusBadge } from './components/StatusBadge'
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

  const columns = useMemo<ColumnDef<UserWithRoles, unknown>[]>(
    () => [
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
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <StatusBadge status={user.status} />
              <select
                value={user.status}
                onChange={(e) => updateStatusMutation.mutate({ id: user.id, status: e.target.value })}
                style={{ fontSize: 11, border: '1px solid #E5E7EB', borderRadius: 4, background: 'white', color: '#6B7280', padding: '2px 4px', outline: 'none', cursor: 'pointer' }}
              >
                {STATUS_OPTIONS.filter((o) => o.value).map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
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
        id: 'created_at',
        header: 'Created At',
        cell: ({ row }) => (
          <span style={{ fontSize: 12, color: '#9CA3AF' }}>
            {row.original.created_at ? new Date(row.original.created_at).toLocaleDateString() : '—'}
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
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', display: 'flex', transition: 'color 150ms, background 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#d8452a' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => setDeleteUser(user)}
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', display: 'flex', transition: 'color 150ms, background 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        },
      },
    ],
    [updateStatusMutation],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>Users</h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>Manage user accounts and roles</p>
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
            onClick={() => { setEditUser(null); setModalOpen(true) }}
            className="btn-primary"
          >
            <Plus size={14} />
            Create User
          </button>
        </div>
      </div>

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
