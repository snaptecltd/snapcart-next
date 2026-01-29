"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { addToCart, addToWishlist, removeFromWishlist } from "@/lib/api/global.service";
import { toast } from "react-toastify";

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}

export default function ProductCard({ product }) {
  if (!product) return null;

  const href = `/product/${product.slug}`;
  const thumb = product?.thumbnail_full_url?.path;
  const name = product?.name || "Product";
  const price = product?.unit_price ?? 0;
  const discount = product?.discount ?? 0;
  const discountType = product?.discount_type;
  const currentStock = product?.current_stock ?? 0;

  let oldPrice = null;
  let saveText = null;

  if (discountType === "flat" && discount > 0) {
    oldPrice = price + discount;
    saveText = `${moneyBDT(discount)} OFF`;
  } else if (discountType === "percent" && discount > 0) {
    oldPrice = Math.round(price / (1 - discount / 100));
    saveText = `${discount}% OFF`;
  }

  // Wishlist logic
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  useEffect(() => {
    let wishlist = [];
    try {
      const stored = localStorage.getItem("snapcart_wishlist");
      if (stored) wishlist = JSON.parse(stored);
    } catch {}
    setWishlisted(wishlist.includes(product.id));
  }, [product.id]);

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (wishlistLoading) return;
    const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
    if (!token) {
      toast.info("Please login to add to wishlist.");
      return;
    }
    setWishlistLoading(true);
    try {
      let wishlist = [];
      try {
        const stored = localStorage.getItem("snapcart_wishlist");
        if (stored) wishlist = JSON.parse(stored);
      } catch {}
      if (wishlisted) {
        await removeFromWishlist(product.id);
        setWishlisted(false);
        wishlist = wishlist.filter(id => id !== product.id);
        toast.success("Removed from wishlist!");
      } else {
        await addToWishlist(product.id);
        setWishlisted(true);
        if (!wishlist.includes(product.id)) wishlist.push(product.id);
        toast.success("Added to wishlist!");
      }
      localStorage.setItem("snapcart_wishlist", JSON.stringify(wishlist));
    } catch {
      toast.error("Failed to update wishlist.");
    }
    setWishlistLoading(false);
  };

  return (
    <div
      className="card h-100 card-shadow border rounded-3xl overflow-hidden position-relative"
      style={{
        width: "100%",
        margin: "0 auto",
        boxSizing: "border-box",
      }}
    >
      {/* Stock Out Ribbon */}
      {currentStock < 1 && (
        <div className="shadow"
          style={{
            position: "absolute",
            top: 25,
            right: -32,
            width: 140,
            background: "#EF4444",
            color: "#fff",
            textAlign: "center",
            fontWeight: 700,
            transform: "rotate(45deg)",
            zIndex: 2,
            fontSize: 11,
            padding: "4px 0",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
            letterSpacing: 1,
          }}
        >
          <i className="fas fa-box-open me-1"></i>
          STOCK OUT
        </div>
      )}

      <Link href={href} className="text-decoration-none text-dark">
        <div className="p-3">
          <div className="bg-white rounded-4 d-flex align-items-center justify-content-center">
            {thumb ? (
              <img
                src={thumb}
                alt={name}
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  objectFit: "contain",
                  width: "90%",
                }}
                loading="lazy"
              />
            ) : (
              <div className="border rounded-3 w-100 h-100" />
            )}
          </div>

          <div className="mt-3">
            <div
              className="fw-semibold"
              style={{
                wordBreak: "break-word",
                fontSize: 16,
                lineHeight: "1.2",
              }}
            >
              {name}
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
        </div>
      </Link>

      {/* Wishlist Heart Floating Top Left */}
      <button
        className="btn btn-light border-0 position-absolute"
        style={{
          top: 12,
          left: 12,
          zIndex: 10,
          background: "rgba(255,255,255,0.85)",
          borderRadius: "50%",
          width: 36,
          height: 36,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
        }}
        title={wishlisted ? "Wishlisted" : "Add to wishlist"}
        onClick={handleWishlist}
        disabled={wishlistLoading}
      >
        <i
          className={`fa${wishlisted ? "s" : "r"} fa-heart`}
          style={{
            color: wishlisted ? "#F67535" : "#bbb",
            fontSize: 20,
            transition: "color 0.2s",
          }}
        ></i>
      </button>
    </div>
  );
}
