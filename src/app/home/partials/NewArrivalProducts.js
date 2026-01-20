"use client";

import { useState, useRef, useEffect } from "react";
import useSWR from "swr";
import ProductCard from "@/components/product/ProductCard"; // Assuming this is the default product card
import SectionTitle from "@/components/html/SectionTitle";
import { getNewArrivalProducts } from "@/lib/api/global.service";

export default function NewArrivalProducts() {
  const [products, setProducts] = useState([]);
  const sliderRef = useRef(null);
  // Fetch the New Arrival products data
  const { data, error, isLoading } = useSWR(
    "new-arrival-products",
    getNewArrivalProducts,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 30, // 30 mins cache
    }
  );

  useEffect(() => {
    if (data) {
      setProducts(data.products); // Assign the array of products to the state
    }
  }, [data]);

  const scrollByCards = (dir = 1) => {
    const el = sliderRef.current;
    if (!el) return;
    // visible width অনুযায়ী scroll
    const amount = Math.round(el.clientWidth * 0.9) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  // Handle loading, error, or no data
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching data</div>;
  if (!products || products.length === 0) return <div>No products found</div>;

  return (
    <section className="py-4 py-md-5">
      <div className="container">
        {/* New Arrival Products Section */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <SectionTitle first="New" highlight="Arrivals" />

          {/* You can add additional controls like left and right arrows here */}
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-light border rounded-circle"
              aria-label="Previous"
              onClick={() => scrollByCards(-1)}
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button
              type="button"
              className="btn btn-dark rounded-circle"
              aria-label="Next"
              onClick={() => scrollByCards(1)}
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>

        {/* Product Cards Slider */}
        <div
          className="d-flex gap-3 overflow-auto py-4 hide-scrollbar"
          style={{
            scrollSnapType: "x mandatory",
            WebkitOverflowScrolling: "touch",
          }}
          ref={sliderRef}
        >
          {products.map((product) => (
            <div
              key={product.id}
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
    </section>
  );
}
