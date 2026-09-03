import { io, Socket as SocketType } from "socket.io-client";
import {
  serverUrl,
  getAccessToken,
  onTokenRefreshed,
  ensureFreshAccessToken,
} from "./config/API";

let authRefreshAttempted = false;

const AUTH_ERROR_SIGNALS = [
  "UNAUTHORIZED",
  "TOKEN_EXPIRED",
  "jwt expired",
  "Unauthorized",
];

const isAuthError = (err: Error): boolean => {
  const code = (err as any)?.data?.code;
  const message = err?.message ?? "";
  return AUTH_ERROR_SIGNALS.some(
    (signal) => code === signal || message.includes(signal),
  );
};

onTokenRefreshed(() => {
  Socket.connectIfAuthenticated();
});

export default class Socket {
  static instance: SocketType | null = null;

  constructor() {
    Socket.instance = io(serverUrl, {
      path: "/socket",
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      withCredentials: true,
      autoConnect: false,
      auth: (cb) => cb({ token: getAccessToken() }),
    });

    authRefreshAttempted = false;

    Socket.instance.on("connect", () => {
      authRefreshAttempted = false;
    });

    Socket.instance.on("connect_error", async (err) => {
      if (!isAuthError(err)) {
        console.log("Socket connect error:", err.message);
        return;
      }

      if (authRefreshAttempted) return;

      authRefreshAttempted = true;
      Socket.instance?.disconnect();

      try {
        await ensureFreshAccessToken();
      } catch {
      }
    });

    if (getAccessToken()) Socket.instance.connect();
  }

  static getInstant(): SocketType {
    if (!Socket.instance) {
      console.log("init new socket");
      new Socket();
    }

    return Socket.instance!;
  }

  static connectIfAuthenticated(): void {
    if (!getAccessToken()) return;
    Socket.getInstant().connect();
  }

  static disconnect(): void {
    Socket.instance?.disconnect();
  }
}
