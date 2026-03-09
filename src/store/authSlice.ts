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
  name?: string
}

const persistedToken = getStoredToken()
const persistedUsername = getStoredUsername()

const initialState: AuthState = {
  isLoggedIn: !!persistedToken,
  bearerToken: persistedToken,
  name : persistedUsername ?? undefined,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string }>) => {
      state.isLoggedIn = true
      state.bearerToken = action.payload.token
      setStoredToken(action.payload.token)
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.bearerToken = null
      state.name = undefined
      clearStoredToken()
      clearStoredUsername()
    },
    setName: (state, action: PayloadAction<{ name: string }>) => {
      state.name = action.payload.name
      setStoredUsername(action.payload.name)
    }
  },
})

export const { login, logout, setName } = authSlice.actions
export default authSlice.reducer
