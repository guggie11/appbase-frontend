import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronRight, ChevronDown, ToggleLeft, ToggleRight } from 'lucide-react'
import { useMenus, useDeleteMenu, useUpdateMenu } from '@/features/menus/queries'
import { useRoles } from '@/features/roles/queries'
import { MenuModal } from './components/MenuModal'
import type { Menu } from '@/shared/api/types'

// ── Tree builder ───────────────────────────────────────────────────────────

interface MenuNode extends Menu {
  children: MenuNode[]
}

function buildTree(menus: Menu[]): MenuNode[] {
  const map = new Map<string, MenuNode>()
  const roots: MenuNode[] = []

  // Create nodes
  menus.forEach((m) => map.set(m.id, { ...m, children: [] }))

  // Link children
  menus.forEach((m) => {
    const node = map.get(m.id)!
    if (m.parent_id && map.has(m.parent_id)) {
      map.get(m.parent_id)!.children.push(node)
    } else {
      roots.push(node)
    }
  })

  // Sort by order_index
  const sort = (nodes: MenuNode[]) => {
    nodes.sort((a, b) => a.order_index - b.order_index)
    nodes.forEach((n) => sort(n.children))
  }
  sort(roots)

  return roots
}

// ── Tree Row ───────────────────────────────────────────────────────────────

interface TreeRowProps {
  node: MenuNode
  depth: number
  allMenus: Menu[]
  allRoles: import('@/shared/api/types').Role[]
  onEdit: (m: Menu) => void
  onDelete: (id: string, label: string) => void
  onToggleActive: (m: Menu) => void
  dragTarget: string | null
  setDragTarget: (id: string | null) => void
  onDrop: (dragId: string, targetId: string) => void
}

function TreeRow({
  node,
  depth,
  allMenus,
  allRoles,
  onEdit,
  onDelete,
  onToggleActive,
  dragTarget,
  setDragTarget,
  onDrop,
}: TreeRowProps) {
  const [open, setOpen] = useState(true)
  const hasChildren = node.children.length > 0
  const isDragOver = dragTarget === node.id

  return (
    <>
      <tr
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', node.id)}
        onDragOver={(e) => { e.preventDefault(); setDragTarget(node.id) }}
        onDragLeave={() => setDragTarget(null)}
        onDrop={(e) => {
          e.preventDefault()
          const dragId = e.dataTransfer.getData('text/plain')
          if (dragId !== node.id) onDrop(dragId, node.id)
          setDragTarget(null)
        }}
        className={[
          'border-b border-slate-100 hover:bg-slate-50 transition-colors cursor-grab',
          isDragOver ? 'bg-indigo-50' : '',
        ].join(' ')}
      >
        {/* Label + expand */}
        <td className="px-4 py-3">
          <div
            className="flex items-center gap-2"
            style={{ paddingLeft: `${depth * 20}px` }}
          >
            {hasChildren ? (
              <button
                onClick={() => setOpen((o) => !o)}
                className="text-slate-400 hover:text-slate-700"
              >
                {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
              </button>
            ) : (
              <span className="w-[14px]" />
            )}
            <span className="font-medium text-slate-800">{node.label}</span>
          </div>
        </td>

        {/* Icon */}
        <td className="px-4 py-3 text-sm text-slate-500">{node.icon ?? '—'}</td>

        {/* Path */}
        <td className="px-4 py-3 text-sm text-slate-500 font-mono">{node.path ?? '—'}</td>

        {/* Parent */}
        <td className="px-4 py-3 text-sm text-slate-500">
          {node.parent_id
            ? allMenus.find((m) => m.id === node.parent_id)?.label ?? '—'
            : '—'}
        </td>

        {/* Status */}
        <td className="px-4 py-3">
          <span
            className={[
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              node.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-slate-100 text-slate-500',
            ].join(' ')}
          >
            {node.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>

        {/* Roles */}
        <td className="px-4 py-3">
          <div className="flex flex-wrap gap-1">
            {node.roles.length === 0 ? (
              <span className="text-xs text-slate-400">All</span>
            ) : (
              node.roles.map((r) => (
                <span
                  key={r.id}
                  className="rounded-full bg-indigo-100 text-indigo-700 px-2 py-0.5 text-xs"
                >
                  {r.name}
                </span>
              ))
            )}
          </div>
        </td>

        {/* Actions */}
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleActive(node)}
              title={node.is_active ? 'Deactivate' : 'Activate'}
              className="text-slate-400 hover:text-indigo-600 transition-colors"
            >
              {node.is_active ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
            </button>
            <button
              onClick={() => onEdit(node)}
              title="Edit"
              className="text-slate-400 hover:text-blue-600 transition-colors"
            >
              <Pencil size={15} />
            </button>
            <button
              onClick={() => onDelete(node.id, node.label)}
              title="Delete"
              className="text-slate-400 hover:text-red-600 transition-colors"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </td>
      </tr>

      {/* Children (accordion) */}
      {open &&
        hasChildren &&
        node.children.map((child) => (
          <TreeRow
            key={child.id}
            node={child}
            depth={depth + 1}
            allMenus={allMenus}
            allRoles={allRoles}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleActive={onToggleActive}
            dragTarget={dragTarget}
            setDragTarget={setDragTarget}
            onDrop={onDrop}
          />
        ))}
    </>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────

export function MenusPage() {
  const { data: menus = [], isLoading } = useMenus()
  const { data: rolesRes } = useRoles(1, 100)
  const deleteMenu = useDeleteMenu()
  const updateMenu = useUpdateMenu()

  const [modalOpen, setModalOpen] = useState(false)
  const [editMenu, setEditMenu] = useState<Menu | null>(null)
  const [dragTarget, setDragTarget] = useState<string | null>(null)

  const roles = rolesRes?.data ?? []
  const tree = buildTree(menus)

  function openCreate() {
    setEditMenu(null)
    setModalOpen(true)
  }

  function openEdit(m: Menu) {
    setEditMenu(m)
    setModalOpen(true)
  }

  async function handleDelete(id: string, label: string) {
    if (!confirm(`Delete menu "${label}"? This cannot be undone.`)) return
    await deleteMenu.mutateAsync(id)
  }

  async function handleToggleActive(m: Menu) {
    await updateMenu.mutateAsync({ id: m.id, label: m.label, is_active: !m.is_active })
  }

  async function handleDrop(dragId: string, targetId: string) {
    // Swap order_index between dragged and target
    const dragged = menus.find((m) => m.id === dragId)
    const target = menus.find((m) => m.id === targetId)
    if (!dragged || !target) return
    await updateMenu.mutateAsync({ id: dragId, label: dragged.label, order_index: target.order_index })
    await updateMenu.mutateAsync({ id: targetId, label: target.label, order_index: dragged.order_index })
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Menu Management</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage navigation menus and their role assignments
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
        >
          <Plus size={16} />
          Create Menu
        </button>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-white shadow-sm overflow-x-auto">
        {isLoading ? (
          <div className="p-8 text-center text-slate-400">Loading menus…</div>
        ) : menus.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No menus yet.{' '}
            <button onClick={openCreate} className="text-indigo-600 hover:underline">
              Create the first one
            </button>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-slate-50 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                <th className="px-4 py-3 text-left">Label</th>
                <th className="px-4 py-3 text-left">Icon</th>
                <th className="px-4 py-3 text-left">Path</th>
                <th className="px-4 py-3 text-left">Parent</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-left">Roles</th>
                <th className="px-4 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {tree.map((node) => (
                <TreeRow
                  key={node.id}
                  node={node}
                  depth={0}
                  allMenus={menus}
                  allRoles={roles}
                  onEdit={openEdit}
                  onDelete={handleDelete}
                  onToggleActive={handleToggleActive}
                  dragTarget={dragTarget}
                  setDragTarget={setDragTarget}
                  onDrop={handleDrop}
                />
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      <MenuModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        editMenu={editMenu}
        menus={menus}
        roles={roles}
      />
    </div>
  )
}
