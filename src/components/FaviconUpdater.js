"use client";

import { useEffect } from "react";
import { useGlobalConfig } from "@/context/GlobalConfigContext";

export default function FaviconUpdater() {
  const { data: config } = useGlobalConfig();

  useEffect(() => {
    const href = config?.company_fav_icon?.path;
    if (!href) return;

    // if existing icon tag then update, otherwise create
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.href = href;
  }, [config]);

  return null;
}
