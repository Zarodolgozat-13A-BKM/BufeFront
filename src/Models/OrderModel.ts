import type { ItemModel } from "./ItemModel";
export interface OrderModel {
  id: number
  user_id: number
  order_identifier_number: number
  status: boolean
  delivery_date: Date | null;
  created_at: Date
  updated_at: Date
  items: ItemModel[]
}

export interface OrderCreateModel {
  delivery_date: string
  items: OrderItem[]
}

export interface OrderItem {
  item_id: number
  quantity: number
  
}
export interface Links {
  first: string
  last: string
  prev: string | null
  next: string | null
}

export interface Meta {
  current_page: number
  from: number
  last_page: number
  per_page: number
  to: number
  total: number
}
export interface AllOrdersResponseModel {
  data: OrderModel[]
  links: Links
  meta: Meta
}