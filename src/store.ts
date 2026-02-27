import { configureStore, createSlice } from '@reduxjs/toolkit'

const appSlice = createSlice({
	name: 'app',
	initialState: {
		initialized: true,
	},
	reducers: {},
})

const authSlice = createSlice({
	name: 'auth',
	initialState: {
		token: null as string | null,
	},
	reducers: {
		setToken: (state, action: { payload: string }) => {
			state.token = action.payload
			console.log('Token set in store:', state.token)
		},
		clearToken: (state) => {
			state.token = null
		},
	},
})

const store = configureStore({
	reducer: {
		app: appSlice.reducer,
		auth: authSlice.reducer,
	},
})

export const { setToken, clearToken } = authSlice.actions
export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store