import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Shield, Settings } from 'lucide-react'
import type { Role } from '@/shared/api/types'
import { useRoles, useDeleteRole, useUpdateRole } from '@/features/roles/queries'
import { RoleModal } from './components/RoleModal'
import { PermissionMatrix } from './components/PermissionMatrix'
import { DeleteConfirmDialog } from '../users/components/DeleteConfirmDialog'

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 5 }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </td>
      ))}
    </tr>
  )
}

export function RolesPage() {
  const [page, setPage] = useState(1)
  const [modalOpen, setModalOpen] = useState(false)
  const [editRole, setEditRole] = useState<Role | null>(null)
  const [deleteRole, setDeleteRole] = useState<Role | null>(null)
  const [permRole, setPermRole] = useState<Role | null>(null)

  const { data, isLoading } = useRoles(page, 10)
  const deleteMutation = useDeleteRole()
  const updateRole = useUpdateRole()

  const roles: Role[] = data?.data ?? []
  const meta = data?.meta

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Roles</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage roles and their permissions</p>
          </div>
          <button
            onClick={() => { setEditRole(null); setModalOpen(true) }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            Create Role
          </button>
        </div>

        {/* Permission Matrix Panel */}
        {permRole && (
          <div className="bg-white dark:bg-gray-900 rounded-xl border border-indigo-200 dark:border-indigo-800 p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Permission Matrix</h2>
              <button
                onClick={() => setPermRole(null)}
                className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Close
              </button>
            </div>
            <PermissionMatrix roleId={permRole.id} roleName={permRole.name} />
          </div>
        )}

        {/* Table */}
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Slug</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Description</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  : roles.map((role) => (
                      <tr key={role.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-gray-900 dark:text-white">{role.name}</span>
                            {role.is_system && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400">
                                <Shield className="h-3 w-3" />
                                system
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <code className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded">
                            {role.slug}
                          </code>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          {role.description ?? '—'}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() =>
                              !role.is_system &&
                              updateRole.mutate({ id: role.id, is_active: !role.is_active })
                            }
                            disabled={role.is_system}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              role.is_active ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'
                            } ${role.is_system ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
                                role.is_active ? 'translate-x-4' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => setPermRole(role)}
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-indigo-600 transition-colors"
                              title="Manage permissions"
                            >
                              <Settings className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => { setEditRole(role); setModalOpen(true) }}
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-indigo-600 transition-colors"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => !role.is_system && setDeleteRole(role)}
                              disabled={role.is_system}
                              className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 hover:text-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                              title={role.is_system ? 'System roles cannot be deleted' : 'Delete'}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                {!isLoading && roles.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-12 text-center text-gray-400">No roles found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100 dark:border-gray-800">
              <p className="text-xs text-gray-500">
                Page {meta.page} of {meta.total_pages} — {meta.total} total
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}
                  disabled={page >= meta.total_pages}
                  className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

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
