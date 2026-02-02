"use client";
import { useEffect, useState } from "react";
import { 
  getCart, 
  updateCartItem, 
  removeCartItem, 
  getShippingMethods, 
  applyCoupon,
  chooseShippingForOrder,
  getChoosenShippingMethod
} from "@/lib/api/global.service";
import { toast } from "react-toastify";
import Link from "next/link";

export default function Cart() {
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState({});
  const [coupon, setCoupon] = useState("");
  const [couponApplied, setCouponApplied] = useState(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [shippingMethods, setShippingMethods] = useState([]);
  const [shippingMethodId, setShippingMethodId] = useState("");
  const [shippingLoading, setShippingLoading] = useState(true);
  const [orderNoteEnabled, setOrderNoteEnabled] = useState(false);
  const [orderNote, setOrderNote] = useState("");
  const [selectedShipping, setSelectedShipping] = useState({
    methodId: "",
    cartGroupId: ""
  });
  const [shippingCost, setShippingCost] = useState(0);
  const [shippingCostName, setShippingCostName] = useState("");

  // ==================== fetchCart ফাংশন - cart_group_id পাওয়ার জন্য আপডেট করুন ====================
  const fetchCart = () => {
    // setLoading(true);
    getCart()
      .then((data) => {
        console.log("Cart API response:", data); // Debug জন্য
        setCart(Array.isArray(data) ? data : []);
        
        // cart_group_id বের করুন
        if (Array.isArray(data) && data.length > 0) {
          // প্রথম আইটেম থেকে cart_group_id নিন (সব আইটেমের একই cart_group_id থাকে)
          const cartGroupId = data[0]?.cart_group_id;
          if (cartGroupId) {
            setSelectedShipping(prev => ({
              ...prev,
              cartGroupId: cartGroupId
            }));
            
            // localStorage-এও সংরক্ষণ করুন
            localStorage.setItem("snapcart_cart_group_id", cartGroupId);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching cart:", error);
        setCart([]);
      })
      .finally(() => setLoading(false));
  };

  // ==================== useEffect for initial cart load ====================
  useEffect(() => {
    fetchCart();
    // Load coupon from localStorage
    try {
      const stored = localStorage.getItem("snapcart_coupon_applied");
      if (stored) setCouponApplied(JSON.parse(stored));
    } catch {}
    
    // Load saved shipping method
    const savedShippingMethodId = localStorage.getItem("snapcart_shipping_method_id");
    if (savedShippingMethodId) {
      setShippingMethodId(savedShippingMethodId);
      setSelectedShipping(prev => ({
        ...prev,
        methodId: savedShippingMethodId
      }));
    }
  }, []);

  // ==================== Fetch shipping methods ====================
  useEffect(() => {
    setShippingLoading(true);
    getShippingMethods()
      .then(res => {
        const methods = Array.isArray(res) ? res : [];
        setShippingMethods(methods);
        
        // যদি আগে থেকে সিলেক্ট করা shipping method না থাকে এবং shipping methods আছে
        if (methods.length > 0 && !shippingMethodId) {
          // প্রথম shipping method ডিফল্ট হিসেবে সেট করুন
          const firstMethod = methods[0];
          if (firstMethod) {
            const methodId = String(firstMethod.id);
            setShippingMethodId(methodId);
            setSelectedShipping(prev => ({
              ...prev,
              methodId: methodId
            }));
            localStorage.setItem("snapcart_shipping_method_id", methodId);
          }
        }
      })
      .catch(() => setShippingMethods([]))
      .finally(() => setShippingLoading(false));
  }, []);

  // ==================== Handle shipping method change ====================
  const handleShippingMethodChange = async (e) => {
    const newMethodId = e.target.value;
    const cartGroupId = selectedShipping.cartGroupId;
    
    // Validation চেক
    if (!newMethodId || !cartGroupId) {
      toast.error("Please wait for cart data to load");
      return;
    }
    
    // State আপডেট করুন
    setShippingMethodId(newMethodId);
    setSelectedShipping({
      cartGroupId: cartGroupId,
      methodId: newMethodId
    });
    
    // API কল করুন
    try {
      console.log("Calling shipping API with:", {
        cartGroupId,
        shipping_method_id: newMethodId
      });
      
      const response = await chooseShippingForOrder(cartGroupId, newMethodId);
      console.log("Shipping API response:", response);
      
      if (response) {
        toast.success("Shipping method updated successfully!");
        
        // localStorage আপডেট করুন
        localStorage.setItem("snapcart_shipping_method_id", newMethodId);
        
        // cart আপডেট করুন (যদি প্রয়োজন হয়)
        fetchCart();
      } else {
        toast.error(response?.message || "Failed to update shipping method");
      }
    } catch (error) {
      console.error("Shipping method change error:", error);
      toast.error("Failed to update shipping method. Please try again.");
      
      // Error হলে পূর্বের state-এ ফিরে যান
      setShippingMethodId(selectedShipping.methodId);
    }
  };

  // ==================== Save shipping method to localStorage ====================
  useEffect(() => {
    if (shippingMethodId) {
      localStorage.setItem("snapcart_shipping_method_id", shippingMethodId);
    }
  }, [shippingMethodId]);

  // ==================== Fetch chosen shipping cost ====================
  useEffect(() => {
    async function fetchShippingCost() {
      try {
        const res = await getChoosenShippingMethod();
        // res is array, take first item
        if (Array.isArray(res) && res.length > 0) {
          setShippingCost(Number(res[0].shipping_cost) || 0);
          // Find shipping method name from shippingMethods
          const method = shippingMethods.find(m => String(m.id) === String(res[0].shipping_method_id));
          setShippingCostName(method ? method.title : "Shipping");
        } else {
          setShippingCost(0);
          setShippingCostName("");
        }
      } catch {
        setShippingCost(0);
        setShippingCostName("");
      }
    }
    if (shippingMethodId && selectedShipping.cartGroupId) {
      fetchShippingCost();
    }
  }, [shippingMethodId, selectedShipping.cartGroupId, shippingMethods]);

  // ==================== Calculate subtotal, item discount, total cart items, and total ====================
  const subtotal = Array.isArray(cart)
    ? cart.reduce((sum, item) => {
        if (!item || typeof item.price !== "number" || typeof item.quantity !== "number") return sum;
        return sum + (item.price * item.quantity);
      }, 0)
    : 0;
  const itemDiscount = Array.isArray(cart)
    ? cart
        .filter(item => item.addons_parent == 0) // Only main products
        .reduce((sum, item) => {
          if (!item || typeof item.discount !== "number" || typeof item.quantity !== "number") return sum;
          return sum + (item.discount * item.quantity);
        }, 0)
    : 0;
  const totalCartItems = Array.isArray(cart)
    ? cart.reduce((sum, item) => {
        if (!item || typeof item.quantity !== "number") return sum;
        return sum + item.quantity;
      }, 0)
    : 0;
  const couponDiscount = couponApplied?.coupon_discount || 0;
  // Calculate total: subtotal - itemDiscount - couponDiscount + shippingCost
  const total = Math.max(0, subtotal - itemDiscount - couponDiscount + shippingCost);

  // ==================== Save cart summary to localStorage ====================
  useEffect(() => {
    localStorage.setItem("snapcart_cart_subtotal", subtotal);
    localStorage.setItem("snapcart_cart_discount", couponDiscount);
    localStorage.setItem("snapcart_cart_total", total);
    // No need to store shipping cost in localStorage
  }, [subtotal, couponDiscount, total]);

  // ==================== Coupon apply handler ====================
  const handleApplyCoupon = async () => {
    if (!coupon) return;
    setCouponLoading(true);
    try {
      const data = await applyCoupon(coupon);
      if (data && data.coupon_discount > 0) {
        setCouponApplied({ ...data, code: coupon });
        localStorage.setItem("snapcart_coupon_applied", JSON.stringify({ ...data, code: coupon }));
        toast.success("Coupon applied!");
      } else {
        setCouponApplied(null);
        localStorage.removeItem("snapcart_coupon_applied");
        toast.error(data.message || "Invalid or expired coupon.");
      }
    } catch (error) {
      setCouponApplied(null);
      localStorage.removeItem("snapcart_coupon_applied");
      toast.error("Failed to apply coupon.");
    }
    setCouponLoading(false);
  };

  // ==================== Coupon clear handler ====================
  const handleClearCoupon = () => {
    setCouponApplied(null);
    localStorage.removeItem("snapcart_coupon_applied");
    setCoupon("");
  };

  // ==================== Update quantity handler ====================
  const handleUpdateQty = async (item, newQty) => {
    if (newQty < 1 || updating[item.id]) return;
    setUpdating((u) => ({ ...u, [item.id]: true }));
    try {
      await updateCartItem({ key: item.id, quantity: newQty });
      toast.success("Cart updated");
      fetchCart();
      window.dispatchEvent(new Event("snapcart-auth-change"));
    } catch {
      toast.error("Failed to update cart");
    }
    setUpdating((u) => ({ ...u, [item.id]: false }));
  };

  // ==================== Remove item handler ====================
  const handleRemove = async (item) => {
    if (updating[item.id]) return;
    setUpdating((u) => ({ ...u, [item.id]: true }));
    try {
      await removeCartItem({ key: item.id });
      toast.success("Removed from cart");
      fetchCart();
      window.dispatchEvent(new Event("snapcart-auth-change"));
    } catch {
      toast.error("Failed to remove item");
    }
    setUpdating((u) => ({ ...u, [item.id]: false }));
  };

  if (loading) return (
    <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "300px", background: "transparent" }}>
        <div className="spinner-border text-warning" role="status" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
        </div>
    </div>
  );
  
  if (!Array.isArray(cart) || !cart.length)
    return (
      <div className="container py-5 text-center">
        <h4>Your cart is empty.</h4>
      </div>
    );
    
  return (
    <div className="container py-5">
      <div className="mb-4 d-flex align-items-center gap-2">
        <i className="fas fa-shopping-cart" style={{ color: "#d2b48c", fontSize: 28 }}></i>
        <h3 className="mb-0 fw-bold" style={{ color: "#222" }}>Shopping Cart</h3>
      </div>
      {/* Desktop Table */}
      <div className="table-responsive mb-4 d-none d-md-block">
        <table className="table align-middle mb-0" style={{ minWidth: 700 }}>
          <thead>
            <tr className="cart-table-header">
              <th style={{ width: 120 }}>Product</th>
              <th>Product Name</th>
              <th style={{ width: 180 }}>Quantity</th>
              <th style={{ width: 140 }}>Unit Price</th>
              <th style={{ width: 140 }}>Total</th>
              <th style={{ width: 60 }}></th>
            </tr>
          </thead>
          <tbody>
            {cart.filter(item => item && typeof item.price === "number" && typeof item.quantity === "number").map((item) => (
              <tr key={item.id} className="bg-white">
                <td>
                  <img
                    src={item.product?.thumbnail_full_url?.path}
                    alt={item.name}
                    className="rounded"
                    style={{ width: 60, height: 60, objectFit: "cover", background: "#f8f9fa" }}
                  />
                </td>
                <td>
                  <div className="fw-semibold">{item.name}</div>
                  <div className="text-muted small">{item.variant}</div>
                </td>
                <td>
                  <div className="input-group input-group-sm justify-content-center" style={{ maxWidth: 120 }}>
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleUpdateQty(item, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updating[item.id] || item.addons_parent != 0}
                    >
                      <i className="fas fa-minus"></i>
                    </button>
                    <input
                      type="text"
                      className="form-control text-center"
                      value={item.quantity}
                      style={{ maxWidth: 40 }}
                      readOnly
                    />
                    <button
                      className="btn btn-outline-secondary"
                      type="button"
                      onClick={() => handleUpdateQty(item, item.quantity + 1)}
                      disabled={
                        updating[item.id] ||
                        (typeof item.product?.current_stock === "number" && item.quantity >= item.product.current_stock) ||
                        item.addons_parent != 0
                      }
                    >
                      {typeof item.product?.current_stock === "number" && item.quantity >= item.product.current_stock ? "Max" : <i className="fas fa-plus"></i>}
                    </button>
                  </div>
                </td>
                <td className="fw-semibold">{item.price.toLocaleString()} BDT</td>
                <td className="fw-semibold">{(item.price * item.quantity).toLocaleString()} BDT</td>
                <td>
                  <button
                    className="btn btn-link text-danger p-0"
                    title="Remove"
                    onClick={() => handleRemove(item)}
                    disabled={updating[item.id]}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>
            ))}
            {/* Subtotal row */}
            <tr>
              <td colSpan={4} className="text-end fw-bold">Subtotal:</td>
              <td className="fw-bold">{subtotal.toLocaleString()} BDT</td>
              <td></td>
            </tr>
            {/* Item Discount row */}
            <tr>
              <td colSpan={4} className="text-end fw-bold text-primary">Item Discount:</td>
              <td className="fw-bold text-primary">- {itemDiscount.toLocaleString()} BDT</td>
              <td></td>
            </tr>
            {/* Shipping Cost row */}
            {shippingCost > 0 && (
              <tr>
                <td colSpan={4} className="text-end fw-bold">{shippingCostName || "Shipping Cost"}:</td>
                <td className="fw-bold">+ {shippingCost.toLocaleString()} BDT</td>
                <td></td>
              </tr>
            )}
            {/* Discount row if coupon applied */}
            {couponApplied && couponApplied.coupon_discount > 0 && (
              <tr>
                <td colSpan={4} className="text-end fw-bold text-success">
                  Discount ({couponApplied.code || couponApplied.coupon_code || "Coupon"}):
                </td>
                <td className="fw-bold text-success">- {couponApplied.coupon_discount.toLocaleString()} BDT</td>
                <td>
                  <button
                    className="btn btn-link text-danger p-0"
                    title="Clear Coupon"
                    onClick={handleClearCoupon}
                  >
                    <i className="fas fa-times"></i>
                  </button>
                </td>
              </tr>
            )}
            {/* Total row */}
            <tr>
              <td colSpan={4} className="text-end fw-bold fs-5">Total:</td>
              <td className="fw-bold fs-5">{total.toLocaleString()} BDT</td>
              <td></td>
            </tr>
          </tbody>
        </table>
      </div>
      {/* Mobile Cart List */}
      <div className="d-block d-md-none">
        {cart.filter(item => item && typeof item.price === "number" && typeof item.quantity === "number").map((item) => (
          <div key={item.id} className="card mb-3 shadow-sm">
            <div className="card-body d-flex gap-3 align-items-center">
              <img
                src={item.product?.thumbnail_full_url?.path}
                alt={item.name}
                className="rounded"
                style={{ width: 70, height: 70, objectFit: "cover", background: "#f8f9fa" }}
              />
              <div className="flex-grow-1">
                <div className="fw-semibold">{item.name}</div>
                <div className="text-muted small">{item.variant}</div>
                <div className="d-flex align-items-center gap-2 mt-2">
                  <span className="fw-bold">{item.price.toLocaleString()} BDT</span>
                  <span className="text-muted small">x {item.quantity}</span>
                  <span className="fw-bold ms-2">{(item.price * item.quantity).toLocaleString()} BDT</span>
                </div>
                <div className="input-group input-group-sm mt-2" style={{ maxWidth: 180 }}>
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => handleUpdateQty(item, item.quantity - 1)}
                    disabled={item.quantity <= 1 || updating[item.id] || item.addons_parent != null}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <input
                    type="text"
                    className="form-control text-center"
                    value={item.quantity}
                    style={{ maxWidth: 40 }}
                    readOnly
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => handleUpdateQty(item, item.quantity + 1)}
                    disabled={
                      updating[item.id] ||
                      (typeof item.product?.current_stock === "number" && item.quantity >= item.product.current_stock) ||
                      item.addons_parent != null
                    }
                  >
                    {typeof item.product?.current_stock === "number" && item.quantity >= item.product.current_stock ? "Max" : <i className="fas fa-plus"></i>}
                  </button>
                  <button
                    className="btn btn-link text-danger p-0 ms-2"
                    title="Remove"
                    onClick={() => handleRemove(item)}
                    disabled={updating[item.id]}
                  >
                    <i className="fas fa-trash-alt"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {/* Subtotal, Discount, Total */}
        <div className="card mb-3">
          <div className="card-body">
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold">Subtotal:</span>
              <span>{subtotal.toLocaleString()} BDT</span>
            </div>
            <div className="d-flex justify-content-between mb-2 text-primary">
              <span className="fw-bold">Item Discount:</span>
              <span>- {itemDiscount.toLocaleString()} BDT</span>
            </div>
            {shippingCost > 0 && (
              <div className="d-flex justify-content-between mb-2">
                <span className="fw-bold">{shippingCostName || "Shipping Cost"}:</span>
                <span>+ {shippingCost.toLocaleString()} BDT</span>
              </div>
            )}
            <div className="d-flex justify-content-between mb-2">
              <span className="fw-bold">Total Cart Items:</span>
              <span>{totalCartItems}</span>
            </div>
            {couponApplied && couponApplied.coupon_discount > 0 && (
              <div className="d-flex justify-content-between mb-2 text-success">
                <span className="fw-bold">
                  Discount ({couponApplied.code || couponApplied.coupon_code || "Coupon"}):
                </span>
                <span>- {couponApplied.coupon_discount.toLocaleString()} BDT</span>
              </div>
            )}
            <div className="d-flex justify-content-between fw-bold fs-5">
              <span>Total:</span>
              <span>{total.toLocaleString()} BDT</span>
            </div>
          </div>
        </div>
      </div>

      <div className="row g-4">
        {/* Promo Code & Shipping */}
        <div className="col-12 col-md-6 col-lg-5">
          <div className="bg-light rounded-3 p-4">
            {/* Coupon */}
            <div>
              <label className="form-label fw-semibold">Apply promo code</label>
              <div className="input-group mb-2">
                <input
                  type="text"
                  className="form-control"
                  placeholder="Apply promo code"
                  value={coupon}
                  onChange={e => setCoupon(e.target.value)}
                  disabled={couponLoading}
                />
                <button
                  className="btn btn-outline-warning fw-semibold"
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !coupon}
                >
                  {couponLoading ? "Applying..." : "APPLY"}
                </button>
                {couponApplied && couponApplied.coupon_discount > 0 && (
                  <button
                    className="btn btn-outline-danger fw-semibold"
                    type="button"
                    onClick={handleClearCoupon}
                    style={{ marginLeft: 8 }}
                  >
                    Clear
                  </button>
                )}
              </div>
              {couponApplied && couponApplied.coupon_discount > 0 && (
                <div className="text-success small mb-2">
                  Coupon applied: <b>{couponApplied.code || couponApplied.coupon_code}</b> ({couponApplied.coupon_type}), Discount: <b>{couponDiscount} BDT</b>
                </div>
              )}
            </div>
            {/* Shipping Method */}

            {/* Shipping Method Section - আপডেট করুন */}
            <div className="mt-4">
              <label className="form-label fw-semibold">Select Shipping Method <span className="text-danger">*</span></label>
              {shippingLoading ? (
                <div className="text-muted small">Loading shipping methods...</div>
              ) : (
                <select
                  className="form-select"
                  value={shippingMethodId}
                  onChange={handleShippingMethodChange} // এই onchange হ্যান্ডলার ব্যবহার করুন
                  required
                  disabled={!selectedShipping.cartGroupId}
                >
                  <option value="">Select shipping method</option>
                  {(shippingMethods || []).map(m => (
                    <option key={m.id} value={m.id}>
                      {m.title} ({m.duration}) - {m.cost} BDT
                    </option>
                  ))}
                </select>
              )}
              {!selectedShipping.cartGroupId && (
                <div className="text-warning small mt-1">
                  <i className="fas fa-info-circle me-1"></i>
                  Please wait for cart data to load
                </div>
              )}
              {selectedShipping.cartGroupId && shippingMethodId && (
                <div className="text-success small mt-1">
                  <i className="fas fa-check-circle me-1"></i>
                  Shipping method selected: {shippingMethods.find(m => String(m.id) === String(shippingMethodId))?.title}
                </div>
              )}
            </div>
            {/* Order Note Section */}
            <div className="mt-4">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="orderNoteCheck"
                  checked={orderNoteEnabled}
                  onChange={e => {
                    setOrderNoteEnabled(e.target.checked);
                    if (!e.target.checked) {
                      setOrderNote("");
                      localStorage.removeItem("snapcart_order_note");
                    }
                  }}
                />
                <label className="form-check-label" htmlFor="orderNoteCheck">
                  Add Order Note (Optional)
                </label>
              </div>
              {orderNoteEnabled && (
                <textarea
                  className="form-control mt-2"
                  rows={2}
                  placeholder="Order note (optional)"
                  value={orderNote}
                  onChange={e => setOrderNote(e.target.value)}
                />
              )}
            </div>
          </div>
        </div>
        {/* Total & Actions */}
        <div className="col-12 col-md-6 col-lg-7 d-flex flex-column justify-content-end align-items-end">
          <div className="mb-3 w-100 d-flex justify-content-end align-items-center flex-column flex-md-row">
            <div className="me-md-4 mb-2 mb-md-0">
              <span className="fw-bold me-2">Subtotal:</span>
              <span>{subtotal.toLocaleString()} BDT</span>
              {couponDiscount > 0 && (
                <>
                  <span className="fw-bold ms-3 text-success">Coupon: -{couponDiscount} BDT</span>
                </>
              )}
            </div>
            <span className="fw-bold fs-5 me-3">Total:</span>
            <span className="fw-bold fs-4">{total.toLocaleString()} BDT</span>
          </div>
          {/* Checkout Button - এখানে onClick হ্যান্ডলার যোগ করুন */}
          <div className="d-flex gap-3 w-100 justify-content-end">
            <Link href="/" className="btn btn-outline-warning px-4 fw-semibold" style={{ minWidth: 180 }}>
              CONTINUE SHOPPING
            </Link>
            <Link
              href={shippingMethodId && selectedShipping.cartGroupId ? "/checkout" : "#"}
              className="btn btn-dark px-4 fw-semibold"
              style={{ minWidth: 180 }}
              onClick={e => {
                if (!shippingMethodId || !selectedShipping.cartGroupId) {
                  e.preventDefault();
                  toast.error("Please select a shipping method first.");
                } else {
                  // সব ডেটা localStorage-এ সংরক্ষণ করুন
                  localStorage.setItem("snapcart_shipping_method_id", shippingMethodId);
                  localStorage.setItem("snapcart_cart_group_id", selectedShipping.cartGroupId);
                  
                  if (orderNote) {
                    localStorage.setItem("snapcart_order_note", orderNote);
                  }
                  
                  if (couponApplied) {
                    localStorage.setItem("snapcart_coupon_applied", JSON.stringify(couponApplied));
                  }
                  
                  // shipping method ডিটেইলসও সংরক্ষণ করুন
                  const selectedMethod = shippingMethods.find(m => String(m.id) === String(shippingMethodId));
                  if (selectedMethod) {
                    localStorage.setItem("snapcart_selected_shipping_method", JSON.stringify(selectedMethod));
                  }
                }
              }}
            >
              CHECK OUT
            </Link>
          </div>
        </div>
      </div>
      <style>{`
        @media (max-width: 767.98px) {
          table { min-width: 0 !important; }
        }
        .text-danger:hover i { cursor: pointer; color: #b02a37 !important; }
      `}</style>
    </div>
  );
}
