
import type {
  OrderCreateModel,
  OrderModel,
  OrderPatchModel,
  StatusModel,
} from "../Models/OrderModel";
import { api } from "./axiosInstance";

export const GetStatuses = async () => {
  const response = await api.get<StatusModel[]>(`/statuses`);
  if (import.meta.env.DEV) {
    console.log("Fetched statuses:", response.data);
  }
  return response.data;
};
export const GetAllOrders = async (page: number) => {
  const response = await api.get<OrderModel[]>(`/orders?page=${page}`);
  return response.data;
};
export const GetAllActiveOrders = async () => {
  const response = await api.get<OrderModel[]>(`/orders/active`);
  return response.data;
};

export const GetOneOrder = async (id: string) => {
  const response = await api.get<OrderModel>(`/orders/${id}`);
  return response.data;
};

export const GetStripeKey = async () => {
  const response = await api.get<{ key: string }>(`/payment/stripe-key`);
  return response.data.key;
}

export const CreateOrder = async (postData: OrderCreateModel) => {
  if (import.meta.env.DEV) {
    console.log("Creating order with data:", postData);
  }
  if(postData.comment?.trim() === "" || postData.comment === null) {
    postData.comment = undefined; 
  } 
  const response = await api.post<OrderModel>(`/payment/checkout`, postData);
  if (import.meta.env.DEV) {
    console.log("Order created:", response.data);
  }
  return response.data;
};

export const UpdateOrderStatus = async (id: number, status: string) => {
  const statusResponse = await GetStatuses();
  console.log(statusResponse);
  const statusObj = statusResponse.find((s) => s.name === status);
  const response = await api.patch<OrderPatchModel>(`/orders/${id}`, {
    status_id: statusObj?.id,
  });
  if (import.meta.env.DEV) {
    console.log("Order status updated:", response.data);
  }
  return response.data;
};
