"use client";

import { useMemo, useState, useEffect, useRef } from "react";
import useSWR from "swr";
import Link from "next/link";
import { getBrands } from "@/lib/api/global.service";
import SectionTitle from "@/components/html/SectionTitle";
import ProductCard from "@/components/product/ProductCard";

export default function Brands() {
  const [selectedBrandId, setSelectedBrandId] = useState(null);
  const [brandImagesLoaded, setBrandImagesLoaded] = useState(false);

  // Fetching brands data using useSWR
  const { data, error, isLoading } = useSWR("brands", getBrands, {
    revalidateOnFocus: false,
    dedupingInterval: 1000 * 60 * 30, // 30 minutes cache
  });

  // Hydration error fix: only allow brand images to load on the client side
  useEffect(() => {
    setBrandImagesLoaded(true);
  }, []);

  // Handle loading, error, or no data
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error fetching brands</div>;
  if (!data || !data.brands) return <div>No brands found</div>;

  // Function to handle brand selection and fetch its products
  const handleBrandClick = (brandId) => {
    setSelectedBrandId(brandId);
  };

  // Fetch the products for the selected brand
  const selectedBrand = data.brands.find((brand) => brand.id === selectedBrandId);
  const products = selectedBrand ? selectedBrand.products : [];

  // Refs for horizontal scrollable sections
  const brandSliderRef = useRef(null);
  const productSliderRef = useRef(null);

  // Scroll by cards function
  const scrollByCards = (sliderRef, dir = 1) => {
    const el = sliderRef.current;
    if (!el) return;
    const amount = Math.round(el.clientWidth * 0.9) * dir;
    el.scrollBy({ left: amount, behavior: "smooth" });
  };

  return (
    <section className="py-4">
      <div className="container">
        {/* Section Title for Brands */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <SectionTitle first="Shop By" highlight="Brands" />
          <div className="d-flex gap-2">
            <button
              type="button"
              className="btn btn-light border rounded-circle"
              aria-label="Previous"
              onClick={() => scrollByCards(brandSliderRef, -1)}
            >
              <i className="fa-solid fa-chevron-left" />
            </button>
            <button
              type="button"
              className="btn btn-dark rounded-circle"
              aria-label="Next"
              onClick={() => scrollByCards(brandSliderRef, 1)}
            >
              <i className="fa-solid fa-chevron-right" />
            </button>
          </div>
        </div>

        {/* Brands Navbar with horizontal scroll */}
        <div className="d-flex gap-3 overflow-auto pb-2 hide-scrollbar" ref={brandSliderRef}>
          {data.brands.map((brand) => (
            <div key={brand.id} style={{ minWidth: 120, maxWidth: 120 }}>
              <button
                className="btn btn-light border rounded-pill"
                onClick={() => handleBrandClick(brand.id)}
              >
                {brandImagesLoaded && brand.image_full_url && (
                  <img
                    src={brand.image_full_url.path}
                    alt={brand.name}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "contain",
                      display: "block",
                    }}
                  />
                )}
              </button>
            </div>
          ))}
        </div>

        {/* Product Cards for the selected brand */}
        {selectedBrandId && (
          <div className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
            <h5 className="fw-semibold mb-3">Products from {selectedBrand.name}</h5>
              <div className="d-flex gap-2">
                <button
                  type="button"
                  className="btn btn-light border rounded-circle"
                  aria-label="Previous"
                  onClick={() => scrollByCards(productSliderRef, -1)}
                >
                  <i className="fa-solid fa-chevron-left" />
                </button>
                <button
                  type="button"
                  className="btn btn-dark rounded-circle"
                  aria-label="Next"
                  onClick={() => scrollByCards(productSliderRef, 1)}
                >
                  <i className="fa-solid fa-chevron-right" />
                </button>
              </div>
            </div>
            <div
              className="d-flex gap-3 overflow-auto pb-2 hide-scrollbar"
              ref={productSliderRef}
              style={{
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
              }}
            >
              {products.map((product) => (
                <div key={product.id} style={{ minWidth: 260, maxWidth: 260 }}>
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
