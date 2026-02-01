"use client";

import Link from "next/link";
import useSWR from "swr";
import { getMainBanners } from "@/lib/api/global.service";
import { useEffect, useRef, useState } from "react";
import { useSwipeable } from "react-swipeable";

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

  const [isClient, setIsClient] = useState(false);
  const carouselRef = useRef(null);

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Initialize Bootstrap carousel only on client side
  useEffect(() => {
    if (!isClient || !carouselRef.current) return;

    const initCarousel = async () => {
      const { Carousel } = await import('bootstrap');
      const carouselElement = carouselRef.current;
      
      if (carouselElement) {
        const carousel = new Carousel(carouselElement, {
          interval: 4000,
          ride: 'carousel'
        });
        
        // Cleanup on unmount
        return () => {
          carousel.dispose();
        };
      }
    };

    initCarousel();
  }, [isClient]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (carouselRef.current) {
        const nextBtn = carouselRef.current.querySelector("[data-bs-slide='next']");
        if (nextBtn) nextBtn.click();
      }
    },
    onSwipedRight: () => {
      if (carouselRef.current) {
        const prevBtn = carouselRef.current.querySelector("[data-bs-slide='prev']");
        if (prevBtn) prevBtn.click();
      }
    },
    trackMouse: true,
    preventScrollOnSwipe: true,
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
    <>
      {/* Custom styles for carousel controls and indicators */}
      <style jsx>{`
        .custom-carousel-control {
          width: 2rem;
          height: 2rem;
          background: rgb(255 255 255);
          border-radius: 50%;
          top: 50%;
          transform: translateY(-50%);
          opacity: 1 !important;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e0e0e0;
          transition: background 0.2s;
        }
        .custom-carousel-control:hover {
          background: #f3f3f3;
        }
        .carousel-control-prev {
          left: 16px;
        }
        .carousel-control-next {
          right: 16px;
        }
        .carousel-indicators {
          position: absolute;
          bottom: 12px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2;
        }
        .carousel-indicators [data-bs-target] {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #bbb;
          margin: 0 4px;
          border: none;
          opacity: 1;
          transition: background 0.2s;
        }
        .carousel-indicators .active {
          background: #333;
        }
      `}</style>
      
      <div className="row g-3 mb-3">
        {/* LEFT: Carousel */}
        <div className="col-12 col-md-8 col-lg-8">
          <div
            {...handlers}
            ref={carouselRef}
            id="homeCarousel"
            className="carousel slide position-relative"
            data-bs-ride="carousel"
            style={{
              minHeight: "220px",
              cursor: "grab",
              userSelect: "none",
            }}
          >
            <div className="carousel-inner rounded-3 h-100">
              {sliders.map((slide, idx) => (
                <div
                  key={idx}
                  className={`carousel-item${idx === 0 ? " active" : ""} h-100`}
                >
                  <Link href={slide.link || "/"} className="d-block h-100">
                    <div className="position-relative w-100 h-100">
                      <img
                        src={slide.photo_full_url?.path || "/slider1.webp"}
                        alt={slide.title || "Banner"}
                        className="rounded-3"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = "/slider1.webp";
                        }}
                      />
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            {/* Carousel Indicators (dots at the bottom) */}
            <div className="carousel-indicators">
              {sliders.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  data-bs-target="#homeCarousel"
                  data-bs-slide-to={idx}
                  className={idx === 0 ? "active" : ""}
                  aria-current={idx === 0 ? "true" : undefined}
                  aria-label={`Slide ${idx + 1}`}
                />
              ))}
            </div>

            {/* Custom round and always visible controls */}
            <button
              className="carousel-control-prev custom-carousel-control"
              type="button"
              data-bs-target="#homeCarousel"
              data-bs-slide="prev"
              aria-label="Previous"
            >
              <i className="fa-solid fa-chevron-left" style={{ color: "#292929" }}></i>
            </button>

            <button
              className="carousel-control-next custom-carousel-control"
              type="button"
              data-bs-target="#homeCarousel"
              data-bs-slide="next"
              aria-label="Next"
            >
              <i className="fa-solid fa-chevron-right" style={{ color: "#292929" }}></i>
            </button>
          </div>
        </div>

        {/* RIGHT: Two Banners */}
        <div className="col-12 col-md-4 col-lg-4 d-flex flex-column gap-3">
          <div className="d-flex flex-row flex-md-column gap-3">          
            {sidebanners.map((banner, idx) => (
              <Link 
                href={banner.link || "/product/galaxy-watch"} 
                className="flex-fill" 
                key={banner.id || idx}
              >
                <div className="position-relative w-100 home-slider-banner">
                  <img
                    src={banner.photo_full_url?.path || "/side1.webp"}
                    alt={banner.title || "Side Banner"}
                    className="rounded-3 object-fit-contain"
                    style={{
                      width: "100%",
                      height: "100%",
                      minHeight: "156px",
                      objectFit: "contain",
                      display: "block",
                    }}
                    loading="lazy"
                    onError={(e) => {
                      e.target.src = "/side1.webp";
                    }}
                  />
                </div>
              </Link>          
            ))}
          </div>
        </div>
      </div>
    </>
  );
}