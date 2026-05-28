"use client";

import { ConfigProvider } from "antd";
import type { ReactNode } from "react";

const BRAND_PRIMARY = "#CC553B";
const BRAND_PRIMARY_HOVER = "#B64A33";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: BRAND_PRIMARY,
          colorPrimaryHover: BRAND_PRIMARY_HOVER,
        },
      }}
    >
      {children}
    </ConfigProvider>
  );
}

