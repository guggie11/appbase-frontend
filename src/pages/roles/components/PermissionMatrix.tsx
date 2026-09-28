import { useState } from 'react'
import { Loader2, Save } from 'lucide-react'
import type { Permission } from '@/shared/api/types'
import { useRolePermissions, usePermissions, useUpdateRolePermissions } from '@/features/roles/queries'

interface PermissionMatrixProps {
  roleId: string
  roleName: string
}

function groupByModule(permissions: Permission[]) {
  const map: Record<string, Permission[]> = {}
  for (const p of permissions) {
    if (!map[p.module]) map[p.module] = []
    map[p.module].push(p)
  }
  return map
}

export function PermissionMatrix({ roleId, roleName }: PermissionMatrixProps) {
  const { data: allPermissions = [], isLoading: loadingAll } = usePermissions()
  const { data: rolePermissions = [], isLoading: loadingRole } = useRolePermissions(roleId)
  const updateMutation = useUpdateRolePermissions()

  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [initialized, setInitialized] = useState(false)

  // Initialize from fetched data
  if (!initialized && !loadingRole && rolePermissions.length >= 0) {
    setSelected(new Set(rolePermissions.map((p) => p.id)))
    setInitialized(true)
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const handleSave = () => {
    updateMutation.mutate({ roleId, permission_ids: Array.from(selected) })
  }

  const grouped = groupByModule(allPermissions)

  if (loadingAll || loadingRole) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#D94F3D]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">
          Permissions for <span className="text-[#D94F3D]">{roleName}</span>
        </h3>
        <button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-lg bg-[#D94F3D] text-white hover:bg-[#C0392B] disabled:opacity-60 transition-colors"
        >
          {updateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Save
        </button>
      </div>

      {Object.entries(grouped).map(([module, perms]) => (
        <div key={module} className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {module}
            </h4>
          </div>
          <div className="divide-y divide-gray-50">
            {perms.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={selected.has(p.id)}
                  onChange={() => toggle(p.id)}
                  className="h-4 w-4 rounded border-gray-300 text-[#D94F3D] focus:ring-[#D94F3D]"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-sm text-gray-700">{p.name}</span>
                  <span className="ml-2 text-xs text-gray-400">{p.slug}</span>
                </div>
                <span className="text-xs text-gray-400 capitalize">{p.action}</span>
              </label>
            ))}
          </div>
        </div>
      ))}

      {allPermissions.length === 0 && (
        <p className="text-sm text-gray-400 text-center py-6">No permissions found</p>
      )}

      {updateMutation.isSuccess && (
        <p className="text-xs text-green-600">Permissions saved successfully!</p>
      )}
    </div>
  )
}
