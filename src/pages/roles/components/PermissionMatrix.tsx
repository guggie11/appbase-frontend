import { useMemo, useState } from 'react'
import { AlertTriangle, Loader2, Lock, Save } from 'lucide-react'

import type { Role } from '@/shared/api/types'
import {
  usePermissionMatrix,
  usePermissions,
  useRolePermissions,
  useUpdateRolePermissions,
} from '@/features/roles/queries'
import { isRoleLocked } from '../model'
import { diffSelection } from '../matrix'
import { PermissionGrid } from './PermissionGrid'

interface PermissionMatrixProps {
  roleId: string
  role?: Role
}

export function PermissionMatrix({ roleId, role }: PermissionMatrixProps) {
  const { data: matrix, isLoading: loadingMatrix } = usePermissionMatrix()
  const { data: allPermissions = [] } = usePermissions()
  const { data: rolePermissions = [], isLoading: loadingRole } = useRolePermissions(roleId)
  const updateMutation = useUpdateRolePermissions()

  // The grid speaks slugs; the save endpoint speaks ids.
  const idBySlug = useMemo(() => {
    const map = new Map<string, string>()
    allPermissions.forEach((p) => map.set(p.slug, p.id))
    return map
  }, [allPermissions])

  const originalSlugs = useMemo(
    () => new Set(rolePermissions.map((p) => p.slug)),
    [rolePermissions],
  )

  const [draft, setDraft] = useState<Set<string> | null>(null)
  const [loadedFor, setLoadedFor] = useState<string | null>(null)

  // Reset the draft when the selected role changes, otherwise one role's
  // edits would carry over onto another.
  if (!loadingRole && loadedFor !== roleId) {
    setDraft(new Set(originalSlugs))
    setLoadedFor(roleId)
  }

  const granted = draft ?? originalSlugs
  const locked = role ? isRoleLocked(role) : false
  const rows = matrix?.rows ?? []
  const diff = diffSelection(originalSlugs, granted)

  const handleSave = () => {
    // A slug with no id cannot be saved; dropping it silently would revoke a
    // permission the admin never touched, so keep it out of the diff instead.
    const ids = [...granted]
      .map((slug) => idBySlug.get(slug))
      .filter((id): id is string => Boolean(id))
    updateMutation.mutate(
      { roleId, permission_ids: ids },
      { onSuccess: () => setLoadedFor(null) },
    )
  }

  if (loadingMatrix || loadingRole) {
    return (
      <div className="flex items-center gap-2 py-10 text-[13px] text-[#6c6e70]">
        <Loader2 size={15} className="animate-spin" />
        Loading permissions…
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {locked && (
        <div className="flex items-start gap-2.5 rounded-[12px] border border-[#e2e3e3] bg-[#f7f7f8] px-4 py-3">
          <Lock size={15} className="mt-0.5 shrink-0 text-[#6c6e70]" aria-hidden="true" />
          <div>
            <p className="text-[13px] font-medium text-[#1b1c1e]">
              This is a platform role
            </p>
            <p className="mt-0.5 text-[12px] text-[#6c6e70]">
              Its permissions are fixed so the workspace cannot be locked out of
              its own administration. Duplicate it to make an editable copy.
            </p>
          </div>
        </div>
      )}

      <PermissionGrid
        rows={rows}
        granted={granted}
        onChange={setDraft}
        locked={locked}
        roleName={role?.name}
      />

      {!locked && (
        <div className="flex items-center justify-between rounded-[12px] border border-[#e2e3e3] bg-white px-4 py-3">
          <p className="text-[12px] text-[#6c6e70]">
            {diff.dirty ? (
              <>
                <span className="font-medium text-[#1b1c1e]">Unsaved changes</span>
                {' — '}
                {diff.added.length > 0 && `${diff.added.length} added`}
                {diff.added.length > 0 && diff.removed.length > 0 && ', '}
                {diff.removed.length > 0 && `${diff.removed.length} removed`}
              </>
            ) : (
              'No changes to save'
            )}
          </p>

          <div className="flex items-center gap-2">
            {diff.dirty && (
              <button
                type="button"
                onClick={() => setDraft(new Set(originalSlugs))}
                className="rounded-[10px] border border-[#e2e3e3] bg-transparent px-3 py-1.5 text-[13px] text-[#44474a] transition hover:bg-[#f4f4f4]"
              >
                Discard
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={!diff.dirty || updateMutation.isPending}
              className="btn-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {updateMutation.isPending ? (
                <Loader2 size={14} className="animate-spin" aria-hidden="true" />
              ) : (
                <Save size={14} aria-hidden="true" />
              )}
              Save
            </button>
          </div>
        </div>
      )}

      {updateMutation.isError && (
        <div className="flex items-center gap-2 rounded-[12px] border border-[#f0d4cd] bg-[#fdf3f1] px-4 py-3 text-[12px] text-[#9c3620]">
          <AlertTriangle size={14} aria-hidden="true" />
          Could not save permissions. Nothing was changed.
        </div>
      )}
    </div>
  )
}
