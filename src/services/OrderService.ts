import type { OrderCreateModel, OrderModel, OrderPatchModel } from "../Models/OrderModel";
import api from "./axiosInstance";

export const GetAllOrders = async () => {
  const response = await api.get<OrderModel[]>(`/orders`);
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

export const UpdateOrderStatus = async (id: number, status: string) => {
  const response = await api.patch<OrderPatchModel>(`/orders/${id}`, {status: 6});
  console.log('Order status updated:', response.data);
  return response.data;
};
