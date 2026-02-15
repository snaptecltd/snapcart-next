// app/checkout/sslcommerz-callback/page.js
"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { verifyAndCompleteSSLCommerzOrder } from "@/lib/api/global.service";

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [orderDetails, setOrderDetails] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const processPaymentCallback = async () => {
      try {
        // Get all URL parameters
        const params = {};
        searchParams.forEach((value, key) => {
          params[key] = value;
        });
        
        console.log("URL Parameters received:", params);

        // Check if we have transaction data
        const transactionId = params.tran_id;
        const statusParam = params.status;
        const bankTranId = params.bank_tran_id;
        const amount = params.amount;

        // If no transaction ID, check if we're in the middle of processing
        if (!transactionId) {
          // Maybe we're still waiting for redirect
          console.log("No transaction ID yet, waiting...");
          return;
        }

        console.log("Processing payment:", { transactionId, statusParam, bankTranId, amount });

        if (statusParam === "VALID" || statusParam === "success") {
          setStatus("verifying");
          
          // Get pending order data
          const pendingOrderDataStr = localStorage.getItem("pending_order_data");
          
          if (!pendingOrderDataStr) {
            console.error("No pending order data found");
            setStatus("failed");
            setError("Order data not found");
            setTimeout(() => router.push("/cart"), 3000);
            return;
          }

          const pendingOrderData = JSON.parse(pendingOrderDataStr);
          
          // Prepare verification data
          const verificationData = {
            status: "VALID",
            tran_id: transactionId,
            bank_tran_id: bankTranId,
            amount: amount || pendingOrderData.amount,
            currency: params.currency || "BDT",
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

          console.log("Sending verification data:", verificationData);

          // Call your backend to verify and create order
          const response = await verifyAndCompleteSSLCommerzOrder(verificationData);
          
          if (response && response.order_ids) {
            setStatus("success");
            setOrderDetails(response);
            
            // Clear all checkout data
            clearCheckoutData();
            
            toast.success(`Payment successful!`);
            
            // Redirect after 5 seconds
            setTimeout(() => {
              router.push("/");
            }, 5000);
          } else {
            throw new Error(response?.message || "Failed to create order");
          }
        } 
        else if (statusParam === "FAILED" || statusParam === "failed") {
          setStatus("failed");
          setError("Payment failed");
          localStorage.removeItem("pending_order_data");
          setTimeout(() => router.push("/cart"), 3000);
        } 
        else if (statusParam === "CANCELLED" || statusParam === "canceled") {
          setStatus("canceled");
          setError("Payment canceled");
          localStorage.removeItem("pending_order_data");
          setTimeout(() => router.push("/cart"), 3000);
        }
        else {
          console.log("Unknown status:", statusParam);
          // Try to process anyway if we have transaction ID
          if (transactionId) {
            setStatus("verifying");
            // Try to verify with just the transaction ID
            const pendingOrderDataStr = localStorage.getItem("pending_order_data");
            if (pendingOrderDataStr) {
              const pendingOrderData = JSON.parse(pendingOrderDataStr);
              const verificationData = {
                status: "VALID",
                tran_id: transactionId,
                bank_tran_id: bankTranId,
                amount: amount || pendingOrderData.amount,
                currency: params.currency || "BDT",
                ...pendingOrderData
              };
              
              const response = await verifyAndCompleteSSLCommerzOrder(verificationData);
              if (response && response.order_ids) {
                setStatus("success");
                setOrderDetails(response);
                clearCheckoutData();
                setTimeout(() => router.push("/"), 5000);
              }
            }
          }
        }
      } catch (error) {
        console.error("Payment verification error:", error);
        setStatus("failed");
        setError(error.message || "Payment verification failed");
        setTimeout(() => router.push("/cart"), 3000);
      }
    };

    // Only process if we have search params
    if (searchParams.toString()) {
      processPaymentCallback();
    }
  }, [searchParams, router]);

  const clearCheckoutData = () => {
    const keys = [
      "pending_order_data",
      "snapcart_shipping_method_id",
      "snapcart_checkout_shipping_id",
      "snapcart_checkout_billing_id",
      "snapcart_same_as_shipping",
      "snapcart_order_note",
      "snapcart_coupon_applied",
      "snapcart_cart_subtotal",
      "snapcart_cart_item_discount",
      "snapcart_cart_shipping",
      "snapcart_cart_discount",
      "snapcart_cart_total",
      "snapcart_checkout_shipping_address",
      "snapcart_checkout_billing_address"
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card text-center">
            <div className="card-body py-5">
              {status === "processing" && (
                <>
                  <div className="spinner-border text-primary mb-3" />
                  <h3>Processing Payment...</h3>
                  <p className="text-muted">Please wait...</p>
                </>
              )}
              
              {status === "verifying" && (
                <>
                  <div className="spinner-border text-primary mb-3" />
                  <h3>Verifying Payment...</h3>
                  <p className="text-muted">Please wait while we confirm your payment...</p>
                </>
              )}
              
              {status === "success" && (
                <>
                  <div className="text-success mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Payment Successful!</h3>
                  {orderDetails?.order_ids && (
                    <div className="mt-3">
                      <p className="fw-bold">Order ID: {orderDetails.order_ids.join(", ")}</p>
                    </div>
                  )}
                  <p className="mt-3 text-muted">Redirecting to home page...</p>
                </>
              )}
              
              {status === "failed" && (
                <>
                  <div className="text-danger mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <h3>Payment Failed</h3>
                  <p className="text-muted">{error || "Please try again"}</p>
                  <p>Redirecting to cart...</p>
                </>
              )}
              
              {status === "canceled" && (
                <>
                  <div className="text-warning mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-exclamation-circle"></i>
                  </div>
                  <h3>Payment Canceled</h3>
                  <p className="text-muted">{error || "You canceled the payment"}</p>
                  <p>Redirecting to cart...</p>
                </>
              )}
              
              <div className="mt-4">
                <button 
                  onClick={() => router.push("/")} 
                  className="btn btn-primary me-2"
                >
                  Go to Home
                </button>
                {status === "failed" && (
                  <button 
                    onClick={() => router.push("/checkout/payment")} 
                    className="btn btn-outline-primary"
                  >
                    Try Again
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SSLCommerzCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}