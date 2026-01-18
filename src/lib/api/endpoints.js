import { API_CONFIG } from "./config";

const { PREFIX } = API_CONFIG;

export const ENDPOINTS = {
  NAV_CATEGORIES: `${PREFIX}/nav-categories`,
  PRODUCTS: `${PREFIX}/products`,
  PRODUCT_DETAILS: (slug) => `${PREFIX}/products/${slug}`,
  CART_ADD: `${PREFIX}/cart/add`,
  CART: `${PREFIX}/cart`,
};
