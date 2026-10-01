import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { useDashboardStats, useLoginActivity } from '@/features/dashboard/queries'
import { useAuthStore } from '@/features/auth/store'

// ── Metric Card ────────────────────────────────────────────────────────────

interface MetricCardProps {
  label: string
  value: number | undefined
  delta?: { value: number; positive: boolean }
  sublabel?: string
  loading?: boolean
}

function MetricCard({ label, value, delta, sublabel, loading }: MetricCardProps) {
  if (loading) {
    return (
      <div className="card animate-pulse">
        <div style={{ height: 10, width: 80, background: '#F3F4F6', borderRadius: 4, marginBottom: 12 }} />
        <div style={{ height: 28, width: 64, background: '#E5E7EB', borderRadius: 4, marginBottom: 8 }} />
        <div style={{ height: 10, width: 100, background: '#F3F4F6', borderRadius: 4 }} />
      </div>
    )
  }

  return (
    <div className="card">
      <div className="section-label" style={{ marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
        <span className="metric-number">{value ?? 0}</span>
        {delta !== undefined && (
          <span style={{ fontSize: 12, fontWeight: 600, color: delta.positive ? '#10B981' : '#EF4444' }}>
            {delta.positive ? '+' : ''}{delta.value}
          </span>
        )}
      </div>
      {sublabel && (
        <div style={{ fontSize: 12, color: '#6B7280' }}>{sublabel}</div>
      )}
    </div>
  )
}

// ── Chart skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div style={{ height: 260, background: '#F9FAFB', borderRadius: 8, animation: 'pulse 2s infinite' }} />
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useLoginActivity()
  const user = useAuthStore((s) => s.user)

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const barData = stats
    ? [
        { name: 'Active', value: stats.users.active, color: '#10B981' },
        { name: 'Pending', value: stats.users.pending, color: '#F59E0B' },
        { name: 'Inactive', value: stats.users.inactive, color: '#9CA3AF' },
        { name: 'Suspended', value: stats.users.suspended, color: '#EF4444' },
      ]
    : []

  const lineData = (activity ?? []).map((d) => ({
    date: d.date.slice(5),
    Success: d.success_count,
    Failed: d.failed_count,
  }))

  const pendingCount = stats?.users.pending ?? 0
  const showAlert = pendingCount > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Greeting */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>
          {greeting}, {user?.name?.split(' ')[0] ?? 'there'} 👋
        </h1>
        <p style={{ fontSize: 14, color: '#6B7280' }}>
          Here's what's happening with your platform today.
        </p>
      </div>

      {/* Alert card */}
      {showAlert && (
        <div className="alert-card">
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#d8452a', marginBottom: 4 }}>
            Team Action Needed
          </div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
            {pendingCount} user{pendingCount !== 1 ? 's' : ''} awaiting approval
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
            Review pending accounts in the Users section.
          </div>
        </div>
      )}

      {/* Section label */}
      <div className="section-label">AI Command Center</div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <MetricCard
          label="User Aktif"
          value={stats?.users.active}
          delta={{ value: 6, positive: true }}
          sublabel="Active accounts"
          loading={statsLoading}
        />
        <MetricCard
          label="User Pending"
          value={stats?.users.pending}
          delta={{ value: pendingCount > 0 ? pendingCount : 0, positive: false }}
          sublabel="Awaiting approval"
          loading={statsLoading}
        />
        <MetricCard
          label="User Suspended"
          value={stats?.users.suspended}
          sublabel="Suspended accounts"
          loading={statsLoading}
        />
        <MetricCard
          label="Login Hari Ini"
          value={stats?.today.login_success}
          sublabel="Successful logins today"
          loading={statsLoading}
        />
      </div>

      {/* Charts */}
      <div className="section-label">Team Performance · Last 30 Days</div>
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 16 }}>
        {/* Line Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-label" style={{ marginBottom: 16 }}>Login Activity</div>
          {activityLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} interval="preserveStartEnd" />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Line type="monotone" dataKey="Success" stroke="#10B981" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="Failed" stroke="#EF4444" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart */}
        <div className="card" style={{ padding: 20 }}>
          <div className="card-label" style={{ marginBottom: 16 }}>Users by Status</div>
          {statsLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  )
}
