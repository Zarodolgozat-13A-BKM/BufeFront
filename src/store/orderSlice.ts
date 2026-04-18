import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { OrderResponseModel } from '../Models/OrderModel'

interface OrderState {
  orders: OrderResponseModel
}

const initialState: OrderState = {
  orders: [] as unknown as OrderResponseModel,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<OrderResponseModel>) => {
      state.orders = action.payload
    },
    clearOrders: (state) => {
      state.orders = [] as unknown as OrderResponseModel
    },
  },
})

export const { setOrders, clearOrders } = orderSlice.actions
export default orderSlice.reducer
