import { useMemo, useState } from 'react'
import { Plus, Tags, Archive, RotateCcw, Pencil, Trash2, Lock } from 'lucide-react'
import type { Category, CategoryGroup } from '@/shared/api/types'
import {
  useCategoryGroups,
  useCategoryTree,
  useCreateGroup,
  useDeleteCategory,
  useDeleteGroup,
  useDeprecateCategory,
  useRestoreCategory,
} from '@/features/categories/queries'
import {
  buildCategoryTree,
  canRestore,
  countChildren,
  describeUsage,
  isDeprecated,
} from './tree'
import { CategoryModal } from './components/CategoryModal'
import { GroupModal } from './components/GroupModal'
import { DeprecateModal } from './components/DeprecateModal'

const cardStyle: React.CSSProperties = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border-light)',
  borderRadius: 14,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
}

const metaStyle: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: 11,
  color: 'var(--color-text-meta)',
  letterSpacing: '0.04em',
}

export function CategoriesPage() {
  const { data: groups = [], isLoading } = useCategoryGroups()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Falls back to the first group so the right pane is never blank when one
  // exists.
  const activeId = selectedId ?? groups[0]?.id ?? null
  const activeGroup = groups.find((g) => g.id === activeId) ?? null

  const { data: items = [] } = useCategoryTree(activeId)
  const rows = useMemo(() => buildCategoryTree(items), [items])

  const createGroup = useCreateGroup()
  const deleteGroup = useDeleteGroup()
  const deprecate = useDeprecateCategory()
  const restore = useRestoreCategory()
  const deleteCategory = useDeleteCategory()

  const [groupModal, setGroupModal] = useState(false)
  const [categoryModal, setCategoryModal] = useState<{
    open: boolean
    edit: Category | null
    parentId: string | null
  }>({ open: false, edit: null, parentId: null })
  const [deprecating, setDeprecating] = useState<Category | null>(null)
  const [error, setError] = useState<{ id: string; message: string } | null>(
    null,
  )

  const handleDelete = async (category: Category) => {
    setError(null)
    const children = countChildren(items, category.id)
    try {
      await deleteCategory.mutateAsync(category.id)
    } catch {
      // The database refuses while anything still references the row. Explain
      // it next to that row — a page-level banner leaves the user hunting.
      setError({
        id: category.id,
        message:
          describeUsage(category, children) ||
          `"${category.name}" is still referenced elsewhere, so it cannot be ` +
            'deleted. Deprecate it instead — existing references stay intact.',
      })
    }
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 600,
            color: 'var(--color-text)',
            margin: 0,
          }}
        >
          Categories
        </h1>
        <p
          style={{
            fontSize: 13,
            color: 'var(--color-text-secondary)',
            margin: '6px 0 0',
          }}
        >
          Reference data other features point at. Group them by theme, nest them
          as deeply as you need.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 20 }}>
        {/* ── Groups ─────────────────────────────────────────────────────── */}
        <div style={{ ...cardStyle, padding: 16, alignSelf: 'start' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 12,
            }}
          >
            <span style={metaStyle}>GROUPS</span>
            <button
              onClick={() => setGroupModal(true)}
              aria-label="Add group"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                padding: '4px 8px',
                fontSize: 12,
                border: '1px solid var(--color-border)',
                borderRadius: 8,
                background: 'var(--color-card)',
                color: 'var(--color-text-secondary)',
                cursor: 'pointer',
              }}
            >
              <Plus size={13} /> Add
            </button>
          </div>

          {isLoading ? (
            <p style={{ fontSize: 13, color: 'var(--color-text-meta)' }}>
              Loading…
            </p>
          ) : groups.length === 0 ? (
            <div style={{ padding: '20px 4px', textAlign: 'center' }}>
              <Tags
                size={22}
                style={{ color: 'var(--color-text-meta)', marginBottom: 8 }}
              />
              <p
                style={{
                  fontSize: 13,
                  color: 'var(--color-text-secondary)',
                  margin: 0,
                }}
              >
                No groups yet
              </p>
              <p
                style={{
                  fontSize: 12,
                  color: 'var(--color-text-meta)',
                  margin: '4px 0 0',
                }}
              >
                Create one for each kind of classification you need.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {groups.map((g: CategoryGroup) => {
                const active = g.id === activeId
                return (
                  <button
                    key={g.id}
                    onClick={() => setSelectedId(g.id)}
                    aria-current={active ? 'true' : undefined}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 8,
                      width: '100%',
                      padding: '9px 11px',
                      borderRadius: 10,
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      background: active ? 'var(--color-card-alt)' : 'transparent',
                      color: active
                        ? 'var(--color-text)'
                        : 'var(--color-text-secondary)',
                      fontSize: 13,
                      fontWeight: active ? 500 : 400,
                    }}
                  >
                    <span
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {g.name}
                      {g.is_system && (
                        <Lock
                          size={10}
                          style={{
                            marginLeft: 6,
                            color: 'var(--color-text-meta)',
                            verticalAlign: 'middle',
                          }}
                        />
                      )}
                    </span>
                    <span style={{ ...metaStyle, flexShrink: 0 }}>
                      {g.category_count}
                    </span>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Items ──────────────────────────────────────────────────────── */}
        <div style={{ ...cardStyle, overflow: 'hidden' }}>
          {!activeGroup ? (
            <div style={{ padding: 40, textAlign: 'center' }}>
              <p style={{ fontSize: 13, color: 'var(--color-text-meta)' }}>
                Select a group to see its items.
              </p>
            </div>
          ) : (
            <>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '14px 18px',
                  borderBottom: '1px solid var(--color-border-light)',
                  background: 'var(--color-card-alt)',
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--color-text)',
                    }}
                  >
                    {activeGroup.name}
                  </div>
                  <code style={metaStyle}>{activeGroup.code}</code>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() =>
                      setCategoryModal({ open: true, edit: null, parentId: null })
                    }
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 5,
                      padding: '7px 13px',
                      fontSize: 13,
                      fontWeight: 500,
                      border: 'none',
                      borderRadius: 9,
                      background: 'var(--color-primary)',
                      color: '#fff',
                      cursor: 'pointer',
                    }}
                  >
                    <Plus size={14} /> Add item
                  </button>
                  {!activeGroup.is_system && (
                    <button
                      onClick={async () => {
                        setError(null)
                        try {
                          await deleteGroup.mutateAsync(activeGroup.id)
                          setSelectedId(null)
                        } catch {
                          setError({
                            id: activeGroup.id,
                            message:
                              'This group still has items, so it cannot be ' +
                              'deleted. Remove or move them first.',
                          })
                        }
                      }}
                      aria-label="Delete group"
                      title="Delete group"
                      style={{
                        padding: '7px 10px',
                        border: '1px solid var(--color-border)',
                        borderRadius: 9,
                        background: 'var(--color-card)',
                        // Deleting a whole group is the most consequential
                        // action here; it must not look neutral.
                        color: 'var(--color-primary)',
                        cursor: 'pointer',
                        marginLeft: 4,
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>

              {error && error.id === activeGroup.id && (
                <div
                  role="alert"
                  style={{
                    padding: '10px 18px',
                    fontSize: 12,
                    color: 'var(--color-text)',
                    background: 'rgba(216,69,42,0.06)',
                    borderBottom: '1px solid var(--color-border-light)',
                  }}
                >
                  {error.message}
                </div>
              )}

              {rows.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center' }}>
                  <Tags
                    size={24}
                    style={{ color: 'var(--color-text-meta)', marginBottom: 10 }}
                  />
                  <p
                    style={{
                      fontSize: 13,
                      color: 'var(--color-text-secondary)',
                      margin: 0,
                    }}
                  >
                    No items yet
                  </p>
                </div>
              ) : (
                <div>
                  {rows.map(({ category, depth }) => {
                    const dead = isDeprecated(category)
                    return (
                      <div
                        key={category.id}
                        style={{
                          display: 'flex',
                          // Top-aligned: centring drifts the buttons off the
                          // title line as soon as an inline alert appears.
                          alignItems: 'flex-start',
                          gap: 10,
                          padding: '11px 18px',
                          paddingLeft: 18 + depth * 24,
                          borderBottom: '1px solid var(--color-border-light)',
                          // Deprecated rows stay visible but recede, so they
                          // can still be restored.
                          opacity: dead ? 0.55 : 1,
                        }}
                      >
                        {depth > 0 && (
                          <span
                            aria-hidden
                            style={{
                              alignSelf: 'stretch',
                              width: 1,
                              marginLeft: -12,
                              marginRight: 4,
                              background: 'var(--color-border)',
                            }}
                          />
                        )}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 8,
                            }}
                          >
                            <span
                              style={{
                                fontSize: 13,
                                color: 'var(--color-text)',
                                textDecoration: dead ? 'line-through' : 'none',
                              }}
                            >
                              {category.name}
                            </span>
                            {category.is_system && (
                              <Lock
                                size={10}
                                style={{ color: 'var(--color-text-meta)' }}
                              />
                            )}
                            {dead && (
                              <span
                                style={{
                                  ...metaStyle,
                                  padding: '1px 6px',
                                  borderRadius: 5,
                                  border: '1px solid var(--color-border)',
                                  background: 'var(--color-card-alt)',
                                }}
                              >
                                DEPRECATED
                              </span>
                            )}
                          </div>
                          <code style={metaStyle}>{category.code}</code>
                          {dead && category.deprecated_reason && (
                            <div
                              style={{
                                fontSize: 12,
                                color: 'var(--color-text-meta)',
                                marginTop: 3,
                              }}
                            >
                              {category.deprecated_reason}
                            </div>
                          )}
                          {error && error.id === category.id && (
                            <div
                              role="alert"
                              style={{
                                fontSize: 12,
                                color: 'var(--color-text)',
                                marginTop: 5,
                                padding: '6px 9px',
                                borderRadius: 8,
                                background: 'rgba(216,69,42,0.06)',
                              }}
                            >
                              {error.message}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: 4 }}>
                          <button
                            onClick={() =>
                              setCategoryModal({
                                open: true,
                                edit: null,
                                parentId: category.id,
                              })
                            }
                            aria-label={`Add child of ${category.name}`}
                            title="Add child"
                            style={iconButton}
                          >
                            <Plus size={14} />
                          </button>
                          <button
                            onClick={() =>
                              setCategoryModal({
                                open: true,
                                edit: category,
                                parentId: null,
                              })
                            }
                            aria-label={`Edit ${category.name}`}
                            style={iconButton}
                          >
                            <Pencil size={14} />
                          </button>
                          {canRestore(category) ? (
                            <button
                              onClick={() => restore.mutate(category.id)}
                              aria-label={`Restore ${category.name}`}
                              title="Restore"
                              style={iconButton}
                            >
                              <RotateCcw size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => setDeprecating(category)}
                              aria-label={`Deprecate ${category.name}`}
                              title="Deprecate"
                              style={{
                                ...iconButton,
                                width: 'auto',
                                padding: '0 9px',
                                gap: 5,
                                fontSize: 12,
                              }}
                            >
                              <Archive size={13} />
                              Deprecate
                            </button>
                          )}
                          {!category.is_system && (
                            <button
                              onClick={() => handleDelete(category)}
                              aria-label={`Delete ${category.name}`}
                              title={
                                countChildren(items, category.id) > 0
                                  ? 'Has children'
                                  : 'Delete'
                              }
                              style={dangerIconButton}
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {groupModal && (
        <GroupModal
          onClose={() => setGroupModal(false)}
          onSubmit={async (payload) => {
            await createGroup.mutateAsync(payload)
            setGroupModal(false)
          }}
        />
      )}

      {categoryModal.open && activeGroup && (
        <CategoryModal
          groupId={activeGroup.id}
          edit={categoryModal.edit}
          parentId={categoryModal.parentId}
          siblings={items}
          onClose={() =>
            setCategoryModal({ open: false, edit: null, parentId: null })
          }
        />
      )}

      {deprecating && (
        <DeprecateModal
          category={deprecating}
          onClose={() => setDeprecating(null)}
          onSubmit={async (reason) => {
            await deprecate.mutateAsync({ id: deprecating.id, reason })
            setDeprecating(null)
          }}
        />
      )}
    </div>
  )
}

const iconButton: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 28,
  height: 28,
  border: '1px solid var(--color-border)',
  borderRadius: 8,
  background: 'var(--color-card)',
  color: 'var(--color-text-secondary)',
  cursor: 'pointer',
}

/** Delete must not look like the neutral actions sitting beside it. */
const dangerIconButton: React.CSSProperties = {
  ...iconButton,
  color: 'var(--color-primary)',
  marginLeft: 4,
}
