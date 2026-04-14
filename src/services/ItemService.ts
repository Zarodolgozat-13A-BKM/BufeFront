import type { InventoryAdjustment, ItemCreateModel,  ItemModel } from "../Models/ItemModel";
import { api }  from "./axiosInstance";

type ItemPayload = ItemCreateModel | FormData;


export const GetAllItems = async () => {
  const response = await api.get<ItemModel[]>(`/items`);
  return response.data;
};

export const GetOneItem = async (id: number) => {
  const response = await api.get(`/items/${id}`);
  return response.data.item as ItemModel;
};

export const CreateItem = async (postData: ItemPayload) => {
  if (postData instanceof FormData) {
    const response = await api.post<ItemModel>(`/items`, postData);
    return response.data;
  } else {
    const response = await api.post<ItemModel>(`/items`, postData);
    return response.data;
  }
};

export const UpdateItem = async (id: number, postData: FormData) => {
  const response = await api.patch<ItemModel>(`/items/${id}`, postData);
  return response.data;
};

export const DeleteItem = async (id: number) => {
  const response = await api.delete<ItemModel>(`/items/${id}`);
  return response.data;
};

export const ToggleActive = async (id: number) => {
  const response = await api.post(`/items/${id}/toggle-active`);
  return response.data;
};

export const ToggleFeatured = async (id: number) => {
  const response = await api.post(`/items/${id}/toggle-featured`);
  return response.data;
};

export const AdjustInventory = async (items: InventoryAdjustment) => {
  const response = await api.post<{items: ItemModel[]}>(`/items/update-inventory`, {
    items,
  });
  return response.data.items as ItemModel[];
};
