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

export default function Sidebar({ active }) {
  return (
    <aside className="sticky-top" style={{ top: 24 }}>
      <ul className="list-group list-group-flush shadow-sm rounded-4 py-3 bg-white">
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
