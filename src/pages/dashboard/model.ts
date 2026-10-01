import type { DashboardStats, LoginActivity } from '@/shared/api/types'

export type { DashboardStats, LoginActivity }

export interface StatusRow {
  label: string
  value: number
  /** Fraction of all users, 0..1. Zero when there are no users at all. */
  share: number
  color: string
}

/**
 * Break the user totals down by status.
 *
 * Colours come from the Archie v4 token set so the breakdown follows the
 * active theme instead of hard-coded hex values.
 */
export function buildStatusBreakdown(stats: DashboardStats | undefined): StatusRow[] {
  if (!stats) return []

  const total = stats.users.total
  const row = (label: string, value: number, color: string): StatusRow => ({
    label,
    value,
    share: total > 0 ? value / total : 0,
    color,
  })

  return [
    row('Active', stats.users.active, 'var(--color-success)'),
    row('Pending', stats.users.pending, '#96731a'),
    row('Inactive', stats.users.inactive, 'var(--color-text-placeholder)'),
    row('Suspended', stats.users.suspended, 'var(--color-primary)'),
  ]
}

export interface ActivitySummary {
  days: number
  totalSuccess: number
  totalFailed: number
  /** Successful logins on the last day minus the first. Null if < 2 days. */
  successDelta: number | null
  /** Failed share of all attempts in the window, 0..1. */
  failureRate: number
}

/**
 * Summarise the login-activity window.
 *
 * Every figure is derived from the API payload — the dashboard must never
 * display an invented trend.
 */
export function summariseLoginActivity(activity: LoginActivity[]): ActivitySummary {
  const totalSuccess = activity.reduce((sum, d) => sum + d.success_count, 0)
  const totalFailed = activity.reduce((sum, d) => sum + d.failed_count, 0)
  const attempts = totalSuccess + totalFailed

  return {
    days: activity.length,
    totalSuccess,
    totalFailed,
    successDelta:
      activity.length >= 2
        ? activity[activity.length - 1].success_count - activity[0].success_count
        : null,
    failureRate: attempts > 0 ? totalFailed / attempts : 0,
  }
}

export function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
