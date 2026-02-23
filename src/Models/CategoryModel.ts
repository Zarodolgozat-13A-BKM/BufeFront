import type { ItemModel } from "./ItemModel";
export interface CategoryModel {
  id: number
  name: string
  created_at: Date
  updated_at: Date
  items: ItemModel[]
}