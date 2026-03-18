
import type { OrderCreateModel, OrderModel, OrderPatchModel, StatusModel } from "../Models/OrderModel";
import {api} from "./axiosInstance";

export const GetStatuses = async () => {
  const response = await api.get<StatusModel[]>(`/statuses`);
  if (import.meta.env.DEV) {
    console.log('Fetched statuses:', response.data);
  }
  return response.data;
}
export const GetAllOrders = async () => {
  const response = await api.get<OrderModel[]>(`/orders`);
  return response.data;
};

export const GetOneOrder = async (id: string) => {
  const response = await api.get<OrderModel>(`/orders/${id}`);
  return response.data;
};

export const CreateOrder = async (postData: OrderCreateModel) => {
  const response = await api.post<OrderModel>(`/payment/checkout`, postData);
  return response.data;
};

export const UpdateOrderStatus = async (id: number, status: string) => {
  const response = await api.patch<OrderPatchModel>(`/orders/${id}`, {status_id:status});
  if (import.meta.env.DEV) {
    console.log('Order status updated:', response.data);
  }
  return response.data;
};
