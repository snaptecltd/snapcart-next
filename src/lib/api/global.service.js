import { api } from "./client";
import { ENDPOINTS } from "./endpoints";

export async function getNavCategories() {
  const res = await api.get(ENDPOINTS.NAV_CATEGORIES);
  return res.data;
}
