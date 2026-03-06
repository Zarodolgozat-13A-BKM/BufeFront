import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  clearStoredToken,
  clearStoredUsername,
  getStoredToken,
  getStoredUsername,
  setStoredToken,
  setStoredUsername,
} from '../services/tokenStorage'

interface AuthState {
  isLoggedIn: boolean
  bearerToken: string | null
  username?: string
}

const persistedToken = getStoredToken()
const persistedUsername = getStoredUsername()

const initialState: AuthState = {
  isLoggedIn: !!persistedToken,
  bearerToken: persistedToken,
  username: persistedUsername ?? undefined,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; username: string }>) => {
      state.isLoggedIn = true
      state.bearerToken = action.payload.token
      state.username = action.payload.username
      setStoredToken(action.payload.token)
      setStoredUsername(action.payload.username)
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.bearerToken = null
      state.username = undefined
      clearStoredToken()
      clearStoredUsername()
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
