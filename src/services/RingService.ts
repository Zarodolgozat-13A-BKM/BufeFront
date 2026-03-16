import type { Ringlist, RingModel } from "../Models/RingModel";
import axios from "axios";
import api from "./axiosInstance";


function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const GetRinging = async (): Promise<Ringlist[]> => {
  const endpoint = `/orders/breaks/${todayDateString()}`;
  const response = await api.get<RingModel>(endpoint);
  return response.data.rings;
};
