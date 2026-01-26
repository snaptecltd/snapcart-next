"use client";

import { useMemo, useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { getNavCategories } from "@/lib/api/global.service";
import SectionTitle from "@/components/html/SectionTitle";

export default function HomeCategories() {
  const { data, error, isLoading } = useSWR("nav-categories-home", getNavCategories, {
    revalidateOnFocus: false,
    dedupingInterval: 1000 * 60 * 30,
  });

  const [showAllMobile, setShowAllMobile] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport (Bootstrap md breakpoint: 768px)
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const featured = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.data ?? [];
    return list
      .filter((c) => Number(c.home_status) === 1)
      .sort((a, b) => (a.priority ?? 999) - (b.priority ?? 999));
  }, [data]);

  if (isLoading) return null;
  if (error) return null;
  if (!featured.length) return null;

  const MOBILE_LIMIT = 6;
  const shouldLimit = isMobile && !showAllMobile && featured.length > MOBILE_LIMIT;
  const visibleItems = shouldLimit ? featured.slice(0, MOBILE_LIMIT) : featured;

  return (
    <section className="py-3">
      <div className="container">
        <SectionTitle first="Feature" highlight="Categories" />

        {/* Grid */}
        <div className="row g-4 g-md-5 row-cols-3 row-cols-sm-4 row-cols-md-6 row-cols-lg-8">
          {visibleItems.map((cat) => {
            const icon = cat?.icon_full_url?.path;
            const href = `/${cat.slug}`;

            return (
              <div key={cat.id} className="col">
                <Link
                  href={href}
                  className="text-decoration-none d-flex flex-column align-items-center text-center"
                >
                  <div
                    className="d-flex align-items-center justify-content-center"
                    style={{ width: 56, height: 56 }}
                  >
                    {icon ? (
                      <img
                        src={icon}
                        alt={cat.name}
                        width="44"
                        height="44"
                        style={{ objectFit: "contain" }}
                        loading="lazy"
                      />
                    ) : (
                      <div className="border rounded-3" style={{ width: 44, height: 44 }} />
                    )}
                  </div>

                  <div className="mt-2 small text-dark fw-medium">{cat.name}</div>
                </Link>
              </div>
            );
          })}
        </div>

        {/* Show more/less (ONLY mobile) */}
        {isMobile && featured.length > MOBILE_LIMIT && (
          <div className="text-center mt-3">
            <button
              type="button"
              className="btn btn-outline-dark btn-sm rounded-pill px-4"
              onClick={() => setShowAllMobile((prev) => !prev)}
            >
              {showAllMobile ? "Show less" : "Show more"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
