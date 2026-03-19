import Echo from "laravel-echo";
import Pusher from "pusher-js";

// Necessary for Laravel Echo to find the library
window.Pusher = Pusher;

export const echo = new Echo({
  broadcaster: "reverb",
  key: "lkmdfbj4dsd2tyfuprvn",
  wsHost: "https://bufeapi-ws.jcloud.jedlik.cloud",
  wsPort: import.meta.env.REVERB_PORT ?? 8080,
  wssPort: import.meta.env.REVERB_PORT ?? 443,
  forceTLS: (import.meta.env.REVERB_SCHEME ?? "https") === "https",
  enabledTransports: ["ws", "wss"],
  authEndpoint: "https://bufeapi.jcloud.jedlik.cloud/broadcasting/auth",
  auth: {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
      Accept: "application/json",
    },
  },

  withCredentials: true,
});
