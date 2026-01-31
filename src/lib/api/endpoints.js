import { API_CONFIG } from "./config";

const { PREFIX } = API_CONFIG;

export const ENDPOINTS = {
  GET_GUEST_ID: `${PREFIX}/get-guest-id`,
  GET_MAIN_BANNERS: `${PREFIX}/get-main-banners`,
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

  // cart endpoints 
  CART: `${PREFIX}/cart`,
  ADD_TO_CART: `${PREFIX}/cart/add`,
  UPDATE_CART_ITEM: `${PREFIX}/cart/update`,
  REMOVE_CART_ITEM: `${PREFIX}/cart/remove`,
  REMOVE_CART_ALL_ITEMS: `${PREFIX}/cart/remove-all`,

  // customer endpoints
  CUSTOMER_INFO: `${PREFIX}/customer/info`,
  CUSTOMER_UPDATE_PROFILE: `${PREFIX}/customer/update-profile`,
  CUSTOMER_ORDER_LIST: `${PREFIX}/customer/order/list`,
  CUSTOMER_ORDER_DETAILS: `${PREFIX}/customer/order/details`,

  // wishlist endpoints
  CUSTOMER_WISHLIST_ADD: `${PREFIX}/customer/wish-list/add`,
  CUSTOMER_WISHLIST: `${PREFIX}/customer/wish-list`,
  CUSTOMER_WISHLIST_REMOVE: `${PREFIX}/customer/wish-list/remove`,

  // support ticket endpoints
  CUSTOMER_SUPPORT_TICKET_LIST: `${PREFIX}/customer/support-ticket/get`,
  CUSTOMER_SUPPORT_TICKET_CREATE: `${PREFIX}/customer/support-ticket/create`,
  CUSTOMER_SUPPORT_TICKET_CONV: `${PREFIX}/customer/support-ticket/conv`,
  CUSTOMER_SUPPORT_TICKET_REPLY: `${PREFIX}/customer/support-ticket/reply`,
  CUSTOMER_SUPPORT_TICKET_CLOSE: `${PREFIX}/customer/support-ticket/close`,

  // address endpoints
  CUSTOMER_ADDRESS_LIST: `${PREFIX}/customer/address/list`,
  CUSTOMER_ADDRESS_ADD: `${PREFIX}/customer/address/add`,
  CUSTOMER_ADDRESS_DELETE: `${PREFIX}/customer/address`,
  GET_ADDRESS_DETAILS: `${PREFIX}/customer/address/get`,

  // restock endpoints
  CUSTOMER_RESTOCK_LIST: `${PREFIX}/customer/restock-requests/list`,
  CUSTOMER_RESTOCK_DELETE: `${PREFIX}/customer/restock-requests/delete`,
  CART_CHECK_RESTOCK: `${PREFIX}/cart/check-restock-request`,
  CART_PRODUCT_RESTOCK: `${PREFIX}/cart/product-restock-request`,

  // order tracking endpoint
  ORDER_TRACK: `${PREFIX}/order/track-order`,

  // coupon endpoints
  COUPON_LIST: `${PREFIX}/coupon/list`,
  COUPON_APPLY: `${PREFIX}/coupon/apply`,
  
  // shipping methods endpoint
  SHIPPING_METHODS: `${PREFIX}/products/shipping-methods`,

  // offline payment methods
  OFFLINE_PAYMENT_METHOD_LIST: `${PREFIX}/customer/order/offline-payment-method-list`,
  
  // order place endpoint
  ORDER_PLACE: `${PREFIX}/customer/order/place`,
  ORDER_PLACE_OFFLINE_PAYMENT: `${PREFIX}/customer/order/place-by-offline-payment`,
};
