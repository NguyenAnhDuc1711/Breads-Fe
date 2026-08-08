import io from "socket.io-client";
import { serverUrl } from "./config/API";

// Singleton
export default class Socket {
  static instance;

  constructor() {
    console.log("inital in constructor");
    Socket.instance = io(serverUrl, {
      path: "/socket",
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 3,
      withCredentials: true,
    });
    Socket.instance.on("connect_error", (err) => {
      console.log("err", err);
    });
  }

  static getInstant() {
    if (!Socket.instance) {
      console.log("init new socket");
      new Socket();
    }

    return Socket.instance;
  }
}
