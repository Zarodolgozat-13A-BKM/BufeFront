import type { ItemCreateModel, ItemModel } from "../models/ItemModel";

const API_URL = import.meta.env.VITE_API_URL || "http://bufeapi-markomilan.jcloud.jedlik.cloud/api";
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};
export const GetAllItems = async () => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/items`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }); 
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data: ItemModel[] = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const GetOneItem = async (id:string) => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/items/${id}`, {
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

export const CreateItem = async (postData: ItemCreateModel) => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/items`, {
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

export const UpdateItem = async (id:string, postData: any) => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(postData),
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
export const DeleteItem = async (id:string) => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/items/${id}`, {
      method: "DELETE",
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
export const ToggleItem = async (id:string) => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/items/${id}/toggle-active`, {
      method: "POST",
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