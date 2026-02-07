// app/order-confirmation/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";

export default function OrderConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderIds, setOrderIds] = useState([]);
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const orderIdsParam = searchParams.get("order_ids");
    if (orderIdsParam) {
      const ids = orderIdsParam.split(",");
      setOrderIds(ids);
      toast.success(`Order placed successfully! Order ID: ${ids.join(", ")}`);
    } else {
      // If no order IDs in URL, check localStorage
      const pendingOrder = localStorage.getItem("pending_order_data");
      if (pendingOrder) {
        const orderData = JSON.parse(pendingOrder);
        toast.success("Payment successful! Order is being processed.");
        localStorage.removeItem("pending_order_data");
      }
    }
  }, [searchParams]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card text-center">
            <div className="card-body py-5">
              <div className="text-success mb-3" style={{ fontSize: "4rem" }}>
                <i className="fas fa-check-circle"></i>
              </div>
              <h3>Order Confirmed!</h3>
              <p className="text-muted">Thank you for your purchase.</p>
              
              {orderIds.length > 0 && (
                <div className="alert alert-success mt-3">
                  <h5 className="alert-heading">Order Details</h5>
                  <hr />
                  <p className="mb-1"><strong>Order ID(s):</strong> {orderIds.join(", ")}</p>
                  <p className="mb-1"><strong>Status:</strong> Processing</p>
                  <p className="mb-0">
                    You will receive a confirmation email shortly.
                  </p>
                </div>
              )}
              
              <div className="mt-4">
                <Link href="/" className="btn btn-primary me-2">
                  <i className="fas fa-home me-1"></i> Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}