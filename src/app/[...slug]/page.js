"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/shop/filters/FilterSidebar";
import ProductGrid from "@/components/shop/products/ProductGrid";
import ProductSkeletonGrid from "@/components/shop/products/ProductSkeletonGrid";
import PaginationBar from "@/components/shop/products/PaginationBar";
import { filterProducts } from "@/lib/api/global.service";
import { cleanObject, parseCSV, toCSV } from "@/lib/utils/qs";
import { FaFilter, FaTimes } from "react-icons/fa"; // Add this if using react-icons, or use <i className="fas fa-times"></i> for fontawesome

function buildFilterStateFromUrl(searchParams) {
  return {
    q: searchParams.get("q") || "",
    min_price: searchParams.get("min_price") ? Number(searchParams.get("min_price")) : "",
    max_price: searchParams.get("max_price") ? Number(searchParams.get("max_price")) : "",
    brands: parseCSV(searchParams.get("brands")),
    colors: parseCSV(searchParams.get("colors")),
    // attrs=ram:8GB|12GB;storage:256GB
    attrs: (() => {
      const raw = searchParams.get("attrs");
      if (!raw) return {};
      const out = {};
      raw.split(";").forEach((pair) => {
        const [k, vals] = pair.split(":");
        if (!k) return;
        out[k] = (vals || "").split("|").filter(Boolean);
      });
      return out;
    })(),
    page: Number(searchParams.get("page") || 1),
    limit: Number(searchParams.get("limit") || 12),
    sort: searchParams.get("sort") || "",
  };
}

function attrsToQuery(attrsObj) {
  const parts = [];
  Object.entries(attrsObj || {}).forEach(([k, vals]) => {
    if (!vals?.length) return;
    parts.push(`${k}:${vals.join("|")}`);
  });
  return parts.join(";");
}

export default function ListingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params?.slug || [];

  const levels = useMemo(() => {
    return {
      category_slug: slug[0] || null,
      sub_category_slug: slug[1] || null,
      sub_sub_category_slug: slug[2] || null,
    };
  }, [slug]);

  const [ui, setUi] = useState(() => buildFilterStateFromUrl(searchParams));
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // meta for filters (dynamic from API recommended)
  const [meta, setMeta] = useState({
    brands: [],
    colors: [],
    attributes: [],
    price: { min: 0, max: 0 },
  });

  // Keep ui state synced when url changes (Back button)
  useEffect(() => {
    setUi(buildFilterStateFromUrl(searchParams));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString()]);

  const apiFilters = useMemo(() => {
    // Convert attrs object to { ram: "8GB,12GB", ... }
    const attr = {};
    Object.entries(ui.attrs || {}).forEach(([k, vals]) => {
      if (vals?.length) attr[k] = vals.join(",");
    });
    return cleanObject({
      keyword: ui.q || "",
      min_price: ui.min_price,
      max_price: ui.max_price,
      brand_ids: toCSV(ui.brands),
      colors: toCSV(ui.colors),
      attr, // <-- send as object, not string
      offset: ui.page,
      limit: ui.limit,
      sort: ui.sort,

      // route-based slugs:
      category_slug: levels.category_slug,
      sub_category_slug: levels.sub_category_slug,
      sub_sub_category_slug: levels.sub_sub_category_slug,
    });
  }, [ui, levels]);

  async function load() {
    setLoading(true);
    try {
      const data = await filterProducts(apiFilters);

      setProducts(data?.products || []);
      setTotal(Number(data?.total_size || 0));

      // Transform facets into meta structure
      if (data?.facets) {
        const transformedMeta = {
          brands: (data.facets.brands || []).map(b => ({
            value: String(b.id),
            label: b.name,
            count: b.count,
            image: b.image?.path
          })),
          colors: [], // Extract from attributes if needed
          attributes: (data.facets.attributes || []).map(attr => ({
            key: attr.key,
            title: attr.label,
            options: (attr.options || []).map(opt => ({
              value: opt.value,
              label: opt.value,
              count: opt.count
            }))
          })),
          categories: data.facets.categories || [],
          price: data.facets.price || { min: 0, max: 0 }
        };
        setMeta(transformedMeta);
      } else {
        setMeta(m => ({ ...m }));
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(apiFilters)]);

  function pushUrl(next) {
    const q = new URLSearchParams();

    if (next.q) q.set("q", next.q);
    if (next.min_price) q.set("min_price", String(next.min_price));
    if (next.max_price) q.set("max_price", String(next.max_price));
    if (next.brands?.length) q.set("brands", toCSV(next.brands));
    if (next.colors?.length) q.set("colors", toCSV(next.colors));

    const attrsStr = attrsToQuery(next.attrs);
    if (attrsStr) q.set("attrs", attrsStr);

    if (next.sort) q.set("sort", next.sort);
    if (next.page && next.page !== 1) q.set("page", String(next.page));
    if (next.limit && next.limit !== 12) q.set("limit", String(next.limit));

    const qs = q.toString();
    router.push(qs ? `?${qs}` : `?`);
  }

  // Handlers
  const onSetPrice = ({ min_price, max_price }) => {
    pushUrl({ ...ui, min_price, max_price, page: 1 });
  };

  const onToggleBrand = (id) => {
    const brands = ui.brands.includes(id)
      ? ui.brands.filter((x) => x !== id)
      : [...ui.brands, id];
    pushUrl({ ...ui, brands, page: 1 });
  };

  const onToggleColor = (c) => {
    const colors = ui.colors.includes(c)
      ? ui.colors.filter((x) => x !== c)
      : [...ui.colors, c];
    pushUrl({ ...ui, colors, page: 1 });
  };

  const onToggleAttr = (key, val) => {
    const cur = ui.attrs?.[key] || [];
    const nextVals = cur.includes(val) ? cur.filter((x) => x !== val) : [...cur, val];
    const nextAttrs = { ...(ui.attrs || {}) };
    if (nextVals.length) nextAttrs[key] = nextVals;
    else delete nextAttrs[key];
    pushUrl({ ...ui, attrs: nextAttrs, page: 1 });
  };

  const onReset = () => {
    pushUrl({
      q: ui.q || "",
      min_price: "",
      max_price: "",
      brands: [],
      colors: [],
      attrs: {},
      sort: "",
      page: 1,
      limit: 12,
    });
  };

  const onRemoveChip = (chip) => {
    if (chip.type === "price") return onSetPrice({ min_price: "", max_price: "" });
    if (chip.type === "brand") return onToggleBrand(chip.value);
    if (chip.type === "color") return onToggleColor(chip.value);
    if (chip.type === "attr") return onToggleAttr(chip.key, chip.value);
  };

  const totalPages = Math.max(1, Math.ceil(total / ui.limit));

  return (
    <div className="container py-4">
      <div className="row g-3">
        {/* Left Sidebar (Desktop/LG+) */}
        <div className="col-12 col-lg-3 d-none d-lg-block">
          <FilterSidebar
            meta={meta}
            state={ui}
            onSetPrice={onSetPrice}
            onToggleBrand={onToggleBrand}
            onToggleColor={onToggleColor}
            onToggleAttr={onToggleAttr}
            onReset={onReset}
            onRemoveChip={onRemoveChip}
            onToggleCategory={(slug)=>pushUrl({...ui,category:slug,page:1})}
            onToggleSub={(slug)=>pushUrl({...ui,sub_category:slug,page:1})}
            onToggleSubSub={(slug)=>pushUrl({...ui,sub_sub_category:slug,page:1})}
          />
        </div>

        {/* Main Content */}
        <div className="col-12 col-lg-9">
            <div className="d-md-none d-flex flex-column mb-3">
              <div className="fw-bold" style={{ fontSize: 18 }}>
                Products
              </div>
              <div className="text-muted small">
                Found: {total}
              </div>
            </div>
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div className="d-none d-md-flex flex-column">
              <div className="fw-bold" style={{ fontSize: 18 }}>
                Products
              </div>
              <div className="text-muted small">
                Found: {total}
              </div>
            </div>

            {/* Sort */}
            <select
              className="form-select"
              style={{ maxWidth: 260 }}
              value={ui.sort}
              onChange={(e) => pushUrl({ ...ui, sort: e.target.value, page: 1 })}
            >
              <option value="">Sort: Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
            </select>

            {/* Filter Button (Mobile only) */}
            <button
              className="btn btn-dark d-md-none d-flex align-items-center gap-2"
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              style={{ minWidth: 90 }}
            >
              <i className="fas fa-filter"></i>
              Filter
            </button>
          </div>

          {/* Grid */}
          {loading ? (
            <ProductSkeletonGrid />
          ) : products.length ? (
            <>
              <ProductGrid products={products} />
              <PaginationBar
                page={ui.page}
                totalPages={totalPages}
                onPage={(p) => pushUrl({ ...ui, page: p })}
              />
            </>
          ) : (
            <div className="bg-white border rounded-4 p-5 text-center text-muted">
              No products found.
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Sidebar */}
      {mobileFilterOpen && (
        <div className="d-lg-none">
          <div
            className="mobile-filter-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.35)",
              zIndex: 1200,
              transition: "background 0.2s",
            }}
            onClick={() => setMobileFilterOpen(false)}
          />
          <div
            className="mobile-filter-sidebar"
            style={{
              position: "fixed",
              top: 0,
              right: 0,
              width: "90vw",
              maxWidth: 340,
              height: "100vh",
              background: "#fff",
              zIndex: 1201,
              boxShadow: "-2px 0 16px rgba(0,0,0,0.08)",
              overflowY: "auto",
              transition: "right 0.2s",
              padding: 0,
            }}
          >
            <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
              <div className="fw-bold">Filter</div>
              <button
                className="btn btn-link text-dark fs-4 p-0"
                style={{ lineHeight: 1 }}
                onClick={() => setMobileFilterOpen(false)}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-3">
              <FilterSidebar
                meta={meta}
                state={ui}
                onSetPrice={onSetPrice}
                onToggleBrand={onToggleBrand}
                onToggleColor={onToggleColor}
                onToggleAttr={onToggleAttr}
                onReset={onReset}
                onRemoveChip={onRemoveChip}
                onToggleCategory={(slug)=>pushUrl({...ui,category:slug,page:1})}
                onToggleSub={(slug)=>pushUrl({...ui,sub_category:slug,page:1})}
                onToggleSubSub={(slug)=>pushUrl({...ui,sub_sub_category:slug,page:1})}
              />
            </div>
          </div>
          <style>{`
            .mobile-filter-overlay {
              animation: fadeInBg 0.2s;
            }
            .mobile-filter-sidebar {
              animation: slideInRight 0.2s;
            }
            @keyframes fadeInBg {
              from { background: rgba(0,0,0,0); }
              to { background: rgba(0,0,0,0.35); }
            }
            @keyframes slideInRight {
              from { right: -100vw; }
              to { right: 0; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
