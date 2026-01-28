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
  // Try to get token and user/guest id from localStorage
  let params = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      // Auth user
      const user = localStorage.getItem("snapcart_user");
      try {
        const userObj = user ? JSON.parse(user) : {};
        if (userObj?.id) params.user_id = userObj.id;
      } catch {}
    } else {
      // Guest user
      const guestId = localStorage.getItem("guest_id");
      if (guestId) params.guest_id = guestId;
    }
  }
  const res = await api.get(ENDPOINTS.CART, { params });
  return res.data;
}

export async function addToCart(data) {
  let payload = { ...data };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      const user = localStorage.getItem("snapcart_user");
      try {
        const userObj = user ? JSON.parse(user) : {};
        if (userObj?.id) payload.user_id = userObj.id;
      } catch {}
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  // Remove undefined/null fields
  Object.keys(payload).forEach(
    (k) => (payload[k] === undefined || payload[k] === null) && delete payload[k]
  );
  const res = await api.post(ENDPOINTS.ADD_TO_CART, payload);
  return res.data;
}

export async function updateCartItem(data) {
  let payload = { ...data };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      const user = localStorage.getItem("snapcart_user");
      try {
        const userObj = user ? JSON.parse(user) : {};
        if (userObj?.id) payload.user_id = userObj.id;
      } catch {}
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  const res = await api.put(ENDPOINTS.UPDATE_CART_ITEM, payload);
  return res.data;
}

export async function removeCartItem(data) {
  let payload = { ...data };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      const user = localStorage.getItem("snapcart_user");
      try {
        const userObj = user ? JSON.parse(user) : {};
        if (userObj?.id) payload.user_id = userObj.id;
      } catch {}
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  const res = await api.delete(ENDPOINTS.REMOVE_CART_ITEM, payload);
  return res.data;
}

export async function removeAllCartItems() {
  let payload = {};
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("snapcart_token");
    if (token) {
      const user = localStorage.getItem("snapcart_user");
      try {
        const userObj = user ? JSON.parse(user) : {};
        if (userObj?.id) payload.user_id = userObj.id;
      } catch {}
    } else {
      const guestId = localStorage.getItem("guest_id");
      if (guestId) payload.guest_id = guestId;
    }
  }
  const res = await api.delete(ENDPOINTS.REMOVE_CART_ALL_ITEMS, payload);
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
  const res = await api.delete(`${ENDPOINTS.CUSTOMER_WISHLIST_REMOVE}?product_id=${product_id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
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