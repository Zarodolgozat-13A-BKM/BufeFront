export interface ItemModel {
  id: number;
  name: string;
  picture_url: string | null;
  description: string | null;
  price: number;
  is_active: boolean;
  default_time_to_deliver: number;
  is_featured: boolean;
  category_id: number;
  inventory_count: number;
}

export interface ItemCreateModel {
  name: string;
  picture_url: string | null;
  description: string | null;
  price: number;
  is_active: boolean;
  default_time_to_deliver: number;
  category_id: number;
  is_featured: boolean;
  inventory_count: number;
}
