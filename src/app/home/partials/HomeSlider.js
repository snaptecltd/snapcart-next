"use client";

import Link from "next/link";
import useSWR from "swr";
import { getMainBanners } from "@/lib/api/global.service";

const fetcher = () => getMainBanners();

function Skeleton() {
  return (
    <div className="row g-3 mb-3 align-items-stretch">
      {/* LEFT: Skeleton Carousel */}
      <div className="col-12 col-md-8 col-lg-8 d-flex">
        <div
          className="rounded-3 w-100"
          style={{
            aspectRatio: "16/7",
            background: "#f3f3f3",
            minHeight: 320,
            height: "100%",
          }}
        />
      </div>
      {/* RIGHT: Skeleton Side Banners */}
      <div className="col-12 col-md-4 col-lg-4 d-flex flex-column gap-3 justify-content-between" style={{ height: "100%" }}>
        <div className="d-flex flex-column gap-3 h-100" style={{ height: "100%" }}>
          <div
            className="rounded-3 w-100 flex-fill"
            style={{
              aspectRatio: "16/7",
              background: "#f3f3f3",
              minHeight: 0,
              height: "calc(50% - 0.75rem)",
            }}
          />
          <div
            className="rounded-3 w-100 flex-fill"
            style={{
              aspectRatio: "16/7",
              background: "#f3f3f3",
              minHeight: 0,
              height: "calc(50% - 0.75rem)",
            }}
          />
        </div>
      </div>
    </div>
  );
}

export default function HomeSlider() {
  const { data, isLoading } = useSWR("main-banners", fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 1800000, // 30 minutes
  });

  if (isLoading || !data || !data.sliders || !data.sidebanners) {
    return <Skeleton />;
  }

  // Handle sliders: can be array or object
  const sliders = Array.isArray(data.sliders)
    ? data.sliders
    : data.sliders
      ? [data.sliders]
      : [];
  const sidebanners = Object.values(data.sidebanners || {}).slice(0, 2);

  // If no banners, show skeleton
  if (sliders.length === 0 || sidebanners.length < 2) {
    return <Skeleton />;
  }

  return (
    <div className="row g-3 mb-3">

      {/* LEFT: Carousel */}
      <div className="col-12 col-md-8 col-lg-8">
        <div
          id="homeCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="4000"
          style={{ minHeight: '220px' }}
        >
          <div className="carousel-inner rounded-3 h-100">
            {sliders.map((slide, idx) => (
              <div
                key={idx}
                className={`carousel-item${idx === 0 ? " active" : ""} h-100`}
              >
                <Link href="/" className="d-block h-100">
                  <div className="position-relative w-100 h-100">
                    <img
                      src={slide.photo_full_url?.path || "/slider1.webp"}
                      alt={slide.title || "Banner"}
                      className="rounded-3"
                      style={{
                        width: "100%",
                        height: "100%",
                        maxWidth: "991px",
                        objectFit: "cover",
                        display: "block",
                        position: "static",
                      }}
                    />
                  </div>
                </Link>
              </div>
            ))}
          </div>
          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#homeCarousel"
            data-bs-slide="prev"
          >
            <span className="carousel-control-prev-icon"></span>
          </button>

          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#homeCarousel"
            data-bs-slide="next"
          >
            <span className="carousel-control-next-icon"></span>
          </button>
        </div>
      </div>

      {/* RIGHT: Two Banners */}
      <div className="col-12 col-md-4 col-lg-4 d-flex flex-column gap-3">
        <div className="d-flex flex-column gap-3">          
          {sidebanners.map((banner, idx) => (
          <Link href="/product/galaxy-watch" className="flex-fill" key={banner.id}>
            <div className="position-relative w-100 home-slider-banner">
              <img
                src={banner.photo_full_url?.path || "/side1.webp"}
                alt="Galaxy Watch"
                className="rounded-3 object-fit-cover"
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  display: "block",
                  position: "static",
                }}
              />
            </div>
          </Link>          
        ))}
        </div>
      </div>

    </div>
  );
}