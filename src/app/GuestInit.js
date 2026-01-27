"use client";

import { useEffect } from "react";
import { getGuestId } from "@/lib/api/global.service";

export default function GuestInit() {
  useEffect(() => {
    const initGuest = async () => {
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
// console.log(localStorage.getItem("guest_id"));
// clear guest_id from local storage
// localStorage.removeItem("guest_id");
  return null; // no ui
}
