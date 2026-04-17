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
export interface OrderResponseModel {
  data: OrderModel[],
  links: {
    first: string,
    last: string | null,
    prev: string | null,
    next: string | null
  },
  meta: {
    current_page: number,
    from: number,
    last_page: number,
    links: [
      {
        url: string,
        label: string,
        active: boolean
      }
    ],
    path: string,
    per_page: number,
    to: number,
    total: number
  }
}

export interface OrderModel {
  id: number
  user_username: string
  order_identifier_number: number
  status: string
  created_at?: string | null
  delivery_date: string | null
  items: OrderLineItem[] | undefined
  total_price?: number
  default_completion_time?: number
  comment: string | null
  clientSecret?: string
  payment_intent_id?: string
}
export interface OrderPatchModel {
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
  comment: string | null | undefined
  items: OrderItem[]
  cash: boolean
}
export interface StatusModel {
  id: number
  name: string
}