"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import FilterSidebar from "@/components/shop/filters/FilterSidebar";
import ProductGrid from "@/components/shop/products/ProductGrid";
import ProductSkeletonGrid from "@/components/shop/products/ProductSkeletonGrid";
import PaginationBar from "@/components/shop/products/PaginationBar";
import { filterProducts } from "@/lib/api/global.service";
import { cleanObject, parseCSV, toCSV } from "@/lib/utils/qs";

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
    return cleanObject({
      keyword: ui.q || "",
      min_price: ui.min_price,
      max_price: ui.max_price,
      brand_ids: toCSV(ui.brands),
      colors: toCSV(ui.colors),
      attrs: attrsToQuery(ui.attrs),
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
          colors: [],
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
        {/* Left Sidebar */}
        <div className="col-12 col-lg-3">
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
          <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3">
            <div>
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
    </div>
  );
}
