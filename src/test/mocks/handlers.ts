import { http, HttpResponse } from 'msw'

// In jsdom, relative URLs resolve to http://localhost (no port),
// so MSW intercepts them as http://localhost/api/v1/...
// We register handlers for both to cover all environments.
const BASES = [
  'http://localhost:8000/api/v1',
  'http://localhost/api/v1',
  'http://localhost:3000/api/v1',
]

const loginResponse = () =>
  HttpResponse.json({
    data: {
      access_token: 'test-token',
      token_type: 'bearer',
      user: {
        id: '1',
        name: 'Test',
        email: 'test@test.com',
        status: 'active',
      },
    },
    message: 'Login berhasil',
  })

const refreshUnauth = () =>
  HttpResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'No session', details: [], request_id: 'x' } },
    { status: 401 },
  )

const meUnauth = () =>
  HttpResponse.json(
    { error: { code: 'UNAUTHORIZED', message: 'Not authenticated', details: [], request_id: 'x' } },
    { status: 401 },
  )

export const handlers = BASES.flatMap((BASE) => [
  http.post(`${BASE}/auth/login`, loginResponse),
  http.post(`${BASE}/auth/refresh`, refreshUnauth),
  http.get(`${BASE}/auth/me`, meUnauth),
])
