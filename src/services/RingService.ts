import type { Ringlist, RingModel } from "../Models/RingModel";
import { api } from "./axiosInstance";

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const GetRinging = async (): Promise<RingModel> => {
  const response = await api.get<RingModel>(`/orders/breaks/${todayDateString()}`);
  return response.data;
};
