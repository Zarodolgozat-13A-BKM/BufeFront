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
export const GetAllOrders = async () => {
  const response = await api.get<OrderModel[]>(`/orders`);
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

export const CreateOrder = async (postData: OrderCreateModel) => {
  console.log("Creating order with data:", postData);
  if(postData.comment?.trim() === "" || postData.comment === null) {
    postData.comment = undefined; 
  } 
  const response = await api.post<OrderModel>(`/payment/checkout`, postData);
  console.log("Order created:", response.data);
  return response.data;
};

export const UpdateOrderStatus = async (id: number, status: string) => {
  const response = await api.patch<OrderPatchModel>(`/orders/${id}`, {
    status_id: status,
  });
  if (import.meta.env.DEV) {
    console.log("Order status updated:", response.data);
  }
  return response.data;
};
