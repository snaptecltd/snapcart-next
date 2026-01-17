"use client";

import Link from "next/link";
import Image from "next/image";

export default function HomeSlider() {
  return (
    <div className="row g-3">

      {/* LEFT: Carousel */}
      <div className="col-12 col-md-8 col-lg-8">
        <div id="homeCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="4000" style={{ minHeight: '220px' }} >
          <div className="carousel-inner rounded-3 h-100">
            {/* Slide 1 */}
            <div className="carousel-item active h-100">
              <Link href="/category/printer" className="d-block h-100">
                <div className="position-relative w-100 h-100">
                  <Image
                    src="/slider1.webp"
                    alt="Printer Offer"
                    fill
                    priority
                    className="rounded-3 object-fit-cover"
                    sizes="(max-width: 991px) 100vw, 66vw"
                  />
                </div>
              </Link>
            </div>

            {/* Slide 2 */}
            <div className="carousel-item h-100">
              <Link href="/category/laptop" className="d-block h-100">
                <div className="position-relative w-100 h-100">
                  <Image
                    src="/slider2.webp"
                    alt="Laptop Offer"
                    fill
                    className="rounded-3 object-fit-cover"
                    sizes="(max-width: 991px) 100vw, 66vw"
                  />
                </div>
              </Link>
            </div>
          </div>

          {/* Controls */}
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
        <div className="d-flex flex-column gap-3 h-100">

          <Link href="/product/galaxy-watch" className="flex-fill">
            <div className="position-relative w-100 h-100">
              <Image
                src="/side1.webp"
                alt="Galaxy Watch"
                fill
                className="rounded-3 object-fit-cover"
                sizes="(max-width: 991px) 100vw, 34vw"
              />
            </div>
          </Link>

          <Link href="/product/induction-cooker" className="flex-fill">
            <div className="position-relative w-100 h-100">
              <Image
                src="/side2.webp"
                alt="Induction Cooker"
                fill
                className="rounded-3 object-fit-cover"
                sizes="(max-width: 991px) 100vw, 34vw"
              />
            </div>
          </Link>

        </div>
      </div>

    </div>
  );
}
