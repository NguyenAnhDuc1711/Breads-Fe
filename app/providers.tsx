"use client";

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { ReactNode, useRef } from "react";
import { Provider } from "react-redux";
// Side-effect import: initialises the i18next singleton exactly once per
// client bundle load, same as the retired src/main.tsx did.
import "../languages/i18n";
import { AppState, AppStore, makeStore } from "../src/store";
import { initialUserState, IUser } from "../src/store/UserSlice";
import theme from "../theme";

import { useEffect } from "react";
import { useAppDispatch } from "../src/hooks/redux";
import { getMe } from "../src/store/UserSlice/asyncThunk";

const AuthSessionInit = ({ children }: { children: ReactNode }) => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // Restore session via /users/me using HTTP-only cookie
    dispatch(getMe());

    // Multi-tab logout sync listener
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userId" && !e.newValue) {
        window.location.href = "/login";
      }
    };
    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [dispatch]);

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
      ? { user: { ...initialUserState, userInfo: initialUser, isLoading: false } }
      : undefined;
    storeRef.current = makeStore(preloadedState);
  }

  return (
    <Provider store={storeRef.current}>
      <AuthSessionInit>
        <ChakraProvider theme={theme}>
          {/* Written into the HTML before paint so a hard refresh never flashes
              the wrong colour mode (Vite's client-only render never needed this). */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          {children}
        </ChakraProvider>
      </AuthSessionInit>
    </Provider>
  );
};

export default Providers;
