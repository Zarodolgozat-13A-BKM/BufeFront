import type { RingModel } from "../Models/RingModel";
const API_URL = import.meta.env.VITE_RING_API_URL || "https://jcs.jedlik.eu:4001/api";
export const GetRinging = async () => {
  const response = await fetch(`${API_URL}/ring-list`, {
    method: "GET",
  });
  if (!response.ok) {
    throw new Error(`Error: ${response.status} ${response.statusText}`);
  }
  const data: RingModel = await response.json();
  return data;
};