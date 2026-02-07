//app/checkout/payment/sslcommerz-callback/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import { verifyAndCompleteSSLCommerzOrder, placeOrderByOfflinePayment } from "@/lib/api/global.service";

export default function SSLCommerzCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState("processing");
  const [orderDetails, setOrderDetails] = useState(null);

  useEffect(() => {
    const processPaymentCallback = async () => {
      const statusParam = searchParams.get("status");
      const orderId = searchParams.get("order_id");
      const transactionId = searchParams.get("tran_id");
      const amount = searchParams.get("amount");

      console.log("Payment callback received:", {
        statusParam,
        orderId,
        transactionId,
        amount
      });

      if (statusParam === "success") {
        setStatus("verifying");
        
        try {
          // Get pending order data from localStorage
          const pendingOrderDataStr = localStorage.getItem("pending_order_data");
          const pendingOrderData = pendingOrderDataStr ? JSON.parse(pendingOrderDataStr) : null;
          
          if (!pendingOrderData) {
            toast.error("Order data not found. Please contact support.");
            setStatus("failed");
            setTimeout(() => {
              router.push("/cart");
            }, 3000);
            return;
          }

          // Prepare payment verification data
          const paymentData = {
            status: "success",
            order_id: orderId,
            tran_id: transactionId,
            amount: amount,
            // Include all order data
            coupon_code: pendingOrderData.coupon_code,
            order_note: pendingOrderData.order_note,
            shipping_method_id: pendingOrderData.shipping_method_id,
            address_id: pendingOrderData.address_id,
            billing_address_id: pendingOrderData.billing_address_id,
            payment_method: 'ssl_commerz',
            payment_note: `SSLCommerz Transaction: ${transactionId}`,
            method_id: 'ssl_commerz',
            method_informations: btoa(JSON.stringify({
              transaction_id: transactionId,
              payment_gateway: 'SSLCommerz'
            })),
            customer_name: pendingOrderData.customer_info?.name,
            customer_email: pendingOrderData.customer_info?.email,
            customer_phone: pendingOrderData.customer_info?.phone,
          };

          console.log("Verifying payment with data:", paymentData);

          // Verify payment and create order
          const response = await verifyAndCompleteSSLCommerzOrder(paymentData);
          
          if (response && (response.order_ids || response.messages)) {
            setStatus("success");
            setOrderDetails(response);
            
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
              "snapcart_checkout_billing_address",
              "pending_order_data"
            ];
            
            keys.forEach(key => localStorage.removeItem(key));
            
            // Dispatch event for cart update
            window.dispatchEvent(new Event("snapcart-auth-change"));
            
            const orderIds = response.order_ids ? response.order_ids.join(", ") : "N/A";
            toast.success(`Payment successful! Order ID: ${orderIds}`);
            
            // Redirect to home after 5 seconds
            setTimeout(() => {
              router.push("/");
            }, 5000);
            
          } else {
            throw new Error("Failed to create order after payment");
          }
          
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Payment verification failed. Please contact support.");
          setStatus("failed");
          setTimeout(() => {
            router.push("/cart");
          }, 3000);
        }
        
      } else if (statusParam === "failed") {
        setStatus("failed");
        toast.error("Payment failed. Please try again.");
        
        // Clear pending order data
        localStorage.removeItem("pending_order_data");
        
        setTimeout(() => {
          router.push("/cart");
        }, 3000);
        
      } else if (statusParam === "canceled") {
        setStatus("canceled");
        toast.warning("Payment canceled.");
        
        // Clear pending order data
        localStorage.removeItem("pending_order_data");
        
        setTimeout(() => {
          router.push("/cart");
        }, 3000);
      }
    };

    if (searchParams.toString()) {
      processPaymentCallback();
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