const TOKEN_KEY = 'token'

export const getStoredToken = (): string | null => {
  if (typeof window === 'undefined') {
    return null
  }

  return window.localStorage.getItem(TOKEN_KEY) ?? window.sessionStorage.getItem(TOKEN_KEY)
}

export const setStoredToken = (token: string, rememberMe = true) => {
  if (typeof window === 'undefined') {
    return
  }

  if (rememberMe) {
    window.localStorage.setItem(TOKEN_KEY, token)
  } else {
    window.sessionStorage.setItem(TOKEN_KEY, token)
  }
}

export const clearStoredToken = () => {
  if (typeof window === 'undefined') {
    return
  }

  window.localStorage.removeItem(TOKEN_KEY)
  window.sessionStorage.removeItem(TOKEN_KEY)
}
