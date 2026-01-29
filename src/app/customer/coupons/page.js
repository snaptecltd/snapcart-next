"use client";
import { useEffect, useState } from "react";
import Sidebar from "../partials/Sidebar";
import { getCouponList } from "@/lib/api/global.service";
import { toast } from "react-toastify";
import Image from "next/image";

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
                  <div className="ticket-box" key={c.id}>
                    <div className="ticket-start">
                        <Image src="/images/dollar.png" alt="Coupon" width={30} height={30} />
                        <h2 className="ticket-amount"> {moneyBDT(c.discount)} </h2>
                        <p className="d-flex flex-column"> On                       
                          <div className="text-muted" style={{ fontSize: 13 }}>{c.seller?.name || "RSM International"}</div> 
                        </p>
                    </div>
                    <div className="ticket-border"></div>
                    <div className="ticket-end">
                        <button className="ticket-welcome-btn click-to-copy-coupon" onClick={() => handleCopy(c.code)} title="Copy code" data-value={c.code}>{c.code}</button> 
                        <h6>Valid till {formatDate(c.plain_expire_date)}</h6>
                        <p className="m-0">Available from minimum purchase {moneyBDT(c.min_purchase)}</p>
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
