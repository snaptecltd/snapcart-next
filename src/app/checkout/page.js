"use client";
import { useEffect, useState, useRef } from "react";
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
    email: "", // Added email
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
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [createAccount, setCreateAccount] = useState(false);
  const [guestPassword, setGuestPassword] = useState("");
  const [guestPasswordError, setGuestPasswordError] = useState("");
  
  // cart summary state
  const [cartSummary, setCartSummary] = useState({
    subtotal: 0,
    itemDiscount: 0,
    shipping: 0,
    shippingName: "",
    discount: 0,
    total: 0,
  });

  // Refs
  const dropdownRef = useRef(null);
  const dropdownButtonRef = useRef(null);

  // Load cart summary from localStorage
  useEffect(() => {
    try {
      // Always get the latest values from localStorage (set by Cart page)
      const subtotal = Number(localStorage.getItem("snapcart_cart_subtotal") || 0);
      const itemDiscount = Number(localStorage.getItem("snapcart_cart_item_discount") || 0);
      const shipping = Number(localStorage.getItem("snapcart_cart_shipping") || 0);
      const shippingName = localStorage.getItem("snapcart_cart_shipping_name") || "Shipping";
      const discount = Number(localStorage.getItem("snapcart_cart_discount") || 0);
      // Calculation: subtotal - itemDiscount - discount + shipping
      const total = Math.max(0, subtotal - itemDiscount - discount + shipping);
      setCartSummary({ subtotal, itemDiscount, shipping, shippingName, discount, total });
    } catch (error) {
      console.error("Error loading cart summary:", error);
      setCartSummary({ subtotal: 0, itemDiscount: 0, shipping: 0, shippingName: "", discount: 0, total: 0 });
    }
  }, []);
  
useEffect(() => {
  const cartGroupId = localStorage.getItem("snapcart_cart_group_id");
  const shippingMethodId = localStorage.getItem("snapcart_shipping_method_id");
  
  if (cartGroupId && shippingMethodId) {
    console.log("Cart group ID:", cartGroupId);
    console.log("Shipping method ID:", shippingMethodId);
  }
}, []);
  // এড্রেস লিস্ট রিফ্রেশ করার জন্য নতুন ফাংশন
  const refreshAddressList = async () => {
    try {
      console.log("Refreshing address list...");
      
      const res = await getAddressGroupedbyType();
      console.log("Refreshed addresses API response:", res);
      
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
      
      return res;
    } catch (error) {
      console.error("Error refreshing addresses:", error);
      toast.error("Failed to load addresses");
      return null;
    }
  };

  // Load saved addresses - ONLY ONCE!
  useEffect(() => {
    const loadAddresses = async () => {
      console.log("Fetching addresses...");
      
      try {
        const res = await getAddressGroupedbyType();
        console.log("Addresses API response:", res);
        
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
      } catch (error) {
        console.error("Error fetching addresses:", error);
        toast.error("Failed to load saved addresses");
        setAddresses([]);
      }
    };
    
    loadAddresses();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        const dropdownMenu = document.querySelector('.dropdown-menu.show');
        if (dropdownMenu) {
          dropdownMenu.classList.remove('show');
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle address selection
  const handleSelectAddress = (address) => {
    console.log("Selecting address:", address);
    
    const newShipping = {
      contact_person_name: address.contact_person_name || "",
      phone: address.phone || "",
      email: address.email || "", // Added email
      address_type: address.address_type || "Home",
      country: address.country || "Bangladesh",
      city: address.city || "",
      zip: address.zip || "",
      address: address.address || "",
      latitude: address.latitude || "",
      longitude: address.longitude || "",
      id: address.id || null
    };
    
    setShipping(newShipping);
    setSelectedAddressId(address.id);
    
    // Uncheck update address when selecting from saved addresses
    setUpdateAddress(false);
    
    // If same as shipping is checked, update billing too
    if (sameAsShipping) {
      setBilling(newShipping);
    }
    
    // Close dropdown
    const dropdownMenu = document.querySelector('.dropdown-menu.show');
    if (dropdownMenu) {
      dropdownMenu.classList.remove('show');
    }
    
    toast.success(`Selected address: ${address.contact_person_name}`);
  };

  // Handle shipping field change
  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    const updatedShipping = { ...shipping, [name]: value };
    setShipping(updatedShipping);
    
    // Clear selected address ID if user manually edits the form
    if (name !== "address_type") {
      setSelectedAddressId(null);
    }
    
    // If same as shipping is checked, update billing too
    if (sameAsShipping) {
      setBilling(updatedShipping);
    }
  };

  // Handle billing field change
  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBilling((prev) => ({ ...prev, [name]: value }));
  };

  // Sync billing with shipping if checked
  useEffect(() => {
    if (sameAsShipping) {
      setBilling({ ...shipping });
    }
  }, [sameAsShipping, shipping]);

  // Address validation function
  const validateAddress = (addr) => {
    const required = ["contact_person_name", "phone", "email", "country", "city", "zip", "address"]; // Added email
    const errs = {};
    required.forEach((k) => {
      if (!addr[k] || String(addr[k]).trim() === "") errs[k] = "Required";
    });
    return errs;
  };

  // Handle save address function
  const handleSaveAddress = async (addressData, isBilling = false) => {
    try {
      const addressToSave = {
        ...addressData,
        is_billing: isBilling ? 1 : 0
      };

      console.log("Saving address with data:", addressToSave);

      const response = await addCustomerAddress(addressToSave);
      console.log("Address save API response:", response, response.id);

      if (response && response.id) {
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

  // Find address by ID
  const findAddressById = (id) => {
    const allAddresses = getAllAddresses();
    return allAddresses.find(addr => addr.id === id);
  };

  // Handle proceed to payment
  // checkout/page.js - handleProceedToPayment function
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Address validation
    const shippingErrs = validateAddress(shipping);
    const billingErrs = sameAsShipping ? {} : validateAddress(billing);
    
    setErrors({ shipping: shippingErrs, billing: billingErrs });
    
    if (Object.keys(shippingErrs).length || Object.keys(billingErrs).length) {
      toast.error("Please fill all required address fields.");
      setIsLoading(false);
      return;
    }
    
    // Guest user: if create account checked, validate password
    if (isGuest && createAccount) {
      if (!guestPassword || guestPassword.length < 6) {
        setGuestPasswordError("Password must be at least 6 characters.");
        setIsLoading(false);
        return;
      }
      setGuestPasswordError("");
    }

    try {
      let shippingId = null;
      let billingId = null;
      
      // 1. Check if we have a selected saved address
      if (selectedAddressId && !updateAddress) {
        shippingId = selectedAddressId;
        console.log("Using existing shipping address ID:", shippingId);
      } else {
        // 2. Check if this address already exists in user's saved addresses
        const allAddresses = getAllAddresses();
        const existingAddress = allAddresses.find(addr => {
          if (!addr || typeof addr !== 'object') return false;
          
          return (
            addr.contact_person_name === shipping.contact_person_name &&
            addr.phone === shipping.phone &&
            addr.address === shipping.address &&
            addr.city === shipping.city &&
            addr.zip === shipping.zip &&
            addr.country === shipping.country
          );
        });
        
        if (existingAddress && !updateAddress) {
          // Use existing address
          shippingId = existingAddress.id;
          setSelectedAddressId(existingAddress.id);
          console.log("Found existing address, using ID:", shippingId);
        } else {
          // Save new address
          const newAddressResponse = await addCustomerAddress({
            ...shipping,
            is_billing: 0
          });
          console.log(newAddressResponse);
          
          if (newAddressResponse && newAddressResponse.id) {
            shippingId = newAddressResponse.id;
            setSelectedAddressId(newAddressResponse.id);
            
            // Refresh address list
            setTimeout(async () => {
              await refreshAddressList();
            }, 500);
            
            console.log("New address saved with ID:", shippingId);
          } else {
            toast.error("Failed to save shipping address. Please try again.");
            setIsLoading(false);
            return;
          }
        }
      }
      
      // 3. Handle billing address
      if (sameAsShipping) {
        billingId = shippingId;
      } else {
        // Check for existing billing address
        const allAddresses = getAllAddresses();
        const existingBillingAddress = allAddresses.find(addr => {
          if (!addr || typeof addr !== 'object') return false;
          
          return (
            addr.contact_person_name === billing.contact_person_name &&
            addr.phone === billing.phone &&
            addr.address === billing.address &&
            addr.city === billing.city &&
            addr.zip === billing.zip &&
            addr.country === billing.country
          );
        });
        
        if (existingBillingAddress && !updateAddress) {
          billingId = existingBillingAddress.id;
        } else {
          // Save new billing address
          const newBillingResponse = await addCustomerAddress({
            ...billing,
            is_billing: 1
          });
          
          if (newBillingResponse && newBillingResponse.id) {
            billingId = newBillingResponse.id;
          } else {
            toast.error("Failed to save billing address. Please try again.");
            setIsLoading(false);
            return;
          }
        }
      }
      
      // 4. সংরক্ষণ করুন localStorage-এ
      localStorage.setItem("snapcart_checkout_shipping_id", shippingId);
      localStorage.setItem("snapcart_checkout_billing_id", billingId);
      localStorage.setItem("snapcart_same_as_shipping", sameAsShipping.toString());
      
      // Address objects also save for reference
      localStorage.setItem("snapcart_checkout_shipping_address", JSON.stringify({
        ...shipping,
        id: shippingId
      }));
      
      if (sameAsShipping) {
        localStorage.setItem("snapcart_checkout_billing_address", JSON.stringify({
          ...shipping,
          id: shippingId
        }));
      } else {
        localStorage.setItem("snapcart_checkout_billing_address", JSON.stringify({
          ...billing,
          id: billingId
        }));
      }
      
      // If guest and createAccount checked, save password for payment page
      if (isGuest && createAccount) {
        localStorage.setItem("snapcart_guest_create_account", "1");
        localStorage.setItem("snapcart_guest_password", guestPassword);
      } else {
        localStorage.removeItem("snapcart_guest_create_account");
        localStorage.removeItem("snapcart_guest_password");
      }
      
      // 5. Navigate to payment page - এখানে সমস্যা ছিল
      console.log("Navigating to payment page...");
      router.push("/checkout/payment");
      
    } catch (error) {
      console.error("Error in checkout:", error);
      toast.error("Failed to proceed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  // Calculate total
  const subtotal = cartSummary.subtotal;
  const itemDiscount = cartSummary.itemDiscount;
  const shippingCharge = cartSummary.shipping;
  const shippingName = cartSummary.shippingName || "Shipping";
  const discount = cartSummary.discount;
  const tax = 0; // any tax, set to 0 if not applicable
  const total = cartSummary.total;

  // Toggle dropdown
  const toggleDropdown = () => {
    const dropdownMenu = dropdownButtonRef.current?.nextElementSibling;
    if (dropdownMenu) {
      dropdownMenu.classList.toggle("show");
    }
  };

  // Get button text based on selection
  const getButtonText = () => {
    if (selectedAddressId) {
      const address = findAddressById(selectedAddressId);
      if (address) {
        return `${address.contact_person_name} - ${address.address.substring(0, 20)}...`;
      }
    }
    return "Select Saved Address";
  };

  useEffect(() => {
    const token = localStorage.getItem("snapcart_token");
    setIsGuest(!token); // If token exists, user is not a guest
  }, []);

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
                <div className="rounded-circle bg-light text-dark d-inline-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>3</div>
                <div style={{ fontSize: 13 }}>Payment</div>
              </div>
            </div>
          </div>
          
          {/* Shipping Address */}
          <div className="bg-white rounded-4 p-4 shadow-sm mb-4">
            <h5 className="fw-bold mb-3">Shipping Address</h5>
            
            {/* Saved Address Dropdown */}
            <div className="mb-4" ref={dropdownRef}>
              {addresses && Object.keys(addresses).length > 0 ? (
                <>
                  <div className="dropdown">
                    <button 
                      ref={dropdownButtonRef}
                      className="btn btn-outline-secondary dropdown-toggle w-100 text-start"
                      type="button" 
                      onClick={toggleDropdown}
                      aria-expanded="false"
                    >
                      <div className="d-flex justify-content-between align-items-center">
                        <span className="text-truncate">{getButtonText()}</span>
                        <i className="fas fa-chevron-down ms-2"></i>
                      </div>
                    </button>
                    <ul className="dropdown-menu w-100" style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {Object.entries(addresses).map(([type, addrList]) => (
                        <React.Fragment key={type}>
                          <li><h6 className="dropdown-header text-capitalize">{type} Address</h6></li>
                          {Array.isArray(addrList) && addrList.map((addr) => (
                            <li key={addr.id}>
                              <button
                                className={`dropdown-item ${selectedAddressId === addr.id ? 'active bg-primary text-white' : ''}`}
                                type="button"
                                onClick={() => handleSelectAddress(addr)}
                              >
                                <div className="d-flex flex-column">
                                  <div className="d-flex justify-content-between align-items-start">
                                    <small className="fw-bold">{addr.contact_person_name}</small>
                                    {selectedAddressId === addr.id && (
                                      <small><i className="fas fa-check"></i></small>
                                    )}
                                  </div>
                                  <small className="text-muted">{addr.phone}</small>
                                  <small className="text-truncate" style={{ maxWidth: "250px" }}>
                                    {addr.address}
                                  </small>
                                </div>
                              </button>
                            </li>
                          ))}
                        </React.Fragment>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-2">
                    <small className="text-muted">
                      <i className="fas fa-info-circle me-1"></i>
                      {selectedAddressId ? "Selected address will be used for shipping." : "Select an address or fill the form below."}
                    </small>
                  </div>
                </>
              ) : (
                <div className="alert alert-info">
                  <i className="fas fa-info-circle me-2"></i>
                  No saved addresses found. Please fill the form below to add your address.
                </div>
              )}
            </div>

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
                  placeholder="Enter full name"
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
                  placeholder="01XXXXXXXXX"
                  required 
                />
                {errors.shipping.phone && <div className="invalid-feedback">{errors.shipping.phone}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Email *</label>
                <input 
                  type="email" 
                  className={`form-control${errors.shipping.email ? " is-invalid" : ""}`} 
                  name="email" 
                  value={shipping.email} 
                  onChange={handleShippingChange} 
                  placeholder="Enter email address"
                  required 
                />
                {errors.shipping.email && <div className="invalid-feedback">{errors.shipping.email}</div>}
              </div>
              
              <div className="col-md-6">
                <label className="form-label">Address type</label>
                <select className="form-select" name="address_type" value={shipping.address_type} onChange={handleShippingChange}>
                  <option value="Home">Home</option>
                  <option value="Office">Office</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Country *</label>
                <input 
                  type="text" 
                  className={`form-control${errors.shipping.country ? " is-invalid" : ""}`} 
                  name="country" 
                  value={shipping.country} 
                  onChange={handleShippingChange} 
                  required 
                  readOnly
                />
                {errors.shipping.country && <div className="invalid-feedback">{errors.shipping.country}</div>}
              </div>
              
              <div className="col-md-4">
                <label className="form-label">City *</label>
                <input 
                  type="text" 
                  className={`form-control${errors.shipping.city ? " is-invalid" : ""}`} 
                  name="city" 
                  value={shipping.city} 
                  onChange={handleShippingChange} 
                  placeholder="Enter city name"
                  required 
                />
                {errors.shipping.city && <div className="invalid-feedback">{errors.shipping.city}</div>}
              </div>
              
              <div className="col-md-4">
                <label className="form-label">Zip code *</label>
                <input 
                  type="text" 
                  className={`form-control${errors.shipping.zip ? " is-invalid" : ""}`} 
                  name="zip" 
                  value={shipping.zip} 
                  onChange={handleShippingChange} 
                  placeholder="Enter postal code"
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
                  placeholder="Enter full address with house/road number"
                  rows="3"
                  required 
                />
                {errors.shipping.address && <div className="invalid-feedback">{errors.shipping.address}</div>}
              </div>
              
              {/* Map - if coordinates available */}
              {shipping.latitude && shipping.longitude && (
                <div className="col-12">
                  <div className="card">
                    <div className="card-header">
                      <small className="fw-bold">Location Preview</small>
                    </div>
                    <div className="card-body p-0">
                      <iframe
                        width="100%"
                        height="180"
                        frameBorder="0"
                        style={{ border: 0, borderRadius: "0 0 8px 8px" }}
                        src={`https://maps.google.com/maps?q=${shipping.latitude},${shipping.longitude}&z=15&output=embed`}
                        allowFullScreen
                        title="Address location"
                      ></iframe>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Only show for guest user */}
              {isGuest && (
                <div className="col-12">
                  <div className="form-check mb-2">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      id="createAccount"
                      checked={createAccount}
                      onChange={e => setCreateAccount(e.target.checked)}
                    />
                    <label className="form-check-label" htmlFor="createAccount">
                      Create a customer account with this address
                    </label>
                  </div>
                  {createAccount && (
                    <div className="mb-2">
                      <label className="form-label" htmlFor="guestPassword">
                        Set Password <span className="text-danger">*</span>
                      </label>
                      <input
                        type="password"
                        className={`form-control${guestPasswordError ? " is-invalid" : ""}`}
                        id="guestPassword"
                        value={guestPassword}
                        onChange={e => setGuestPassword(e.target.value)}
                        placeholder="Password (min 6 chars)"
                      />
                      {guestPasswordError && (
                        <div className="invalid-feedback">{guestPasswordError}</div>
                      )}
                    </div>
                  )}
                </div>
              )}
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
                    placeholder="Enter full name"
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
                    placeholder="01XXXXXXXXX"
                    required 
                  />
                  {errors.billing.phone && <div className="invalid-feedback">{errors.billing.phone}</div>}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Email *</label>
                  <input 
                    type="email" 
                    className={`form-control${errors.billing.email ? " is-invalid" : ""}`} 
                    name="email" 
                    value={billing.email} 
                    onChange={handleBillingChange} 
                    placeholder="Enter email address"
                    required 
                  />
                  {errors.billing.email && <div className="invalid-feedback">{errors.billing.email}</div>}
                </div>
                
                <div className="col-md-6">
                  <label className="form-label">Address type</label>
                  <select className="form-select" name="address_type" value={billing.address_type} onChange={handleBillingChange}>
                    <option value="Home">Home</option>
                    <option value="Office">Office</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Country *</label>
                  <input 
                    type="text" 
                    className={`form-control${errors.billing.country ? " is-invalid" : ""}`} 
                    name="country" 
                    value={billing.country} 
                    onChange={handleBillingChange} 
                    required 
                    readOnly
                  />
                  {errors.billing.country && <div className="invalid-feedback">{errors.billing.country}</div>}
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">City *</label>
                  <input 
                    type="text" 
                    className={`form-control${errors.billing.city ? " is-invalid" : ""}`} 
                    name="city" 
                    value={billing.city} 
                    onChange={handleBillingChange} 
                    placeholder="Enter city name"
                    required 
                  />
                  {errors.billing.city && <div className="invalid-feedback">{errors.billing.city}</div>}
                </div>
                
                <div className="col-md-4">
                  <label className="form-label">Zip code *</label>
                  <input 
                    type="text" 
                    className={`form-control${errors.billing.zip ? " is-invalid" : ""}`} 
                    name="zip" 
                    value={billing.zip} 
                    onChange={handleBillingChange} 
                    placeholder="Enter postal code"
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
                    placeholder="Enter full address with house/road number"
                    rows="3"
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
                <span>{shippingName}</span>
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
              onClick={handleProceedToPayment}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Processing...
                </>
              ) : (
                <>
                  <i className="fas fa-lock me-2"></i>
                  Proceed to Payment
                </>
              )}
            </button>
            
            <div className="text-center">
              <Link href="/cart" className="btn btn-link text-decoration-none">
                <i className="fas fa-arrow-left me-2"></i>
                Back to Cart
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