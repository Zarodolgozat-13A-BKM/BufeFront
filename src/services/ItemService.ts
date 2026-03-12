import type { ItemCreateModel, ItemModel } from "../Models/ItemModel";
import axios from "axios";
import { getStoredToken } from "./tokenStorage";

const API_URL = import.meta.env.VITE_API_URL || "http://bufeapi.jcloud.jedlik.cloud/api"
export const GetAllItems = async () => {
  try {
    const token = getStoredToken();
    const response = await axios.get<ItemModel[]>(`${API_URL}/items`, {
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

export const GetOneItem = async (id:string) => {
  try {
    const token = getStoredToken();
    const response = await axios.get<ItemModel>(`${API_URL}/items/${id}`, {
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

export const CreateItem = async (postData: ItemCreateModel) => {
  try {
    const token = getStoredToken();
    const response = await axios.post(`${API_URL}/items`, postData, {
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

export const UpdateItem = async (id:string, postData: any) => {
  try {
    const token = getStoredToken();
    const response = await axios.put<ItemModel>(`${API_URL}/items/${id}`, postData, {
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
export const DeleteItem = async (id:string) => {
  try {
    const token = getStoredToken();
    const response = await axios.delete<ItemModel>(`${API_URL}/items/${id}`, {
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
export const ToggleItem = async (id:string) => {
  try {
    const token = getStoredToken();
    const response = await axios.post<ItemModel>(`${API_URL}/items/${id}/toggle-active`, null, {
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