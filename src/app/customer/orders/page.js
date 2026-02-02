"use client";
import { useEffect, useState } from "react";
import { getCustomerOrderList } from "@/lib/api/global.service";
import Sidebar from "../partials/Sidebar";
import { toast } from "react-toastify";
import Link from "next/link";

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}

const statusMap = {
  pending: { label: "Pending", color: "#38bdf8" },
  processing: { label: "Processing", color: "#facc15" },
  delivered: { label: "Delivered", color: "#22c55e" },
  cancelled: { label: "Cancelled", color: "#ef4444" },
  returned: { label: "Returned", color: "#f87171" },
  completed: { label: "Completed", color: "#22c55e" },
};

export default function CustomerOrderPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getCustomerOrderList()
      .then((data) => setOrders(data.orders || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Sidebar */}
        <div className="col-12 col-lg-3">
          <Sidebar active={1} />
        </div>
        {/* Main Content */}
        <div className="col-12 col-lg-9">
          <div className="bg-white rounded-4 shadow-sm p-4 p-md-5">
            <h4 className="fw-bold mb-4">My Order</h4>
            <div className="table-responsive">
              <table className="table align-middle">
                <thead>
                  <tr className="cart-table-header">
                    <th>Order #</th>
                    <th>Items</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Total</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Loading...
                      </td>
                    </tr>
                  ) : orders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        No orders found.
                      </td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <span className="fw-semibold">#{order.id}</span>
                        </td>
                        <td>{order.order_details_count} Items</td>
                        <td>{new Date(order.created_at).toLocaleString()}</td>
                        <td>
                          <span
                            className="badge"
                            style={{
                              background: statusMap[order.order_status]?.color || "#e5e7eb",
                              color: "#fff",
                              fontWeight: 500,
                              fontSize: 14,
                            }}
                          >
                            {statusMap[order.order_status]?.label || order.order_status}
                          </span>
                        </td>
                        <td>{moneyBDT(order.order_amount)}</td>
                        <td>
                          <Link
                            href={`/customer/orders/${order.id}`}
                            className="btn btn-light border rounded-circle"
                            title="View"
                          >
                            <i className="fas fa-eye text-primary"></i>
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
