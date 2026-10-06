import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Copy, Lock, Settings } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Role } from '@/shared/api/types'
import { useRoles, useDeleteRole, useUpdateRole, useDuplicateRole } from '@/features/roles/queries'
import { isRoleLocked, roleKindBadge } from './model'
import { RoleModal } from './components/RoleModal'
import { PermissionMatrix } from './components/PermissionMatrix'
import { DeleteConfirmDialog } from '../users/components/DeleteConfirmDialog'
import { DataTable } from '@/shared/ui/DataTable'

export function RolesPage() {
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [deleteRole, setDeleteRole] = useState<Role | null>(null)
  const [permRole, setPermRole] = useState<Role | null>(null)

  const { data, isLoading } = useRoles(page, 10)
  const deleteMutation = useDeleteRole()
  const updateRole = useUpdateRole()
  const duplicateRole = useDuplicateRole()

  const roles: Role[] = data?.data ?? []
  const meta = data?.meta

  const columns = useMemo<ColumnDef<Role, unknown>[]>(
    () => [
      {
        id: 'name',
        header: 'Name',
        cell: ({ row }) => {
          const role = row.original
          const badge = roleKindBadge(role.kind)
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontWeight: 500, color: '#1A1A1A' }}>{role.name}</span>
              <span
                data-testid={`role-kind-${role.slug}`}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 9999, fontFamily: 'Geist Mono, monospace', fontSize: 10, letterSpacing: '0.06em', fontWeight: 600, background: badge.background, color: badge.color }}
              >
                {isRoleLocked(role) && <Lock size={9} aria-hidden="true" />}
                {badge.label}
              </span>
            </div>
          )
        },
      },
      {
        id: 'users',
        header: 'Users',
        cell: ({ row }) => (
          <span style={{ fontFamily: 'Geist Mono, monospace', fontSize: 12, color: '#6c6e70' }}>
            {row.original.user_count ?? 0}
          </span>
        ),
      },
      {
        accessorKey: 'slug',
        header: 'Slug',
        cell: ({ getValue }) => (
          <code style={{ fontSize: 12, color: '#6B7280', background: '#F9FAFB', padding: '2px 6px', borderRadius: 4, border: '1px solid #E5E7EB' }}>
            {getValue() as string}
          </code>
        ),
      },
      {
        accessorKey: 'description',
        header: 'Description',
        cell: ({ getValue }) => (
          <span style={{ color: '#6B7280', fontSize: 13 }}>{(getValue() as string | null) ?? '—'}</span>
        ),
      },
      {
        id: 'active',
        header: 'Active',
        cell: ({ row }) => {
          const role = row.original
          return (
            <button
              onClick={() => !isRoleLocked(role) && !role.is_system && updateRole.mutate({ id: role.id, is_active: !role.is_active })}
              disabled={isRoleLocked(role) || role.is_system}
              aria-label={`Toggle ${role.name} active`}
              style={{
                position: 'relative',
                width: 36,
                height: 20,
                borderRadius: 9999,
                border: 'none',
                background: role.is_active ? '#10B981' : '#E5E7EB',
                cursor: isRoleLocked(role) || role.is_system ? 'not-allowed' : 'pointer',
                opacity: isRoleLocked(role) || role.is_system ? 0.5 : 1,
                transition: 'background 150ms',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  display: 'inline-block',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  background: 'white',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
                  transform: role.is_active ? 'translateX(18px)' : 'translateX(3px)',
                  transition: 'transform 150ms',
                }}
              />
            </button>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const role = row.original
          const locked = isRoleLocked(role)
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => setPermRole(role)}
                title="Manage permissions"
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', display: 'flex', transition: 'color 150ms, background 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#d8452a' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
              >
                <Settings size={14} />
              </button>
              <button
                onClick={() => {
                  const name = window.prompt(`Duplicate "${role.name}" as:`, `${role.name} Copy`)
                  if (name?.trim()) duplicateRole.mutate({ id: role.id, name: name.trim() })
                }}
                title="Duplicate this role with all its permissions"
                data-testid={`duplicate-${role.slug}`}
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', display: 'flex', transition: 'color 150ms, background 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#d8452a' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
              >
                <Copy size={14} />
              </button>
              <button
                onClick={() => { if (!locked) { setEditRole(role); setModalOpen(true) } }}
                disabled={locked}
                title={locked ? 'Platform roles cannot be edited' : 'Edit'}
                data-testid={`edit-${role.slug}`}
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: locked ? 'not-allowed' : 'pointer', color: '#9CA3AF', display: 'flex', opacity: locked ? 0.4 : 1, transition: 'color 150ms, background 150ms' }}
                onMouseEnter={(e) => { if (!locked) { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#d8452a' } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => !locked && !role.is_system && setDeleteRole(role)}
                disabled={locked || role.is_system}
                title={locked ? 'Platform roles cannot be deleted' : role.is_system ? 'System roles cannot be deleted' : 'Delete'}
                data-testid={`delete-${role.slug}`}
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: locked || role.is_system ? 'not-allowed' : 'pointer', color: '#9CA3AF', display: 'flex', opacity: locked || role.is_system ? 0.4 : 1, transition: 'color 150ms, background 150ms' }}
                onMouseEnter={(e) => { if (!locked && !role.is_system) { (e.currentTarget as HTMLElement).style.background = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#EF4444' } }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
              >
                <Trash2 size={14} />
              </button>
            </div>
          )
        },
      },
    ],
    [updateRole, duplicateRole],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          {/* Heading lives on the Admin Console tab; repeating it here duplicated the label. */}
          <p style={{ fontSize: 13, color: '#6B7280' }}>Manage roles and their permissions</p>
        </div>
        {/* Hidden while a role detail is open: creating a role is an action on
            the list, and offering it here invites a misclick. */}
        {!permRole && (
          <button
            onClick={() => { setEditRole(null); setModalOpen(true) }}
            className="btn-primary"
          >
            <Plus size={14} />
            Create Role
          </button>
        )}
      </div>

      {/* Permission Matrix Panel */}
      {permRole && (
        <div style={{ background: 'white', border: '1px solid #e2e3e3', borderRadius: 14, padding: 20, boxShadow: '0 1px 2px rgba(27,28,30,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              {/* The role name is the heading; "Permission Matrix" above it
                  put the same idea on screen twice and promised a grid. */}
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1b1c1e' }}>{permRole.name}</div>
            </div>
            <button
              onClick={() => setPermRole(null)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#44474a', background: 'transparent', border: '1px solid #e2e3e3', borderRadius: 10, padding: '7px 12px', cursor: 'pointer' }}
            >
              <ChevronLeft size={14} aria-hidden="true" />
              Back to roles
            </button>
          </div>
          <PermissionMatrix roleId={permRole.id} role={permRole} />
        </div>
      )}

      {/* DataTable */}
      <DataTable
        data={roles}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No roles found"
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
      <RoleModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditRole(null) }}
        role={editRole}
      />
      <DeleteConfirmDialog
        open={!!deleteRole}
        title="Delete Role"
        description={`Delete role "${deleteRole?.name}"? This action cannot be undone.`}
        isPending={deleteMutation.isPending}
        onConfirm={() => {
          if (deleteRole) {
            deleteMutation.mutate(deleteRole.id, { onSuccess: () => setDeleteRole(null) })
          }
        }}
        onCancel={() => setDeleteRole(null)}
      />
    </div>
  )
}
