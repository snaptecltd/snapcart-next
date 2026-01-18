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