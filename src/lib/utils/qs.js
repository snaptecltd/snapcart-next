export function parseCSV(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}

export function toCSV(arr) {
  if (!arr || !arr.length) return "";
  return arr.join(",");
}

export function cleanObject(obj) {
  const out = {};
  Object.entries(obj || {}).forEach(([k, v]) => {
    if (v === null || v === undefined) return;
    if (typeof v === "string" && v.trim() === "") return;
    if (Array.isArray(v) && v.length === 0) return;
    out[k] = v;
  });
  return out;
}
