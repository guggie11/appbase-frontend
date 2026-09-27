import { useState } from 'react'
import { Download } from 'lucide-react'
import { useAuditLogs, type AuditLogFilters } from '@/features/audit-logs/queries'
import type { AuditLog } from '@/shared/api/types'

// ── Helpers ────────────────────────────────────────────────────────────────

function actionColor(action: string): string {
  if (['create', 'register', 'login'].includes(action))
    return 'bg-green-100 text-green-700'
  if (['update', 'assign', 'revoke'].includes(action))
    return 'bg-blue-100 text-blue-700'
  if (['delete', 'logout', 'ban'].includes(action))
    return 'bg-red-100 text-red-700'
  return 'bg-gray-100 text-gray-700'
}

function truncate(str: string | null, n = 30): string {
  if (!str) return '—'
  return str.length > n ? str.slice(0, n) + '…' : str
}

function exportCsv(rows: AuditLog[]) {
  const headers = [
    'ID', 'User', 'Action', 'Module', 'Entity ID', 'IP', 'Request ID', 'Created At',
  ]
  const lines = rows.map((r) =>
    [
      r.id,
      r.user_name ?? '',
      r.action,
      r.module,
      r.entity_id ?? '',
      r.ip_address ?? '',
      r.request_id ?? '',
      r.created_at,
    ]
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

  const MODULE_OPTIONS = [
    '', 'auth', 'users', 'roles', 'permissions', 'menus', 'settings', 'audit',
  ]

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-900">Audit Log</h1>
        <button
          onClick={() => rows.length > 0 && exportCsv(rows)}
          disabled={rows.length === 0}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </button>
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-3 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-medium text-gray-500">Module</label>
          <select
            value={filters.module ?? ''}
            onChange={(e) => setFilter('module', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {MODULE_OPTIONS.map((m) => (
              <option key={m} value={m}>
                {m || 'All modules'}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-medium text-gray-500">Action</label>
          <input
            value={filters.action ?? ''}
            onChange={(e) => setFilter('action', e.target.value)}
            placeholder="Filter by action…"
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Date from</label>
          <input
            type="date"
            value={filters.date_from ?? ''}
            onChange={(e) => setFilter('date_from', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-gray-500">Date to</label>
          <input
            type="date"
            value={filters.date_to ?? ''}
            onChange={(e) => setFilter('date_to', e.target.value)}
            className="rounded-md border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                {['User', 'Action', 'Module', 'Entity ID', 'IP', 'Request ID', 'Created At'].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-gray-400 text-sm">
                    No audit logs found.
                  </td>
                </tr>
              ) : (
                rows.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-gray-700">{log.user_name ?? '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${actionColor(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.module}</td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">
                      {truncate(log.entity_id, 12)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{log.ip_address ?? '—'}</td>
                    <td
                      className="px-4 py-3 text-gray-600 font-mono text-xs"
                      title={log.request_id ?? ''}
                    >
                      {truncate(log.request_id, 16)}
                    </td>
                    <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {meta && meta.total_pages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Page {meta.page} of {meta.total_pages} &mdash; {meta.total} total records
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) - 1 }))}
              disabled={(filters.page ?? 1) <= 1}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => setFilters((p) => ({ ...p, page: (p.page ?? 1) + 1 }))}
              disabled={(filters.page ?? 1) >= meta.total_pages}
              className="px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
