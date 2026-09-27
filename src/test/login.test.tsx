import { describe, it, expect } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { LoginPage } from '@/pages/login'
import { http, HttpResponse } from 'msw'
import { server } from './mocks/server'

function renderLogin() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('LoginPage', () => {
  it('renders login form', () => {
    renderLogin()
    expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /masuk/i })).toBeInTheDocument()
  })

  it('shows error on invalid submit (empty fields)', async () => {
    renderLogin()
    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /masuk/i }))
    await waitFor(() => {
      expect(screen.getByText(/email tidak valid/i)).toBeInTheDocument()
    })
  })

  it('calls login API on valid submit', async () => {
    let loginCalled = false
    server.use(
      http.post('http://localhost:8000/api/v1/auth/login', () => {
        loginCalled = true
        return HttpResponse.json({
          data: {
            access_token: 'test-token',
            token_type: 'bearer',
            user: { id: '1', name: 'Test', email: 'test@test.com', status: 'active' },
          },
          message: 'Login berhasil',
        })
      }),
    )

    renderLogin()
    const user = userEvent.setup()
    await user.type(screen.getByPlaceholderText('you@example.com'), 'test@test.com')
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123')
    await user.click(screen.getByRole('button', { name: /masuk/i }))

    await waitFor(() => {
      expect(loginCalled).toBe(true)
    })
  })
})
