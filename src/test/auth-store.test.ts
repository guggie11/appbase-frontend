import { describe, it, expect, beforeEach } from 'vitest'
import { useAuthStore } from '@/features/auth/store'

describe('useAuthStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      isLoading: true,
    })
  })

  it('initial state is unauthenticated', () => {
    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
  })

  it('setAuth sets user and token', () => {
    const user = { id: '1', name: 'Test', email: 'test@test.com', status: 'active' }
    useAuthStore.getState().setAuth(user, 'my-token')

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(true)
    expect(state.user).toEqual(user)
    expect(state.accessToken).toBe('my-token')
  })

  it('clearAuth resets state', () => {
    const user = { id: '1', name: 'Test', email: 'test@test.com', status: 'active' }
    useAuthStore.getState().setAuth(user, 'my-token')
    useAuthStore.getState().clearAuth()

    const state = useAuthStore.getState()
    expect(state.isAuthenticated).toBe(false)
    expect(state.user).toBeNull()
    expect(state.accessToken).toBeNull()
  })
})
