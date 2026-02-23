import type { CategoryModel } from "../Models/CategoryModel";

const API_URL = import.meta.env.VITE_API_URL || "http://bufeapi-markomilan.jcloud.jedlik.cloud/api";
const getCookie = (name: string) => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift();
  return null;
};
export const GetAllCategories = async () => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/categories`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }); 
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data: CategoryModel[] = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
export const GetOneCategory = async (id: string) => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/categories/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    }); 
    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data: CategoryModel = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
export const CreateCategory = async (categoryName: string) => {
  try {
    const token = getCookie('token');
    const postData = { name: categoryName };
    const response = await fetch(`${API_URL}/categories`, {
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
    const data: CategoryModel = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};
export const DeleteCategory = async (id: string) => {
  try {
    const token = getCookie('token');
    const response = await fetch(`${API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
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
export const UpdateCategory = async (id: string, categoryName: string) => {
  try {
    const token = getCookie('token');
    const postData = { name: categoryName };
    const response = await fetch(`${API_URL}/categories/${id}`, {
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
    const data: CategoryModel = await response.json();
    return data;
    } catch (error) {
    throw error;
    };
};