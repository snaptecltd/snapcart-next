"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import ProductCard from "@/components/product/ProductCard";
import SectionTitle from "@/components/html/SectionTitle";
import { getFeaturedDealProducts } from "@/lib/api/global.service";

export default function FeaturedDeals() {
  const [deals, setDeals] = useState([]);
  const sliderRefs = useRef({}); // map of dealId -> DOM element

  const { data, error, isLoading } = useSWR(
    "featured-deal-products",
    getFeaturedDealProducts,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 30,
    }
  );

  useEffect(() => {
    if (data) {
      setDeals(Array.isArray(data) ? data : []);
    }
  }, [data]);

  const scrollByCards = (dealId, dir = 1) => {
    const el = sliderRefs.current[dealId];
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  if (isLoading) return null;
  if (error) return <div>Error fetching data</div>;
  if (!deals || deals.length === 0) return <div>No featured deals found</div>;

  return (
    <section className="py-4 py-md-5">
      <div className="container">
        {deals.map((deal) => (
          <div key={`deal-${deal.id}`} className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <SectionTitle first={deal.title} highlight="" />
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-light border rounded-circle"
                  aria-label="Previous"
                  onClick={() => scrollByCards(deal.id, -1)}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button
                  type="button"
                  className="btn btn-dark rounded-circle"
                  aria-label="Next"
                  onClick={() => scrollByCards(deal.id, 1)}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>

            <div
              className="d-flex gap-3 overflow-auto py-4 hide-scrollbar"
              style={{ scrollSnapType: "x mandatory", WebkitOverflowScrolling: "touch" }}
              ref={(el) => (sliderRefs.current[deal.id] = el)}
            >
              {(deal.products || []).map((product) => (
                <div
                  key={`product-${deal.id}-${product.id}`}
                  style={{
                    minWidth: 260,
                    maxWidth: 260,
                    scrollSnapAlign: "start",
                  }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
