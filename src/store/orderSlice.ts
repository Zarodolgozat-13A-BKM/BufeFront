import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { OrderResponseModel } from '../Models/OrderModel'

interface OrderState {
  orders: OrderResponseModel
}

const emptyOrderResponse: OrderResponseModel = {
  data: [],
  links: {
    first: null,
    last: null,
    prev: null,
    next: null,
  },
  meta: {
    current_page: 0,
    from: 0,
    last_page: 0,
    links: [],
    path: '',
    per_page: 0,
    to: 0,
    total: 0,
  },
}

const initialState: OrderState = {
  orders: emptyOrderResponse,
}

const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    setOrders: (state, action: PayloadAction<OrderResponseModel>) => {
      state.orders = action.payload
    },
    clearOrders: (state) => {
      state.orders = emptyOrderResponse
    },
  },
})

export const { setOrders, clearOrders } = orderSlice.actions
export default orderSlice.reducer
