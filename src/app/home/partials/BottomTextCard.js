"use client";

import { useEffect, useState } from "react";
import useSWR from "swr";
import SectionTitle from "@/components/html/SectionTitle";
import { getBottomTextCards } from "@/lib/api/global.service";

export default function BottomTextCard() {
  const [cards, setCards] = useState([]);
  const [banners, setBanners] = useState([]);

  // Fetch the bottom text cards and banner data
  const { data, error, isLoading } = useSWR("get-bottom-text-cards", getBottomTextCards, {
    revalidateOnFocus: false,
    dedupingInterval: 1000 * 60 * 30, // Cache for 30 minutes
  });

  useEffect(() => {
    if (data) {
      setBanners(Array.isArray(data.banner) ? data.banner : data.banner ? [data.banner] : []);
      setCards(data.cards);
    }
  }, [data]);

  if (isLoading) return null;
  if (error) return <div>Error fetching data</div>;
  if (!data) return <div>No data found</div>;

  return (
    <section className="py-4">
      <div className="container">
        {/* Row for the bottom text cards */}
        <div className="row g-4 d-flex align-items-stretch mb-3">
          {/* First Row */}
          <div className="col-12 col-md-4 mb-2">
            <div
              className="p-4 rounded-3"
              style={{ backgroundColor: cards[0]?.background || "#FFEBD5", height: "100%" }}
            >
              <h5 className="fw-semibold">{cards[0]?.title}</h5>
              <p>{cards[0]?.description}</p>
            </div>
          </div>

          <div className="col-12 col-md-4 mb-2">
            {/* Banner in the middle as Bootstrap Carousel */}
            <div className="position-relative overflow-hidden rounded-3" style={{ height: "100%" }}>
              {banners.length > 0 ? (
                <div id="bottomTextBannerCarousel" className="carousel slide h-100" data-bs-ride="carousel">
                  <div className="carousel-inner h-100">
                    {banners.map((banner, idx) => (
                      <div
                        className={`carousel-item h-100${idx === 0 ? " active" : ""}`}
                        key={banner.id || idx}
                      >
                        <a href={banner.url || "#"} target="_blank" rel="noopener noreferrer">
                          <img
                            src={banner.photo_full_url?.path}
                            alt={banner.title || "Banner"}
                            className="w-100"
                            style={{
                              objectFit: "cover",
                              height: "100%",
                              minHeight: 180,
                              borderRadius: "0.5rem"
                            }}
                          />
                        </a>
                      </div>
                    ))}
                  </div>
                  {/* Carousel indicators (bottom dots) */}
                  {banners.length > 1 && (
                    <div className="carousel-indicators" style={{ bottom: 8 }}>
                      {banners.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          data-bs-target="#bottomTextBannerCarousel"
                          data-bs-slide-to={idx}
                          className={idx === 0 ? "active" : ""}
                          aria-current={idx === 0 ? "true" : undefined}
                          aria-label={`Slide ${idx + 1}`}
                        />
                      ))}
                    </div>
                  )}
                  {banners.length > 1 && (
                    <>
                      <button className="carousel-control-prev" type="button" data-bs-target="#bottomTextBannerCarousel" data-bs-slide="prev" style={{ width: 32 }}>
                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Previous</span>
                      </button>
                      <button className="carousel-control-next" type="button" data-bs-target="#bottomTextBannerCarousel" data-bs-slide="next" style={{ width: 32 }}>
                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                        <span className="visually-hidden">Next</span>
                      </button>
                    </>
                  )}
                </div>
              ) : (
                <div
                  className="d-flex justify-content-center align-items-center bg-light"
                  style={{ height: "100%" }}
                >
                  <span>No Banner Available</span>
                </div>
              )}
            </div>
          </div>

          <div className="col-12 col-md-4 mb-2">
            <div
              className="p-4 rounded-3"
              style={{ backgroundColor: cards[1]?.background || "#FFE9F0", height: "100%" }}
            >
              <h5 className="fw-semibold">{cards[1]?.title}</h5>
              <p>{cards[1]?.description}</p>
            </div>
          </div>
        </div>

        {/* Second Row */}
        <div className="row g-4 d-flex align-items-stretch">
          <div className="col-12 col-md-4 mb-2">
            <div
              className="p-4 rounded-3"
              style={{ backgroundColor: cards[2]?.background || "#FFF6D5", height: "100%" }}
            >
              <h5 className="fw-semibold">{cards[2]?.title}</h5>
              <p>{cards[2]?.description}</p>
            </div>
          </div>

          <div className="col-12 col-md-4 mb-2">
            <div
              className="p-4 rounded-3"
              style={{ backgroundColor: cards[3]?.background || "#FFE6E5", height: "100%" }}
            >
              <h5 className="fw-semibold">{cards[3]?.title}</h5>
              <p>{cards[3]?.description}</p>
            </div>
          </div>

          <div className="col-12 col-md-4 mb-2">
            <div
              className="p-4 rounded-3"
              style={{ backgroundColor: cards[4]?.background || "#E7FFE7", height: "100%" }}
            >
              <h5 className="fw-semibold">{cards[4]?.title}</h5>
              <p>{cards[4]?.description}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
