"use client";
import { useEffect, useState } from "react";
import Sidebar from "../partials/Sidebar";
import {
  getCustomerRestockList,
  deleteCustomerRestock,
} from "@/lib/api/global.service";
import Link from "next/link";
import { toast } from "react-toastify";

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}

export default function RestockRequestsPage() {
  const [restocks, setRestocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removing, setRemoving] = useState({});
  const [removingAll, setRemovingAll] = useState(false);

  useEffect(() => {
    fetchRestocks();
  }, []);

  const fetchRestocks = () => {
    setLoading(true);
    getCustomerRestockList()
      .then((res) => setRestocks(res.data || []))
      .catch(() => toast.error("Failed to load restock requests"))
      .finally(() => setLoading(false));
  };

  const handleRemove = async (id) => {
    setRemoving((r) => ({ ...r, [id]: true }));
    try {
      await deleteCustomerRestock({ id });
      setRestocks((list) => list.filter((item) => item.id !== id));
      toast.success("Removed from restock requests!");
    } catch {
      toast.error("Failed to remove restock request");
    }
    setRemoving((r) => ({ ...r, [id]: false }));
  };

  const handleRemoveAll = async () => {
    if (!window.confirm("Remove all restock requests?")) return;
    setRemovingAll(true);
    try {
      await deleteCustomerRestock({ type: "all" });
      setRestocks([]);
      toast.success("All restock requests removed!");
    } catch {
      toast.error("Failed to remove all restock requests");
    }
    setRemovingAll(false);
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <Sidebar active={2} />
        </div>
        {/* Main Content */}
        <div className="col-12 col-lg-9">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h4 className="fw-bold mb-0">Restock Requests</h4>
              {restocks.length > 0 && (
                <button
                  className="btn btn-outline-danger"
                  onClick={handleRemoveAll}
                  disabled={removingAll}
                >
                  {removingAll ? "Removing..." : "Remove All"}
                </button>
              )}
            </div>
            {loading ? (
              <div className="text-center py-5">Loading...</div>
            ) : restocks.length === 0 ? (
              <div className="text-center py-5 text-muted">No restock requests found.</div>
            ) : (
              <div className="row g-3">
                {restocks.map((item) => {
                  const p = item.product;
                  if (!p) return null;
                  const img = p.thumbnail_full_url?.path || "/placeholder.png";
                  return (
                    <div key={item.id} className="col-12 col-md-6">
                      <div className="d-flex align-items-center bg-white border rounded-4 p-3 position-relative" style={{ minHeight: 100 }}>
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
                        <div className="flex-grow-1">
                          <div className="fw-semibold" style={{ fontSize: 16 }}>{p.name}</div>
                          <div className="text-muted" style={{ fontSize: 14 }}>
                            {p.brand_name || p.brand?.name || "—"}
                          </div>
                          <div className="fw-bold mt-1" style={{ fontSize: 16 }}>{moneyBDT(p.unit_price)}</div>
                          <div className="text-muted small">Requested: {new Date(item.created_at).toLocaleString()}</div>
                        </div>
                        <button
                          className="btn btn-light border rounded-circle ms-3"
                          style={{ width: 40, height: 40 }}
                          title="Remove"
                          onClick={() => handleRemove(item.id)}
                          disabled={removing[item.id]}
                        >
                          <i className="fas fa-trash text-danger"></i>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
