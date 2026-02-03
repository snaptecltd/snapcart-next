"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const menu = [
  { label: "Profile Info", icon: "fas fa-user", href: "/customer" },
  { label: "My Order", icon: "fas fa-box", href: "/customer/orders" },
  { label: "Restock Requests", icon: "fas fa-sync", href: "/customer/restock" },
  { label: "Wish List", icon: "fas fa-heart", href: "/customer/wishlist" },
  { label: "Inbox", icon: "fas fa-envelope", href: "/customer/inbox" },
  { label: "My Address", icon: "fas fa-map-marker-alt", href: "/customer/address" },
  { label: "Support Ticket", icon: "fas fa-headset", href: "/customer/support" },
  { label: "Coupons", icon: "fas fa-ticket-alt", href: "/customer/coupons" },
  { label: "Track Order", icon: "fas fa-shipping-fast", href: "/order/tracking" },
];

export default function MobileSidebar({ active }) {
  const [open, setOpen] = useState(true);
  const router = useRouter();

  // useEffect(() => {
  //   const token = localStorage.getItem("snapcart_token"); // Replace with your actual token key
  //   if (!token) {
  //     router.push("/auth/login");
  //   }
  // }, [router]);

  return (
    <div className="dropdown">
      <button
        className="btn btn-light w-100 d-flex justify-content-between align-items-center shadow-sm rounded-4"
        type="button"
        onClick={() => setOpen(!open)}
      >
        <span>
          <i className="fas fa-user me-2" /> {menu[0].label}
        </span>
        <i className={`fas fa-chevron-${open ? "up" : "down"}`} />
      </button>
      {open && (
        <ul className="list-group list-group-flush shadow-sm rounded-4 mt-2 bg-white">
          {menu.map((item, idx) => (
            <li key={item.label} className="list-group-item border-0 px-3 py-2">
              <Link
                href={item.href}
                className={`d-flex align-items-center gap-3 text-decoration-none ${
                  active === idx ? "fw-bold text-primary" : "text-dark"
                }`}
                style={{ fontSize: 15 }}
              >
                <i className={item.icon + " me-1"} style={{ opacity: active === idx ? 1 : 0.5 }} />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}