import { API_CONFIG } from "./config";

const { PREFIX } = API_CONFIG;

export const ENDPOINTS = {
  NAV_CATEGORIES: `${PREFIX}/nav-categories`,
  CONFIG: `${PREFIX}/config`,
  COMPANY_LIABILITIES: `${PREFIX}/company-reliability`,
  PRODUCTS_FEATURED: `${PREFIX}/products/featured`,
  PRODUCTS_BEST_SELLINGS: `${PREFIX}/products/best-sellings`,
  PRODUCTS_TOP_RATED: `${PREFIX}/products/top-rated`,
};
