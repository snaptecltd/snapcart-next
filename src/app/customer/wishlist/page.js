"use client";
import { useEffect, useState } from "react";
import Sidebar from "../partials/Sidebar";
import { getCustomerWishlist, removeFromWishlist } from "@/lib/api/global.service";
import Link from "next/link";
import { toast } from "react-toastify";

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}

export default function WishlistPage() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    setLoading(true);
    getCustomerWishlist()
      .then(setWishlist)
      .catch(() => toast.error("Failed to load wishlist"))
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = async (productId) => {
    setRemoving((r) => ({ ...r, [productId]: true }));
    try {
      await removeFromWishlist(productId);
      setWishlist((list) => list.filter((item) =>
        (item.product_id || item.productFullInfo?.id) !== productId
      ));
      toast.success("Removed from wishlist!");
    } catch {
      toast.error("Failed to remove from wishlist");
    }
    setRemoving((r) => ({ ...r, [productId]: false }));
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <Sidebar active={3} />
        </div>
        {/* Main Content */}
        <div className="col-12 col-lg-9">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <h4 className="fw-bold mb-4">Wishlist</h4>
            {loading ? (
              <div className="text-center py-5">Loading...</div>
            ) : wishlist.length === 0 ? (
              <div className="text-center py-5 text-muted">No products in wishlist.</div>
            ) : (
              <div className="d-flex flex-column gap-3">
                {wishlist.map((item) => {
                  const p = item.productFullInfo || item.product_full_info;
                  if (!p) return null;
                  const img = p.thumbnail_full_url?.path || "/placeholder.png";
                  const brand = p.brand_name || p.brand?.name || "—";
                  const discount = p.discount || 0;
                  const discountType = p.discount_type;
                  let oldPrice = null;
                  if (discountType === "flat" && discount > 0) {
                    oldPrice = p.unit_price + discount;
                  } else if (discountType === "percent" && discount > 0) {
                    oldPrice = Math.round(p.unit_price / (1 - discount / 100));
                  }
                  return (
                    <div key={item.id} className="d-flex align-items-center bg-white border rounded-4 p-3 position-relative" style={{ minHeight: 100 }}>
                      {/* Discount badge */}
                      {discount > 0 && (
                        <span className="badge bg-primary position-absolute" style={{ left: 10, top: 10, fontSize: 15 }}>
                          {discountType === "flat"
                            ? `-${moneyBDT(discount)}`
                            : `-${discount}%`}
                        </span>
                      )}
                      {/* Product image */}
                      <Link href={`/product/${p.slug}`} className="me-3 d-flex align-items-center" style={{ minWidth: 80 }}>
                        <img
                          src={img}
                          alt={p.name}
                          style={{
                            width: 70,
                            height: 70,
                            objectFit: "contain",
                            borderRadius: 12,
                            background: "#f8f9fa",
                          }}
                        />
                      </Link>
                      {/* Product info */}
                      <div className="flex-grow-1">
                        <div className="fw-semibold" style={{ fontSize: 16 }}>{p.name}</div>
                        <div className="text-muted" style={{ fontSize: 14 }}>
                          Brand : <span className="fw-semibold">{brand}</span>
                        </div>
                        <div className="fw-bold mt-1" style={{ fontSize: 16 }}>{moneyBDT(p.unit_price)}</div>
                        {oldPrice && (
                          <div className="text-muted text-decoration-line-through" style={{ fontSize: 15 }}>
                            {moneyBDT(oldPrice)}
                          </div>
                        )}
                      </div>
                      {/* Remove button */}
                      <button
                        className="btn btn-light border rounded-circle ms-3"
                        style={{ width: 40, height: 40 }}
                        title="Remove from wishlist"
                        onClick={() => handleRemove(p.id)}
                        disabled={removing[p.id]}
                      >
                        <i className="fas fa-heart text-primary"></i>
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .btn .fa-heart {
          font-size: 20px;
        }
      `}</style>
    </div>
  );
}
