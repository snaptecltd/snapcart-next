"use client";

import { useEffect } from "react";
import { getGuestId } from "@/lib/api/global.service";

export default function GuestInit() {
  useEffect(() => {
    const initGuest = async () => {
      // Prevent guest creation if user is logged in
      const token = localStorage.getItem("snapcart_token");
      if (token) return;

      // Only create guest if not already present
      const existing = localStorage.getItem("guest_id");
      if (existing) return;

      try {
        const res = await getGuestId(); // { guest_id: 1 }
        if (res?.guest_id) {
          localStorage.setItem("guest_id", res.guest_id);
        }
      } catch (e) {
        console.error("Guest init failed", e);
      }
    };

    initGuest();
  }, []);
  return null; // no ui
}
