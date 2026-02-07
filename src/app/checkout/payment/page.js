// checkout/payment/page.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "react-toastify";
import { 
  placeOrder,
  placeOrderWithDigitalPayment,
  placeOrderByOfflinePayment,
  initiateSSLCommerzPayment,
  getOfflinePaymentMethods 
} from "@/lib/api/global.service";

export default function PaymentPage() {
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState("ssl_commerz");
  const [offlineMethods, setOfflineMethods] = useState([]);
  const [selectedOfflineMethod, setSelectedOfflineMethod] = useState("");
  const [offlinePaymentNote, setOfflinePaymentNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    itemDiscount: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  });
  const [orderNote, setOrderNote] = useState("");

  // Load cart summary
  useEffect(() => {
    try {
      const subtotal = Number(localStorage.getItem("snapcart_cart_subtotal") || 0);
      const itemDiscount = Number(localStorage.getItem("snapcart_cart_item_discount") || 0);
      const shipping = Number(localStorage.getItem("snapcart_cart_shipping") || 0);
      const discount = Number(localStorage.getItem("snapcart_cart_discount") || 0);
      const total = Math.max(0, subtotal - itemDiscount - discount + shipping);
      
      setCartSummary({ subtotal, itemDiscount, shipping, discount, total });
    } catch (error) {
      console.error("Error loading cart summary:", error);
    }
  }, []);

  // Load offline payment methods
  useEffect(() => {
    const loadOfflineMethods = async () => {
      try {
        const methods = await getOfflinePaymentMethods();
        if (methods && methods.offline_methods) {
          setOfflineMethods(methods.offline_methods);
          if (methods.offline_methods.length > 0) {
            setSelectedOfflineMethod(methods.offline_methods[0].id.toString());
          }
        }
      } catch (error) {
        console.error("Error loading offline methods:", error);
      }
    };
    loadOfflineMethods();
  }, []);

  const getGuestIdFromLocalStorage = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("guest_id") || "";
    }
    return "";
  };

  const getTokenFromLocalStorage = () => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("snapcart_token") || "";
    }
    return "";
  };
  
  // checkout/payment/page.js - handlePlaceOrder function
  const handlePlaceOrder = async () => {
    setIsLoading(true);

    try {
      // Get saved data from localStorage
      const shippingId = localStorage.getItem("snapcart_checkout_shipping_id");
      const billingId = localStorage.getItem("snapcart_checkout_billing_id");
      const shippingMethodId = localStorage.getItem("snapcart_shipping_method_id");
      const couponCode = localStorage.getItem("snapcart_coupon_applied") || "";
      const sameAsShipping = localStorage.getItem("snapcart_same_as_shipping") === "true";
      
      // Get shipping address for customer info
      const shippingAddressStr = localStorage.getItem("snapcart_checkout_shipping_address");
      const shippingAddress = shippingAddressStr ? JSON.parse(shippingAddressStr) : {};

      console.log("Order data:", {
        shippingId,
        billingId,
        shippingMethodId,
        couponCode,
        orderNote,
        paymentMethod
      });

      if (!shippingId) {
        toast.error("Shipping address not found. Please go back and add address.");
        setIsLoading(false);
        return;
      }

      // Common order data
      const commonOrderData = {
        coupon_code: couponCode,
        order_note: orderNote,
        shipping_method_id: shippingMethodId,
        address_id: shippingId,
        billing_address_id: sameAsShipping ? shippingId : billingId,
      };

      // Case 1: Cash on Delivery
      if (paymentMethod === "cash_on_delivery") {
        console.log("Placing COD order:", commonOrderData);
        
        const response = await placeOrder(commonOrderData);
        
        if (response && response.order_ids) {
          toast.success(`Order placed successfully! Order ID: ${response.order_ids.join(", ")}`);
          
          // Clear checkout data
          clearCheckoutLocalStorage();
          
          // Redirect to order confirmation
          setTimeout(() => {
            router.push(`/checkout/order-confirmation?order_ids=${response.order_ids.join(",")}`);
          }, 2000);
        } else {
          throw new Error("Failed to place order");
        }
      }
      
      // Case 2: Offline Payment
      else if (paymentMethod === "offline_payment") {
        if (!selectedOfflineMethod) {
          toast.error("Please select an offline payment method.");
          setIsLoading(false);
          return;
        }

        const method = offlineMethods.find(m => m.id.toString() === selectedOfflineMethod);
        if (!method) {
          toast.error("Invalid payment method selected.");
          setIsLoading(false);
          return;
        }

        // Prepare method informations
        const methodInformations = {};
        if (method.method_informations) {
          method.method_informations.forEach(info => {
            methodInformations[info.customer_input] = "";
          });
        }

        const offlineOrderData = {
          ...commonOrderData,
          method_id: selectedOfflineMethod,
          method_informations: btoa(JSON.stringify(methodInformations)),
          payment_note: offlinePaymentNote,
        };

        console.log("Placing offline order:", offlineOrderData);

        const response = await placeOrderByOfflinePayment(offlineOrderData);
        
        if (response && response.messages) {
          toast.success(response.messages);
          clearCheckoutLocalStorage();
          
          setTimeout(() => {
            router.push("/checkout/order-confirmation");
          }, 2000);
        }
      }
      
      // Case 3: SSLCommerz (Digital Payment)
      else if (paymentMethod === "ssl_commerz") {
        console.log("Initiating SSLCommerz payment");
        
        // FIRST: Place order to get order_id
        const orderResponse = await placeOrderWithDigitalPayment(commonOrderData);
        
        if (!orderResponse || !orderResponse.order_ids || orderResponse.order_ids.length === 0) {
          toast.error("Failed to create order. Please try again.");
          setIsLoading(false);
          return;
        }
        
        const orderId = orderResponse.order_ids[0];
        
        // Prepare payment data with order_id
        const paymentData = {
          order_id: orderId,
          amount: cartSummary.total,
          currency: "BDT",
          customer_name: shippingAddress.contact_person_name || "Customer",
          customer_email: shippingAddress.email || "customer@example.com",
          customer_phone: shippingAddress.phone || "01XXXXXXXXX",
          callback_url: `${window.location.origin}/checkout/payment/sslcommerz-callback`,
          // Additional order data for reference
          coupon_code: commonOrderData.coupon_code,
          order_note: commonOrderData.order_note,
          shipping_method_id: commonOrderData.shipping_method_id,
          address_id: commonOrderData.address_id,
          billing_address_id: commonOrderData.billing_address_id,
          guest_id: getGuestIdFromLocalStorage(),
          token: getTokenFromLocalStorage()
        };

        console.log("Payment data:", paymentData);

        // Store pending order data for callback
        localStorage.setItem("pending_order_data", JSON.stringify({
          ...commonOrderData,
          order_id: orderId,
          payment_method: 'ssl_commerz',
          customer_info: {
            name: shippingAddress.contact_person_name,
            email: shippingAddress.email,
            phone: shippingAddress.phone
          },
          amount: cartSummary.total
        }));

        // Initiate SSLCommerz payment
        const sslResponse = await initiateSSLCommerzPayment(paymentData);
        
        if (sslResponse && sslResponse.payment_url) {
          console.log("Redirecting to SSLCommerz:", sslResponse.payment_url);
          window.location.href = sslResponse.payment_url;
        } else {
          throw new Error("Failed to initiate payment");
        }
      }

    } catch (error) {
      console.error("Payment error:", error);
      toast.error(error.response?.data?.message || error.message || "Payment failed");
    } finally {
      setIsLoading(false);
    }
  };

// Helper function to clear localStorage
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
    "pending_order_data"
  ];
  
  keys.forEach(key => localStorage.removeItem(key));
  window.dispatchEvent(new Event("snapcart-auth-change"));
};

  const subtotal = cartSummary.subtotal;
  const itemDiscount = cartSummary.itemDiscount;
  const shippingCharge = cartSummary.shipping;
  const discount = cartSummary.discount;
  const total = cartSummary.total;

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          {/* Stepper */}
          <div className="mb-4">
            <div className="d-flex align-items-center justify-content-center gap-4">
              <div className="text-center">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>1</div>
                <div style={{ fontSize: 13 }}>Cart</div>
              </div>
              <div style={{ width: 40, height: 2, background: "#ddd" }} />
              <div className="text-center">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>2</div>
                <div style={{ fontSize: 13 }}>Shipping & Billing</div>
              </div>
              <div style={{ width: 40, height: 2, background: "#ddd" }} />
              <div className="text-center">
                <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>3</div>
                <div style={{ fontSize: 13 }}>Payment</div>
              </div>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
            <h5 className="fw-bold mb-3">Select Payment Method</h5>
            
            <div className="mb-4">
              {/* Cash on Delivery */}
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="cash_on_delivery"
                  value="cash_on_delivery"
                  checked={paymentMethod === "cash_on_delivery"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="cash_on_delivery">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-money-bill-wave fa-lg me-3 text-success"></i>
                    <div>
                      <strong>Cash on Delivery</strong>
                      <p className="mb-0 text-muted small">Pay when you receive the product</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* SSLCommerz */}
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="ssl_commerz"
                  value="ssl_commerz"
                  checked={paymentMethod === "ssl_commerz"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="ssl_commerz">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-credit-card fa-lg me-3 text-primary"></i>
                    <div>
                      <strong>Pay with Card/Bank (SSLCommerz)</strong>
                      <p className="mb-0 text-muted small">Visa, MasterCard, bKash, Nagad, Rocket, Bank Transfer</p>
                    </div>
                  </div>
                </label>
              </div>

              {/* Offline Payment */}
              <div className="form-check mb-3">
                <input
                  className="form-check-input"
                  type="radio"
                  name="paymentMethod"
                  id="offline_payment"
                  value="offline_payment"
                  checked={paymentMethod === "offline_payment"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                />
                <label className="form-check-label" htmlFor="offline_payment">
                  <div className="d-flex align-items-center">
                    <i className="fas fa-university fa-lg me-3 text-success"></i>
                    <div>
                      <strong>Offline Payment</strong>
                      <p className="mb-0 text-muted small">Bank Deposit, Cash on Delivery, Mobile Banking</p>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Offline Payment Details */}
            {paymentMethod === "offline_payment" && offlineMethods.length > 0 && (
              <div className="border rounded-3 p-4 mb-4">
                <h6 className="fw-bold mb-3">Select Payment Method</h6>
                <select 
                  className="form-select mb-3"
                  value={selectedOfflineMethod}
                  onChange={(e) => setSelectedOfflineMethod(e.target.value)}
                >
                  {offlineMethods.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.method_name}
                    </option>
                  ))}
                </select>

                {selectedOfflineMethod && (
                  <div className="mb-3">
                    <h6 className="fw-bold">Payment Instructions:</h6>
                    <div className="bg-light p-3 rounded-3">
                      {offlineMethods
                        .find(m => m.id.toString() === selectedOfflineMethod)
                        ?.method_fields?.map((field, index) => (
                          <div key={index} className="mb-2">
                            <strong>{field.input_name}:</strong> {field.placeholder_data}
                          </div>
                        ))}
                    </div>
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label">Payment Note (Optional)</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    value={offlinePaymentNote}
                    onChange={(e) => setOfflinePaymentNote(e.target.value)}
                    placeholder="Add any additional payment information..."
                  />
                </div>
              </div>
            )}

            {/* Order Note */}
            <div className="mb-4">
              <label className="form-label">Order Note (Optional)</label>
              <textarea
                className="form-control"
                rows="3"
                value={orderNote}
                onChange={(e) => setOrderNote(e.target.value)}
                placeholder="Add special instructions for your order..."
              />
            </div>

            {/* SSLCommerz Security Info */}
            {paymentMethod === "ssl_commerz" && (
              <div className="alert alert-info">
                <div className="d-flex align-items-center">
                  <i className="fas fa-shield-alt fa-2x me-3"></i>
                  <div>
                    <h6 className="mb-1">Secure Payment</h6>
                    <p className="mb-0 small">
                      Your payment is processed through SSLCommerz, a PCI DSS compliant payment gateway. 
                      Your card details are encrypted and secure.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Order Summary */}
        <div className="col-12 col-lg-4">
          <div className="bg-light rounded-4 p-4 shadow-sm sticky-top" style={{ top: "20px" }}>
            <h5 className="fw-bold mb-4">Order Summary</h5>
            
            <div className="mb-3 d-flex justify-content-between">
              <span>Sub total</span>
              <span className="fw-bold">৳{subtotal.toLocaleString()}</span>
            </div>
            <div className="mb-3 d-flex justify-content-between">
              <span>Item Discount</span>
              <span className="text-primary">- ৳{itemDiscount.toLocaleString()}</span>
            </div>
            {shippingCharge > 0 && (
              <div className="mb-3 d-flex justify-content-between">
                <span>Shipping</span>
                <span>+ ৳{shippingCharge.toLocaleString()}</span>
              </div>
            )}
            {discount > 0 && (
              <div className="mb-3 d-flex justify-content-between">
                <span>Discount</span>
                <span className="text-success">- ৳{discount.toLocaleString()}</span>
              </div>
            )}
            
            <hr />
            
            <div className="mb-4 d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span className="text-primary">৳{total.toLocaleString()}</span>
            </div>
            
            <button
              className="btn btn-primary w-100 mb-3 py-3 fw-bold"
              onClick={handlePlaceOrder}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : paymentMethod === "ssl_commerz" ? (
                <>
                  <i className="fas fa-lock me-2"></i>
                  Pay Now
                </>
              ) : (
                <>
                  <i className="fas fa-check-circle me-2"></i>
                  Place Order
                </>
              )}
            </button>
            
            <div className="text-center">
              <Link href="/checkout" className="btn btn-link text-decoration-none">
                <i className="fas fa-arrow-left me-2"></i>
                Back to Shipping
              </Link>
            </div>
            
            <div className="mt-4 pt-3 border-top">
              <small className="text-muted">
                <i className="fas fa-shield-alt me-2"></i>
                Secure checkout. Your information is protected.
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}