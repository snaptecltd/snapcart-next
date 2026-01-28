"use client";
import { useEffect, useState } from "react";
import { getSearchedProducts, getProductDetails } from "@/lib/api/global.service";
import Link from "next/link";

const LOCAL_KEY = "snapcart_compare_products";
const MAX_COMPARE = 3;

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}

function getSpecMap(product) {
  // Returns { specName: value, ... }
  const map = {};
  (product?.specifications || []).forEach((s) => {
    if (s?.name && s?.pivot?.value) map[s.name] = s.pivot.value;
  });
  return map;
}

export default function ComparePage() {
  const [compare, setCompare] = useState([null, null, null]);
  const [search, setSearch] = useState(["", "", ""]);
  const [searchResults, setSearchResults] = useState([[], [], []]);
  const [loading, setLoading] = useState([false, false, false]);
  const [specList, setSpecList] = useState([]);

  // Load compare from localStorage
  useEffect(() => {
    let stored = [];
    try {
      stored = JSON.parse(localStorage.getItem(LOCAL_KEY) || "[]");
    } catch {}
    // Always 3 slots
    setCompare([
      stored[0] || null,
      stored[1] || null,
      stored[2] || null,
    ]);
  }, []);

  // Save compare to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_KEY, JSON.stringify(compare));
    // Update spec list
    const allSpecs = compare
      .filter(Boolean)
      .flatMap((p) => (p.specifications || []).map((s) => s.name));
    setSpecList([...new Set(allSpecs)]);
  }, [compare]);

  // Search handler
  const handleSearch = async (idx, val) => {
    setSearch((s) => {
      const arr = [...s];
      arr[idx] = val;
      return arr;
    });
    if (!val) {
      setSearchResults((r) => {
        const arr = [...r];
        arr[idx] = [];
        return arr;
      });
      return;
    }
    setLoading((l) => {
      const arr = [...l];
      arr[idx] = true;
      return arr;
    });
    try {
      const res = await getSearchedProducts(val);
      setSearchResults((r) => {
        const arr = [...r];
        arr[idx] = res.products || [];
        return arr;
      });
    } finally {
      setLoading((l) => {
        const arr = [...l];
        arr[idx] = false;
        return arr;
      });
    }
  };

  // Add product to compare
  const handleAdd = async (idx, product) => {
    // Fetch full details for specs
    const details = await getProductDetails(product.slug);
    setCompare((c) => {
      const arr = [...c];
      arr[idx] = details;
      return arr;
    });
    setSearch((s) => {
      const arr = [...s];
      arr[idx] = "";
      return arr;
    });
    setSearchResults((r) => {
      const arr = [...r];
      arr[idx] = [];
      return arr;
    });
  };

  // Remove product from compare
  const handleRemove = (idx) => {
    setCompare((c) => {
      const arr = [...c];
      arr[idx] = null;
      return arr;
    });
  };

  // Responsive: stack on mobile, 3 columns on desktop
  return (
    <div className="container py-4">
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb">
          <li className="breadcrumb-item"><Link href="/">Home</Link></li>
          <li className="breadcrumb-item active" aria-current="page">Compare</li>
        </ol>
      </nav>
      <h1 className="fw-bold mb-4" style={{ fontSize: 36 }}>Compare Selected Product</h1>
      <div className="row g-0 mb-4 rounded-4 overflow-hidden shadow-sm bg-white">
        {/* Left info panel */}
        <div className="col-12 col-lg-3 border-end p-4 d-flex flex-column justify-content-center" style={{ minHeight: 320 }}>
          <h5 className="fw-bold mb-2">Compare Products</h5>
          <div className="text-muted mb-2" style={{ fontSize: 15 }}>
            Find and select products to see the differences and similarities between them
          </div>
        </div>
        {/* Compare columns */}
        <div className="col-12 col-lg-9">
          <div className="row g-0">
            {[0, 1, 2].map((idx) => (
              <div key={idx} className="col-12 col-md-4 border-end p-3 d-flex flex-column align-items-center" style={{ minHeight: 320 }}>
                {/* Search bar */}
                {!compare[idx] && (
                  <div className="w-100 mb-3">
                    <input
                      className="form-control rounded-pill px-3"
                      placeholder="Search..."
                      value={search[idx]}
                      onChange={(e) => handleSearch(idx, e.target.value)}
                      style={{ fontSize: 15 }}
                    />
                    {loading[idx] && <div className="small text-muted mt-1">Searching...</div>}
                    {searchResults[idx]?.length > 0 && (
                      <div className="list-group position-absolute w-100 z-3" style={{ maxHeight: 220, overflowY: "auto" }}>
                        {searchResults[idx].map((p) => (
                          <button
                            key={p.id}
                            className="list-group-item list-group-item-action"
                            onClick={() => handleAdd(idx, p)}
                          >
                            <div className="d-flex align-items-center gap-2">
                              <img src={p.thumbnail_full_url?.path || "/placeholder.png"} alt={p.name} style={{ width: 36, height: 36, objectFit: "cover", borderRadius: 6 }} />
                              <span>{p.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
                {/* Product card */}
                {compare[idx] && (
                  <div className="w-100 text-center">
                    <img
                      src={compare[idx].thumbnail_full_url?.path || "/placeholder.png"}
                      alt={compare[idx].name}
                      style={{ width: 100, height: 100, objectFit: "contain", borderRadius: 12, background: "#fafafa" }}
                    />
                    <div className="fw-semibold mt-2 mb-1">{compare[idx].name}</div>
                    <div className="mb-2">
                      <span className="fw-bold" style={{ fontSize: 18 }}>{moneyBDT(compare[idx].unit_price)}</span>
                      {compare[idx].discount > 0 && (
                        <span className="text-muted ms-2 text-decoration-line-through" style={{ fontSize: 15 }}>
                          {moneyBDT(compare[idx].unit_price + (compare[idx].discount_type === "flat" ? compare[idx].discount : Math.round(compare[idx].unit_price * compare[idx].discount / 100)))}
                        </span>
                      )}
                    </div>
                    <div className="d-flex justify-content-center gap-2 mb-2">
                      <button className="btn btn-outline-secondary rounded-pill px-3" onClick={() => handleRemove(idx)}>
                        Remove
                      </button>
                      <Link href={`/product/${compare[idx].slug}`} className="btn btn-warning rounded-pill px-3 text-white" style={{ background: "#F67535" }}>
                        Shop Now
                      </Link>
                    </div>
                  </div>
                )}
                {/* Empty slot */}
                {!compare[idx] && (
                  <div className="text-muted text-center mt-4" style={{ fontSize: 15 }}>
                    Select a product to compare
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Comparison Table */}
      {specList.length > 0 && (
        <div className="table-responsive">
          <table className="table table-bordered align-middle bg-white">
            <thead>
              <tr>
                <th className="bg-light" style={{ width: "25%" }}>Specification</th>
                {[0, 1, 2].map((idx) => (
                  <th key={idx} className="bg-light text-center" style={{ width: "25%" }}>
                    {compare[idx]?.name || "-"}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {specList.map((spec) => (
                <tr key={spec}>
                  <td className="fw-semibold">{spec}</td>
                  {[0, 1, 2].map((idx) => (
                    <td key={idx} className="text-center">
                      {getSpecMap(compare[idx])[spec] || <span className="text-muted">-</span>}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <style>{`
        .list-group.position-absolute {
          left: 0;
          right: 0;
          top: 48px;
        }
        @media (max-width: 991.98px) {
          .row.g-0 > .col-md-4 {
            border-right: none !important;
            border-bottom: 1px solid #eee;
          }
        }
        @media (max-width: 767.98px) {
          .row.g-0 > .col-md-4 {
            min-height: 220px;
          }
        }
      `}</style>
    </div>
  );
}
