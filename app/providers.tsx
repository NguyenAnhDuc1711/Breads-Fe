"use client";

import { ChakraProvider, ColorModeScript } from "@chakra-ui/react";
import { ReactNode } from "react";
import { Provider } from "react-redux";
// Side-effect import: initialises the i18next singleton exactly once per
// client bundle load, same as the retired src/main.tsx did.
import "../languages/i18n";
import store from "../src/store";
import theme from "../theme";

const Providers = ({ children }: { children: ReactNode }) => {
  return (
    <Provider store={store}>
      <ChakraProvider theme={theme}>
        {/* Written into the HTML before paint so a hard refresh never flashes
            the wrong colour mode (Vite's client-only render never needed this). */}
        <ColorModeScript initialColorMode={theme.config.initialColorMode} />
        {children}
      </ChakraProvider>
    </Provider>
  );
};

export default Providers;
