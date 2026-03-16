export interface OrderItem {
  item_id: number
  quantity: number
}

export interface OrderLineItem {
  item_id: number
  item_name: string
  item_price: number
  picture_url: string
  quantity: number
  price: number
}

export interface OrderModel {
  id: number
  user_id: number
  order_identifier_number: number
  status: string
  delivery_date: string | null
  items: OrderLineItem[] | undefined
  total_price?: number
  default_completion_time?: number
}
export interface OrderPatchModel{
  message?: string,
  order: OrderModel
}

export interface CartModel {
  items: CartItemModel[]
}

import type { ItemModel } from './ItemModel'
export type CartItemModel = ItemModel & {
  quantity?: number
}

export interface OrderCreateModel {
  delivery_date: string
  items: OrderItem[]
}