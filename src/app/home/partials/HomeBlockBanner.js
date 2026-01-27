"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import Link from "next/link";
import { getHomeBlockBanner } from "@/lib/api/global.service";

export default function HomeBlockBanner() {
  const [banner, setBanner] = useState(null);

  // Fetch the home block banner data
    const { data, error, isLoading } = useSWR(
        "home-block-banner",
        getHomeBlockBanner,
        {
            revalidateOnFocus: false,
            dedupingInterval: 1000 * 60 * 30, // 30 mins cache
        }
    );
  useEffect(() => {
    if (data) {
      setBanner(data); // Store the banner data in the state
    }
  }, [data]);

  // Handle loading, error, or no data
  if (isLoading) return null;
  if (error) return <div>Error fetching banner</div>;
  if (!banner) return <div>No banner found</div>;

  return (
    <section className="py-4">
      <div className="container">
        {/* Home Block Banner */}
        {banner?.photo_full_url?.path && (
          <div className="d-flex justify-content-center align-items-center">
            <div className="position-relative overflow-hidden rounded-3">
              <img
                src={banner.photo_full_url.path}
                alt={banner.title || "Home Block Banner"}
                className="w-100"
                style={{ objectFit: "cover", height: "auto" }}
              />
              {/* Optional: Add a clickable link */}
              {banner.url && (
                <Link
                  href={banner.url}
                  className="position-absolute top-50 start-50 translate-middle text-decoration-none text-light"
                  style={{
                    background: "rgba(0, 0, 0, 0.5)",
                    padding: "10px 20px",
                    borderRadius: "5px",
                  }}
                >
                  Shop Now
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
