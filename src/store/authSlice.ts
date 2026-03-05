import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

interface AuthState {
  isLoggedIn: boolean
  bearerToken: string | null
  username?: string
}

const initialState: AuthState = {
  isLoggedIn: false,
  bearerToken: null
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<{ token: string; username: string }>) => {
      state.isLoggedIn = true
      state.bearerToken = action.payload.token
      state.username = action.payload.username
    },
    logout: (state) => {
      state.isLoggedIn = false
      state.bearerToken = null
      state.username = undefined
    },
  },
})

export const { login, logout } = authSlice.actions
export default authSlice.reducer
