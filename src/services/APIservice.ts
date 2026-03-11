import type { LoginModel } from "../Models/AuthModel";
import axios from "axios";
import { clearStoredToken, getStoredToken, setStoredToken } from "./tokenStorage";

const API_URL = import.meta.env.VITE_API_URL || "https://bufeapi.jcloud.jedlik.cloud/api";

export const Login = async (postData: LoginModel, _rememberMe: boolean) => {
  try {
    const response = await axios.post<{ access_token?: string }>(`${API_URL}/account/login`, postData, {
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
    });
    const token = response.data?.access_token;

    if (!token) {
      throw new Error('Login response does not contain access_token');
    }

    setStoredToken(token)
    
    return token;
  } catch (error) {
    throw error;
  }
};

export const Logout = async () => {
  try {
    const token = getStoredToken();
    const response = await axios.post(`${API_URL}/account/logout`, null, {
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    clearStoredToken();
    return response.data;
    
  } catch (error) {
    throw error;
  }
};
export const GetMe = async () => {
  try {
    const token = getStoredToken();
    const response = await axios.get(`${API_URL}/account/me`, {
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


