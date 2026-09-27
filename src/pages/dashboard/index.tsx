import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Users, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { useDashboardStats, useLoginActivity } from '@/features/dashboard/queries'

// ── Stat Card ──────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: number | undefined
  icon: React.ReactNode
  color: 'green' | 'yellow' | 'red' | 'blue'
  loading?: boolean
}

const colorMap = {
  green: {
    bg: 'bg-green-50',
    icon: 'bg-green-100 text-green-600',
    text: 'text-green-700',
    bar: 'bg-green-400',
  },
  yellow: {
    bg: 'bg-yellow-50',
    icon: 'bg-yellow-100 text-yellow-600',
    text: 'text-yellow-700',
    bar: 'bg-yellow-400',
  },
  red: {
    bg: 'bg-red-50',
    icon: 'bg-red-100 text-red-600',
    text: 'text-red-700',
    bar: 'bg-red-400',
  },
  blue: {
    bg: 'bg-blue-50',
    icon: 'bg-blue-100 text-blue-600',
    text: 'text-blue-700',
    bar: 'bg-blue-400',
  },
}

function StatCard({ label, value, icon, color, loading }: StatCardProps) {
  const c = colorMap[color]

  if (loading) {
    return (
      <div className="rounded-xl border bg-white p-5 shadow-sm animate-pulse">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-full bg-slate-200" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-24 rounded bg-slate-200" />
            <div className="h-6 w-16 rounded bg-slate-200" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ${c.bg} border-transparent`}>
      <div className="flex items-center gap-4">
        <div className={`h-12 w-12 rounded-full flex items-center justify-center ${c.icon}`}>
          {icon}
        </div>
        <div>
          <p className="text-sm text-slate-500">{label}</p>
          <p className={`text-2xl font-bold stat-count ${c.text}`}>{value ?? 0}</p>
        </div>
      </div>
    </div>
  )
}

// ── Chart Skeleton ─────────────────────────────────────────────────────────

function ChartSkeleton() {
  return (
    <div className="h-64 rounded-xl bg-slate-100 animate-pulse" />
  )
}

// ── Dashboard Page ─────────────────────────────────────────────────────────

export function DashboardPage() {
  const { data: stats, isLoading: statsLoading } = useDashboardStats()
  const { data: activity, isLoading: activityLoading } = useLoginActivity()

  // Bar chart data: user status breakdown
  const barData = stats
    ? [
        { name: 'Active', value: stats.users.active, fill: '#22c55e' },
        { name: 'Pending', value: stats.users.pending, fill: '#eab308' },
        { name: 'Inactive', value: stats.users.inactive, fill: '#94a3b8' },
        { name: 'Suspended', value: stats.users.suspended, fill: '#ef4444' },
      ]
    : []

  // Line chart: last 30 days login activity
  const lineData = (activity ?? []).map((d) => ({
    date: d.date.slice(5), // MM-DD
    Success: d.success_count,
    Failed: d.failed_count,
  }))

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 text-sm mt-1">Platform overview & login activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Active Users"
          value={stats?.users.active}
          icon={<Users size={20} />}
          color="green"
          loading={statsLoading}
        />
        <StatCard
          label="Pending Users"
          value={stats?.users.pending}
          icon={<Clock size={20} />}
          color="yellow"
          loading={statsLoading}
        />
        <StatCard
          label="Suspended Users"
          value={stats?.users.suspended}
          icon={<AlertTriangle size={20} />}
          color="red"
          loading={statsLoading}
        />
        <StatCard
          label="Logins Today"
          value={stats?.today.login_success}
          icon={<CheckCircle2 size={20} />}
          color="blue"
          loading={statsLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Line Chart: Login Activity */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Login Activity (30 days)
          </h2>
          {activityLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11 }}
                  interval="preserveStartEnd"
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="Success"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="Failed"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart: User Status */}
        <div className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-800 mb-4">
            Users by Status
          </h2>
          {statsLoading ? (
            <ChartSkeleton />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <rect key={index} fill={entry.fill} />
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
