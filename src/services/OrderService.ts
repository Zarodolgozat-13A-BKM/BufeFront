import type { ItemModel } from "../Models/ItemModel";
import type { AllOrdersResponseModel } from "../Models/OrderModel";
import axios from "axios";
import { getStoredToken } from "./tokenStorage";
const API_URL = import.meta.env.VITE_API_URL || "http://bufeapi.jcloud.jedlik.cloud/api";
export const GetAllOrders = async (page: number) => {
  try {
    const token = getStoredToken();
    const response = await axios.get<AllOrdersResponseModel>(`${API_URL}/orders?page=${page}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }); 
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const GetOneOrder = async (id:string) => {
  try {
    const token = getStoredToken();
    const response = await axios.get<ItemModel>(`${API_URL}/orders/${id}`, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }); 
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const CreateOrder = async (postData: any) => {
  try {
    const token = getStoredToken();
    const response = await axios.post(`${API_URL}/orders`, postData, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }); 
    return response.data;
  } catch (error) {
    throw error;
  }
};