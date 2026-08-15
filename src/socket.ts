import { io, Socket as SocketType } from "socket.io-client";
import { serverUrl, getAccessToken, onTokenRefreshed } from "./config/API";

// Register the socket reconnect callback so that whenever the access
// token is refreshed (after a 401 → /refresh-token cycle), the socket
// automatically reconnects with the new credentials.
onTokenRefreshed(() => {
  Socket.reconnectWithNewToken();
});

/**
 * Socket singleton that passes the current access token on every
 * (re)connection so the server can authenticate the user.
 *
 * When the access token is refreshed (after a 401 → /refresh-token cycle),
 * call `Socket.reconnectWithNewToken()` to tear down the old connection
 * and establish a new one with the fresh token.
 */
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
      auth: {
        token: getAccessToken(),
      },
    });
    Socket.instance.on("connect_error", (err) => {
      console.log("Socket connect error:", err.message);
    });
  }

  static getInstant(): SocketType | null {
    if (!Socket.instance) {
      console.log("init new socket");
      new Socket();
    }

    return Socket.instance;
  }

  /**
   * Disconnect the current socket and create a new connection with the
   * latest access token. Call this after a token refresh to ensure the
   * server sees the new credentials.
   */
  static reconnectWithNewToken(): void {
    if (Socket.instance) {
      Socket.instance.disconnect();
      Socket.instance = null;
    }
    new Socket();
  }

  /**
   * Fully disconnect and clear the singleton (used on logout).
   */
  static disconnect(): void {
    if (Socket.instance) {
      Socket.instance.disconnect();
      Socket.instance = null;
    }
  }
}
