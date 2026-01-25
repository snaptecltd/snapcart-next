"use client";

import Link from "next/link";
import { moneyBDT } from "@/lib/utils/money";

export default function ProductCard({ p }) {
  const img =
    p?.thumbnail_full_url?.path ||
    p?.images_full_url?.[0]?.path ||
    "/placeholder.png";

  return (
    <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
      <Link href={`/product/${p.slug}`} className="text-decoration-none">
        <div
          className="bg-white d-flex align-items-center justify-content-center"
          style={{ height: 200 }}
        >
          <img
            src={img}
            alt={p.name}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
          />
        </div>

        <div className="card-body">
          <div className="fw-semibold text-dark" style={{ minHeight: 44 }}>
            {p.name}
          </div>

          <div className="mt-2 d-flex align-items-center gap-2 flex-wrap">
            <span className="fw-bold">{moneyBDT(p.unit_price)}</span>
            {!!p.discount && (
              <span className="badge bg-warning text-dark">Offer</span>
            )}
          </div>
        </div>
      </Link>
    </div>
  );
}
