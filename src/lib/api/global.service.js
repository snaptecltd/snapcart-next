import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

export async function getGuestId() {
  const res = await api.get(ENDPOINTS.GET_GUEST_ID);
  return res.data;
}

/* =========================
   NAV
========================= */
export async function getNavCategories() {
  const res = await api.get(ENDPOINTS.NAV_CATEGORIES);
  return res.data;
}

export async function getMainBanners() {
  const res = await api.get(ENDPOINTS.GET_MAIN_BANNERS);
  return res.data;
}

/* =========================
   GLOBAL CONFIG
========================= */
export async function getGlobalConfig() {
  const res = await api.get(ENDPOINTS.CONFIG);
  return res.data;
}

/* =========================
   COMPANY LIABILITES
========================= */
export async function getCompanyLiabilities() {
  const res = await api.get(ENDPOINTS.COMPANY_LIABILITIES);
  return res.data;
}


export async function getFeaturedProducts() {
  const res = await api.get(ENDPOINTS.PRODUCTS_FEATURED);
  return res.data;
}

export async function getBestSellingProducts() {
  const res = await api.get(ENDPOINTS.PRODUCTS_BEST_SELLINGS);
  return res.data;
}

export async function getTopRatedProducts() {
  const res = await api.get(ENDPOINTS.PRODUCTS_TOP_RATED);
  return res.data;
}

export async function getDealOfTheDay() {
  const res = await api.get(ENDPOINTS.DEAL_OF_THE_DAY);
  return res.data;
}

export async function getNewArrivalProducts() {
  const res = await api.get(ENDPOINTS.PRODUCTS_NEW_ARRIVALS);
  return res.data;
}

export async function getHomeBlockBanner() {
  const res = await api.get(ENDPOINTS.HOME_BLOCK_BANNERS);
  return res.data;
}

export async function getBrands() {
  const res = await api.get(ENDPOINTS.BRANDS);
  return res.data;
}

export async function getBottomTextCards() {
  const res = await api.get(ENDPOINTS.BOTTOM_TEXT_CARDS);
  return res.data;
}

export async function getStoreLocations() {
  const res = await api.get(ENDPOINTS.STORE_LOCATIONS);
  return res.data;
}

export async function getStoreDetails(slug) {
  const res = await api.get(`${ENDPOINTS.STORE_DETAILS}?slug=${slug}`);
  return res.data;
}

export async function getDynamicPage(slug) {
  const res = await api.get(`${ENDPOINTS.DYNAMIC_PAGE}?slug=${slug}`);
  return res.data;
}

export async function submitContactUsForm(data) {
  const res = await api.post(ENDPOINTS.CONTACT_US, data);
  return res.data;
}

export async function getFAQ() {
  const res = await api.get(ENDPOINTS.FAQ);
  return res.data;
}

export async function submitPreOrder(data) {
  const res = await api.post(ENDPOINTS.PRE_ORDER, data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function getTrendingSearches() {
  const res = await api.get(ENDPOINTS.TRENDING_SEARCHES);
  return res.data;
}

export async function getSearchedProducts(query) {
  const res = await api.get(ENDPOINTS.LIGHT_SEARCHED_PRODUCTS, {
    params: { keyword: query },
  });
  return res.data;
}

export async function filterProducts(filters) {
  const res = await api.get(ENDPOINTS.PRODUCT_FILTER, {
    params: filters,
  });
  return res.data;
}

export async function getProductDetails(slug) {
  const res = await api.get(`${ENDPOINTS.PRODUCT_DETAILS}/${slug}`);
  return res.data;
}

export async function getRelatedProducts(productId) {
  const res = await api.get(`${ENDPOINTS.RELATED_PRODUCTS}/${productId}`);
  return res.data;
}

export async function registerUser(data) {
  const res = await api.post(ENDPOINTS.AUTH_REGISTER, data);
  return res.data;
}

export async function loginUser(data) {
  const res = await api.post(ENDPOINTS.AUTH_LOGIN, data);
  return res.data;
}

export async function logoutUser() {
  const res = await api.post(ENDPOINTS.AUTH_LOGOUT);
  return res.data;
}

export async function resetPassword(data) {
  const res = await api.post(ENDPOINTS.AUTH_PASSWORD_RESET, data);
  return res.data;
}

// Cart
export async function getCart() {
  let headers = {};
  let params = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) params.guest_id = guestId;
    }
  }
  const res = await api.get(ENDPOINTS.CART, { params, headers });
  return res.data;
}

export async function addToCart(data) {
  let payload = { ...data };
  let headers = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  // Remove undefined/null fields
  Object.keys(payload).forEach(
    (k) => (payload[k] === undefined || payload[k] === null) && delete payload[k]
  );
  const res = await api.post(ENDPOINTS.ADD_TO_CART, payload, { headers });
  return res.data;
}

export async function updateCartItem(data) {
  let payload = { ...data };
  let headers = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  const res = await api.post(ENDPOINTS.UPDATE_CART_ITEM, payload, { headers });
  return res.data;
}

export async function removeCartItem(data) {
  let payload = { ...data };
  let headers = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  // Correct usage: payload as 2nd arg, headers as 3rd arg
  const res = await api.post(ENDPOINTS.REMOVE_CART_ITEM, payload, { headers });
  return res.data;
}

export async function removeAllCartItems() {
  let headers = {};
  let payload = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  const res = await api.post(ENDPOINTS.REMOVE_CART_ALL_ITEMS, payload, { headers });
  return res.data;
}

export async function getCustomerInfo() {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(ENDPOINTS.CUSTOMER_INFO, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function updateCustomerProfile(data) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const formData = new FormData();

  // Always append all required fields, even if empty string
  formData.append("f_name", data.f_name ?? "");
  formData.append("l_name", data.l_name ?? "");
  formData.append("phone", data.phone ?? "");
  formData.append("email", data.email ?? "");
  if (data.password) formData.append("password", data.password);
  if (data.image) formData.append("image", data.image);
  formData.append("_method", "POST"); // Laravel expects this for POST with FormData

  const res = await api.post(ENDPOINTS.CUSTOMER_UPDATE_PROFILE, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function getCustomerOrderList() {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(ENDPOINTS.CUSTOMER_ORDER_LIST, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function getCustomerOrderDetails(order_id) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(`${ENDPOINTS.CUSTOMER_ORDER_DETAILS}?order_id=${order_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function getCustomerWishlist() {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(ENDPOINTS.CUSTOMER_WISHLIST, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function removeFromWishlist(product_id) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.post(`${ENDPOINTS.CUSTOMER_WISHLIST_REMOVE}?product_id=${product_id}`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function addToWishlist(product_id) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  if (!token) throw new Error("Not authenticated");
  const res = await api.post(`${ENDPOINTS.CUSTOMER_WISHLIST_ADD}?product_id=${product_id}`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

export async function getCustomerSupportTickets() {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(ENDPOINTS.CUSTOMER_SUPPORT_TICKET_LIST, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function createCustomerSupportTicket(data) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const formData = new FormData();
  formData.append("subject", data.subject);
  formData.append("type", data.type);
  formData.append("priority", data.priority);
  formData.append("description", data.description);
  if (data.images && Array.isArray(data.images)) {
    data.images.forEach((img) => formData.append("image[]", img));
  }
  const res = await api.post(ENDPOINTS.CUSTOMER_SUPPORT_TICKET_CREATE, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function getCustomerSupportTicketConv(ticketId) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(`${ENDPOINTS.CUSTOMER_SUPPORT_TICKET_CONV}/${ticketId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function replyCustomerSupportTicket(ticketId, message, images) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const formData = new FormData();
  formData.append("message", message);
  if (images && Array.isArray(images)) {
    images.forEach((img) => formData.append("image[]", img));
  }
  const res = await api.post(`${ENDPOINTS.CUSTOMER_SUPPORT_TICKET_REPLY}/${ticketId}`, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function closeCustomerSupportTicket(ticketId) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(`${ENDPOINTS.CUSTOMER_SUPPORT_TICKET_CLOSE}/${ticketId}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function getCustomerAddressList() {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(ENDPOINTS.CUSTOMER_ADDRESS_LIST, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function addCustomerAddress(data) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined && value !== null) formData.append(key, value);
  });
  const res = await api.post(ENDPOINTS.CUSTOMER_ADDRESS_ADD, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function deleteCustomerAddress(address_id) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  // Pass {} as body, headers as 3rd arg
  const res = await api.post(`${ENDPOINTS.CUSTOMER_ADDRESS_DELETE}?address_id=${address_id}`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function getAddressDetails(address_id) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(`${ENDPOINTS.GET_ADDRESS_DETAILS}?address_id=${address_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function getAddressGroupedbyType() {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(ENDPOINTS.GET_ADDRESS_DETAILS_GROUPED, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function getCustomerRestockList() {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(ENDPOINTS.CUSTOMER_RESTOCK_LIST, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function deleteCustomerRestock({ id, type }) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  let url = ENDPOINTS.CUSTOMER_RESTOCK_DELETE;
  if (type === "all") url += "?type=all";
  else if (id) url += `?id=${id}`;
  const res = await api.post(url, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function trackOrder({ order_id, phone_number }) {
  const res = await api.post(ENDPOINTS.ORDER_TRACK, { order_id, phone_number });
  return res.data;
}

export async function getCouponList() {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(ENDPOINTS.COUPON_LIST, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function checkRestockRequest(product_id) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(`${ENDPOINTS.CART_CHECK_RESTOCK}?product_id=${product_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function requestProductRestock(product_id) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.post(`${ENDPOINTS.CART_PRODUCT_RESTOCK}?id=${product_id}`, {}, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function getShippingMethods() {
  const res = await api.get(ENDPOINTS.SHIPPING_METHODS);
  return res.data;
}

export async function chooseShippingForOrder(cart_group_id, shipping_method_id) {
  let headers = {};
  let payload = {
    cart_group_id,
    id: shipping_method_id,
  };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  const res = await api.post(ENDPOINTS.CHOOSE_SHIPPING_FOR_ORDER, payload, { headers });
  return res.data;
}

export async function getChoosenShippingMethod() {
  let headers = {};
  let params = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) params.guest_id = guestId;
    }
  }
  const res = await api.get(ENDPOINTS.CHOOSEN_SHIPPING_METHOD, { params, headers });
  return res.data;
}

export async function applyCoupon(code) {
  let headers = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await api.get(`${ENDPOINTS.COUPON_APPLY}?code=${encodeURIComponent(code)}`, { headers });
  return res.data;
}

export async function getOfflinePaymentMethods() {
  let headers = {};
  let params = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) params.guest_id = guestId;
    }
  }
  const res = await api.get(ENDPOINTS.OFFLINE_PAYMENT_METHOD_LIST, { params, headers });
  return res.data;
}

export async function placeOrder({
  coupon_code,
  order_note,
  shipping_method_id,
  address_id,
  billing_address_id,
}) {
  let headers = {};
  let params = {
    coupon_code,
    order_note,
    shipping_method_id,
    address_id,
    billing_address_id,
  };
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) params.guest_id = guestId;
    }
  }
  
  console.log("Order API call params:", params);
  
  //stop placing order to see the prams

  Object.keys(params).forEach(
    (k) => (params[k] === undefined || params[k] === null || params[k] === "") && delete params[k]
  );
  
  const res = await api.get(ENDPOINTS.ORDER_PLACE, { params, headers });
  return res.data;
}

export async function placeOrderByOfflinePayment({
  coupon_code,
  order_note,
  payment_note,
  shipping_method_id,
  address_id,
  billing_address_id,
  method_id,
  method_informations,
}) {
  let headers = {};
  let payload = {
    coupon_code,
    order_note,
    payment_note,
    shipping_method_id,
    address_id,
    billing_address_id,
    method_id,
    method_informations,
  };
  
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  
  // Debugging জন্য
  console.log("Offline order placing with payload:", payload);
  
  Object.keys(payload).forEach(
    (k) => (payload[k] === undefined || payload[k] === null || payload[k] === "") && delete payload[k]
  );
  
  const res = await api.post(ENDPOINTS.ORDER_PLACE_OFFLINE_PAYMENT, payload, { headers });
  return res.data;
}

/* =========================
   REVIEWS
========================= */
export async function getProductReviews(product_id) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(`${ENDPOINTS.GET_PRODUCT_REVIEWS}?product_id=${product_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function getProductReviewByProductAndOrder(product_id, order_id) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const res = await api.get(`${ENDPOINTS.GET_PRODUCT_REVIEW_BY_PRODUCT_AND_ORDER}?product_id=${product_id}&order_id=${order_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  return res.data;
}

export async function submitProductReview(data) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const formData = new FormData();
  
  // Append required fields
  formData.append("product_id", data.product_id);
  formData.append("order_id", data.order_id);
  formData.append("comment", data.comment);
  formData.append("rating", data.rating);
  
  // Append images with the correct field name 'fileUpload[]'
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    data.images.forEach((image) => {
      if (image instanceof File) {
        formData.append('fileUpload[]', image);
      }
    });
  }
  
  const res = await api.post(ENDPOINTS.SUBMIT_PRODUCT_REVIEW, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function updateProductReview(data) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const formData = new FormData();
  
  // Append all required fields - note: backend expects 'id' not 'review_id'
  formData.append("id", data.review_id); // Changed from review_id to id
  formData.append("product_id", data.product_id);
  formData.append("order_id", data.order_id);
  formData.append("comment", data.comment);
  formData.append("rating", data.rating);
  
  // Append new images with the correct field name 'fileUpload[]'
  if (data.new_images && Array.isArray(data.new_images) && data.new_images.length > 0) {
    data.new_images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append('fileUpload[]', image); // Keep as array notation
      }
    });
  }
  
  // Append deleted image IDs if needed (backend might handle this differently)
  if (data.deleted_images && Array.isArray(data.deleted_images) && data.deleted_images.length > 0) {
    data.deleted_images.forEach((imageId, index) => {
      formData.append(`deleted_images[${index}]`, imageId);
    });
  }
  
  console.log("Update review data being sent:", {
    id: data.review_id, // This will be sent as 'id'
    product_id: data.product_id,
    order_id: data.order_id,
    comment: data.comment,
    rating: data.rating,
    new_images_count: data.new_images?.length || 0,
    deleted_images_count: data.deleted_images?.length || 0
  });
  
  const res = await api.post(ENDPOINTS.UPDATE_PRODUCT_REVIEW, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function deleteReviewImage(review_id, image_name) {
  const token = typeof window !== "undefined" ? localStorage.getItem("snapcart_token") : null;
  const formData = new FormData();
  
  formData.append("id", review_id);
  formData.append("name", image_name);
  
  console.log("Deleting review image:", { review_id, image_name });
  
  const res = await api.post(ENDPOINTS.DELETE_REVIEW_IMAGE, formData, {
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
}

export async function getEmiBanks() {
  const res = await api.get(ENDPOINTS.EMI_BANKS);
  return res.data;
}

export async function getOffersType() {
  const res = await api.get(ENDPOINTS.OFFERS_TYPE);
  return res.data;
}