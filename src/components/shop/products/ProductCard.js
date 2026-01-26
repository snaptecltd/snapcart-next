"use client";

import Link from "next/link";
import { moneyBDT } from "@/lib/utils/money";

export default function ProductCard({ p }) {
  const img =
    p?.thumbnail_full_url?.path ||
    p?.images_full_url?.[0]?.path ||
    "/placeholder.png";

  const price = p?.unit_price ?? 0;
  const discount = p?.discount ?? 0;
  const discountType = p?.discount_type;

  let oldPrice = null;
  let saveText = null;

  if (discountType === "flat" && discount > 0) {
    oldPrice = price + discount;
    saveText = `${moneyBDT(discount)} OFF`;
  } else if (discountType === "percent" && discount > 0) {
    oldPrice = Math.round(price / (1 - discount / 100));
    saveText = `${discount}% OFF`;
  }
  
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

            <div className="mt-2 fw-bold" style={{ fontSize: 16 }}>
              {moneyBDT(price)}
            </div>

            <div className="d-flex align-items-center gap-1 mt-2">
              {oldPrice ? (
                <div className="text-muted text-decoration-line-through small">
                  {moneyBDT(oldPrice)}
                </div>
              ) : null}

              {saveText ? (
                <span className="badge rounded-pill text-success px-3 py-2" style={{ background: "#DCFCE7" }}>
                  {saveText}
                </span>
              ) : null}
            </div>
        </div>
      </Link>
    </div>
  );
}
