import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getStoredToken } from "../services/tokenStorage";

// Necessary for Laravel Echo to find the library
window.Pusher = Pusher;

const apiUrl = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";
const reverbHost = import.meta.env.VITE_REVERB_HOST || "127.0.0.1";
const reverbPort = Number(import.meta.env.VITE_REVERB_PORT || 8080);
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME || (window.location.protocol === "https:" ? "https" : "http");

const getEchoAuthorizationHeader = (): string => {
  const token = getStoredToken();
  return token ? `Bearer ${token}` : "";
};

export const echo = new Echo({
  broadcaster: "reverb",
  // key: "lkmdfbj4dsd2tyfuprvn",
  key: "exwatrl1ffrnjuuz61ga",
  // wsHost: "bufeapi-ws.jcloud.jedlik.cloud",
  wsHost: reverbHost.replace(/^https?:\/\//, ""),
  wsPort: reverbPort,
  wssPort: reverbPort,
  forceTLS: reverbScheme === "https",
  enabledTransports: ["ws", "wss"],
  authEndpoint: `http://127.0.0.1:8000/broadcasting/auth`,
  auth: {
    headers: {
      get Authorization() {
        return getEchoAuthorizationHeader();
      },
      Accept: "application/json",
    },
  },

  withCredentials: true,
});
