"use client";

import ProductCard from "./ProductCard";

export default function ProductGrid({ products = [] }) {
  return (
    <div className="row g-3">
      {products.map((p) => (
        <div key={p.id} className="col-6 col-md-4 col-lg-3">
          <ProductCard p={p} />
        </div>
      ))}
    </div>
  );
}
