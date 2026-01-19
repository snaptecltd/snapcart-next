import { api } from "./client";
import { ENDPOINTS } from "./endpoints";


/* =========================
   NAV
========================= */
export async function getNavCategories() {
  const res = await api.get(ENDPOINTS.NAV_CATEGORIES);
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