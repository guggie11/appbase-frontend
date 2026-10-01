import { useState, useRef, useMemo } from 'react'
import { Plus, Pencil, Trash2, GripVertical, ChevronUp, ChevronDown, Check, AlertCircle, X } from 'lucide-react'
import type { Menu } from '@/shared/api/types'
import { useMenus, useDeleteMenu, useUpdateMenu, useReorderMenus } from '@/features/menus/queries'
import { useRoles } from '@/features/roles/queries'
import { MenuModal } from './components/MenuModal'
import { buildDisplayRows, planReorder } from './ordering'

// ── Table styles ────────────────────────────────────────────────────────────

const tableContainerStyle: React.CSSProperties = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border-light)',
  borderRadius: 14,
  overflow: 'hidden',
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

const thStyle: React.CSSProperties = {
  padding: '10px 16px',
  textAlign: 'left',
  fontFamily: "'Geist Mono', monospace",
  fontSize: 11,
  fontWeight: 500,
  color: 'var(--color-text-meta)',
  textTransform: 'uppercase',
  letterSpacing: '0.08em',
  background: 'var(--color-card-alt)',
  borderBottom: '1px solid var(--color-border)',
  whiteSpace: 'nowrap',
}

const tdStyle: React.CSSProperties = {
  padding: '12px 16px',
  fontSize: 13,
  color: 'var(--color-text-secondary)',
  borderBottom: '1px solid var(--color-border-light)',
}

// ── Page ────────────────────────────────────────────────────────────────────

export function MenusPage() {
  const { data: menus = [], isLoading } = useMenus()
  const { data: rolesRes } = useRoles(1, 100)
  const deleteMenu = useDeleteMenu()
  const updateMenu = useUpdateMenu()
  const reorderMenus = useReorderMenus()

  const [modalOpen, setModalOpen] = useState(false)
  const [editMenu, setEditMenu] = useState<Menu | null>(null)
  const dragIdRef = useRef<string | null>(null)
  const [dragOverId, setDragOverId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null)

  const roles = rolesRes?.data ?? []
  // Reordering needs the whole sibling group, so the table is never paginated.
  const rows = useMemo(() => buildDisplayRows(menus), [menus])
  const isSaving = reorderMenus.isPending

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
    const plan = planReorder(menus, dragId, dropId)
    if (!plan.ok) {
      if (plan.reason === 'cross-parent') {
        setNotice({
          kind: 'error',
          text: 'Dragging only reorders menus within the same parent. To change the parent, use Edit → Parent Menu.',
        })
      }
      return
    }
    setNotice(null)
    try {
      await reorderMenus.mutateAsync({ parent_id: plan.parentId, menu_ids: plan.menuIds })
      setNotice({ kind: 'success', text: 'Menu order saved.' })
    } catch {
      setNotice({ kind: 'error', text: 'Could not save the menu order. Please try again.' })
    }
  }

  /** Keyboard/touch-accessible alternative to dragging. */
  async function moveBy(menu: Menu, direction: -1 | 1) {
    const siblings = menus
      .filter((m) => (m.parent_id ?? null) === (menu.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index || a.id.localeCompare(b.id))
    const index = siblings.findIndex((m) => m.id === menu.id)
    const target = siblings[index + direction]
    if (!target) return
    await handleReorder(menu.id, target.id)
  }

  /** True when the menu already sits at the edge of its sibling group. */
  function isAtEdge(menu: Menu, direction: -1 | 1): boolean {
    const siblings = menus
      .filter((m) => (m.parent_id ?? null) === (menu.parent_id ?? null))
      .sort((a, b) => a.order_index - b.order_index || a.id.localeCompare(b.id))
    const index = siblings.findIndex((m) => m.id === menu.id)
    return siblings[index + direction] === undefined
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--color-text-primary)', marginBottom: 2 }}>Menu Management</h1>
          <p style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>Manage navigation menus and their role assignments</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary"
        >
          <Plus size={14} />
          Create Menu
        </button>
      </div>

      {/* Save status */}
      {(notice || isSaving) && (
        <div
          role="status"
          data-testid="menu-reorder-status"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 14px',
            borderRadius: 10,
            fontSize: 13,
            border: '1px solid',
            borderColor: notice?.kind === 'error'
              ? '#f5cec5'
              : notice?.kind === 'success' ? '#cbe5d8' : 'var(--color-border-light)',
            background: notice?.kind === 'error'
              ? 'var(--color-primary-light)'
              : notice?.kind === 'success' ? 'var(--color-success-bg)' : 'var(--color-card-alt)',
            color: notice?.kind === 'error'
              ? 'var(--color-primary)'
              : notice?.kind === 'success' ? '#1f7d52' : 'var(--color-text-secondary)',
          }}
        >
          {!isSaving && notice?.kind === 'success' && <Check size={14} style={{ flexShrink: 0 }} />}
          {!isSaving && notice?.kind === 'error' && <AlertCircle size={14} style={{ flexShrink: 0 }} />}
          <span style={{ flex: 1 }}>{isSaving ? 'Saving order…' : notice?.text}</span>
          {!isSaving && notice && (
            <button
              type="button"
              aria-label="Dismiss message"
              onClick={() => setNotice(null)}
              style={{
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'inherit',
                opacity: 0.7,
                display: 'flex',
                padding: 2,
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      )}

      {/* Table */}
      <div style={tableContainerStyle}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '100%' }}>
            <thead>
              <tr>
                <th style={{ ...thStyle, width: 76, padding: '10px 8px' }} scope="col">
                  <span className="sr-only">Order</span>
                </th>
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
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ ...tdStyle, padding: '48px 16px', textAlign: 'center', color: '#9CA3AF' }}>
                    No menus found
                  </td>
                </tr>
              ) : (
                rows.map(({ menu, depth }) => {
                  const parentLabel = menu.parent_id
                    ? menus.find((m) => m.id === menu.parent_id)?.label
                    : null
                  const menuRoles = menu.roles ?? []
                  const isDraggingOver = dragOverId === menu.id

                  return (
                    <tr
                      key={menu.id}
                      data-menu-id={menu.id}
                      style={{
                        transition: 'background 100ms',
                        background: isDraggingOver ? 'var(--color-primary-light)' : undefined,
                        outline: isDraggingOver ? '2px dashed var(--color-primary)' : undefined,
                        outlineOffset: -2,
                      }}
                      onDragOver={(e) => { e.preventDefault(); if (dragOverId !== menu.id) setDragOverId(menu.id) }}
                      onDragLeave={(e) => {
                        // Hanya clear jika benar-benar keluar dari row (bukan masuk ke child)
                        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOverId(null)
                      }}
                      onDrop={(e) => {
                        e.preventDefault()
                        const fromId = dragIdRef.current
                        setDragOverId(null)
                        dragIdRef.current = null
                        if (fromId && fromId !== menu.id) handleReorder(fromId, menu.id)
                      }}
                      onMouseEnter={(e) => {
                        if (!dragOverId) (e.currentTarget as HTMLElement).style.background = 'rgba(0,0,0,0.02)'
                      }}
                      onMouseLeave={(e) => {
                        if (!dragOverId) (e.currentTarget as HTMLElement).style.background = ''
                      }}
                    >
                      {/* Drag handle */}
                      <td style={{ ...tdStyle, padding: '12px 8px', width: 76 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <button
                            type="button"
                            draggable
                            aria-label={`Reorder ${menu.label}`}
                            data-testid="menu-drag-handle"
                            disabled={isSaving}
                            onDragStart={(e) => {
                              dragIdRef.current = menu.id
                              e.dataTransfer.effectAllowed = 'move'
                              e.dataTransfer.setData('text/plain', menu.id)
                            }}
                            onDragEnd={() => { dragIdRef.current = null; setDragOverId(null) }}
                            onPointerDown={(e) => {
                              // Pointer-driven drag so touch devices work too.
                              if (e.pointerType === 'mouse' && e.button !== 0) return
                              dragIdRef.current = menu.id
                            }}
                            onPointerMove={(e) => {
                              if (dragIdRef.current !== menu.id) return
                              const over = document
                                .elementFromPoint(e.clientX, e.clientY)
                                ?.closest('tr[data-menu-id]') as HTMLElement | null
                              setDragOverId(over?.dataset.menuId ?? null)
                            }}
                            onPointerUp={(e) => {
                              const fromId = dragIdRef.current
                              dragIdRef.current = null
                              const over = document
                                .elementFromPoint(e.clientX, e.clientY)
                                ?.closest('tr[data-menu-id]') as HTMLElement | null
                              const dropId = over?.dataset.menuId
                              setDragOverId(null)
                              if (fromId && dropId && fromId !== dropId) handleReorder(fromId, dropId)
                            }}
                            style={{
                              cursor: isSaving ? 'progress' : 'grab',
                              color: '#D1D5DB',
                              padding: '0 2px',
                              display: 'flex',
                              alignItems: 'center',
                              background: 'transparent',
                              border: 'none',
                              touchAction: 'none',
                            }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = '#6B7280' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = '#D1D5DB' }}
                          >
                            <GripVertical size={16} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${menu.label} up`}
                            disabled={isSaving || isAtEdge(menu, -1)}
                            onClick={() => moveBy(menu, -1)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: isSaving || isAtEdge(menu, -1) ? 'not-allowed' : 'pointer',
                              opacity: isAtEdge(menu, -1) ? 0.3 : 1,
                              color: 'var(--color-text-placeholder)',
                              display: 'flex',
                              padding: 3,
                              borderRadius: 6,
                            }}
                          >
                            <ChevronUp size={13} />
                          </button>
                          <button
                            type="button"
                            aria-label={`Move ${menu.label} down`}
                            disabled={isSaving || isAtEdge(menu, 1)}
                            onClick={() => moveBy(menu, 1)}
                            style={{
                              border: 'none',
                              background: 'transparent',
                              cursor: isSaving || isAtEdge(menu, 1) ? 'not-allowed' : 'pointer',
                              opacity: isAtEdge(menu, 1) ? 0.3 : 1,
                              color: 'var(--color-text-placeholder)',
                              display: 'flex',
                              padding: 3,
                              borderRadius: 6,
                            }}
                          >
                            <ChevronDown size={13} />
                          </button>
                        </div>
                      </td>

                      {/* Label */}
                      <td style={tdStyle}>
                        <span style={{ fontWeight: 500, color: '#1A1A1A', paddingLeft: depth * 20 }}>
                          {depth > 0 ? '↳ ' : ''}{menu.label}
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
                                  background: 'var(--color-primary-light)',
                                  color: 'var(--color-primary)',
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
                            aria-label={`Edit ${menu.label}`}
                            style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', transition: 'color 150ms, background 150ms' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-card-alt)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-primary)' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => handleDelete(menu.id, menu.label)}
                            title="Delete"
                            aria-label={`Delete ${menu.label}`}
                            style={{ padding: 6, borderRadius: 8, border: 'none', background: 'transparent', cursor: 'pointer', color: 'var(--color-text-muted)', display: 'flex', transition: 'color 150ms, background 150ms' }}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--color-primary-light)'; (e.currentTarget as HTMLElement).style.color = 'var(--color-primary)' }}
                            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; (e.currentTarget as HTMLElement).style.color = 'var(--color-text-muted)' }}
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

      <p style={{ fontSize: 12, color: '#9CA3AF', padding: '0 4px' }}>
        {menus.length} menus — drag the handle or use the arrow buttons to reorder.
      </p>

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
