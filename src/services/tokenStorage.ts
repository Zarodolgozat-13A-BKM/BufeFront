const TOKEN_KEY = 'token'
const NAME_KEY = 'name'

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(TOKEN_KEY)
}

export const setStoredToken = (token: string) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(TOKEN_KEY, token)
}

export const clearStoredToken = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(TOKEN_KEY)
}

export const getStoredUsername = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(NAME_KEY)
}

export const setStoredUsername = (username: string) => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.setItem(NAME_KEY, username)
}

export const clearStoredUsername = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(NAME_KEY)
}