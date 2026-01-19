"use client";

import useSWR from "swr";
import { getCompanyLiabilities } from "@/lib/api/global.service";

// icon map based on item keys from API
const ICON_MAP = {
  delivery_info: "fa-truck-fast",
  safe_payment: "fa-shield-halved",
  return_policy: "fa-rotate-left",
  authentic_product: "fa-circle-check",
  emi: "fa-calculator",
  exchange: "fa-right-left",
  best_price: "fa-tags",
  after_sell: "fa-headset",
};

export default function CompanyLiability() {
  const { data, error, isLoading } = useSWR(
    "company-liabilities",
    getCompanyLiabilities,
    {
      revalidateOnFocus: false,
      dedupingInterval: 1000 * 60 * 30, // 30 min cache
    }
  );

  const list = Array.isArray(data) ? data : data?.data ?? [];
  const items = list.filter((x) => Number(x.status) === 1);

  if (isLoading) return null; // skeleton can be added here
  if (error) return null;
  if (!items.length) return null;

  return (
    <section className="py-3">
      <div className="container p-0">
        {/* Outer rounded box */}
        <div className="border rounded-4 bg-white px-3 px-md-4 py-3 shadow-sm">
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-between gap-3 gap-md-4">
            {items.map((it, idx) => {
              const icon = ICON_MAP[it.item] || "fa-star";

              return (
                <div
                  key={`${it.item}-${idx}`}
                  className="d-flex align-items-center gap-2 gap-md-3"
                  style={{ minWidth: "220px" }}
                >
                  {/* Icon circle */}
                  <span
                    className="d-inline-flex align-items-center justify-content-center rounded-circle border"
                    style={{
                      width: 40,
                      height: 40,
                      flex: "0 0 40px",
                    }}
                  >
                    {/* if image from api then can show here iamge */}
                    {it.image ? (
                      // if image is external/local then next/image na diye simple img is safe
                      <img
                        src={it.image}
                        alt={it.title || "icon"}
                        width="22"
                        height="22"
                        style={{ objectFit: "contain" }}
                      />
                    ) : (
                      <i className={`fa-solid ${icon}`} />
                    )}
                  </span>

                  {/* Text */}
                  <div className="small fw-semibold text-dark" style={{ lineHeight: 1.2 }}>
                    {it.title}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
