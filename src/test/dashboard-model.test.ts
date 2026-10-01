import { describe, it, expect } from 'vitest'
import {
  buildStatusBreakdown,
  summariseLoginActivity,
  greetingFor,
  type DashboardStats,
  type LoginActivity,
} from '@/pages/dashboard/model'

const STATS: DashboardStats = {
  users: { total: 10, active: 6, pending: 2, inactive: 1, suspended: 1 },
  roles: { total: 3 },
  today: { login_success: 12, login_failed: 3 },
}

describe('buildStatusBreakdown', () => {
  it('returns every status with its share of the total', () => {
    const rows = buildStatusBreakdown(STATS)
    expect(rows.map((r) => r.label)).toEqual(['Active', 'Pending', 'Inactive', 'Suspended'])
    expect(rows.find((r) => r.label === 'Active')?.share).toBeCloseTo(0.6)
  })

  it('never divides by zero on an empty instance', () => {
    const empty: DashboardStats = {
      users: { total: 0, active: 0, pending: 0, inactive: 0, suspended: 0 },
      roles: { total: 0 },
      today: { login_success: 0, login_failed: 0 },
    }
    const rows = buildStatusBreakdown(empty)
    expect(rows.every((r) => r.share === 0)).toBe(true)
  })

  it('is empty when stats have not loaded', () => {
    expect(buildStatusBreakdown(undefined)).toEqual([])
  })
})

describe('summariseLoginActivity', () => {
  const activity: LoginActivity[] = [
    { date: '2026-09-29', success_count: 4, failed_count: 1 },
    { date: '2026-09-30', success_count: 6, failed_count: 0 },
    { date: '2026-10-01', success_count: 10, failed_count: 4 },
  ]

  it('totals successes and failures across the window', () => {
    const s = summariseLoginActivity(activity)
    expect(s.totalSuccess).toBe(20)
    expect(s.totalFailed).toBe(5)
    expect(s.days).toBe(3)
  })

  it('computes the real change between first and last day', () => {
    // 10 vs 4 on the first day — a genuine +6, derived not invented.
    expect(summariseLoginActivity(activity).successDelta).toBe(6)
  })

  it('reports no delta when a single day is available', () => {
    expect(summariseLoginActivity(activity.slice(0, 1)).successDelta).toBeNull()
  })

  it('computes the failure rate over the window', () => {
    expect(summariseLoginActivity(activity).failureRate).toBeCloseTo(5 / 25)
  })

  it('handles an empty window without NaN', () => {
    const s = summariseLoginActivity([])
    expect(s.totalSuccess).toBe(0)
    expect(s.failureRate).toBe(0)
    expect(s.successDelta).toBeNull()
  })
})

describe('greetingFor', () => {
  it('splits the day into morning, afternoon and evening', () => {
    expect(greetingFor(9)).toBe('Good morning')
    expect(greetingFor(14)).toBe('Good afternoon')
    expect(greetingFor(21)).toBe('Good evening')
  })

  it('covers the boundaries', () => {
    expect(greetingFor(0)).toBe('Good morning')
    expect(greetingFor(12)).toBe('Good afternoon')
    expect(greetingFor(17)).toBe('Good evening')
  })
})
