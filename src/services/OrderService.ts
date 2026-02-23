import type { ItemModel } from "../Models/ItemModel";
import type { AllOrdersResponseModel } from "../Models/OrderModel";
const API_URL = import.meta.env.VITE_API_URL || "http://bufeapi-markomilan.jcloud.jedlik.cloud/api";
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};
export const GetAllOrders = async (page: number) => {
  try {
    const token = getCookie('token');
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
    const token = getCookie('token');
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
    const token = getCookie('token');
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