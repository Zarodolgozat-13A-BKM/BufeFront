const THEME_STORAGE_KEY = 'theme'

export type ThemeMode = 'light' | 'dark'
export type ThemePreference = ThemeMode | 'system'

let systemThemeMediaQuery: MediaQueryList | null = null
let systemThemeListener: ((event: MediaQueryListEvent) => void) | null = null

const getSystemTheme = (): ThemeMode => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

const applyResolvedTheme = (theme: ThemeMode) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

const removeSystemThemeListener = () => {
  if (systemThemeMediaQuery && systemThemeListener) {
    systemThemeMediaQuery.removeEventListener('change', systemThemeListener)
  }
  systemThemeMediaQuery = null
  systemThemeListener = null
}

const syncSystemThemeListener = (preference: ThemePreference) => {
  removeSystemThemeListener()
  if (preference !== 'system' || !window.matchMedia) {
    return
  }

  systemThemeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  systemThemeListener = () => {
    if (getThemePreference() === 'system') {
      applyResolvedTheme(getSystemTheme())
    }
  }
  systemThemeMediaQuery.addEventListener('change', systemThemeListener)
}

export const getStoredTheme = (): ThemePreference | null => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark' || storedTheme === 'system') {
    return storedTheme
  }
  return null
}

export const getThemePreference = (): ThemePreference => getStoredTheme() ?? 'system'

export const getResolvedTheme = (preference: ThemePreference = getThemePreference()): ThemeMode => {
  return preference === 'system' ? getSystemTheme() : preference
}

export const isDarkTheme = (): boolean => document.documentElement.classList.contains('dark')

export const applyTheme = (theme: ThemeMode) => {
  localStorage.setItem(THEME_STORAGE_KEY, theme)
  applyResolvedTheme(theme)
  syncSystemThemeListener(theme)
}

export const applyThemePreference = (preference: ThemePreference) => {
  localStorage.setItem(THEME_STORAGE_KEY, preference)
  applyResolvedTheme(getResolvedTheme(preference))
  syncSystemThemeListener(preference)
}

export const applyInitialTheme = () => {
  const storedTheme = getThemePreference()
  applyThemePreference(storedTheme)
}

export const toggleTheme = (): ThemePreference => {
  const currentTheme = getThemePreference()
  const nextTheme: ThemePreference = currentTheme === 'light' ? 'dark' : currentTheme === 'dark' ? 'system' : 'light'
  applyThemePreference(nextTheme)
  return nextTheme
}
