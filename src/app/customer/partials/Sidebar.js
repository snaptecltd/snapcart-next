import Link from "next/link";
import { useState } from "react";

const menu = [
  { label: "Account Details", icon: "fas fa-user", href: "/customer" },
  { label: "Order", icon: "fas fa-box", href: "/customer/orders" },
  { label: "Addresses", icon: "fas fa-map-marker-alt", href: "/customer/address" },
  { label: "Log Out", icon: "fas fa-sign-out-alt", href: "/auth/logout" },
];

export default function Sidebar({ active }) {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <aside className="sticky-top" style={{ top: 24 }}>
      {/* Collapsible Sidebar for Mobile */}
      <div className="d-lg-none">
        <button
          className="btn btn-outline-secondary w-100 d-flex justify-content-between align-items-center"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-expanded={!isCollapsed}
        >
          <span>
            <i className="fas fa-user me-2"></i> Account Details
          </span>
          <i className={`fas fa-chevron-${isCollapsed ? "down" : "up"}`}></i>
        </button>
        {!isCollapsed && (
          <ul className="list-group list-group-flush shadow-sm rounded-4 py-3 bg-white mt-2">
            {menu.map((item, idx) => (
              <li key={item.label} className="list-group-item border-0 px-4 py-2">
                <Link
                  href={item.href}
                  className={`d-flex align-items-center gap-3 text-decoration-none ${active === idx ? "fw-bold text-primary" : "text-dark"}`}
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

      {/* Sidebar for Desktop */}
      <ul className="list-group list-group-flush shadow-sm rounded-4 py-3 bg-white d-none d-lg-block">
        {menu.map((item, idx) => (
          <li key={item.label} className="list-group-item border-0 px-4 py-2">
            <Link
              href={item.href}
              className={`d-flex align-items-center gap-3 text-decoration-none ${active === idx ? "fw-bold text-primary" : "text-dark"}`}
              style={{ fontSize: 15 }}
            >
              <i className={item.icon + " me-1"} style={{ opacity: active === idx ? 1 : 0.5 }} />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
