import { useState, useMemo } from 'react'
import { Download } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { useAuditLogs, type AuditLogFilters } from '@/features/audit-logs/queries'
import type { AuditLog } from '@/shared/api/types'
import { DataTable } from '@/shared/ui/DataTable'

// ── Helpers ────────────────────────────────────────────────────────────────

function actionBadgeStyle(action: string): React.CSSProperties {
  if (['create', 'register', 'login'].includes(action))
    return { background: '#ECFDF5', color: '#059669' }
  if (['update', 'assign', 'revoke'].includes(action))
    return { background: '#EFF6FF', color: '#3B82F6' }
  if (['delete', 'logout', 'ban'].includes(action))
    return { background: '#FEF2F2', color: '#DC2626' }
  return { background: '#F3F4F6', color: '#6B7280' }
}

function truncate(str: string | null, n = 30): string {
  if (!str) return '—'
  return str.length > n ? str.slice(0, n) + '…' : str
}

function exportCsv(rows: AuditLog[]) {
  const headers = ['ID', 'User', 'Action', 'Module', 'Entity ID', 'IP', 'Request ID', 'Created At']
  const lines = rows.map((r) =>
    [r.id, r.user_name ?? '', r.action, r.module, r.entity_id ?? '', r.ip_address ?? '', r.request_id ?? '', r.created_at]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  )
  const csv = [headers.join(','), ...lines].join('\n')
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `audit-logs-${new Date().toISOString().slice(0, 10)}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

const filterInputStyle: React.CSSProperties = {
  border: '1px solid #E5E7EB',
  borderRadius: 6,
  padding: '6px 12px',
  fontSize: 13,
  color: '#374151',
  background: 'white',
  outline: 'none',
  width: '100%',
}

// ── Component ──────────────────────────────────────────────────────────────

export function AuditLogsPage() {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    per_page: 20,
    module: '',
    action: '',
    date_from: '',
    date_to: '',
  })

  const { data, isLoading } = useAuditLogs(filters)

  const rows = data?.data ?? []
  const meta = data?.meta

  function setFilter(key: keyof AuditLogFilters, value: string | number) {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }))
  }

  const MODULE_OPTIONS = ['', 'auth', 'users', 'roles', 'permissions', 'menus', 'settings', 'audit']

  const columns = useMemo<ColumnDef<AuditLog, unknown>[]>(
    () => [
      {
        id: 'user',
        header: 'User',
        cell: ({ row }) => (
          <span style={{ fontWeight: 500 }}>{row.original.user_name ?? '—'}</span>
        ),
      },
      {
        accessorKey: 'action',
        header: 'Action',
        cell: ({ getValue }) => {
          const action = getValue() as string
          return (
            <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 9999, fontSize: 11, fontWeight: 500, ...actionBadgeStyle(action) }}>
              {action}
            </span>
          )
        },
      },
      {
        accessorKey: 'module',
        header: 'Module',
        cell: ({ getValue }) => (
          <span style={{ color: '#6B7280' }}>{getValue() as string}</span>
        ),
      },
      {
        id: 'entity_id',
        header: 'Entity ID',
        cell: ({ row }) => (
          <span style={{ color: '#6B7280', fontFamily: 'monospace', fontSize: 12 }}>
            {truncate(row.original.entity_id, 12)}
          </span>
        ),
      },
      {
        id: 'ip',
        header: 'IP',
        cell: ({ row }) => (
          <span style={{ color: '#6B7280' }}>{row.original.ip_address ?? '—'}</span>
        ),
      },
      {
        id: 'request_id',
        header: 'Request ID',
        cell: ({ row }) => (
          <span style={{ color: '#6B7280', fontFamily: 'monospace', fontSize: 12 }} title={row.original.request_id ?? ''}>
            {truncate(row.original.request_id, 16)}
          </span>
        ),
      },
      {
        id: 'created_at',
        header: 'Created At',
        cell: ({ row }) => (
          <span style={{ color: '#9CA3AF', whiteSpace: 'nowrap', fontSize: 12 }}>
            {new Date(row.original.created_at).toLocaleString()}
          </span>
        ),
      },
    ],
    [],
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#1A1A1A', marginBottom: 2 }}>Audit Log</h1>
          <p style={{ fontSize: 13, color: '#6B7280' }}>Track all system activities and changes</p>
        </div>
        <button
          onClick={() => rows.length > 0 && exportCsv(rows)}
          disabled={rows.length === 0}
          className="btn-ghost"
          style={{ opacity: rows.length === 0 ? 0.4 : 1, cursor: rows.length === 0 ? 'not-allowed' : 'pointer' }}
        >
          <Download size={14} />
          Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div style={{ background: 'white', border: '1px solid #E5E7EB', borderRadius: 8, padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        <div className="section-label" style={{ width: '100%', marginBottom: -8 }}>Filters</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 140 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Module</label>
          <select
            value={filters.module ?? ''}
            onChange={(e) => setFilter('module', e.target.value)}
            style={filterInputStyle}
          >
            {MODULE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m || 'All modules'}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 160 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Action</label>
          <input
            value={filters.action ?? ''}
            onChange={(e) => setFilter('action', e.target.value)}
            placeholder="Filter by action…"
            style={filterInputStyle}
          />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date From</label>
          <input type="date" value={filters.date_from ?? ''} onChange={(e) => setFilter('date_from', e.target.value)} style={filterInputStyle} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Date To</label>
          <input type="date" value={filters.date_to ?? ''} onChange={(e) => setFilter('date_to', e.target.value)} style={filterInputStyle} />
        </div>
      </div>

      {/* DataTable */}
      <DataTable
        data={rows}
        columns={columns}
        isLoading={isLoading}
        emptyMessage="No audit logs found."
      />

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 13, color: '#6B7280' }}>
          <span>Page {meta.page} of {meta.total_pages} — {meta.total} total records</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
              disabled={(filters.page ?? 1) <= 1}
              className="btn-ghost"
              style={{ padding: '6px 14px', fontSize: 12, opacity: (filters.page ?? 1) <= 1 ? 0.4 : 1, cursor: (filters.page ?? 1) <= 1 ? 'not-allowed' : 'pointer' }}
            >
              Previous
            </button>
            <button
              onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
              disabled={(filters.page ?? 1) >= meta.total_pages}
              className="btn-ghost"
              style={{ padding: '6px 14px', fontSize: 12, opacity: (filters.page ?? 1) >= meta.total_pages ? 0.4 : 1, cursor: (filters.page ?? 1) >= meta.total_pages ? 'not-allowed' : 'pointer' }}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
