import type { LoginModel } from "../Models/AuthModel";
import { clearStoredToken, getStoredToken, setStoredToken } from "./tokenStorage";

const API_URL = import.meta.env.DEV
  ? (import.meta.env.VITE_API_URL || '/api')
  : (import.meta.env.VITE_API_URL || "http://bufeapi-markomilan.jcloud.jedlik.cloud/api");

export const Login = async (postData: LoginModel, _rememberMe: boolean) => {
  try {
    const response = await fetch(`${API_URL}/account/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(postData),
      redirect: 'follow',
    });
    console.log('Login response status:', response.status);
    console.log('Login response status text:', postData);
    console.log('Login response data:');
    if (!response.ok) {
      const bodyText = await response.text().catch(() => '');
      throw new Error(`Error: ${response.status} ${response.statusText} - ${bodyText}`);
    }
    const data = await response.json();
    const token = data?.access_token as string | undefined;

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
    const response = await fetch(`${API_URL}/account/logout`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
    }
    const data = await response.json();
    clearStoredToken();
    return data;
    
  } catch (error) {
    throw error;
  }
};
export const GetMe = async () => {
  try {
    const token = getStoredToken();
    const response = await fetch(`${API_URL}/account/me`, {
      method: "GET",
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


