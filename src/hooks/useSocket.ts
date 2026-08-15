import { useEffect } from "react";
import Socket from "../socket";

const useSocket = (
  listener: any,
  deps: any,
  disconnect: boolean = false
) => {
  useEffect(() => {
    const socket = Socket.getInstant();
    let cleanup: any;

    if (socket && listener) {
      cleanup = listener(socket);
    }

    return () => {
      if (typeof cleanup === "function") {
        cleanup();
      }
      if (disconnect && socket) {
        socket.disconnect();
      }
    };
  }, [...(deps ?? [])]);

  return null;
};

export default useSocket;
