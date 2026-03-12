import type { LoginModel, MeModel } from "../Models/AuthModel";
import api from "./axiosInstance";
import { clearStoredToken, setStoredToken } from "./tokenStorage";

export const Login = async (postData: LoginModel, rememberMe: boolean) => {
  const response = await api.post<{ access_token?: string }>(`/account/login`, postData);
  const token = response.data?.access_token;

  if (!token) {
    throw new Error('Login response does not contain access_token');
  }

  setStoredToken(token, rememberMe)

  return token;
};

export const Logout = async () => {
  const response = await api.post(`/account/logout`);
  clearStoredToken();
  return response.data;
};

export const GetMe = async (): Promise<MeModel> => {
  const response = await api.get<MeModel>(`/account/me`);
  return response.data;
};
