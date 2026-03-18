import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../services/tokenStorage'
import type { MeModel } from '../Models/AuthModel'

interface AuthState {
  isLoggedIn: boolean
  bearerToken: string | null
  me: MeModel | null
}

const persistedToken = getStoredToken()

const initialState: AuthState = {
  isLoggedIn: !!persistedToken,
  bearerToken: persistedToken,
  me: null,
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
      state.me = null
      clearStoredToken()
    },
    setMe: (state, action: PayloadAction<{ me: MeModel }>) => {
      state.me = action.payload.me
    }
  }
})

export const { login, logout, setMe } = authSlice.actions
export default authSlice.reducer
