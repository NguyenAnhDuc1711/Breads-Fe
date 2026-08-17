import { io, Socket as SocketType } from "socket.io-client";
import {
  serverUrl,
  getAccessToken,
  onTokenRefreshed,
  ensureFreshAccessToken,
} from "./config/API";

// Trần "1 refresh / 1 phiên kết nối" cho luồng auth-recovery của socket
// (tương đương cờ _retry của axios interceptor). Được T4 (011.md) dùng.
let authRefreshAttempted = false;

// AD-6 — allowlist mã lỗi auth. Tương ứng code: "TOKEN_EXPIRED" mà HTTP 401
// đang dùng (config/API.ts). Payload lỗi từ middleware BE của socket.io nằm ở
// (err as any).data, nên khớp CẢ err.message LẪN err.data.code.
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

// Khi access token mới xuất hiện (refresh 401, login, hoặc bootstrap sau
// SSR), facade ensureFreshAccessToken()/notifyTokenRefreshed() gọi callback
// này. Ta chỉ .connect() trên instance sẵn có — KHÔNG teardown, KHÔNG tạo
// instance mới, để listener đã bind lúc mount còn nguyên.
onTokenRefreshed(() => {
  Socket.connectIfAuthenticated();
});

/**
 * Socket singleton. Instance được tạo với `autoConnect: false` và chỉ thực
 * sự kết nối khi có access token — nhờ đó user ẩn danh không phát sinh
 * handshake nào, còn listener của component bind một lần lúc mount vào một
 * instance ổn định và sống sót khi token tới sau.
 *
 * `auth` là callback nên MỌI lần (re)connect — kể cả auto-reconnect nội bộ
 * của socket.io — đều đọc lại token tại thời điểm đó.
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
      autoConnect: false,
      auth: (cb) => cb({ token: getAccessToken() }),
    });

    authRefreshAttempted = false;

    Socket.instance.on("connect", () => {
      authRefreshAttempted = false;
    });

    // AD-7 — luồng auth-recovery. Thứ tự 5 bước dưới đây là load-bearing.
    Socket.instance.on("connect_error", async (err) => {
      // 1) Không phải lỗi auth (server down, mất mạng...) → giữ nguyên
      //    diagnostic như hôm nay rồi dừng. KHÔNG refresh (FR-3).
      if (!isAuthError(err)) {
        console.log("Socket connect error:", err.message);
        return;
      }

      // 2) Đã thử refresh cho phiên kết nối này rồi → không làm gì (trần NFR-1).
      if (authRefreshAttempted) return;

      // 3) Đánh dấu TRƯỚC, rồi disconnect TRƯỚC khi await: dập vòng
      //    auto-reconnect của socket.io để nó không bắn thêm handshake với
      //    token cũ trong lúc ta đang refresh. KHÔNG null hoá instance —
      //    listener của component phải sống sót.
      authRefreshAttempted = true;
      Socket.instance?.disconnect();

      try {
        await ensureFreshAccessToken();
        // 4) THÀNH CÔNG → KHÔNG LÀM GÌ THÊM.
        //    Facade đã tự gọi onTokenRefreshedCallback() →
        //    Socket.connectIfAuthenticated() → .connect() trên đúng instance
        //    này. Tự gọi .connect() ở đây sẽ tạo chủ sở hữu thứ hai cho cùng
        //    một sự kiện ⇒ 2 handshake/lần recovery. Đừng thêm dòng nào.
      } catch {
        // 5) THẤT BẠI → dừng hẳn. Đã disconnect ở bước 3.
        //    KHÔNG redirect /login — việc đó thuộc response interceptor ở API
        //    call kế tiếp (PRD Out of Scope cấm socket tự điều hướng).
      }
    });

    if (getAccessToken()) Socket.instance.connect();
  }

  /**
   * LUÔN trả về một instance (không bao giờ `null`). Instance có thể đang
   * DISCONNECTED — dùng `socket.connected` nếu cần biết trạng thái kết nối.
   * Đừng suy ra "có instance ⇒ đã kết nối".
   */
  static getInstant(): SocketType {
    if (!Socket.instance) {
      console.log("init new socket");
      new Socket();
    }

    return Socket.instance!;
  }

  /** Gọi khi token vừa xuất hiện (refresh / login / bootstrap). Idempotent. */
  static connectIfAuthenticated(): void {
    if (!getAccessToken()) return;
    Socket.getInstant().connect();
  }

  /**
   * Ngắt kết nối (dùng khi logout). CỐ Ý giữ lại instance: listener của các
   * component còn sống vẫn nguyên vẹn, nên chu kỳ logout→login trong cùng
   * tab chỉ cần .connect() lại (auth callback tự đọc token mới). Null hoá
   * instance ở đây sẽ tái tạo đúng lỗi "connected nhưng không có listener".
   */
  static disconnect(): void {
    Socket.instance?.disconnect();
  }
}
