"use client";

import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";
// Side-effect import: initialises the i18next singleton exactly once per
// client bundle load, same as the retired src/main.tsx did.
import "../languages/i18n";
import { ColorModeScript, ThemeProvider } from "../src/context/ThemeContext";
import { ToastViewport } from "../src/components/ui/primitives";
import { AppState, AppStore, makeStore } from "../src/store";
import { initialUserState, IUser } from "../src/store/UserSlice";

import { useEffect } from "react";
import { useAppDispatch } from "../src/hooks/redux";
import { bootstrapSession, getMe } from "../src/store/UserSlice/asyncThunk";

const AuthSessionInit = ({
  children,
  hasInitialUser,
}: {
  children: ReactNode;
  hasInitialUser: boolean;
}) => {
  const dispatch = useAppDispatch();
  // Lớp (1): chặn lần dispatch thứ hai do React StrictMode double-invoke
  // effect ở dev. Xem thêm lớp (2) — single-flight — ở comment dưới.
  const bootstrapRan = useRef(false);

  useEffect(() => {
    // FR-8: SSR đã xác nhận có session qua cookie nhưng accessToken in-memory
    // đã mất sau reload → lấy lại token trong ĐÚNG 1 round-trip (/refresh-token,
    // không qua /me).
    //
    // Idempotency có HAI lớp, cố ý:
    //   (1) ref guard trên — chặn StrictMode double-invoke, làm ý đồ tường minh;
    //   (2) single-flight bên trong ensureFreshAccessToken() (config/API.ts) —
    //       nếu guard (1) bị vượt qua (remount thật, mount ở cây khác), vẫn chỉ
    //       có ĐÚNG 1 request /refresh-token được gửi đi.
    // Đừng bỏ lớp nào: (1) không có (2) sẽ vỡ khi refactor; (2) không có (1)
    // làm ý đồ mờ đi và hỏng phép đo ở dev.
    if (hasInitialUser && !bootstrapRan.current) {
      bootstrapRan.current = true;
      dispatch(bootstrapSession());
    }

    // Multi-tab logout sync listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userId" && !e.newValue) {
        window.location.href = "/login";
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch, hasInitialUser]);

  return <>{children}</>;
};

const Providers = ({
  children,
  initialUser,
}: {
  children: ReactNode;
  initialUser: IUser | null;
}) => {
  // Created once per mount (not module-level) so it can be seeded with the
  // user resolved server-side from the jwt cookie (app/layout.tsx) — lets
  // pages that gate on userInfo._id render real content on first paint
  // instead of waiting for AuthSessionInit's getMe() round trip below.
  const storeRef = useRef<AppStore>();
  if (!storeRef.current) {
    const preloadedState: Partial<AppState> | undefined = initialUser
      ? {
          user: {
            ...initialUserState,
            userInfo: initialUser,
            isLoading: false,
          },
        }
      : undefined;
    storeRef.current = makeStore(preloadedState);
  }

  return (
    <Provider store={storeRef.current}>
      <AuthSessionInit hasInitialUser={!!initialUser}>
        <ThemeProvider>
          {/* Written into the HTML before paint so a hard refresh never flashes
              the wrong colour mode (Vite's client-only render never needed this). */}
          <ColorModeScript />
          {children}
          <ToastViewport />
        </ThemeProvider>
      </AuthSessionInit>
    </Provider>
  );
};

export default Providers;
