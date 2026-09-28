import { useState, useMemo } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Menu } from '@/shared/api/types'
import { useMenus, useDeleteMenu, useUpdateMenu } from '@/features/menus/queries'
import { useRoles } from '@/features/roles/queries'
import { MenuModal } from './components/MenuModal'
import { DataTable } from '@/shared/ui/DataTable'

export function MenusPage() {
  const { data: menus = [], isLoading } = useMenus()
  const { data: rolesRes } = useRoles(1, 100)
  const deleteMenu = useDeleteMenu()
  const updateMenu = useUpdateMenu()

  const [modalOpen, setModalOpen] = useState(false)
  const [editMenu, setEditMenu] = useState<Menu | null>(null)
  const [page, setPage] = useState(1)

  const roles = rolesRes?.data ?? []
  const PAGE_SIZE = 20
  const totalPages = Math.max(1, Math.ceil(menus.length / PAGE_SIZE))
  const pagedMenus = menus.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function openCreate() {
    setEditMenu(null)
    setModalOpen(true)
  }

  function openEdit(m: Menu) {
    setEditMenu(m)
    setModalOpen(true)
  }

  async function handleDelete(id: string, label: string) {
    if (!window.confirm(`Delete menu "${label}"? This cannot be undone.`)) return
    await deleteMenu.mutateAsync(id)
  }

  async function handleToggleActive(m: Menu) {
    await updateMenu.mutateAsync({ id: m.id, label: m.label, is_active: !m.is_active })
  }

  const columns = useMemo<ColumnDef<Menu, unknown>[]>(
    () => [
      {
        id: 'label',
        header: 'Label',
        cell: ({ row }) => {
          const menu = row.original
          const parentLabel = menu.parent_id
            ? menus.find((m) => m.id === menu.parent_id)?.label
            : null
          return (
            <span style={{ fontWeight: 500, color: '#1A1A1A' }}>
              {parentLabel ? '↳ ' : ''}{menu.label}
            </span>
          )
        },
      },
      {
        id: 'icon',
        header: 'Icon',
        cell: ({ row }) => (
          <code style={{ fontSize: 12, color: '#6B7280', background: '#F9FAFB', padding: '2px 6px', borderRadius: 4, border: '1px solid #E5E7EB' }}>
            {row.original.icon ?? '—'}
          </code>
        ),
      },
      {
        id: 'path',
        header: 'Path',
        cell: ({ row }) => (
          <code style={{ fontSize: 12, color: '#6B7280', background: '#F9FAFB', padding: '2px 6px', borderRadius: 4, border: '1px solid #E5E7EB' }}>
            {row.original.path ?? '—'}
          </code>
        ),
      },
      {
        id: 'parent',
        header: 'Parent',
        cell: ({ row }) => {
          const menu = row.original
          if (!menu.parent_id) return <span style={{ color: '#9CA3AF' }}>—</span>
          const parentLabel = menus.find((m) => m.id === menu.parent_id)?.label ?? '—'
          return <span style={{ color: '#6B7280', fontSize: 13 }}>{parentLabel}</span>
        },
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => {
          const menu = row.original
          return (
            <button
              onClick={() => handleToggleActive(menu)}
              title={menu.is_active ? 'Deactivate' : 'Activate'}
              style={{
                position: 'relative',
                width: 36,
                height: 20,
                borderRadius: 9999,
                border: 'none',
                background: menu.is_active ? '#10B981' : '#E5E7EB',
                cursor: 'pointer',
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
                  transform: menu.is_active ? 'translateX(18px)' : 'translateX(3px)',
                  transition: 'transform 150ms',
                }}
              />
            </button>
          )
        },
      },
      {
        id: 'roles',
        header: 'Roles',
        cell: ({ row }) => {
          const menuRoles = row.original.roles ?? []
          if (menuRoles.length === 0) {
            return <span style={{ fontSize: 12, color: '#9CA3AF' }}>All</span>
          }
          return (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {menuRoles.map((r) => (
                <span
                  key={r.id}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    padding: '2px 8px',
                    borderRadius: 9999,
                    fontSize: 11,
                    fontWeight: 500,
                    background: '#FFF5F3',
                    color: '#D94F3D',
                  }}
                >
                  {r.name}
                </span>
              ))}
            </div>
          )
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const menu = row.original
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <button
                onClick={() => openEdit(menu)}
                title="Edit"
                style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', display: 'flex', transition: 'color 150ms, background 150ms' }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#D94F3D' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#9CA3AF' }}
              >
                <Pencil size={14} />
              </button>
              <button
                onClick={() => handleDelete(menu.id, menu.label)}
                title="Delete"
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
    [menus, updateMenu],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>Menu Management</h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>Manage navigation menus and their role assignments</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary"
        >
          <Plus size={14} />
          Create Menu
        </button>
      </div>

      {/* DataTable */}
      <DataTable
        data={pagedMenus}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No menus found"
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <p style={{ fontSize: 12, color: '#9CA3AF' }}>
            Page {page} of {totalPages} — {menus.length} total
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
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              style={{ padding: 6, borderRadius: 6, border: '1px solid #E5E7EB', background: 'white', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1, display: 'flex' }}
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Modal */}
      <MenuModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditMenu(null) }}
        editMenu={editMenu}
        menus={menus}
        roles={roles}
      />
    </div>
  )
}
