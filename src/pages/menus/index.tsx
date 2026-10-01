import { useState } from 'react'
import { Plus, Pencil, Trash2, ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'
import type { Menu } from '@/shared/api/types'
import { useMenus, useDeleteMenu, useUpdateMenu, useUpdateMenuOrder } from '@/features/menus/queries'
import { useRoles } from '@/features/roles/queries'
import { MenuModal } from './components/MenuModal'

// ── Table styles ────────────────────────────────────────────────────────────

const tableContainerStyle: React.CSSProperties = {
  background: 'white',
  border: '1px solid #E5E7EB',
  borderRadius: 8,
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontSize: 11,
  fontWeight: 600,
  color: '#6B7280',
  textTransform: 'uppercase',
  letterSpacing: '0.06em',
  background: '#F9FAFB',
  borderBottom: '1px solid #E5E7EB',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 14,
  color: '#374151',
  borderBottom: '1px solid #F3F4F6',
}

// ── Page ────────────────────────────────────────────────────────────────────

export function MenusPage() {
  const { data: menus = [], isLoading } = useMenus()
  const { data: rolesRes } = useRoles(1, 100)
  const deleteMenu = useDeleteMenu()
  const updateMenu = useUpdateMenu()
  const updateMenuOrder = useUpdateMenuOrder()

  const [modalOpen, setModalOpen] = useState(false)
  const [editMenu, setEditMenu] = useState<Menu | null>(null)
  const [page, setPage] = useState(1)
  const [draggedId, setDraggedId] = useState<string | null>(null)

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

  async function handleReorder(dragId: string, dropId: string) {
    if (dragId === dropId) return
    const dragged = menus.find((m) => m.id === dragId)
    const target = menus.find((m) => m.id === dropId)
    if (!dragged || !target) return
    await updateMenuOrder.mutateAsync({ id: dragId, order_index: target.order_index })
    await updateMenuOrder.mutateAsync({ id: dropId, order_index: dragged.order_index })
  }

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

      {/* Table */}
      <div style={tableContainerStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 36, padding: '10px 8px' }}></th>
                <th style={thStyle}>Label</th>
                <th style={thStyle}>Icon</th>
                <th style={thStyle}>Path</th>
                <th style={thStyle}>Parent</th>
                <th style={thStyle}>Status</th>
                <th style={thStyle}>Roles</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    {Array.from({ length: 8 }).map((__, j) => (
                      <td key={j} style={tdStyle}>
                        <div style={{ height: 14, background: '#F3F4F6', borderRadius: 4, animation: 'pulse 2s infinite' }} />
                      </td>
                    ))}
                  </tr>
                ))
              ) : pagedMenus.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...tdStyle, padding: '48px 16px', textAlign: 'center', color: '#9CA3AF' }}>
                    No menus found
                  </td>
                </tr>
              ) : (
                pagedMenus.map((menu) => {
                  const parentLabel = menu.parent_id
                    ? menus.find((m) => m.id === menu.parent_id)?.label
                    : null
                  const menuRoles = menu.roles ?? []
                  const isDraggingOver = draggedId !== null && draggedId !== menu.id

                  return (
                    <tr
                      key={menu.id}
                      style={{
                        transition: 'background 100ms',
                        background: isDraggingOver ? '#F0FDF4' : undefined,
                        outline: isDraggingOver ? '2px dashed #10B981' : undefined,
                        outlineOffset: -2,
                      }}
                      onDragOver={(e) => { e.preventDefault() }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const fromId = e.dataTransfer.getData('text/plain')
                        if (fromId) handleReorder(fromId, menu.id)
                        setDraggedId(null)
                      }}
                      onMouseEnter={(e) => {
                        if (!draggedId) (e.currentTarget as HTMLElement).style.background = '#F9FAFB'
                      }}
                      onMouseLeave={(e) => {
                        if (!draggedId) (e.currentTarget as HTMLElement).style.background = ''
                      }}
                    >
                      {/* Drag handle */}
                      <td style={{ ...tdStyle, padding: '12px 8px', width: 36 }}>
                        <div
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', menu.id)
                            setDraggedId(menu.id)
                          }}
                          onDragEnd={() => setDraggedId(null)}
                          style={{ cursor: 'grab', color: '#D1D5DB', padding: '0 4px', display: 'flex', alignItems: 'center' }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#6B7280' }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#D1D5DB' }}
                        >
                          <GripVertical size={16} />
                        </div>
                      </td>

                      {/* Label */}
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 500, color: '#1A1A1A' }}>
                          {parentLabel ? '↳ ' : ''}{menu.label}
                        </span>
                      </td>

                      {/* Icon */}
                      <td style={tdStyle}>
                        <code style={{ fontSize: 12, color: '#6B7280', background: '#F9FAFB', padding: '2px 6px', borderRadius: 4, border: '1px solid #E5E7EB' }}>
                          {menu.icon ?? '—'}
                        </code>
                      </td>

                      {/* Path */}
                      <td style={tdStyle}>
                        <code style={{ fontSize: 12, color: '#6B7280', background: '#F9FAFB', padding: '2px 6px', borderRadius: 4, border: '1px solid #E5E7EB' }}>
                          {menu.path ?? '—'}
                        </code>
                      </td>

                      {/* Parent */}
                      <td style={tdStyle}>
                        {menu.parent_id
                          ? <span style={{ color: '#6B7280', fontSize: 13 }}>{parentLabel ?? '—'}</span>
                          : <span style={{ color: '#9CA3AF' }}>—</span>
                        }
                      </td>

                      {/* Status toggle */}
                      <td style={tdStyle}>
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
                      </td>

                      {/* Roles */}
                      <td style={tdStyle}>
                        {menuRoles.length === 0 ? (
                          <span style={{ fontSize: 12, color: '#9CA3AF' }}>All</span>
                        ) : (
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
                                  color: '#d8452a',
                                }}
                              >
                                {r.name}
                              </span>
                            ))}
                          </div>
                        )}
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => openEdit(menu)}
                            title="Edit"
                            style={{ padding: 6, borderRadius: 6, border: 'none', background: 'transparent', cursor: 'pointer', color: '#9CA3AF', display: 'flex', transition: 'color 150ms, background 150ms' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = '#F3F4F6'; (e.currentTarget as HTMLElement).style.color = '#d8452a' }}
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
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

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
