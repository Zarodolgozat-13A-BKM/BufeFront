import type { ItemModel } from "../models/ItemModel";
import type { AllOrdersResponseModel } from "../models/OrderModel";
import { getStoredToken } from "./tokenStorage";
const API_URL = import.meta.env.VITE_API_URL || "http://bufeapi.jcloud.jedlik.cloud/api";
export const GetAllOrders = async (page: number) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_URL}/orders?page=${page}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }); 
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data: AllOrdersResponseModel = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetOneOrder = async (id:string) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_URL}/orders/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }); 
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data: ItemModel = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
export const CreateOrder = async (postData: any) => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_URL}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
    }); 
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};