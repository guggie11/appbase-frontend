import axios from 'axios'
import { useAuthStore } from '@/features/auth/store'

const BASE_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ??
  'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30_000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

function getCsrfToken(): string {
  const match = document.cookie
    .split('; ')
    .find((row) => row.startsWith('csrf_token='))
  return match ? decodeURIComponent(match.split('=')[1]) : ''
}

// Request interceptor — attach auth token + CSRF
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    const csrf = getCsrfToken()
    if (csrf) {
      config.headers['X-CSRF-Token'] = csrf
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Refresh token handling
let isRefreshing = false
type FailedQueueItem = {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}
const failedQueue: FailedQueueItem[] = []

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else if (token) {
      prom.resolve(token)
    }
  })
  failedQueue.length = 0
}

// Skip refresh interceptor for these paths
const SKIP_REFRESH_PATHS = ['/auth/refresh', '/auth/login']

// Response interceptor — 401 → refresh token
apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error)

    const originalRequest = error.config as (typeof error.config) & {
      _retry?: boolean
    }

    const requestUrl = originalRequest.url ?? ''
    const isSkipped = SKIP_REFRESH_PATHS.some((p) => requestUrl.includes(p))
    if (error.response?.status === 401 && !originalRequest._retry && !isSkipped) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`
            }
            return apiClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await apiClient.post<{
          data: { access_token: string }
        }>('/auth/refresh')
        const newToken = data.data.access_token
        useAuthStore.getState().setAuth(
          useAuthStore.getState().user!,
          newToken,
        )
        processQueue(null, newToken)
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
        }
        return apiClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        useAuthStore.getState().clearAuth()
        window.location.href = '/login'
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)
