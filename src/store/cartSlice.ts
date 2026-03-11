import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { ItemModel } from '../Models/ItemModel'
import type { CartModel } from '../Models/OrderModel'

interface CartState {
  cart: CartModel
}

const initialState: CartState = {
  cart: {
    items: [],
  },
}

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCart: (state, action: PayloadAction<CartModel>) => {
      state.cart = action.payload
    },
    addItemToCart: (state, action: PayloadAction<{ item: ItemModel; quantity: number }>) => {
      if (action.payload.quantity <= 0) return
      const existingItem = state.cart.items.find((item) => item.id === action.payload.item.id)
      if (existingItem) {
        existingItem.quantity = (existingItem.quantity ?? 0) + action.payload.quantity
      } else {
        state.cart.items.push({
          ...action.payload.item,
          quantity: action.payload.quantity,
        })
      }
    },
    updateItemQuantity: (state, action: PayloadAction<{ item_id: number; delta: number }>) => {
      const item = state.cart.items.find((i) => i.id === action.payload.item_id)
      if (!item) return

      item.quantity = (item.quantity ?? 0) + action.payload.delta
      if ((item.quantity ?? 0) <= 0) {
        state.cart.items = state.cart.items.filter((i) => i.id !== action.payload.item_id)
      }
    },
    removeItemFromCart: (state, action: PayloadAction<number>) => {
      state.cart.items = state.cart.items.filter((item) => item.id !== action.payload)
    },
    clearCart: (state) => {
      state.cart = {
        items: [],
      }
    },
  },
})

export const { setCart, addItemToCart, updateItemQuantity, removeItemFromCart, clearCart } = cartSlice.actions
export default cartSlice.reducer
