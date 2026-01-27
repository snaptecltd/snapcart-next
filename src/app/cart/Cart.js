"use client";
import { useEffect, useState } from "react";
import { getCart } from "@/lib/api/global.service";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCart()
      .then(setCart)
      .finally(() => setLoading(false));
  }, []);

  // Calculate total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

if (loading) return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "300px" }}>
        <div className="spinner-border text-warning" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
);
  if (!cart.length)
    return (
      <div className="container py-5 text-center">
        <h4>Your cart is empty.</h4>
      </div>
    );

  return (
    <div className="container py-5">
      <div className="mb-4 d-flex align-items-center gap-2">
        <i className="fas fa-shopping-cart" style={{ color: "#d2b48c", fontSize: 28 }}></i>
        <h3 className="mb-0 fw-bold" style={{ color: "#222" }}>Shopping Cart</h3>
      </div>
      <div className="table-responsive mb-4">
        <table className="table align-middle mb-0" style={{ minWidth: 700 }}>
          <thead>
            <tr className="cart-table-header">
              <th style={{ width: 120 }}>Product</th>
              <th>Product Name</th>
              <th style={{ width: 180 }}>Quantity</th>
              <th style={{ width: 140 }}>Unit Price</th>
              <th style={{ width: 140 }}>Total</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {cart.map((item) => (
              <tr key={item.id} className="bg-white">
                <td>
                  <img
                    src={item.product?.thumbnail_full_url?.path}
                    alt={item.name}
                    className="rounded"
                    style={{ width: 60, height: 60, objectFit: "cover", background: "#f8f9fa" }}
                  />
                </td>
                <td>
                  <div className="fw-semibold">{item.name}</div>
                  <div className="text-muted small">{item.variant}</div>
                </td>
                <td>
                  <div className="input-group input-group-sm justify-content-center" style={{ maxWidth: 120 }}>
                    <button className="btn btn-outline-secondary" type="button" disabled>
                      <i className="fas fa-minus"></i>
                    </button>
                    <input
                      type="text"
                      className="form-control text-center"
                      value={item.quantity}
                      style={{ maxWidth: 40 }}
                      readOnly
                    />
                    <button className="btn btn-outline-secondary" type="button" disabled>
                      <i className="fas fa-plus"></i>
                    </button>
                  </div>
                </td>
                <td className="fw-semibold">{item.price.toLocaleString()} BDT</td>
                <td className="fw-semibold">{(item.price * item.quantity).toLocaleString()} BDT</td>
                <td>
                  <button className="btn btn-link text-danger p-0" title="Remove" disabled>
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="row g-4">
        {/* Promo Code Only */}
        <div className="col-12 col-md-6 col-lg-5">
          <div className="bg-light rounded-3 p-4">
            <div>
              <label className="form-label fw-semibold">Apply promo code</label>
              <div className="input-group">
                <input type="text" className="form-control" placeholder="Apply promo code" />
                <button className="btn btn-outline-warning fw-semibold" type="button" disabled>
                  APPLY
                </button>
              </div>
            </div>
          </div>
        </div>
        {/* Total & Actions */}
        <div className="col-12 col-md-6 col-lg-7 d-flex flex-column justify-content-end align-items-end">
          <div className="mb-3 w-100 d-flex justify-content-end align-items-center">
            <span className="fw-bold fs-5 me-3">Total:</span>
            <span className="fw-bold fs-4">{total.toLocaleString()} BDT</span>
          </div>
          <div className="d-flex gap-3 w-100 justify-content-end">
            <button className="btn btn-outline-warning px-4 fw-semibold" style={{ minWidth: 180 }} type="button">
              CONTINUE SHOPPING
            </button>
            <button className="btn btn-dark px-4 fw-semibold" style={{ minWidth: 180 }} type="button">
              CHECK OUT
            </button>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 767.98px) {
          table { min-width: 0 !important; }
        }
      `}</style>
    </div>
  );
}
