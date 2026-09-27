import { http, HttpResponse } from 'msw'

const BASE = 'http://localhost:8000/api/v1'

export const handlers = [
  // POST /api/v1/auth/login — success
  http.post(`${BASE}/auth/login`, () => {
    return HttpResponse.json({
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
  }),

  // POST /api/v1/auth/refresh — 401
  http.post(`${BASE}/auth/refresh`, () => {
    return HttpResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'No session', details: [], request_id: 'x' } },
      { status: 401 },
    )
  }),

  // GET /api/v1/auth/me — 401
  http.get(`${BASE}/auth/me`, () => {
    return HttpResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Not authenticated', details: [], request_id: 'x' } },
      { status: 401 },
    )
  }),
]
