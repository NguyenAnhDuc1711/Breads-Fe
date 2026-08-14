"use client";

import { HeaderHeight } from "../../Layout";
import "./index.css";

export const containerBoxWidth = "640px";

const ContainerLayout = ({ children }) => {
  return (
    <div className="container-layout">
      <div
        className="container-content"
        style={{
          minHeight: `calc(100vh - ${HeaderHeight + 24}px)`,
          marginTop: `${HeaderHeight + 12}px`,
        }}
      >
        {children}
      </div>
    </div>
  );
};

export default ContainerLayout;
