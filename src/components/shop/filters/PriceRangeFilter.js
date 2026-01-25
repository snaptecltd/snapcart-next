"use client";

import { useEffect, useState } from "react";

export default function PriceRangeFilter({ value, onChange }) {
  const [min, setMin] = useState(value?.min_price ?? "");
  const [max, setMax] = useState(value?.max_price ?? "");

  useEffect(() => {
    setMin(value?.min_price ?? "");
    setMax(value?.max_price ?? "");
  }, [value?.min_price, value?.max_price]);

  return (
    <div className="border rounded-4 p-3 bg-white">
      <div className="fw-bold mb-2">Price Range</div>
      <div className="d-flex gap-2">
        <input
          className="form-control"
          placeholder="Min"
          value={min}
          onChange={(e) => setMin(e.target.value)}
          inputMode="numeric"
        />
        <input
          className="form-control"
          placeholder="Max"
          value={max}
          onChange={(e) => setMax(e.target.value)}
          inputMode="numeric"
        />
      </div>

      <button
        className="btn btn-dark w-100 mt-2 rounded-pill"
        onClick={() =>
          onChange({
            min_price: min ? Number(min) : "",
            max_price: max ? Number(max) : "",
          })
        }
      >
        Apply
      </button>
    </div>
  );
}
