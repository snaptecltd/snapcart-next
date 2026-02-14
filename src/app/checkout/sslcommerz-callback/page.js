// app/checkout/sslcommerz-callback/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { verifyAndCompleteSSLCommerzOrder } from "@/lib/api/global.service";

export default function SSLCommerzCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPaymentCallback = async () => {
      try {
        // Log all search params
        const params = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        console.log("All callback parameters:", params);

        const statusParam = searchParams.get("status");
        const transactionId = searchParams.get("tran_id");
        const bankTranId = searchParams.get("bank_tran_id");
        const paymentId = searchParams.get("payment_id");
        const orderId = searchParams.get("order_id");
        const amount = searchParams.get("amount");

        console.log("Payment callback received:", {
          statusParam,
          transactionId,
          bankTranId,
          paymentId,
          orderId,
          amount
        });

        // Check if we have a transaction ID
        if (!transactionId) {
          console.error("No transaction ID in callback");
          setStatus("failed");
          setError("No transaction ID received");
          setTimeout(() => router.push("/cart"), 3000);
          return;
        }

        if (statusParam === "success") {
          setStatus("verifying");
          
          // Get pending order data from localStorage
          const pendingOrderDataStr = localStorage.getItem("pending_order_data");
          console.log("Pending order data from localStorage:", pendingOrderDataStr);
          
          if (!pendingOrderDataStr) {
            console.error("No pending order data found");
            setStatus("failed");
            setError("Order data not found");
            setTimeout(() => router.push("/cart"), 3000);
            return;
          }

          const pendingOrderData = JSON.parse(pendingOrderDataStr);
          console.log("Parsed pending order data:", pendingOrderData);

          // Prepare payment verification data
          const paymentData = {
            status: "VALID",
            tran_id: transactionId,
            bank_tran_id: bankTranId,
            payment_id: paymentId,
            amount: amount || pendingOrderData.amount,
            currency: pendingOrderData.currency || "BDT",
            // Include all order data
            coupon_code: pendingOrderData.coupon_code || "",
            order_note: pendingOrderData.order_note || "",
            shipping_method_id: pendingOrderData.shipping_method_id,
            address_id: pendingOrderData.address_id,
            billing_address_id: pendingOrderData.billing_address_id,
            customer_name: pendingOrderData.customer_info?.name || "Customer",
            customer_email: pendingOrderData.customer_info?.email || "customer@example.com",
            customer_phone: pendingOrderData.customer_info?.phone || "01XXXXXXXXX",
            guest_id: pendingOrderData.guest_id,
          };

          console.log("Sending verification data to backend:", paymentData);

          // Verify payment and create order
          const response = await verifyAndCompleteSSLCommerzOrder(paymentData);
          console.log("Backend response:", response);
          
          if (response && response.order_ids) {
            setStatus("success");
            setOrderDetails(response);
            
            // Clear localStorage
            clearCheckoutData();
            
            toast.success(`Payment successful! Order ID: ${response.order_ids.join(", ")}`);
            
            // Redirect to home after 5 seconds
            setTimeout(() => {
              router.push("/");
            }, 5000);
            
          } else {
            console.error("Invalid response from backend:", response);
            throw new Error(response?.message || "Failed to create order");
          }
          
        } else if (statusParam === "failed") {
          console.log("Payment failed");
          setStatus("failed");
          setError("Payment failed");
          localStorage.removeItem("pending_order_data");
          setTimeout(() => router.push("/cart"), 3000);
          
        } else if (statusParam === "canceled") {
          console.log("Payment canceled");
          setStatus("canceled");
          setError("Payment canceled");
          localStorage.removeItem("pending_order_data");
          setTimeout(() => router.push("/cart"), 3000);
        } else {
          console.log("Unknown status:", statusParam);
          setStatus("failed");
          setError("Unknown payment status");
          setTimeout(() => router.push("/cart"), 3000);
        }
        
      } catch (error) {
        console.error("Payment verification error:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        setStatus("failed");
        setError(error.message);
        toast.error(error.response?.data?.message || error.message || "Payment verification failed");
        setTimeout(() => {
          router.push("/cart");
        }, 3000);
      }
    };

    if (searchParams.toString()) {
      processPaymentCallback();
    }
  }, [searchParams, router]);

  const clearCheckoutData = () => {
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
      "snapcart_checkout_billing_address",
      "pending_order_data"
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    window.dispatchEvent(new Event("snapcart-auth-change"));
  };

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
              
              {status === "verifying" && (
                <>
                  <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h3>Verifying Payment...</h3>
                  <p className="text-muted">Please wait while we create your order.</p>
                </>
              )}
              
              {status === "success" && (
                <>
                  <div className="text-success mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Payment Successful!</h3>
                  <p className="text-muted">Your order has been placed successfully.</p>
                  {orderDetails?.order_ids && (
                    <p className="fw-bold">Order ID: {orderDetails.order_ids.join(", ")}</p>
                  )}
                  <p>Redirecting to home page...</p>
                </>
              )}
              
              {status === "failed" && (
                <>
                  <div className="text-danger mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <h3>Payment Failed</h3>
                  <p className="text-muted">{error || "Your payment was not successful."}</p>
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
                {orderDetails?.order_ids && (
                  <a href="/orders" className="btn btn-outline-primary">View Orders</a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}