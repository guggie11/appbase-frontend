import { create } from 'zustand'
import { apiClient } from '@/shared/api/client'

interface ThemeState {
  appName: string
  appSubtitle: string
  primaryColor: string
  logoUrl: string
  faviconUrl: string
  isLoaded: boolean
  loadTheme: () => Promise<void>
  applyTheme: (overrides?: Partial<ThemeState>) => void
  updateField: (key: string, value: string) => void
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  appName: 'Appbase',
  appSubtitle: 'App Template',
  primaryColor: '#d8452a',
  logoUrl: '',
  faviconUrl: '',
  isLoaded: false,

  loadTheme: async () => {
    try {
      // GET /settings/public - no auth needed
      const res = await apiClient.get('/settings/public')
      const settings = res.data.data as { key: string; value: string }[]
      const map = Object.fromEntries(settings.map((s) => [s.key, s.value]))

      const state = {
        appName: map.app_name || 'Appbase',
        appSubtitle: map.app_subtitle || 'App Template',
        primaryColor: map.primary_color || '#d8452a',
        logoUrl: map.logo_url || '',
        faviconUrl: map.favicon_url || '',
        isLoaded: true,
      }
      set(state)
      get().applyTheme(state)
    } catch {
      set({ isLoaded: true })
    }
  },

  applyTheme: (overrides) => {
    const state = { ...get(), ...overrides }
    // Apply CSS variables
    document.documentElement.style.setProperty('--color-primary', state.primaryColor)
    document.documentElement.style.setProperty('--color-primary-hover', adjustColor(state.primaryColor, -20))
    document.documentElement.style.setProperty('--color-primary-light', hexToLight(state.primaryColor))
    // Apply document title
    document.title = state.appName
    // Apply favicon
    if (state.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]')
      if (!link) {
        link = document.createElement('link')
        link.rel = 'icon'
        document.head.appendChild(link)
      }
      link.href = state.faviconUrl
    }
  },

  updateField: (key, value) => {
    set({ [key]: value } as Partial<ThemeState>)
    // Apply real-time if primary color
    if (key === 'primaryColor' && /^#[0-9A-Fa-f]{6}$/.test(value)) {
      get().applyTheme({ primaryColor: value } as Partial<ThemeState>)
    }
    if (key === 'appName') {
      document.title = value
    }
  },
}))

// Helper: darken hex color by amount
function adjustColor(hex: string, amount: number): string {
  const num = parseInt(hex.slice(1), 16)
  const r = Math.max(0, Math.min(255, (num >> 16) + amount))
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0xff) + amount))
  const b = Math.max(0, Math.min(255, (num & 0xff) + amount))
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

// Helper: generate light version of color
function hexToLight(hex: string): string {
  return hex + '1A' // 10% opacity approximation
}
