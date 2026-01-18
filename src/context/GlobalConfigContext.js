"use client";

import { createContext, useContext } from "react";
import useSWR from "swr";
import { getGlobalConfig } from "@/lib/api/global.service";

const GlobalConfigContext = createContext(null);

export function GlobalConfigProvider({ children }) {
  const { data, error, isLoading } = useSWR(
    "global-config",
    getGlobalConfig,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 30, // 30 min
    }
  );

  return (
    <GlobalConfigContext.Provider value={{ data, error, isLoading }}>
      {children}
    </GlobalConfigContext.Provider>
  );
}

export function useGlobalConfig() {
  return useContext(GlobalConfigContext);
}
