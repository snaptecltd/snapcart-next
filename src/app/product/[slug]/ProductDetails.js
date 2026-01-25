"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getProductDetails } from "@/lib/api/global.service";

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}

export default function ProductDetails() {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [mainImg, setMainImg] = useState("");
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [qty, setQty] = useState(1);
  const [zoom, setZoom] = useState(false);
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!slug || !mounted) return;
    getProductDetails(slug).then((data) => {
      setProduct(data);
      // Set default main image
      if (data?.images_full_url?.length) {
        setMainImg(data.images_full_url[0].path);
      } else if (data?.thumbnail_full_url?.path) {
        setMainImg(data.thumbnail_full_url.path);
      }
      // Set default color/variation
      if (data?.color_images_full_url?.length) {
        setSelectedColor(data.color_images_full_url[0].color);
      }
      if (data?.variation?.length) {
        setSelectedVariation(data.variation[0].type);
      }
    });
    // eslint-disable-next-line
  }, [slug, mounted]);

  if (!mounted) {
    // Prevent hydration mismatch by not rendering until client
    return null;
  }

  if (!product) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  // Get images for gallery (color images or all images)
  let galleryImages = product.images_full_url || [];
  if (selectedColor && product.color_images_full_url?.length) {
    const colorImg = product.color_images_full_url.find(
      (c) => c.color === selectedColor
    );
    if (colorImg) {
      galleryImages = [
        colorImg.image_name,
        ...product.images_full_url.filter(
          (img) => img.key !== colorImg.image_name.key
        ),
      ];
    }
  }

  // Price/discount logic
  let price = product.unit_price;
  let discount = product.discount;
  let discountType = product.discount_type;
  let oldPrice = null;
  if (discountType === "flat" && discount > 0) {
    oldPrice = price + discount;
  } else if (discountType === "percent" && discount > 0) {
    oldPrice = Math.round(price / (1 - discount / 100));
  }
  // If variation selected, override price
  if (selectedVariation && product.variation?.length) {
    const v = product.variation.find((v) => v.type === selectedVariation);
    if (v) price = v.price;
  }

  // Stock
  const stock =
    selectedVariation && product.variation?.length
      ? product.variation.find((v) => v.type === selectedVariation)?.qty ?? product.current_stock
      : product.current_stock;

  // Color swatches
  const colorSwatches = product.color_images_full_url?.map((c) => ({
    color: c.color,
    image: c.image_name?.path,
    code: product.colors_formatted?.find((f) => f.code === "#" + c.color)?.code || "#" + c.color,
    name: product.colors_formatted?.find((f) => f.code === "#" + c.color)?.name || c.color,
  }));

  // Variations (e.g. RAM, Storage)
  const variations = product.variation || [];

  // Handle zoom
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <div className="container py-4">
      <div className="row g-4">
        {/* Left: Image Gallery */}
        <div className="col-12 col-lg-6">
          <div className="bg-white rounded-4 p-3 shadow-sm border">
            <div
              className="position-relative"
              style={{ width: "100%", aspectRatio: "1/1", overflow: "hidden" }}
              onMouseEnter={() => setZoom(true)}
              onMouseLeave={() => setZoom(false)}
              onMouseMove={handleMouseMove}
            >
              <img
                src={mainImg}
                alt={product.name}
                className="w-100 h-100"
                style={{
                  objectFit: "contain",
                  transition: "box-shadow 0.2s",
                  cursor: zoom ? "zoom-in" : "pointer",
                  borderRadius: 12,
                }}
              />
              {/* Zoom lens */}
              {zoom && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    pointerEvents: "none",
                    backgroundImage: `url(${mainImg})`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundSize: "200% 200%",
                    borderRadius: 12,
                    zIndex: 2,
                  }}
                />
              )}
            </div>
            {/* Thumbnails */}
            <div className="d-flex gap-2 mt-3 justify-content-center flex-wrap">
              {galleryImages.map((img, idx) => (
                <div
                  key={img.key || idx}
                  className={`border rounded-3 p-1 ${mainImg === img.path ? "border-warning" : "border-light"}`}
                  style={{
                    cursor: "pointer",
                    width: 60,
                    height: 60,
                    background: "#fafafa",
                    boxSizing: "border-box",
                  }}
                  onClick={() => setMainImg(img.path)}
                >
                  <img
                    src={img.path}
                    alt={product.name}
                    className="w-100 h-100"
                    style={{ objectFit: "contain", borderRadius: 8 }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        {/* Right: Product Info */}
        <div className="col-12 col-lg-6">
          <div className="ps-lg-3">
            <div className="mb-2 text-uppercase text-primary fw-bold" style={{ fontSize: 13 }}>
              {product.brand?.name || ""}
            </div>
            <h2 className="fw-bold mb-2" style={{ fontSize: "2rem" }}>{product.name}</h2>
            <div className="mb-2">
              <span className="fw-bold" style={{ fontSize: 22, color: "#222" }}>{moneyBDT(price)}</span>
              {oldPrice && (
                <span className="text-muted ms-2 text-decoration-line-through" style={{ fontSize: 16 }}>
                  {moneyBDT(oldPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="badge bg-warning text-dark ms-2">{discountType === "flat" ? `${moneyBDT(discount)} OFF` : `${discount}% OFF`}</span>
              )}
            </div>
            <div className="mb-2">
              <span className="text-success fw-semibold">
                Availability: {stock > 0 ? "In Stock" : "Out of Stock"}
              </span>
              <span className="ms-3 text-muted small">
                Code: {product.code}
              </span>
            </div>
            {/* Color selection */}
            {colorSwatches?.length > 0 && (
              <div className="mb-3">
                <div className="fw-semibold mb-1">Color:</div>
                <div className="d-flex flex-wrap gap-2">
                  {colorSwatches.map((c, idx) => (
                    <button
                      key={c.color || idx}
                      type="button"
                      className={`btn btn-sm border d-flex align-items-center gap-2 ${selectedColor === c.color ? "border-warning" : "border-light"}`}
                      style={{
                        background: "#fff",
                        minWidth: 44,
                        borderRadius: 20,
                        fontWeight: 500,
                        color: "#222",
                        boxShadow: selectedColor === c.color ? "0 0 0 2px #F67535" : "none",
                      }}
                      onClick={() => {
                        setSelectedColor(c.color);
                        setMainImg(c.image);
                      }}
                    >
                      <span
                        style={{
                          display: "inline-block",
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: c.code,
                          border: "1px solid #ddd",
                        }}
                      />
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Variation selection */}
            {variations.length > 0 && (
              <div className="mb-3">
                <div className="fw-semibold mb-1">Variation:</div>
                <div className="d-flex flex-wrap gap-2">
                  {variations.map((v, idx) => (
                    <button
                      key={v.type}
                      type="button"
                      className={`btn btn-sm border ${selectedVariation === v.type ? "border-warning" : "border-light"}`}
                      style={{
                        background: "#fff",
                        minWidth: 44,
                        borderRadius: 20,
                        fontWeight: 500,
                        color: "#222",
                        boxShadow: selectedVariation === v.type ? "0 0 0 2px #F67535" : "none",
                      }}
                      onClick={() => {
                        setSelectedVariation(v.type);
                        setMainImg(galleryImages[0]?.path);
                      }}
                    >
                      {v.type}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {/* Quantity */}
            <div className="mb-3">
              <div className="fw-semibold mb-1">Select Quantity:</div>
              <div className="input-group" style={{ maxWidth: 140 }}>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                >-</button>
                <input
                  type="number"
                  className="form-control text-center"
                  value={qty}
                  min={1}
                  max={stock}
                  onChange={(e) => setQty(Math.max(1, Math.min(stock, Number(e.target.value) || 1)))}
                  style={{ width: 50 }}
                />
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={() => setQty((q) => Math.min(stock, q + 1))}
                  disabled={qty >= stock}
                >+</button>
              </div>
            </div>
            {/* Actions */}
            <div className="d-flex gap-3 mb-3 flex-wrap">
              <button className="btn btn-warning fw-bold px-4 rounded-pill" style={{ background: "#F67535", color: "#fff" }}>
                Shop Now
              </button>
              <button className="btn btn-outline-dark fw-bold px-4 rounded-pill">
                <i className="fas fa-shopping-cart me-2"></i>Add To Cart
              </button>
            </div>
            {/* Short details */}
            {product.short_details && (
              <div className="mb-3" dangerouslySetInnerHTML={{ __html: product.short_details }} />
            )}
            {/* EMI, Whatsapp, etc. */}
            <div className="d-flex gap-3 align-items-center flex-wrap">
              <span className="badge bg-light text-dark border px-3 py-2">
                <i className="fas fa-credit-card me-2"></i>EMI Available <a href="#" className="text-primary ms-1">View Plans</a>
              </span>
              <a href="https://wa.me/8801000000000" target="_blank" rel="noopener noreferrer" className="badge bg-success-subtle text-success border px-3 py-2">
                <i className="fab fa-whatsapp me-2"></i>Whatsapp
              </a>
            </div>
          </div>
        </div>
      </div>
      {/* Details */}
      {product.details && (
        <div className="row mt-5">
          <div className="col-12 col-lg-8 mx-auto">
            <div className="bg-white rounded-4 p-4 shadow-sm border">
              <div dangerouslySetInnerHTML={{ __html: product.details }} />
            </div>
          </div>
        </div>
      )}
      <style>{`
        .product-zoom-img {
          transition: transform 0.2s;
        }
        .product-zoom-img:hover {
          transform: scale(1.08);
          z-index: 2;
        }
      `}</style>
    </div>
  );
}
