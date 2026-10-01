import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Link } from 'react-router-dom'
import { useDashboardStats, useLoginActivity } from '@/features/dashboard/queries'
import { useAuthStore } from '@/features/auth/store'
import { useThemeStore } from '@/shared/config/theme'
import { buildStatusBreakdown, summariseLoginActivity, greetingFor } from './model'

// ── Primitives ──────────────────────────────────────────────────────────────

const monoLabel: React.CSSProperties = {
  fontFamily: "'Geist Mono', monospace",
  fontSize: 11,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  color: 'var(--color-text-meta)',
}

const panel: React.CSSProperties = {
  background: 'var(--color-card)',
  border: '1px solid var(--color-border-light)',
  borderRadius: 16,
  padding: 18,
}

function Skeleton({ height }: { height: number }) {
  return (
    <div
      className="animate-pulse"
      style={{ height, background: 'var(--color-card-alt)', borderRadius: 12 }}
    />
  )
}

// ── Metric ──────────────────────────────────────────────────────────────────

interface MetricProps {
  label: string
  value: number | undefined
  note: string
  /** Only rendered when the API actually provides a comparison. */
  delta?: number | null
  loading?: boolean
}

function Metric({ label, value, note, delta, loading }: MetricProps) {
  if (loading) {
    return (
      <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Skeleton height={12} />
        <Skeleton height={26} />
        <Skeleton height={12} />
      </div>
    )
  }

  return (
    <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 5 }}>
      <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>{label}</span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
        <span
          style={{
            fontSize: 26,
            fontWeight: 600,
            letterSpacing: '-0.02em',
            color: 'var(--color-text-primary)',
          }}
        >
          {value ?? 0}
        </span>
        {delta !== undefined && delta !== null && delta !== 0 && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: delta > 0 ? 'var(--color-success)' : 'var(--color-primary)',
            }}
          >
            {delta > 0 ? '+' : ''}{delta}
          </span>
        )}
      </div>
      <span style={{ fontSize: 11.5, color: 'var(--color-text-muted)', lineHeight: 1.4 }}>
        {note}
      </span>
    </div>
  )
}

// ── Page ────────────────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useLoginActivity()
  const user = useAuthStore((s) => s.user)
  const { appName } = useThemeStore()

  const greeting = greetingFor(new Date().getHours())
  const firstName = user?.name?.split(' ')[0] ?? 'there'

  const breakdown = buildStatusBreakdown(stats)
  const summary = summariseLoginActivity(activity ?? [])

  const lineData = (activity ?? []).map((d) => ({
    date: d.date.slice(5),
    Success: d.success_count,
    Failed: d.failed_count,
  }))

  const pending = stats?.users.pending ?? 0
  const periodLabel = summary.days > 0 ? `Last ${summary.days} days` : 'No activity yet'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 26 }}>
      {/* ── Command centre header ── */}
      <section
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '24px 32px',
          alignItems: 'flex-end',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flex: '1 1 380px', minWidth: 0 }}>
          <span style={monoLabel}>Command Center</span>
          <h1
            style={{
              margin: 0,
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: '-0.025em',
              lineHeight: 1.1,
              color: 'var(--color-text-primary)',
            }}
          >
            {greeting}, {firstName}.
          </h1>
          <p style={{ margin: 0, fontSize: 14, color: 'var(--color-text-muted)', maxWidth: 560 }}>
            {pending > 0
              ? `${pending} account${pending === 1 ? '' : 's'} awaiting approval. Everything else on ${appName} is running normally.`
              : `No accounts are waiting for approval — ${appName} is running normally.`}
          </p>
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link
            to="/users"
            className="btn-primary"
            style={{ textDecoration: 'none' }}
          >
            Manage users
          </Link>
          <Link
            to="/audit-logs"
            className="btn-ghost"
            style={{ textDecoration: 'none' }}
          >
            Audit log ↗
          </Link>
        </div>
      </section>

      {/* ── Action required ── */}
      {pending > 0 && (
        <div
          style={{
            ...panel,
            background: 'var(--color-primary-light)',
            border: '1px solid #f5cec5',
            borderLeft: '4px solid var(--color-primary)',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0 }}>
            <span style={{ ...monoLabel, color: 'var(--color-primary)' }}>Action required</span>
            <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-text-primary)' }}>
              {pending} user{pending === 1 ? '' : 's'} awaiting approval
            </span>
            <span style={{ fontSize: 12.5, color: 'var(--color-text-muted)' }}>
              Review pending accounts before they expire.
            </span>
          </div>
          <Link to="/users" className="btn-primary" style={{ textDecoration: 'none' }}>
            Review now
          </Link>
        </div>
      )}

      {/* ── Platform health ── */}
      <section style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
          <span style={monoLabel}>Platform health</span>
          <span style={{ ...monoLabel, fontSize: 10, letterSpacing: '0.06em' }}>{periodLabel}</span>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 12,
          }}
        >
          <Metric
            label="Active users"
            value={stats?.users.active}
            note={`of ${stats?.users.total ?? 0} total accounts`}
            loading={statsLoading}
          />
          <Metric
            label="Awaiting approval"
            value={stats?.users.pending}
            note={pending > 0 ? 'Needs a decision' : 'Nothing queued'}
            loading={statsLoading}
          />
          <Metric
            label="Successful logins today"
            value={stats?.today.login_success}
            note={
              summary.successDelta === null
                ? 'No comparison available yet'
                : 'Change vs. start of window'
            }
            delta={summary.successDelta}
            loading={statsLoading}
          />
          <Metric
            label="Failed logins today"
            value={stats?.today.login_failed}
            note={`${Math.round(summary.failureRate * 100)}% of attempts in window`}
            loading={statsLoading}
          />
        </div>
      </section>

      {/* ── Activity + breakdown ── */}
      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
          gap: 12,
          alignItems: 'stretch',
        }}
      >
        <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={monoLabel}>Login activity</span>
            <span style={{ ...monoLabel, fontSize: 10 }}>
              {summary.totalSuccess} ok · {summary.totalFailed} failed
            </span>
          </div>

          {activityLoading ? (
            <Skeleton height={240} />
          ) : lineData.length === 0 ? (
            <EmptyState text="No sign-in activity recorded yet." />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={lineData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-light)" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'var(--color-text-meta)' }}
                  tickLine={false}
                  axisLine={{ stroke: 'var(--color-border-light)' }}
                  interval="preserveStartEnd"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: 'var(--color-text-meta)' }}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid var(--color-border-light)',
                    fontSize: 12,
                    fontFamily: "'Geist', Helvetica, Arial, sans-serif",
                  }}
                />
                <Line type="monotone" dataKey="Success" stroke="var(--color-success)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Failed" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        <div style={{ ...panel, display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
            <span style={monoLabel}>Users by status</span>
            <span style={{ ...monoLabel, fontSize: 10 }}>Count / share</span>
          </div>

          {statsLoading ? (
            <Skeleton height={240} />
          ) : breakdown.length === 0 || stats?.users.total === 0 ? (
            <EmptyState text="No users yet." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {breakdown.map((row) => (
                <div key={row.label} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, fontSize: 13 }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>{row.label}</span>
                    <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                      {row.value}
                      <span
                        style={{
                          fontFamily: "'Geist Mono', monospace",
                          fontSize: 11,
                          color: 'var(--color-text-meta)',
                          marginLeft: 6,
                          fontWeight: 400,
                        }}
                      >
                        {Math.round(row.share * 100)}%
                      </span>
                    </span>
                  </div>
                  <div
                    role="presentation"
                    style={{
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--color-card-alt)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${row.share * 100}%`,
                        height: '100%',
                        background: row.color,
                        borderRadius: 999,
                        transition: 'width 300ms ease',
                      }}
                    />
                  </div>
                </div>
              ))}

              <div
                style={{
                  marginTop: 2,
                  paddingTop: 12,
                  borderTop: '1px solid var(--color-border-light)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: 12.5,
                  color: 'var(--color-text-muted)',
                }}
              >
                <span>Roles defined</span>
                <span style={{ color: 'var(--color-text-primary)', fontWeight: 600 }}>
                  {stats?.roles.total ?? 0}
                </span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function EmptyState({ text }: { text: string }) {
  return (
    <div
      style={{
        height: 240,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 13,
        color: 'var(--color-text-placeholder)',
        background: 'var(--color-card-alt)',
        borderRadius: 12,
      }}
    >
      {text}
    </div>
  )
}
