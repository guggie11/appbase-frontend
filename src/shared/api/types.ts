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
  roles?: Array<{ id: string; name: string; slug: string }>
  /** Flat permission slugs from /auth/me, e.g. "users.read". */
  permissions?: string[]
}

export interface TokenData {
  access_token: string
  token_type: string
  user: User
}

export interface Role {
  id: string
  name: string
  slug: string
  description: string | null
  is_system: boolean
  is_active: boolean
  /** platform | built-in | custom — drives the badge and the edit lock. */
  kind?: string
  /** How many users hold this role. */
  user_count?: number
}

export interface Permission {
  id: string
  name: string
  slug: string
  module: string
  action: string
  /** Plain sentence explaining what ticking this allows. */
  description?: string | null
  /** Section of the matrix this row belongs to. */
  group?: string | null
  /** Destructive — surfaced in red so it is not ticked casually. */
  is_dangerous?: boolean
}

export interface UserWithRoles extends User {
  roles: Role[]
  avatar: string | null
  is_verified: boolean
  last_login_at: string | null
  created_at: string
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: {
    page: number
    per_page: number
    total: number
    total_pages: number
  }
}

export interface Menu {
  id: string
  label: string
  icon: string | null
  path: string | null
  parent_id: string | null
  order_index: number
  is_active: boolean
  roles?: Role[]
  children: MenuTree[]
}

export interface DashboardStats {
  users: {
    total: number
    active: number
    pending: number
    inactive: number
    suspended: number
  }
  roles: { total: number }
  today: { login_success: number; login_failed: number }
}

export interface LoginActivity {
  date: string
  success_count: number
  failed_count: number
}

export interface Profile {
  id: string
  name: string
  email: string
  avatar: string | null
  status: string
  is_verified: boolean
  last_login_at: string | null
  created_at: string
}

export interface Session {
  id: string
  ip_address: string | null
  user_agent: string | null
  created_at: string
  expires_at: string
  is_current: boolean
}

export interface AuditLog {
  id: string
  user_id: string | null
  user_name: string | null
  action: string
  module: string
  entity_id: string | null
  ip_address: string | null
  request_id: string | null
  created_at: string
}

export interface Setting {
  id: string
  key: string
  value: string | null
  type: string
  is_public: boolean
  is_secret: boolean
}

export interface MenuTree extends Menu {
  children: MenuTree[]
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'warning' | 'error' | 'success'
  is_read: boolean
  link: string | null
  created_at: string
}

export interface UnreadCount {
  count: number
}
