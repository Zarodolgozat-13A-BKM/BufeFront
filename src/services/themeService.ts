const THEME_STORAGE_KEY = 'theme'

type ThemeMode = 'light' | 'dark'

const getSystemTheme = (): ThemeMode => {
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  return 'light'
}

export const getStoredTheme = (): ThemeMode | null => {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY)
  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme
  }
  return null
}

export const isDarkTheme = (): boolean => document.documentElement.classList.contains('dark')

export const applyTheme = (theme: ThemeMode) => {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  localStorage.setItem(THEME_STORAGE_KEY, theme)
}

export const applyInitialTheme = () => {
  const storedTheme = getStoredTheme()
  applyTheme(storedTheme ?? getSystemTheme())
}

export const toggleTheme = (): ThemeMode => {
  const nextTheme: ThemeMode = isDarkTheme() ? 'light' : 'dark'
  applyTheme(nextTheme)
  return nextTheme
}
