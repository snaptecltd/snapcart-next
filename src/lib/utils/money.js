export function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}
