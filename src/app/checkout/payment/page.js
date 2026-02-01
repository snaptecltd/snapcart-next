"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  getOfflinePaymentMethods, 
  placeOrder, 
  placeOrderByOfflinePayment,
  addCustomerAddress 
} from "@/lib/api/global.service"; // addCustomerAddress import করুন
import { toast } from "react-toastify";

export default function PaymentPage() {
  const router = useRouter();
  const [offlineMethods, setOfflineMethods] = useState([]);
  const [showMore, setShowMore] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [offlineFields, setOfflineFields] = useState({});
  const [agreed, setAgreed] = useState(false);
  
  // Cart summary states
  const [subtotal, setSubtotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [shippingMethodId, setShippingMethodId] = useState(null);

  // Load cart summary from localStorage
  useEffect(() => {
    setSubtotal(Number(localStorage.getItem("snapcart_cart_subtotal") || 0));
    setShipping(Number(localStorage.getItem("snapcart_cart_shipping") || 0));
    
    try {
      const stored = localStorage.getItem("snapcart_coupon_applied");
      if (stored) {
        const c = JSON.parse(stored);
        setDiscount(Number(c.coupon_discount || 0));
      }
    } catch {}
    
    setShippingMethodId(localStorage.getItem("snapcart_shipping_method_id") || "");
  }, []);

  // Load offline payment methods
  useEffect(() => {
    getOfflinePaymentMethods()
      .then(res => setOfflineMethods(res?.offline_methods || []))
      .catch(() => setOfflineMethods([]));
  }, []);

  const total = Math.max(0, subtotal + shipping - discount);

  // Handle offline payment field change
  const handleOfflineFieldChange = (input, value) => {
    setOfflineFields((prev) => ({ ...prev, [input]: value }));
  };

  // Function to save address with is_billing field
  const saveAddressToAPI = async (addressData, isBilling = false) => {
    try {
      const addressToSave = {
        ...addressData,
        is_billing: isBilling ? 1 : 0
      };
      
      const response = await addCustomerAddress(addressToSave);
      return response?.id || null;
    } catch (error) {
      console.error("Address save error in payment page:", error);
      return null;
    }
  };

  // Proceed to checkout
// Payment page-এ handleProceed function update করুন
const handleProceed = async () => {
  if (!agreed || !paymentMethod) return;
  
  try {
    // Get all required data from localStorage
    const shipping_method_id = localStorage.getItem("snapcart_shipping_method_id") || "";
    const shipping_address_id = localStorage.getItem("snapcart_checkout_shipping_id") || "";
    const billing_address_id = localStorage.getItem("snapcart_checkout_billing_id") || shipping_address_id;
    const order_note = localStorage.getItem("snapcart_order_note") || "";
    const sameAsShipping = localStorage.getItem("snapcart_same_as_shipping") === "true";
    
    // Get coupon data
    let coupon_code = "";
    try {
      const storedCoupon = localStorage.getItem("snapcart_coupon_applied");
      if (storedCoupon) {
        const couponData = JSON.parse(storedCoupon);
        coupon_code = couponData.code || couponData.coupon_code || "";
      }
    } catch (e) {
      console.error("Error parsing coupon:", e);
    }
    
    // Validate required fields
    if (!shipping_method_id) {
      toast.error("Shipping method is required!");
      router.push("/cart");
      return;
    }
    
    if (!shipping_address_id) {
      toast.error("Shipping address is required!");
      router.push("/checkout");
      return;
    }
    
    console.log("Order placing with data:", {
      shipping_method_id,
      address_id: shipping_address_id,
      billing_address_id: sameAsShipping ? shipping_address_id : billing_address_id,
      coupon_code,
      order_note,
      sameAsShipping
    });
    
    let response;
    
    if (paymentMethod === "cod") {
      // Cash on Delivery
      response = await placeOrder({
        coupon_code,
        order_note,
        shipping_method_id,
        address_id: shipping_address_id,
        billing_address_id: sameAsShipping ? shipping_address_id : billing_address_id,
      });
    } else {
      // Offline Payment
      const method_id = paymentMethod;
      const method_informations = btoa(JSON.stringify(offlineFields));
      
      response = await placeOrderByOfflinePayment({
        coupon_code,
        order_note,
        payment_note: offlineFields.note || "",
        shipping_method_id,
        address_id: shipping_address_id,
        billing_address_id: sameAsShipping ? shipping_address_id : billing_address_id,
        method_id,
        method_informations,
      });
    }
    
    // Success handling
    if (response && (response.order_ids || response.messages)) {
      // Clear localStorage
      clearCheckoutLocalStorage();
      
      // Dispatch event for cart update
      window.dispatchEvent(new Event("snapcart-auth-change"));
      
      // Show success message
      const orderIds = response.order_ids ? response.order_ids.join(", ") : "N/A";
      toast.success(`Order placed successfully! Order ID: ${orderIds}`);
      
      // Redirect to home or orders page
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } else {
      toast.error("Failed to place order. Please try again.");
    }
    
  } catch (error) {
    console.error("Order placement error:", error);
    
    // Show specific error messages
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => {
        toast.error(`${err.code}: ${err.message}`);
      });
    } else if (error.message) {
      toast.error(`Error: ${error.message}`);
    } else {
      toast.error("Failed to place order. Please try again.");
    }
  }
};

// Success handler function
const handleOrderSuccess = (res) => {
  window.dispatchEvent(new Event("snapcart-auth-change"));
  
  // LocalStorage ক্লিয়ার করুন
  localStorage.removeItem("snapcart_shipping_method_id");
  localStorage.removeItem("snapcart_checkout_shipping_id");
  localStorage.removeItem("snapcart_checkout_billing_id");
  localStorage.removeItem("snapcart_same_as_shipping");
  localStorage.removeItem("snapcart_order_note");
  localStorage.removeItem("snapcart_coupon_applied");
  localStorage.removeItem("snapcart_cart_subtotal");
  localStorage.removeItem("snapcart_cart_shipping");
  localStorage.removeItem("snapcart_cart_discount");
  localStorage.removeItem("snapcart_cart_total");
  
  if (typeof window !== "undefined" && window.Swal) {
    window.Swal.fire({
      icon: "success",
      title: "Order Placed!",
      html: `<div>Your order ID: <b>${(res.order_ids || []).join(", ")}</b></div>`,
      confirmButtonText: "Continue Shopping",
    }).then(() => {
      window.location.href = "/";
    });
  } else {
    toast.success(`Order Placed! Order ID: ${(res.order_ids || []).join(", ")}`);
    setTimeout(() => { window.location.href = "/"; }, 1200);
  }
};


// Helper function to clear localStorage
// Clear localStorage function
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
    "snapcart_checkout_billing_address"
  ];
  
  keys.forEach(key => localStorage.removeItem(key));
};

  return (
    <div className="container py-5">
      {/* Stepper */}
      <div className="mb-4">
        <div className="d-flex align-items-center justify-content-center gap-4">
          <div className="text-center">
            <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>1</div>
            <div style={{ fontSize: 13 }}>Cart</div>
          </div>
          <div style={{ width: 80, height: 2, background: "#1976d2" }} />
          <div className="text-center">
            <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>2</div>
            <div style={{ fontSize: 13 }}>Shipping And billing</div>
          </div>
          <div style={{ width: 80, height: 2, background: "#1976d2" }} />
          <div className="text-center">
            <div className="rounded-circle bg-primary text-white d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>3</div>
            <div style={{ fontSize: 13 }}>Payment</div>
          </div>
        </div>
      </div>
      <div className="row g-4">
        {/* Payment Method Card */}
        <div className="col-12 col-lg-7">
          <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
            <h4 className="fw-bold mb-3">Payment method</h4>
            <div className="mb-3">Select A Payment Method To Proceed</div>
            <div className="d-flex flex-column gap-3">
              {/* Cash on Delivery */}
              <div
                className={`d-flex align-items-center border rounded-3 p-3 ${paymentMethod === "cod" ? "border-primary bg-light" : "border-light"}`}
                style={{ cursor: "pointer" }}
                onClick={() => setPaymentMethod("cod")}
              >
                <input
                  type="radio"
                  className="form-check-input me-3"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  id="cod"
                />
                <span className="me-2" style={{ fontSize: 22 }}>
                  <i className="fas fa-money-bill-wave text-success"></i>
                </span>
                <label htmlFor="cod" className="mb-0 fw-semibold" style={{ cursor: "pointer" }}>
                  Cash on Delivery
                </label>
              </div>
              {/* See More */}
              {offlineMethods.length > 0 && !showMore && (
                <div className="text-end">
                  <button className="btn btn-link p-0" onClick={() => setShowMore(true)}>
                    See More
                  </button>
                </div>
              )}
              {/* Offline Payment Methods */}
              {showMore && offlineMethods.map((method) => (
                <div
                  key={method.id}
                  className={`d-flex flex-column border rounded-3 p-3 mb-2 ${paymentMethod === String(method.id) ? "border-primary bg-light" : "border-light"}`}
                  style={{ cursor: "pointer" }}
                  onClick={() => setPaymentMethod(String(method.id))}
                >
                  <div className="d-flex align-items-center">
                    <input
                      type="radio"
                      className="form-check-input me-3"
                      checked={paymentMethod === String(method.id)}
                      onChange={() => setPaymentMethod(String(method.id))}
                      id={`offline-${method.id}`}
                    />
                    <span className="me-2" style={{ fontSize: 22 }}>
                      <i className="fas fa-university text-info"></i>
                    </span>
                    <label htmlFor={`offline-${method.id}`} className="mb-0 fw-semibold" style={{ cursor: "pointer" }}>
                      {method.method_name}
                    </label>
                  </div>
                  {/* Show method fields */}
                  {paymentMethod === String(method.id) && (
                    <div className="ps-4 pt-2">
                      {Array.isArray(method.method_fields) && method.method_fields.map((f, idx) => (
                        <div key={idx} className="mb-1">
                          <span className="text-muted small">{f.input_name}: </span>
                          <span className="fw-semibold">{f.input_data}</span>
                        </div>
                      ))}
                      {Array.isArray(method.method_informations) && method.method_informations.map((info, idx) => (
                        <div key={idx} className="mb-2">
                          <input
                            className="form-control"
                            required={info.is_required === 1}
                            placeholder={info.customer_placeholder}
                            value={offlineFields[info.customer_input] || ""}
                            onChange={e => handleOfflineFieldChange(info.customer_input, e.target.value)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="mt-3">
              <a href="/checkout" className="text-primary text-decoration-none">
                &lt; Go back
              </a>
            </div>
          </div>
        </div>
        {/* Order Summary */}
        <div className="col-12 col-lg-5">
          <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
            <div className="mb-3 d-flex justify-content-between">
              <span>Sub total</span>
              <span>৳{subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mb-3 d-flex justify-content-between">
              <span>Shipping</span>
              <span>৳{shipping.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mb-3 d-flex justify-content-between">
              <span>Discount on product</span>
              <span>- ৳{discount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="mb-3 d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span>৳{total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="agree"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="agree">
                I agree to Your <a href="/terms" className="text-primary">Terms and condition</a>, <a href="/privacy" className="text-primary">Privacy policy</a>, <a href="/refund" className="text-primary">Refund policy</a>
              </label>
            </div>
            <button
              className="btn btn-primary w-100 mb-2"
              disabled={!agreed || !paymentMethod}
              onClick={handleProceed}
            >
              Proceed to Checkout
            </button>
            <a href="/" className="btn btn-link w-100"> &lt; Continue Shopping</a>
          </div>
        </div>
      </div>
      <style>{`
        .border-primary {
          border-color: #1976d2 !important;
        }
        .bg-light {
          background: #f8f9fa !important;
        }
        .rounded-4 {
          border-radius: 1.25rem !important;
        }
      `}</style>
    </div>
  );
}
