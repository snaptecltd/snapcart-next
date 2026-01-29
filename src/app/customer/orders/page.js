"use client";
import { useEffect, useState } from "react";
import { getCustomerOrderList, getCustomerOrderDetails } from "@/lib/api/global.service";
import Sidebar from "../partials/Sidebar";
import { toast } from "react-toastify";

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
  const [showDetails, setShowDetails] = useState(false);
  const [details, setDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getCustomerOrderList()
      .then((data) => setOrders(data.orders || []))
      .catch(() => toast.error("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  const handleShowDetails = async (orderId) => {
    setDetailsLoading(true);
    setShowDetails(true);
    try {
      const data = await getCustomerOrderDetails(orderId);
      setDetails(data && Array.isArray(data) ? data : []);
    } catch {
      toast.error("Failed to load order details");
      setDetails([]);
    }
    setDetailsLoading(false);
  };

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
                          <button
                            className="btn btn-light border rounded-circle"
                            title="View"
                            onClick={() => handleShowDetails(order.id)}
                          >
                            <i className="fas fa-eye text-primary"></i>
                          </button>
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
      {/* Order Details Modal */}
      {showDetails && (
        <div className="modal fade show" style={{ display: "block", background: "rgba(0,0,0,0.25)" }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Order Details</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetails(false)}></button>
              </div>
              <div className="modal-body">
                {detailsLoading ? (
                  <div className="text-center py-4">Loading...</div>
                ) : details && details.length > 0 ? (
                  <>
                    <div className="mb-3">
                      <strong>Order #</strong> {details[0].order_id}
                      <span className="badge ms-2" style={{
                        background: statusMap[details[0].order?.order_status]?.color || "#e5e7eb",
                        color: "#fff",
                        fontWeight: 500,
                        fontSize: 13
                      }}>
                        {statusMap[details[0].order?.order_status]?.label || details[0].order?.order_status}
                      </span>
                    </div>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <div className="border rounded-3 p-3 mb-2">
                          <div className="fw-semibold mb-1">Shipping Address</div>
                          <div>
                            <div>{details[0].order?.shipping_address_data?.contact_person_name}</div>
                            <div>{details[0].order?.shipping_address_data?.phone}</div>
                            <div>{details[0].order?.shipping_address_data?.address}, {details[0].order?.shipping_address_data?.city}, {details[0].order?.shipping_address_data?.zip}</div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="border rounded-3 p-3 mb-2">
                          <div className="fw-semibold mb-1">Billing Address</div>
                          <div>
                            <div>{details[0].order?.billing_address_data?.contact_person_name}</div>
                            <div>{details[0].order?.billing_address_data?.phone}</div>
                            <div>{details[0].order?.billing_address_data?.address}, {details[0].order?.billing_address_data?.city}, {details[0].order?.billing_address_data?.zip}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="table-responsive mb-3">
                      <table className="table align-middle">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Name</th>
                            <th>Variant</th>
                            <th>Qty</th>
                            <th>Unit Price</th>
                            <th>Discount</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {details.map((item, idx) => (
                            <tr key={idx}>
                              <td>
                                <img
                                  src={item.product_details?.thumbnail_full_url?.path || "/placeholder.png"}
                                  alt={item.product_details?.name}
                                  style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8, background: "#f8f9fa" }}
                                />
                              </td>
                              <td>
                                <div className="fw-semibold">{item.product_details?.name}</div>
                                <div className="text-muted small">{item.product_details?.code}</div>
                              </td>
                              <td>{item.variant || "-"}</td>
                              <td>{item.qty}</td>
                              <td>{moneyBDT(item.price)}</td>
                              <td>{item.discount ? moneyBDT(item.discount) : "-"}</td>
                              <td>{moneyBDT((item.price - (item.discount || 0)) * item.qty)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="border rounded-3 p-3 mb-2">
                          <div className="fw-semibold mb-1">Payment Info</div>
                          <div>Payment Status: <span className="fw-bold">{details[0].order?.payment_status}</span></div>
                          <div>Payment Method: <span className="fw-bold">{details[0].order?.payment_method?.replace(/_/g, " ")}</span></div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="border rounded-3 p-3 mb-2">
                          <div className="fw-semibold mb-1">Order Summary</div>
                          <div>Total Item: {details.reduce((sum, i) => sum + (i.qty || 0), 0)}</div>
                          <div>Subtotal: {moneyBDT(details.reduce((sum, i) => sum + (i.price * i.qty), 0))}</div>
                          <div>Discount: {moneyBDT(details.reduce((sum, i) => sum + (i.discount || 0), 0))}</div>
                          <div>Shipping Fee: {moneyBDT(details[0].order?.shipping_cost || 0)}</div>
                          <div className="fw-bold mt-2">Total: {moneyBDT(details[0].order?.order_amount)}</div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">No details found.</div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      <style>{`
        .modal.fade.show {
          display: block;
          background: rgba(0,0,0,0.25);
        }
        .modal-dialog {
          max-width: 900px;
        }
      `}</style>
    </div>
  );
}
