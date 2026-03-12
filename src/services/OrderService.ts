import type { AllOrdersResponseModel, OrderCreateModel, OrderModel } from "../Models/OrderModel";
import api from "./axiosInstance";

export const GetAllOrders = async (page: number) => {
  const response = await api.get<AllOrdersResponseModel>(`/orders?page=${page}`);
  return response.data;
};

export const GetOneOrder = async (id: string) => {
  const response = await api.get<OrderModel>(`/orders/${id}`);
  return response.data;
};

export const CreateOrder = async (postData: OrderCreateModel) => {
  const response = await api.post<OrderModel>(`/orders`, postData);
  return response.data;
};
