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
  STORE_DETAILS: `${PREFIX}/store/details`,
  DYNAMIC_PAGE: `${PREFIX}/page`,
  CONTACT_US: `${PREFIX}/contact-us`,
  FAQ: `${PREFIX}/faq`,
  PRE_ORDER: `${PREFIX}/preorders/create`,
  TRENDING_SEARCHES: `${PREFIX}/products/most-searching`,
  LIGHT_SEARCHED_PRODUCTS: `${PREFIX}/products/light-search`,
  PRODUCT_FILTER: `${PREFIX}/products/search`,
  PRODUCT_DETAILS: `${PREFIX}/products/details`,
  RELATED_PRODUCTS: `${PREFIX}/products/related-products`,

  // auth endpoints 
  AUTH_REGISTER: `${PREFIX}/auth/register`,
  AUTH_LOGIN: `${PREFIX}/auth/login`,
  AUTH_LOGOUT: `${PREFIX}/auth/logout`,
  AUTH_PASSWORD_RESET: `${PREFIX}/auth/password-reset`,
};
