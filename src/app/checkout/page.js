"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from 'react';
import { 
  getCustomerAddressList, 
  addCustomerAddress,
  getAddressGroupedbyType
} from "@/lib/api/global.service";
import { toast } from "react-toastify";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [shipping, setShipping] = useState({
    contact_person_name: "",
    phone: "",
    address_type: "Home",
    country: "Bangladesh",
    city: "",
    zip: "",
    address: ""
  });
  
  const [billing, setBilling] = useState({ ...shipping });
  const [sameAsShipping, setSameAsShipping] = useState(true);
  const [updateAddress, setUpdateAddress] = useState(false);
  const [errors, setErrors] = useState({ shipping: {}, billing: {} });
  
  // cart summary state
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    shipping: 0,
    discount: 0,
    total: 0,
  });

  // Load cart summary from localStorage
  useEffect(() => {
    try {
      const subtotal = Number(localStorage.getItem("snapcart_cart_subtotal") || 0);
      const shipping = Number(localStorage.getItem("snapcart_cart_shipping") || 0);
      const discount = Number(localStorage.getItem("snapcart_cart_discount") || 0);
      const total = Number(localStorage.getItem("snapcart_cart_total") || (subtotal + shipping - discount));
      setCartSummary({ subtotal, shipping, discount, total });
    } catch (error) {
      console.error("Error loading cart summary:", error);
      setCartSummary({ subtotal: 0, shipping: 0, discount: 0, total: 0 });
    }
  }, []);

  // Load saved addresses - ONLY ONCE!
  useEffect(() => {
    console.log("Fetching addresses..."); // Debug log
    
    getAddressGroupedbyType()
      .then((res) => {
        console.log("Addresses API response:", res); // Debug log
        
        // Handle different response formats
        if (Array.isArray(res)) {
          setAddresses(res);
        } else if (res && typeof res === 'object') {
          // Check if it's the grouped format {Home: [...], Office: [...]}
          if (res.Home || res.Office) {
            setAddresses(res);
          } else if (res.addresses) {
            setAddresses(res.addresses);
          } else {
            setAddresses([]);
          }
        } else {
          setAddresses([]);
        }
      })
      .catch((error) => {
        console.error("Error fetching addresses:", error);
        setAddresses([]);
      });
  }, []);

// Handle address selection
const handleSelectAddress = (address) => {
  setShipping({
    contact_person_name: address.contact_person_name || "",
    phone: address.phone || "",
    address_type: address.address_type || "Home",
    country: address.country || "Bangladesh",
    city: address.city || "",
    zip: address.zip || "",
    address: address.address || "",
    latitude: address.latitude || "",
    longitude: address.longitude || "",
    // Store the ID when selecting from saved addresses
    id: address.id || null
  });
  
  // Uncheck update address when selecting from saved addresses
  setUpdateAddress(false);
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

  // Address validation function
  const validateAddress = (addr) => {
    const required = ["contact_person_name", "phone", "country", "city", "zip", "address"];
    const errs = {};
    required.forEach((k) => {
      if (!addr[k] || String(addr[k]).trim() === "") errs[k] = "Required";
    });
    return errs;
  };

// Checkout page-এর handleSaveAddress function update করুন
const handleSaveAddress = async (addressData, isBilling = false) => {
  try {
    // is_billing field যোগ করুন
    const addressToSave = {
      ...addressData,
      is_billing: isBilling ? 1 : 0
    };
    
    console.log("Saving address with data:", addressToSave);
    
    const response = await addCustomerAddress(addressToSave);
    console.log("Address save API response:", response, response.id);
    
    if (response && response.id) {
      toast.success("Address saved successfully!" + response.id);
      return response.id; // Return address ID
    } else if (response && response.errors) {
      response.errors.forEach(err => {
        toast.error(`${err.code}: ${err.message}`);
      });
      return null;
    }
  } catch (error) {
    console.error("Full address save error:", error);
    
    if (error.response?.data?.errors) {
      error.response.data.errors.forEach(err => {
        toast.error(`${err.code}: ${err.message}`);
      });
    } else {
      toast.error("Failed to save address. Please check all fields.");
    }
  }
  return null;
};

// handleProceedToPayment function update করুন
const handleProceedToPayment = async (e) => {
  e.preventDefault();
  
  // Address validation
  const shippingErrs = validateAddress(shipping);
  const billingErrs = sameAsShipping ? {} : validateAddress(billing);
  
  setErrors({ shipping: shippingErrs, billing: billingErrs });
  
  if (Object.keys(shippingErrs).length || Object.keys(billingErrs).length) {
    toast.error("Please fill all required address fields.");
    return;
  }
  
  try {
    let shippingId = null;
    let billingId = null;
    
    // Convert addresses object to flat array for searching
    const getAllAddresses = () => {
      const allAddresses = [];
      if (addresses && typeof addresses === 'object') {
        Object.values(addresses).forEach(addressList => {
          if (Array.isArray(addressList)) {
            allAddresses.push(...addressList);
          }
        });
      }
      return allAddresses;
    };
    
    const allAddresses = getAllAddresses();
    console.log("All addresses for search:", allAddresses);
    
    // Check if we need to save a new shipping address or use existing one
    if (updateAddress) {
      // Save new shipping address (update mode)
      shippingId = await handleSaveAddress(shipping, false);
      if (!shippingId) {
        toast.error("Failed to save shipping address");
        return;
      }
    } else {
      // Try to find if this address already exists
      const selectedAddress = allAddresses.find(addr => {
        if (!addr || typeof addr !== 'object') return false;
        
        // Compare key fields to see if it's the same address
        return (
          addr.contact_person_name === shipping.contact_person_name &&
          addr.phone === shipping.phone &&
          addr.address === shipping.address &&
          addr.city === shipping.city &&
          addr.zip === shipping.zip
        );
      });
      
      if (selectedAddress) {
        // Use existing address ID
        shippingId = selectedAddress.id;
        console.log("Using existing shipping address ID:", shippingId);
      } else {
        // Save new shipping address
        shippingId = await handleSaveAddress(shipping, false);
        if (!shippingId) {
          toast.error("Failed to save shipping address");
          return;
        }
      }
    }
    
    // Handle billing address
    if (sameAsShipping) {
      billingId = shippingId;
    } else {
      if (updateAddress) {
        // Save new billing address (update mode)
        billingId = await handleSaveAddress(billing, true);
        if (!billingId) {
          toast.error("Failed to save billing address");
          return;
        }
      } else {
        // Try to find if this billing address already exists
        const selectedBillingAddress = allAddresses.find(addr => {
          if (!addr || typeof addr !== 'object') return false;
          
          return (
            addr.contact_person_name === billing.contact_person_name &&
            addr.phone === billing.phone &&
            addr.address === billing.address &&
            addr.city === billing.city &&
            addr.zip === billing.zip
          );
        });
        
        if (selectedBillingAddress) {
          // Use existing billing address ID
          billingId = selectedBillingAddress.id;
          console.log("Using existing billing address ID:", billingId);
        } else {
          // Save new billing address
          billingId = await handleSaveAddress(billing, true);
          if (!billingId) {
            toast.error("Failed to save billing address");
            return;
          }
        }
      }
    }
    
    // Save IDs to localStorage
    localStorage.setItem("snapcart_checkout_shipping_id", shippingId);
    localStorage.setItem("snapcart_checkout_billing_id", billingId);
    localStorage.setItem("snapcart_same_as_shipping", sameAsShipping.toString());
    
    // Also save address objects for reference
    localStorage.setItem("snapcart_checkout_shipping_address", JSON.stringify(shipping));
    localStorage.setItem("snapcart_checkout_billing_address", JSON.stringify(sameAsShipping ? shipping : billing));
    
    toast.success("Address saved successfully! Proceeding to payment...");
    router.push("/checkout/payment");
    
  } catch (error) {
    console.error("Error in checkout:", error);
    toast.error("Failed to proceed. Please try again.");
  }
};
  // Calculate total
  const subtotal = cartSummary.subtotal;
  const shippingCharge = cartSummary.shipping;
  const discount = cartSummary.discount;
  const tax = 0; // any tax, set to 0 if not applicable
  const total = subtotal + shippingCharge + tax - discount;

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
            {addresses && Object.keys(addresses).length > 0 && (
              <div className="mb-3">
                <div className="dropdown">
                  <button 
                    className="btn btn-outline-secondary dropdown-toggle" 
                    type="button" 
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    onClick={(e) => {
                      const dropdownMenu = e.target.nextElementSibling;
                      if (dropdownMenu) {
                        dropdownMenu.classList.toggle("show");
                      }
                    }}
                  >
                    Select Saved Address
                  </button>
                  <ul className="dropdown-menu" style={{ maxHeight: "300px", overflowY: "auto" }}>
                    {Object.entries(addresses).map(([type, addrList]) => (
                      <>
                        <li key={`${type}-header`}><h6 className="dropdown-header text-capitalize">{type} Address</h6></li>
                        {Array.isArray(addrList) && addrList.map((addr) => (
                          <li key={addr.id}>
                            <button
                              className="dropdown-item"
                              type="button"
                              onClick={() => {
                                handleSelectAddress(addr);
                                // Close the dropdown after selection
                                const dropdownMenu = document.querySelector('.dropdown-menu.show');
                                if (dropdownMenu) {
                                  dropdownMenu.classList.remove('show');
                                }
                              }}
                            >
                              <div className="d-flex flex-column">
                                <small className="fw-bold">{addr.contact_person_name}</small>
                                <small className="text-muted">{addr.phone}</small>
                                <small className="text-truncate" style={{ maxWidth: "200px" }}>
                                  {addr.address}
                                </small>
                              </div>
                            </button>
                          </li>
                        ))}
                      </>
                    ))}
                  </ul>
                </div>
              </div>
            )}
                    {/* Address Form */}
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label">Contact person name *</label>
                <input 
                  type="text" 
                  className={`form-control${errors.shipping.contact_person_name ? " is-invalid" : ""}`} 
                  name="contact_person_name" 
                  value={shipping.contact_person_name} 
                  onChange={handleShippingChange} 
                  required 
                />
                {errors.shipping.contact_person_name && <div className="invalid-feedback">{errors.shipping.contact_person_name}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Phone *</label>
                <input 
                  type="text" 
                  className={`form-control${errors.shipping.phone ? " is-invalid" : ""}`} 
                  name="phone" 
                  value={shipping.phone} 
                  onChange={handleShippingChange} 
                  required 
                />
                {errors.shipping.phone && <div className="invalid-feedback">{errors.shipping.phone}</div>}
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
                <input 
                  type="text" 
                  className={`form-control${errors.shipping.country ? " is-invalid" : ""}`} 
                  name="country" 
                  value={shipping.country} 
                  onChange={handleShippingChange} 
                  required 
                />
                {errors.shipping.country && <div className="invalid-feedback">{errors.shipping.country}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">City *</label>
                <input 
                  type="text" 
                  className={`form-control${errors.shipping.city ? " is-invalid" : ""}`} 
                  name="city" 
                  value={shipping.city} 
                  onChange={handleShippingChange} 
                  required 
                />
                {errors.shipping.city && <div className="invalid-feedback">{errors.shipping.city}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Zip code *</label>
                <input 
                  type="text" 
                  className={`form-control${errors.shipping.zip ? " is-invalid" : ""}`} 
                  name="zip" 
                  value={shipping.zip} 
                  onChange={handleShippingChange} 
                  required 
                />
                {errors.shipping.zip && <div className="invalid-feedback">{errors.shipping.zip}</div>}
              </div>
              
              <div className="col-12">
                <label className="form-label">Address *</label>
                <textarea 
                  className={`form-control${errors.shipping.address ? " is-invalid" : ""}`} 
                  name="address" 
                  value={shipping.address} 
                  onChange={handleShippingChange} 
                  required 
                />
                {errors.shipping.address && <div className="invalid-feedback">{errors.shipping.address}</div>}
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
                  <input 
                    className="form-check-input" 
                    type="checkbox" 
                    id="updateAddress" 
                    checked={updateAddress} 
                    onChange={e => setUpdateAddress(e.target.checked)} 
                  />
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
                <input 
                  className="form-check-input" 
                  type="checkbox" 
                  id="sameAsShipping" 
                  checked={sameAsShipping} 
                  onChange={e => setSameAsShipping(e.target.checked)} 
                />
                <label className="form-check-label" htmlFor="sameAsShipping">
                  Same as shipping address
                </label>
              </div>
            </div>
            
            {!sameAsShipping && (
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Contact person name *</label>
                  <input 
                    type="text" 
                    className={`form-control${errors.billing.contact_person_name ? " is-invalid" : ""}`} 
                    name="contact_person_name" 
                    value={billing.contact_person_name} 
                    onChange={handleBillingChange} 
                    required 
                  />
                  {errors.billing.contact_person_name && <div className="invalid-feedback">{errors.billing.contact_person_name}</div>}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Phone *</label>
                  <input 
                    type="text" 
                    className={`form-control${errors.billing.phone ? " is-invalid" : ""}`} 
                    name="phone" 
                    value={billing.phone} 
                    onChange={handleBillingChange} 
                    required 
                  />
                  {errors.billing.phone && <div className="invalid-feedback">{errors.billing.phone}</div>}
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
                  <input 
                    type="text" 
                    className={`form-control${errors.billing.country ? " is-invalid" : ""}`} 
                    name="country" 
                    value={billing.country} 
                    onChange={handleBillingChange} 
                    required 
                  />
                  {errors.billing.country && <div className="invalid-feedback">{errors.billing.country}</div>}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    className={`form-control${errors.billing.city ? " is-invalid" : ""}`} 
                    name="city" 
                    value={billing.city} 
                    onChange={handleBillingChange} 
                    required 
                  />
                  {errors.billing.city && <div className="invalid-feedback">{errors.billing.city}</div>}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Zip code *</label>
                  <input 
                    type="text" 
                    className={`form-control${errors.billing.zip ? " is-invalid" : ""}`} 
                    name="zip" 
                    value={billing.zip} 
                    onChange={handleBillingChange} 
                    required 
                  />
                  {errors.billing.zip && <div className="invalid-feedback">{errors.billing.zip}</div>}
                </div>
                
                <div className="col-12">
                  <label className="form-label">Address *</label>
                  <textarea 
                    className={`form-control${errors.billing.address ? " is-invalid" : ""}`} 
                    name="address" 
                    value={billing.address} 
                    onChange={handleBillingChange} 
                    required 
                  />
                  {errors.billing.address && <div className="invalid-feedback">{errors.billing.address}</div>}
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
              <span>৳{cartSummary.subtotal.toLocaleString()}</span>
            </div>
            
            <div className="mb-3 d-flex justify-content-between">
              <span>Shipping</span>
              <span>৳{cartSummary.shipping.toLocaleString()}</span>
            </div>
            
            <div className="mb-3 d-flex justify-content-between">
              <span>Discount on product</span>
              <span>- ৳{cartSummary.discount.toLocaleString()}</span>
            </div>
            
            <div className="mb-3 d-flex justify-content-between fw-bold fs-5">
              <span>Total</span>
              <span>৳{total.toLocaleString()}</span>
            </div>
            
            <button
              className="btn btn-primary w-100 mb-2"
              onClick={handleProceedToPayment}
            >
              Proceed to Payment
            </button>
            
            <Link href="/cart" className="btn btn-link w-100 text-center">
              &lt; Back to Cart
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}