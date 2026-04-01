import Echo from "laravel-echo";
import Pusher from "pusher-js";
import { getStoredToken } from "../services/tokenStorage";

// Necessary for Laravel Echo to find the library
window.Pusher = Pusher;

const getEchoAuthorizationHeader = (): string => {
  const token = getStoredToken();
  return token ? `Bearer ${token}` : "";
};

export const echo = new Echo({
  broadcaster: "reverb",
  key: "lkmdfbj4dsd2tyfuprvn",
  wsHost: "bufeapi-ws.jcloud.jedlik.cloud",
  wsPort: import.meta.env.REVERB_PORT ?? 8080,
  wssPort: import.meta.env.REVERB_PORT ?? 443,
  forceTLS: true,
  enabledTransports: ["ws", "wss"],
  authEndpoint: "https://bufeapi.jcloud.jedlik.cloud/broadcasting/auth",
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
