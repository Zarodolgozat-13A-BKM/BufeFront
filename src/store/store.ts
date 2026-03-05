import { configureStore } from '@reduxjs/toolkit'
import authReducer from './authSlice'
import cartReducer from './cartSlice'
import categoryReducer from './categorySlice'
import itemReducer from './itemSlice'

export const store = configureStore({
  reducer: {
    auth: authReducer,
    cart: cartReducer,
    category: categoryReducer,
    item: itemReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
