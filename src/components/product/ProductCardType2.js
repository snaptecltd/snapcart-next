"use client";

import Link from "next/link";

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}

export default function ProductCard({ product }) {
  if (!product) return null;

  const href = `/product/${product.slug}`;
  const thumb = product?.thumbnail_full_url?.path; // may be null
  const name = product?.name || "Product";

  const unit_price = product?.unit_price ?? 0;
  const discount = product?.discount ?? 0;
  const discountType = product?.discount_type; // "flat" / "percent"

  let price = unit_price;
  let oldPrice = null;
  let saveText = null;

  if (discountType === "flat" && discount > 0) {
    price = unit_price - discount;
    oldPrice = unit_price;
    saveText = `${moneyBDT(discount)} OFF`;
  } else if (discountType === "percent" && discount > 0) {
    price = unit_price - Math.round(unit_price * discount / 100);
    oldPrice = unit_price;
    saveText = `${discount}% OFF`;
  }

  return (
    <div className="card h-100 card-shadow border rounded-3xl overflow-hidden">
      <Link href={href} className="text-decoration-none text-dark">
        <div className="p-3 d-flex flex-row align-items-center gap-3">
          <div
            className="bg-white rounded-4 d-flex align-items-center justify-content-center"
            style={{ height: 100, width: 100 }}
          >
            {thumb ? (
              <img
                src={thumb}
                alt={name}
                style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
                loading="lazy"
              />
            ) : (
              <div className="border rounded-3 w-100 h-100" />
            )}
          </div>

          <div className="mt-3">
            <div className="fw-semibold" style={{ minHeight: 44 }}>
              {name}
            </div>

            <div className="mt-2 fw-bold">{moneyBDT(price)}</div>

            <div className="d-flex align-items-center gap-2 mt-2">
              {oldPrice ? (
                <div className="text-muted text-decoration-line-through small">
                  {moneyBDT(oldPrice)}
                </div>
              ) : null}

              {saveText ? (
                <span className="badge rounded-pill text-success bg-success-subtle px-3 py-2">
                  {saveText}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
