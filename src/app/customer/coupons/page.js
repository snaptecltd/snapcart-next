"use client";
import { useEffect, useState } from "react";
import Sidebar from "../partials/Sidebar";
import { getCouponList } from "@/lib/api/global.service";
import { toast } from "react-toastify";

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳${n.toLocaleString("en-BD")}`;
}

function formatDate(date) {
  if (!date) return "-";
  const d = new Date(date);
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
}

export default function CouponsPage() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCouponList()
      .then((data) => setCoupons(data.coupons || []))
      .catch(() => toast.error("Failed to load coupons"))
      .finally(() => setLoading(false));
  }, []);

  const handleCopy = (code) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code);
      toast.success("Coupon code copied!");
    }
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <Sidebar active={7} />
        </div>
        {/* Main Content */}
        <div className="col-12 col-lg-9">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <h4 className="fw-bold mb-4">Coupons</h4>
            {loading ? (
              <div className="text-center py-5">Loading...</div>
            ) : coupons.length === 0 ? (
              <div className="text-center py-5 text-muted">No coupons found.</div>
            ) : (
              <div className="d-flex flex-wrap gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.id}
                    className="d-flex flex-row align-items-center bg-light rounded-4 shadow-sm p-4 gap-4"
                    style={{ minWidth: 320, minHeight: 140, position: "relative" }}
                  >
                    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minWidth: 120 }}>
                      <div className="mb-2" style={{ fontSize: 32 }}>
                        <i className="fas fa-money-bill-wave text-success"></i>
                      </div>
                      <div className="fw-bold" style={{ fontSize: 22 }}>{moneyBDT(c.discount)}</div>
                      <div className="text-muted" style={{ fontSize: 13 }}>On {c.seller?.name || "RSM International"}</div>
                    </div>
                    <div className="flex-grow-1 d-flex flex-column align-items-start justify-content-center">
                      <div className="mb-2">
                        <span
                          className="border border-primary rounded px-3 py-1 fw-bold"
                          style={{ fontSize: 16, cursor: "pointer", userSelect: "all", background: "#fff" }}
                          onClick={() => handleCopy(c.code)}
                          title="Copy code"
                        >
                          {c.code}
                          <i className="fas fa-copy ms-2 text-primary"></i>
                        </span>
                      </div>
                      <div className="text-muted mb-1" style={{ fontSize: 14 }}>
                        Valid till {formatDate(c.plain_expire_date)}
                      </div>
                      <div className="text-muted" style={{ fontSize: 13 }}>
                        Available from minimum purchase {moneyBDT(c.min_purchase)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`
        .fa-copy {
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
