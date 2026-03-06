import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { OrderCreateModel } from '../Models/OrderModel'

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
    addItemToCart: (state, action: PayloadAction<{ item_id: number; quantity: number }>) => {
      const existingItem = state.cart.items.find(item => item.item_id === action.payload.item_id)
      if (existingItem) {
        existingItem.quantity += action.payload.quantity
      } else {
        state.cart.items.push(action.payload)
      }
    },
    updateItemQuantity: (state, action: PayloadAction<{ item_id: number; delta: number }>) => {
      const item = state.cart.items.find(i => i.item_id === action.payload.item_id)
      if (item) {
        item.quantity += action.payload.delta
        if (item.quantity <= 0) {
          state.cart.items = state.cart.items.filter(i => i.item_id !== action.payload.item_id)
        }
      } else if (action.payload.delta > 0) {
        state.cart.items.push({ item_id: action.payload.item_id, quantity: action.payload.delta })
      }
    },
    removeItemFromCart: (state, action: PayloadAction<number>) => {
      console.log('Removing item with ID:', action.payload)
      state.cart.items = state.cart.items.filter(item => item.item_id !== action.payload)
    },
    clearCart: (state) => {
      state.cart = {
        delivery_date: '',
        items: []
      }
    },
  },
})

export const { setCart, addItemToCart, updateItemQuantity, removeItemFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
