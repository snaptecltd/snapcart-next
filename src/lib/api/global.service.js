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