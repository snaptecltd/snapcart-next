"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import ProductCard from "@/components/product/ProductCard";
import SectionTitle from "@/components/html/SectionTitle";
import ProductCardSkeleton from "@/components/skeleton/ProductCardSkeleton";
import {
  getFeaturedProducts,
  getBestSellingProducts,
  getTopRatedProducts,
} from "@/lib/api/global.service";
import { useRouter } from "next/navigation";

const TABS = [
  { key: "featured", label: "BEST DEALS", fetcher: getFeaturedProducts },
  { key: "best_selling", label: "TOP SELLING", fetcher: getBestSellingProducts },
  { key: "top_rated", label: "TOP RATED", fetcher: getTopRatedProducts },
];

export default function FeaturedProducts() {
  // --- Add router and hash/tab sync logic ---
  const router = useRouter();
  const [active, setActive] = useState("featured");
  const sliderRef = useRef(null);

  // Sync tab with hash in URL on mount and hashchange
  useEffect(() => {
    const syncTabWithHash = () => {
      if (typeof window === "undefined") return;
      const hash = window.location.hash.replace(/^#/, "");
      if (hash && hash.startsWith("products-")) {
        const tabKey = hash.replace("products-", "");
        if (TABS.some((t) => t.key === tabKey)) setActive(tabKey);
      }
    };
    syncTabWithHash();
    window.addEventListener("hashchange", syncTabWithHash);
    return () => window.removeEventListener("hashchange", syncTabWithHash);
  }, []);

  // When tab changes, update hash in URL
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.location.hash = `products-${active}`;
    }
  }, [active]);

  const activeTab = useMemo(() => TABS.find((t) => t.key === active) ?? TABS[0], [active]);

  const { data, error, isLoading } = useSWR(
    ["home-products", activeTab.key],
    () => activeTab.fetcher(),
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 10,
    }
  );

  // API response: {products: [...]}
  const products = data?.products ?? [];

  const scrollByCards = (dir = 1) => {
    const el = sliderRef.current;
    if (!el) return;
    // visible width অনুযায়ী scroll
    const amount = Math.round(el.clientWidth * 0.9) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="py-4 py-md-5">
      <div
        className="container"
        id={`products-${activeTab.key}`}
      >
        {/* Header row: Title + arrows */}
        <div className="d-flex align-items-start justify-content-between gap-3">
          <SectionTitle first="Featured" highlight="Products" />

          <div className="d-flex gap-2 mt-2">
            <button
              type="button"
              className="btn btn-light border rounded-circle"
              onClick={() => scrollByCards(-1)}
              aria-label="Previous"
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button
              type="button"
              className="btn btn-dark rounded-circle"
              onClick={() => scrollByCards(1)}
              aria-label="Next"
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 mb-4 flex-wrap">
          {TABS.map((t) => {
            const isActive = t.key === active;
            return (
              <button
                key={t.key}
                type="button"
                className={`btn btn-sm rounded-pill px-4 ${
                  isActive ? "btn-dark" : "btn-light border"
                }`}
                onClick={() => setActive(t.key)}
                id={`tab-${t.key}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Loading / Error */}
        {isLoading && <ProductCardSkeleton count={5} />}
        {error && <div className="text-danger">Failed to load products</div>}

        {/* Slider */}
        {!isLoading && !error && (
          <div
            ref={sliderRef}
            className="d-flex gap-3 overflow-auto py-4 hide-scrollbar"
            style={{
              scrollSnapType: "x mandatory",
              WebkitOverflowScrolling: "touch",
            }}
          >
            {products.map((p) => (
              <div
                key={p.id}
                style={{
                  minWidth: 260,
                  maxWidth: 260,
                  scrollSnapAlign: "start",
                }}
              >
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
