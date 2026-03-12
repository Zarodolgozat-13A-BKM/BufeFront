import type { ItemCreateModel, ItemModel } from "../Models/ItemModel";
import api from "./axiosInstance";

export const GetAllItems = async () => {
  const response = await api.get<ItemModel[]>(`/items`);
  return response.data;
};

export const GetOneItem = async (id: string) => {
  const response = await api.get<ItemModel>(`/items/${id}`);
  return response.data;
};

export const CreateItem = async (postData: ItemCreateModel) => {
  const response = await api.post<ItemModel>(`/items`, postData);
  return response.data;
};

export const UpdateItem = async (id: string, postData: Partial<ItemCreateModel>) => {
  const response = await api.put<ItemModel>(`/items/${id}`, postData);
  return response.data;
};

export const DeleteItem = async (id: string) => {
  const response = await api.delete<ItemModel>(`/items/${id}`);
  return response.data;
};

export const ToggleActive = async (id: string) => {
  const response = await api.post(`/items/${id}/toggle-active`);
  return response.data;
};

export const ToggleFeatured = async (id: string) => {
  const response = await api.post(`/items/${id}/toggle-featured`);
  return response.data;
};
