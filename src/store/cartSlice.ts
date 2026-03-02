import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { OrderCreateModel } from '../models/OrderModel'

interface CartState {
  cart: OrderCreateModel
}

const initialState: CartState = {
  cart: {
    delivery_date: '',
    items: []
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<OrderCreateModel>) => {
      state.cart = action.payload
    },
    clearCart: (state) => {
      state.cart = {
        delivery_date: '',
        items: []
      }
    },
  },
})

export const { setCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
