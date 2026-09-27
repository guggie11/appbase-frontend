import axios from 'axios'
import { env } from '@/shared/config'

export const apiClient = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor — attach auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor — global error handling placeholder
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // TODO: handle 401 → refresh token flow
    return Promise.reject(error)
  },
)
