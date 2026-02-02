"use client";
import { useState } from "react";
import { trackOrder } from "@/lib/api/global.service";
import { toast } from "react-toastify";

const STATUS_STEPS = [
  { key: "placed", label: "Order Placed", icon: "fas fa-clipboard-list" },
  { key: "confirmed", label: "Order Confirmed", icon: "fas fa-file-alt" },
  { key: "processing", label: "Preparing Shipment", icon: "fas fa-truck-loading" },
  { key: "on_the_way", label: "Order is on the way", icon: "fas fa-shipping-fast" },
  { key: "delivered", label: "Order Shipped", icon: "fas fa-box-open" },
];

function getStepIndex(order_status) {
  switch (order_status) {
    case "pending": return 0;
    case "confirmed": return 1;
    case "processing": return 2;
    case "out_for_delivery": return 3;
    case "delivered": return 4;
    default: return 0;
  }
}

function formatDateTime(dt) {
  if (!dt) return "-";
  const d = new Date(dt);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + ", " +
    d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function OrderTrackingPage() {
  const [form, setForm] = useState({ order_id: "", phone_number: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((e) => ({ ...e, [name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.order_id) return setErrors({ order_id: "Order ID required" });
    if (!form.phone_number) return setErrors({ phone_number: "Phone required" });
    setLoading(true);
    try {
      const data = await trackOrder(form);
      if (Array.isArray(data) && data.length > 0) {
        setResult(data[0]);
      } else {
        setResult(null);
        toast.error("No order found for this ID and phone.");
      }
    } catch {
      setResult(null);
      toast.error("No order found for this ID and phone.");
    }
    setLoading(false);
  };

  // Stepper logic
  let stepIndex = 0;
  let orderStatus = "";
  let statusDates = {};
  if (result?.order) {
    orderStatus = result.order.order_status;
    stepIndex = getStepIndex(orderStatus);
    // For demo, use created_at for all steps
    statusDates = {
      placed: result.order.created_at,
      confirmed: result.order.updated_at,
      processing: result.order.updated_at,
      on_the_way: result.order.updated_at,
      delivered: result.order.updated_at,
    };
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-md-12 col-lg-12">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <h3 className="fw-bold mb-4">Track Your Order</h3>
            <form onSubmit={handleSubmit} className="row g-3 mb-4">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Order ID</label>
                <input
                  type="text"
                  name="order_id"
                  className={`form-control${errors.order_id ? " is-invalid" : ""}`}
                  value={form.order_id}
                  onChange={handleChange}
                  placeholder="e.g. 100006"
                />
                {errors.order_id && <div className="invalid-feedback">{errors.order_id}</div>}
              </div>
              <div className="col-md-4">
                <label className="form-label fw-semibold">Phone Number</label>
                <input
                  type="text"
                  name="phone_number"
                  className={`form-control${errors.phone_number ? " is-invalid" : ""}`}
                  value={form.phone_number}
                  onChange={handleChange}
                  placeholder="e.g. 017XXXXXXXX"
                />
                {errors.phone_number && <div className="invalid-feedback">{errors.phone_number}</div>}
              </div>
              <div className="col-md-4 d-flex align-items-end gap-2">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? "Tracking..." : "Track Order"}
                </button>
              </div>
            </form>
            {/* Stepper */}
            {result ? (
              <div className="bg-light rounded-4 p-4">
                <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap" style={{ gap: 8 }}>
                  {STATUS_STEPS.map((step, idx) => (
                    <div key={step.key} className="flex-fill text-center" style={{ minWidth: 120 }}>
                      <div
                        className={`mx-auto mb-2 d-flex align-items-center justify-content-center`}
                        style={{
                          width: 48,
                          height: 48,
                          borderRadius: 12,
                          background: idx <= stepIndex ? "#e0f2fe" : "#f3f4f6",
                          border: idx === stepIndex ? "2px solid var(--primary-color)" : "2px dashed var(--primary-color)",
                          color: "#d3ab8aff",
                          fontSize: 24,
                        }}
                      >
                        <i className={step.icon}></i>
                      </div>
                      <div className="fw-semibold" style={{ fontSize: 15, color: idx <= stepIndex ? "#222" : "#aaa" }}>
                        {step.label}
                      </div>
                      <div className="text-muted small mt-1" style={{ fontSize: 13 }}>
                        {idx <= stepIndex ? (
                          <>
                            <i className="far fa-clock me-1"></i>
                            {formatDateTime(statusDates[step.key])}
                          </>
                        ) : (
                          "-"
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center mt-3">
                  <span className="fw-bold">Current Status: </span>
                  <span className="badge bg-info text-dark" style={{ fontSize: 15 }}>
                    {orderStatus ? orderStatus.charAt(0).toUpperCase() + orderStatus.slice(1) : "-"}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <style>{`
        .stepper-dot {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }
      `}</style>
    </div>
  );
}
