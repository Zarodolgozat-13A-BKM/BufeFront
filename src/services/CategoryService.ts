import type { CategoryModel } from "../Models/CategoryModel";
import axios from "axios";
import { store } from "../store/store";

const API_URL = import.meta.env.VITE_API_URL || "https://bufeapi.jcloud.jedlik.cloud/api";

export const GetAllCategories = async () => {
  try {
    const token = store.getState().auth.bearerToken;
    console.log("Token in GetAllCategories:", token);
    const response = await axios.get<CategoryModel[]>(`${API_URL}/categories`, {
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
export const GetOneCategory = async (id: string) => {
  try {
    const token = store.getState().auth.bearerToken;
    const response = await axios.get<CategoryModel>(`${API_URL}/categories/${id}`, {
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
export const CreateCategory = async (categoryName: string) => {
  try {
    const token = store.getState().auth.bearerToken;
    const postData = { name: categoryName };
    const response = await axios.post<CategoryModel>(`${API_URL}/categories`, postData, {
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
export const DeleteCategory = async (id: string) => {
  try {
    const token = store.getState().auth.bearerToken;
    const response = await axios.delete(`${API_URL}/categories/${id}`, {
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
export const UpdateCategory = async (id: string, categoryName: string) => {
  try {
    const token = store.getState().auth.bearerToken;
    const postData = { name: categoryName };
    const response = await axios.put<CategoryModel>(`${API_URL}/categories/${id}`, postData, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        },
    });
    return response.data;
    } catch (error) {
    throw error;
    };
};