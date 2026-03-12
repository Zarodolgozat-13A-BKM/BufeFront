import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { OrderModel } from '../Models/OrderModel'

interface OrderState {
  orders: OrderModel[]
}

const initialState: OrderState = {
  orders: [],
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<OrderModel[]>) => {
      state.orders = action.payload
    },
    clearOrders: (state) => {
      state.orders = []
    },
  },
})

export const { setOrders, clearOrders } = orderSlice.actions
export default orderSlice.reducer
