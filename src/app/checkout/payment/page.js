"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { checkSSLCommerzPaymentStatus } from "@/lib/api/global.service";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [orderDetails, setOrderDetails] = useState(null);
  const [transactionId, setTransactionId] = useState("");
  const [pollingInterval, setPollingInterval] = useState(null);

  // Function to clear checkout localStorage
  const clearCheckoutLocalStorage = () => {
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
      "pending_ssl_order"
    ];
    
    keys.forEach(key => localStorage.removeItem(key));
    
    // Dispatch event for cart update
    window.dispatchEvent(new Event("snapcart-auth-change"));
  };

  // Function to check payment status
  const checkPaymentStatus = async (tranId) => {
    try {
      const response = await checkSSLCommerzPaymentStatus(tranId);
      console.log("Payment status check response:", response);
      
      if (response.status === "completed") {
        // Payment completed successfully
        setStatus("success");
        
        // Get order details from localStorage
        const pendingOrderStr = localStorage.getItem("pending_ssl_order");
        if (pendingOrderStr) {
          const pendingOrder = JSON.parse(pendingOrderStr);
          setOrderDetails(pendingOrder);
        }
        
        // Clear localStorage
        clearCheckoutLocalStorage();
        
        // Stop polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        toast.success(`Payment successful!`);
        
        // Redirect to home after 5 seconds
        setTimeout(() => {
          router.push("/");
        }, 5000);
        
      } else if (response.status === "failed") {
        setStatus("failed");
        clearCheckoutLocalStorage();
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        toast.error("Payment failed. Please try again.");
        setTimeout(() => {
          router.push("/cart");
        }, 3000);
        
      } else if (response.status === "canceled") {
        setStatus("canceled");
        clearCheckoutLocalStorage();
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        toast.warning("Payment canceled.");
        setTimeout(() => {
          router.push("/cart");
        }, 3000);
      }
      // If still pending, continue polling
      
    } catch (error) {
      console.error("Payment status check error:", error);
      
      // After 30 seconds of polling without success, show timeout
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > 30000) { // 30 seconds timeout
        setStatus("timeout");
        clearCheckoutLocalStorage();
        
        if (pollingInterval) {
          clearInterval(pollingInterval);
          setPollingInterval(null);
        }
        
        toast.error("Payment verification timeout. Please contact support.");
        setTimeout(() => {
          router.push("/");
        }, 5000);
      }
    }
  };

  let startTime = Date.now();

  useEffect(() => {
    const statusParam = searchParams.get("status");
    const tranId = searchParams.get("tran_id");
    
    console.log("Payment callback received:", {
      statusParam,
      tranId,
      allParams: Object.fromEntries(searchParams.entries())
    });

    if (!tranId) {
      toast.error("Invalid payment callback");
      setTimeout(() => {
        router.push("/");
      }, 3000);
      return;
    }

    setTransactionId(tranId);

    if (statusParam === "success") {
      setStatus("verifying");
      
      // Start polling for payment status
      const interval = setInterval(() => {
        checkPaymentStatus(tranId);
      }, 3000); // Check every 3 seconds
      
      setPollingInterval(interval);
      
      // Initial check
      checkPaymentStatus(tranId);
      
      // Auto timeout after 30 seconds
      setTimeout(() => {
        if (status === "verifying") {
          setStatus("timeout");
          clearCheckoutLocalStorage();
          
          if (pollingInterval) {
            clearInterval(pollingInterval);
            setPollingInterval(null);
          }
          
          toast.error("Payment verification timeout. Please contact support.");
          setTimeout(() => {
            router.push("/");
          }, 5000);
        }
      }, 30000);
      
    } else if (statusParam === "failed") {
      setStatus("failed");
      clearCheckoutLocalStorage();
      toast.error("Payment failed. Please try again.");
      
      setTimeout(() => {
        router.push("/cart");
      }, 3000);
      
    } else if (statusParam === "canceled") {
      setStatus("canceled");
      clearCheckoutLocalStorage();
      toast.warning("Payment canceled.");
      
      setTimeout(() => {
        router.push("/cart");
      }, 3000);
    } else {
      setStatus("processing");
    }

    // Cleanup interval on unmount
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [searchParams]);

  // Get order IDs for display
  const getOrderIds = () => {
    if (orderDetails?.order_ids) {
      return orderDetails.order_ids.join(", ");
    }
    return "Processing...";
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card text-center">
            <div className="card-body py-5">
              {status === "processing" && (
                <>
                  <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h3>Processing Payment Callback...</h3>
                  <p className="text-muted">Please wait while we process your payment information.</p>
                </>
              )}
              
              {status === "verifying" && (
                <>
                  <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }} role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <h3>Verifying Payment...</h3>
                  <p className="text-muted">Please wait while we verify your payment with SSLCommerz.</p>
                  <div className="mt-3">
                    <p className="small text-muted">
                      Transaction ID: <code>{transactionId}</code>
                    </p>
                    <p className="small text-muted">
                      This may take a few moments. Please don't close this page.
                    </p>
                  </div>
                </>
              )}
              
              {status === "success" && (
                <>
                  <div className="text-success mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-check-circle"></i>
                  </div>
                  <h3>Payment Successful!</h3>
                  <p className="text-muted">Your payment has been verified and order has been placed successfully.</p>
                  
                  <div className="alert alert-success mt-3">
                    <h5 className="alert-heading">Order Details</h5>
                    <hr />
                    <p className="mb-1"><strong>Order ID(s):</strong> {getOrderIds()}</p>
                    <p className="mb-1"><strong>Transaction ID:</strong> {transactionId}</p>
                    {orderDetails?.amount && (
                      <p className="mb-0"><strong>Amount Paid:</strong> ৳{orderDetails.amount.toLocaleString()}</p>
                    )}
                  </div>
                  
                  <p className="mt-3">You will receive a confirmation email shortly.</p>
                  <p>Redirecting to home page in 5 seconds...</p>
                </>
              )}
              
              {status === "failed" && (
                <>
                  <div className="text-danger mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-times-circle"></i>
                  </div>
                  <h3>Payment Failed</h3>
                  <p className="text-muted">Your payment was not successful. Please try again.</p>
                  
                  <div className="alert alert-danger mt-3">
                    <p className="mb-0">Transaction ID: <code>{transactionId}</code></p>
                  </div>
                  
                  <p className="mt-3">If money was deducted from your account, it will be refunded within 3-7 business days.</p>
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
                  
                  <div className="alert alert-warning mt-3">
                    <p className="mb-0">Transaction ID: <code>{transactionId}</code></p>
                  </div>
                  
                  <p>Redirecting to cart...</p>
                </>
              )}
              
              {status === "timeout" && (
                <>
                  <div className="text-warning mb-3" style={{ fontSize: "4rem" }}>
                    <i className="fas fa-clock"></i>
                  </div>
                  <h3>Verification Timeout</h3>
                  <p className="text-muted">Payment verification is taking longer than expected.</p>
                  
                  <div className="alert alert-info mt-3">
                    <h5 className="alert-heading">What to do next?</h5>
                    <ul className="text-start">
                      <li>Check your email for payment confirmation</li>
                      <li>Check your bank/SSLCommerz account for transaction status</li>
                      <li>Contact our support with Transaction ID: <code>{transactionId}</code></li>
                      <li>If payment was successful, your order will be processed</li>
                    </ul>
                  </div>
                  
                  <p>Redirecting to home page...</p>
                </>
              )}
              
              <div className="mt-4">
                <a href="/" className="btn btn-primary me-2">
                  <i className="fas fa-home me-1"></i> Go to Home
                </a>
                
                {status === "success" && orderDetails?.order_ids && (
                  <a href="/orders" className="btn btn-outline-primary me-2">
                    <i className="fas fa-list-alt me-1"></i> View Orders
                  </a>
                )}
                
                {(status === "failed" || status === "canceled") && (
                  <a href="/cart" className="btn btn-outline-primary">
                    <i className="fas fa-shopping-cart me-1"></i> Back to Cart
                  </a>
                )}
                
                {status === "timeout" && (
                  <a href="/contact" className="btn btn-outline-warning">
                    <i className="fas fa-headset me-1"></i> Contact Support
                  </a>
                )}
              </div>
              
              {/* Transaction details footer */}
              {transactionId && (
                <div className="mt-4 pt-3 border-top">
                  <p className="small text-muted mb-0">
                    Transaction Reference: <code>{transactionId}</code>
                  </p>
                  <p className="small text-muted mb-0">
                    Need help? Contact support@yourdomain.com
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}