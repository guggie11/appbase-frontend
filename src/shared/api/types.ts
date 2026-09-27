export interface ApiSuccess<T> {
  data: T
  message: string
}

export interface ApiErrorBody {
  error: {
    code: string
    message: string
    details: unknown[]
    request_id: string
  }
}

export interface User {
  id: string
  name: string
  email: string
  status: string
}

export interface UserDetail extends User {
  avatar: string | null
  is_verified: boolean
  last_login_at: string | null
  created_at: string
}

export interface TokenData {
  access_token: string
  token_type: string
  user: User
}
