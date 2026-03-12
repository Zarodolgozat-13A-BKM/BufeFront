import type { CategoryModel } from "../Models/CategoryModel";
import api from "./axiosInstance";

export const GetAllCategories = async () => {
  const response = await api.get<CategoryModel[]>(`/categories`);
  return response.data;
};

export const GetOneCategory = async (id: string) => {
  const response = await api.get<CategoryModel>(`/categories/${id}`);
  return response.data;
};

export const CreateCategory = async (categoryName: string) => {
  const response = await api.post<CategoryModel>(`/categories`, { name: categoryName });
  return response.data;
};

export const DeleteCategory = async (id: string) => {
  const response = await api.delete(`/categories/${id}`);
  return response.data;
};

export const UpdateCategory = async (id: string, categoryName: string) => {
  const response = await api.put<CategoryModel>(`/categories/${id}`, { name: categoryName });
  return response.data;
};

