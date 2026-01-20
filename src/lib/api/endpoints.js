import { API_CONFIG } from "./config";

const { PREFIX } = API_CONFIG;

export const ENDPOINTS = {
  NAV_CATEGORIES: `${PREFIX}/nav-categories`,
  CONFIG: `${PREFIX}/config`,
  COMPANY_LIABILITIES: `${PREFIX}/company-reliability`,
  PRODUCTS_FEATURED: `${PREFIX}/products/featured`,
  PRODUCTS_BEST_SELLINGS: `${PREFIX}/products/best-sellings`,
  PRODUCTS_TOP_RATED: `${PREFIX}/products/top-rated`,
  DEAL_OF_THE_DAY: `${PREFIX}/dealsoftheday/deal-of-the-day`,
  PRODUCTS_NEW_ARRIVALS: `${PREFIX}/products/new-arrival`,
  HOME_BLOCK_BANNERS: `${PREFIX}/get-home-block-banner`,
  BRANDS: `${PREFIX}/brands`,
  BOTTOM_TEXT_CARDS: `${PREFIX}/bottom-text-cards`,
  STORE_LOCATIONS: `${PREFIX}/store-locations`,
  STORE_DETAILS: `${PREFIX}/store/details`, // add this line
};
