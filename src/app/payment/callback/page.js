"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const orderId = searchParams.get("order_id");
    const transactionId = searchParams.get("tran_id");

    if (statusParam === "success") {
      setStatus("success");
      
      // Clear localStorage
      const keys = [
        "snapcart_shipping_method_id",
        "snapcart_checkout_shipping_id",
        "snapcart_checkout_billing_id",
        "snapcart_same_as_shipping",
        "snapcart_order_note",
        "snapcart_coupon_applied",
        "snapcart_cart_subtotal",
        "snapcart_cart_shipping",
        "snapcart_cart_discount",
        "snapcart_cart_total",
        "snapcart_checkout_shipping_address",
        "snapcart_checkout_billing_address"
      ];
      
      keys.forEach(key => localStorage.removeItem(key));
      
      // Dispatch event for cart update
      window.dispatchEvent(new Event("snapcart-auth-change"));
      
      toast.success(`Payment successful! Order ID: ${orderId}`);
      
      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push("/");
      }, 3000);
      
    } else if (statusParam === "failed") {
      setStatus("failed");
      toast.error("Payment failed. Please try again.");
      
      setTimeout(() => {
        router.push("/cart");
      }, 3000);
      
    } else if (statusParam === "canceled") {
      setStatus("canceled");
      toast.warning("Payment canceled.");
      
      setTimeout(() => {
        router.push("/cart");
      }, 3000);
    }
  }, [searchParams, router]);

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body py-5">
              {status === "processing" && (
                <>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h3>Processing Payment...</h3>
                  <p className="text-muted">Please wait while we verify your payment.</p>
                </>
              )}
              
              {status === "success" && (
                <>
                  <div className="text-success mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Payment Successful!</h3>
                  <p className="text-muted">Your order has been placed successfully.</p>
                  <p>Redirecting to home page...</p>
                </>
              )}
              
              {status === "failed" && (
                <>
                  <div className="text-danger mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <h3>Payment Failed</h3>
                  <p className="text-muted">Your payment was not successful.</p>
                  <p>Redirecting to cart...</p>
                </>
              )}
              
              {status === "canceled" && (
                <>
                  <div className="text-warning mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <h3>Payment Canceled</h3>
                  <p className="text-muted">You canceled the payment process.</p>
                  <p>Redirecting to cart...</p>
                </>
              )}
              
              <div className="mt-4">
                <a href="/" className="btn btn-primary me-2">Go to Home</a>
                <a href="/orders" className="btn btn-outline-primary">View Orders</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}