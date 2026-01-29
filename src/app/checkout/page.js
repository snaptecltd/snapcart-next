"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getCustomerAddressList, getAddressDetails } from "@/lib/api/global.service";
import { toast } from "react-toastify";

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [shipping, setShipping] = useState({
    contact_name: "",
    phone: "",
    address_type: "Home",
    country: "Bangladesh",
    city: "",
    zip: "",
    address: "",
    latitude: "",
    longitude: "",
  });
  const [billing, setBilling] = useState({ ...shipping });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [showBilling, setShowBilling] = useState(false);
  const [updateAddress, setUpdateAddress] = useState(false);

  // Only allow access if shipping method is selected in cart (pseudo check)
  useEffect(() => {
    // You should check for shippingMethodId in localStorage or context
    // If not present, redirect to cart
    // Example:
    // if (!localStorage.getItem("snapcart_shipping_method_id")) router.replace("/cart");
  }, [router]);

  // Load saved addresses
  useEffect(() => {
    getCustomerAddressList()
      .then((res) => setAddresses(Array.isArray(res) ? res : res?.addresses || []))
      .catch(() => setAddresses([]));
  }, []);

  // Autofill shipping address from saved
  const handleSelectAddress = async (address) => {
    setShipping({
      contact_name: address.contact_name || "",
      phone: address.phone || "",
      address_type: address.address_type || "Home",
      country: address.country || "Bangladesh",
      city: address.city || "",
      zip: address.zip || "",
      address: address.address || "",
      latitude: address.latitude || "",
      longitude: address.longitude || "",
    });
    setShowMap(!!(address.latitude && address.longitude));
  };

  // Handle shipping field change
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShipping((prev) => ({ ...prev, [name]: value }));
  };

  // Handle billing field change
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
  };

  // Sync billing with shipping if checked
  useEffect(() => {
    if (sameAsShipping) setBilling({ ...shipping });
  }, [sameAsShipping, shipping]);

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
                <div style={{ fontSize: 13 }}>Shipping And billing</div>
              </div>
              <div style={{ width: 40, height: 2, background: "#ddd" }} />
              <div className="text-center">
                <div className="rounded-circle bg-light text-dark d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>3</div>
                <div style={{ fontSize: 13 }}>Payment</div>
              </div>
            </div>
          </div>
          {/* Shipping Address */}
          <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
            <h5 className="fw-bold mb-3">Shipping Address</h5>
            {/* Saved Address Dropdown */}
            <div className="mb-3">
              <div className="dropdown">
                <button className="btn btn-outline-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                  Saved Address
                </button>
                <ul className="dropdown-menu">
                  {addresses.length === 0 && <li className="dropdown-item text-muted">No saved address</li>}
                  {addresses.map((addr) => (
                    <li key={addr.id}>
                      <button className="dropdown-item" type="button" onClick={() => handleSelectAddress(addr)}>
                        {addr.address_type || "Home"} - {addr.address}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            {/* Address Form */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Contact person name *</label>
                <input type="text" className="form-control" name="contact_name" value={shipping.contact_name} onChange={handleShippingChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Phone *</label>
                <input type="text" className="form-control" name="phone" value={shipping.phone} onChange={handleShippingChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Address type</label>
                <select className="form-select" name="address_type" value={shipping.address_type} onChange={handleShippingChange}>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label">Country *</label>
                <input type="text" className="form-control" name="country" value={shipping.country} onChange={handleShippingChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">City *</label>
                <input type="text" className="form-control" name="city" value={shipping.city} onChange={handleShippingChange} required />
              </div>
              <div className="col-md-6">
                <label className="form-label">Zip code *</label>
                <input type="text" className="form-control" name="zip" value={shipping.zip} onChange={handleShippingChange} required />
              </div>
              <div className="col-12">
                <label className="form-label">Address *</label>
                <textarea className="form-control" name="address" value={shipping.address} onChange={handleShippingChange} required />
              </div>
              {/* Map */}
              {shipping.latitude && shipping.longitude && (
                <div className="col-12">
                  <iframe
                    width="100%"
                    height="180"
                    frameBorder="0"
                    style={{ border: 0, borderRadius: 8 }}
                    src={`https://maps.google.com/maps?q=${shipping.latitude},${shipping.longitude}&z=15&output=embed`}
                    allowFullScreen
                  ></iframe>
                </div>
              )}
              <div className="col-12">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="updateAddress" checked={updateAddress} onChange={e => setUpdateAddress(e.target.checked)} />
                  <label className="form-check-label" htmlFor="updateAddress">
                    Update this Address
                  </label>
                </div>
              </div>
            </div>
          </div>
          {/* Billing Address */}
          <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
            <div className="d-flex align-items-center mb-3">
              <h5 className="fw-bold mb-0">Billing Address</h5>
              <div className="form-check ms-3">
                <input className="form-check-input" type="checkbox" id="sameAsShipping" checked={sameAsShipping} onChange={e => setSameAsShipping(e.target.checked)} />
                <label className="form-check-label" htmlFor="sameAsShipping">
                  Same as shipping address
                </label>
              </div>
            </div>
            {!sameAsShipping && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Contact person name *</label>
                  <input type="text" className="form-control" name="contact_name" value={billing.contact_name} onChange={handleBillingChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Phone *</label>
                  <input type="text" className="form-control" name="phone" value={billing.phone} onChange={handleBillingChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Address type</label>
                  <select className="form-select" name="address_type" value={billing.address_type} onChange={handleBillingChange}>
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label">Country *</label>
                  <input type="text" className="form-control" name="country" value={billing.country} onChange={handleBillingChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">City *</label>
                  <input type="text" className="form-control" name="city" value={billing.city} onChange={handleBillingChange} required />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Zip code *</label>
                  <input type="text" className="form-control" name="zip" value={billing.zip} onChange={handleBillingChange} required />
                </div>
                <div className="col-12">
                  <label className="form-label">Address *</label>
                  <textarea className="form-control" name="address" value={billing.address} onChange={handleBillingChange} required />
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Order Summary (right side) */}
        <div className="col-12 col-lg-4">
          <div className="bg-light rounded-4 p-4 shadow-sm">
            <div className="mb-3 d-flex justify-content-between">
              <span>Sub total</span>
              <span>৳2,400.00</span>
            </div>
            <div className="mb-3 d-flex justify-content-between">
              <span>Shipping</span>
              <span>৳5.00</span>
            </div>
            <div className="mb-3 d-flex justify-content-between">
              <span>Discount on product</span>
              <span>- ৳0.00</span>
            </div>
            <div className="input-group mb-3">
              <input type="text" className="form-control" placeholder="Coupon code" />
              <button className="btn btn-outline-secondary" type="button">APPLY</button>
            </div>
            <div className="mb-3 d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span>৳2,405.00</span>
            </div>
            <button className="btn btn-primary w-100 mb-2">Proceed to Payment</button>
            <button className="btn btn-link w-100"> &lt; Continue Shopping</button>
          </div>
        </div>
      </div>
    </div>
  );
}
