"use client";

import Image from "next/image";
import Link from "next/link";

export default function CardType1({
  image,
  title,
  location,
  offDay,
  phone,
  mapUrl = "#",
  slug, // changed from detailsUrl
}) {
  return (
    <div className="card shadow-sm border-0 rounded-3 overflow-hidden">
      {/* Top Banner Image */}
      <div style={{ height: "140px", position: "relative" }}>
        <img
          src={image}
          alt={title}
          style={{
            objectFit: "cover",
            width: "100%",
            height: "100%",
            position: "absolute",
            top: 0,
            left: 0,
          }}
        />
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Title */}
        <h6 className="fw-semibold mb-2 d-flex align-items-center gap-2">
          <i className="fa-solid fa-house text-muted"></i>
          {title}
        </h6>

        {/* Location */}
        <p className="mb-1 text-muted small d-flex align-items-center gap-2">
          <i className="fa-solid fa-location-dot"></i>
          {location}
        </p>

        {/* Off Day */}
        <p className="mb-1 text-muted small">
          <strong>Off Day:</strong> {offDay}
        </p>

        {/* Phone */}
        <p className="mb-3 text-muted small d-flex align-items-center gap-2">
          <i className="fa-solid fa-phone"></i>
          {phone}
        </p>

        {/* Buttons */}
        <div className="d-flex gap-2">
          {/* <Link
            href={mapUrl}
            className="btn btn-dark btn-sm px-3 flex-grow-1"
          >
            Shop Map
          </Link> */}

          <Link
            href={`/store-location/${slug}`}
            className="btn btn-outline-secondary btn-sm px-3 flex-grow-1"
          >
            Show Details
          </Link>
        </div>
      </div>
    </div>
  );
}
