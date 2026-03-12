import type { Ringlist } from "../Models/RingModel";
import axios from "axios";

const REAL_API = "https://jedlikinfo.jedlik.eu/api/api";
const CORS_PROXY = "https://corsproxy.io/?";

function todayDateString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export const GetRinging = async (): Promise<Ringlist[]> => {
  const endpoint = `/timetable/ringsystem/${todayDateString()}`;
  const url = import.meta.env.DEV
    ? `/external-api${endpoint}`
    : `${CORS_PROXY}${encodeURIComponent(REAL_API + endpoint)}`;

  const response = await axios.get<Ringlist[]>(url, { timeout: 10000 });
  return response.data;
};
