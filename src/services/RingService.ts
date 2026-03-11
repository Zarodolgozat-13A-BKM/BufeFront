import type { RingModel } from "../Models/RingModel";
import axios from "axios";
const API_URL = import.meta.env.VITE_RING_API_URL || "https://jcs.jedlik.eu:4001/api";
export const GetRinging = async () => {
  const response = await axios.get<RingModel>(`${API_URL}/ring-list`);
  return response.data;
};