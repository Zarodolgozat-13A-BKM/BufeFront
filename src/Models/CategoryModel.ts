import type { ItemModel } from "./ItemModel";
export interface CategoryModel {
  id: number
  name: string
  items: ItemModel[]
}