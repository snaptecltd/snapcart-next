"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import ProductCard from "@/components/product/ProductCard";
import SectionTitle from "@/components/html/SectionTitle";
import { getDealOfTheDay } from "@/lib/api/global.service";
import ProductCardType2 from "@/components/product/ProductCardType2";

export default function DealOfTheDay() {
  const [banner, setBanner] = useState(null);
  const [products, setProducts] = useState([]);

  // Fetch the deal of the day data
  const { data, error, isLoading } = useSWR(
    "deal-of-the-day",
    getDealOfTheDay,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 30,
    }
  );

  useEffect(() => {
    if (data) {
      setBanner(data.banner);
      setProducts(data.products); // Assign the array of products to the state
    }
  }, [data]);

  // Handle loading, error, or no data
  if (isLoading) return null;
  if (error) return <div>Error fetching data</div>;
  if (!products || products.length === 0) return null;

  return (
    <section className="py-3">
      <div className="container">
        {/* Deal of the Day Section */}
        <div className="row align-items-start">
          {/* Deal Banner - Left Side */}
          {banner && banner.photo && (
            <div className="col-12 col-md-6 mb-4">
              <div
                className="position-relative overflow-hidden rounded-3 shadow-sm"
                style={{ height: "100%" }}
              >
                <img
                  src={banner.photo_full_url.path}
                  alt="Deal of the Day Banner"
                  className="w-100"
                  style={{ objectFit: "cover", height: "100%" }}
                />
              </div>
            </div>
          )}

          {/* Product Cards - Right Side */}
          <div className="col-12 col-md-6 mb-4" style={{ height: "100%" }}>
            <SectionTitle first="🔥" highlight="Deals of The Day" />
            <div className="dealofdayProductCard-wrapper">
              <div
                className="d-flex flex-column gap-4"
                style={{
                  maxHeight: "calc(100vh - 50px)", // Optional: restrict height for demo purposes
                  overflowY: "auto",
                }}
              >
                {/* Loop through products and display ProductCardType2 for each */}
                {products.map((product) => (
                  <ProductCardType2 key={product.product.id} product={product.product} />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fallback - if no banner, show product cards */}
        {!banner && (
          <div className="d-flex gap-3">
            <SectionTitle first="Featured" highlight="Products" />
            <div className="d-flex flex-column gap-3">
              {products.map((product) => (
                <ProductCardType2 key={product.product.id} product={product.product} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
