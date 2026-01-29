"use client";
import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductDetails, getRelatedProducts, addToCart, checkRestockRequest, requestProductRestock } from "@/lib/api/global.service";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/html/Breadcrumb";
import ProductCardType2 from "@/components/product/ProductCardType2";
import ProductCard from "@/components/product/ProductCard";

function moneyBDT(value) {
  const n = Number(value || 0);
  return `৳ ${n.toLocaleString("en-BD")}`;
}

function parseFaqs(faqs) {
  if (!faqs) return [];
  try {
    if (typeof faqs === "string") faqs = JSON.parse(faqs);
    if (Array.isArray(faqs)) return faqs;
    // Laravel style: {en: "[]", bd: "[]"}
    const lang = typeof window !== "undefined" ? (navigator.language?.slice(0,2) || "en") : "en";
    let arr = [];
    if (faqs[lang]) arr = JSON.parse(faqs[lang]);
    else if (faqs.en) arr = JSON.parse(faqs.en);
    return arr;
  } catch {
    return [];
  }
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
  const [tab, setTab] = useState("spec");
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [mounted, setMounted] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [restockStatus, setRestockStatus] = useState(null); // null | "not_requested" | "requested"
  const [restockLoading, setRestockLoading] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const carouselRef = useRef(null);

  let stock = 0;
  if (product) {
    stock = selectedVariation && product.variation?.length
      ? product.variation.find((v) => v.type === selectedVariation)?.qty ?? product.current_stock
      : product.current_stock;
    stock = typeof stock === "number" ? stock : 0;
  }

  useEffect(() => { setMounted(true); }, []);

  // ✅ Reset product when slug changes (for Next Link navigation)
  useEffect(() => {
    if (!slug || !mounted) return;
    setProduct(null); // Clear product to show loading state
  }, [slug, mounted]);

  useEffect(() => {
    if (!slug || !mounted || product !== null) return; // Only fetch if product is null
    
    getProductDetails(slug).then((data) => {
      setProduct(data);

      if (data?.images_full_url?.length) setMainImg(data.images_full_url[0].path);
      else if (data?.thumbnail_full_url?.path) setMainImg(data.thumbnail_full_url.path);

      // set default color
      if (data?.color_images_full_url?.length) setSelectedColor(data.color_images_full_url[0].color);

      // ✅ hide spec tab if no specification
      const specCount = (data?.specifications || []).filter(s => s?.pivot?.value).length;
      setTab(specCount > 0 ? "spec" : "desc");

      // ✅ default selected variation
      // If variations are actually colors (WhiteSmoke/Black), match first color name
      if (data?.variation?.length) {
        const colorNames = new Set((data?.colors_formatted || []).map(c => String(c.name || "").toLowerCase()));
        const firstColorName = (data?.colors_formatted?.[0]?.name || "").toLowerCase();

        const firstMatchingColorVar = data.variation.find(v => colorNames.has(String(v.type || "").toLowerCase()));
        const firstNonColorVar = data.variation.find(v => !colorNames.has(String(v.type || "").toLowerCase()));

        // prefer non-color variation if exists, otherwise color variation
        setSelectedVariation(firstNonColorVar?.type || firstMatchingColorVar?.type || data.variation[0].type);

        // if variations are color-based, sync variation with first color
        if (!firstNonColorVar && firstColorName) {
          const match = data.variation.find(v => String(v.type || "").toLowerCase() === firstColorName);
          if (match) setSelectedVariation(match.type);
        }
      }

      // ✅ Store full product data in localStorage
      if (data?.id) {
        let viewed = [];
        try {
          const stored = localStorage.getItem("snapcart_recently_viewed");
          if (stored) viewed = JSON.parse(stored);
        } catch (e) {
          viewed = [];
        }

        // Remove if already exists, add to front
        viewed = viewed.filter(p => p.id !== data.id);

        // Create product object with all needed fields
        const productData = {
          id: data.id,
          name: data.name,
          slug: data.slug,
          unit_price: data.unit_price,
          discount: data.discount,
          discount_type: data.discount_type,
          thumbnail_full_url: data.thumbnail_full_url,
        };

        viewed.unshift(productData);
        // Keep max 5 items
        viewed = viewed.slice(0, 5);
        localStorage.setItem("snapcart_recently_viewed", JSON.stringify(viewed));
      }
    });
    // eslint-disable-next-line
  }, [slug, mounted, product]);

  // ✅ Load recently viewed products
  useEffect(() => {
    if (!mounted) return;
    try {
      const stored = localStorage.getItem("snapcart_recently_viewed");
      const viewed = stored ? JSON.parse(stored) : [];
      setRecentlyViewed(viewed);
    } catch (e) {
      setRecentlyViewed([]);
    }
  }, [mounted]);

  // ✅ Fetch related products
  useEffect(() => {
    if (!product?.id || !mounted) return;
    setRelatedLoading(true);
    getRelatedProducts(product.id)
      .then((data) => {
        setRelatedProducts(Array.isArray(data) ? data : data?.products || []);
      })
      .catch(() => setRelatedProducts([]))
      .finally(() => setRelatedLoading(false));
  }, [product?.id, mounted]);

  // ✅ Carousel navigation
  const handleCarouselScroll = (direction) => {
    if (!carouselRef.current) return;
    const scrollAmount = 300;
    const current = carouselRef.current.scrollLeft;
    const target = direction === "next" ? current + scrollAmount : current - scrollAmount;
    carouselRef.current.scrollTo({ left: target, behavior: "smooth" });
  };

  // Add to Cart handler
  const handleAddToCart = async () => {
    if (adding || stock < 1) return;
    setAdding(true);
    try {
      const payload = {
        id: product.id,
        quantity: qty,
      };

      // Color: always send color code if selected and valid
      if (selectedColor && Array.isArray(product.colors_formatted)) {
        const colorObj = product.colors_formatted.find(
          c =>
            c.code === selectedColor ||
            c.color === selectedColor ||
            c.name === selectedColor ||
            c.code === "#" + selectedColor
        );
        if (colorObj && colorObj.code) {
          payload.color = colorObj.code;
        }
      }

      // Variant: always send if selected
      if (selectedVariation) payload.variant = selectedVariation;

      // Choice options: if present, send the first value (for demo, as UI is not implemented)
      if (Array.isArray(product.choice_options)) {
        product.choice_options.forEach(choice => {
          if (Array.isArray(choice.options) && choice.options.length > 0) {
            payload[choice.name] = choice.options[0];
          }
        });
      }

      // Remove undefined/null fields
      Object.keys(payload).forEach(
        (k) => (payload[k] === undefined || payload[k] === null) && delete payload[k]
      );

      await addToCart(payload);
      toast.success("Added to cart!");
      window.dispatchEvent(new Event("snapcart-auth-change"));
    } catch {
      toast.error("Failed to add to cart.");
    }
    setAdding(false);
  };

  // Detect auth on mount
  useEffect(() => {
    setIsAuth(typeof window !== "undefined" && !!localStorage.getItem("snapcart_token"));
  }, [mounted]);

  // Check restock status if out of stock and authenticated
  useEffect(() => {
    if (!mounted || !product?.id) return;
    if (stock > 0) {
      setRestockStatus(null);
      return;
    }
    if (isAuth) {
      setRestockLoading(true);
      checkRestockRequest(product.id)
        .then((res) => setRestockStatus(res.exists ? "requested" : "not_requested"))
        .catch(() => setRestockStatus("not_requested"))
        .finally(() => setRestockLoading(false));
    } else {
      setRestockStatus(null);
    }
  }, [mounted, product?.id, stock, isAuth]);

  // Restock request handler
  const handleRestockRequest = async () => {
    if (restockLoading || restockStatus === "requested") return;
    setRestockLoading(true);
    try {
      await requestProductRestock(product.id);
      toast.success("Restock request sent!");
      setRestockStatus("requested");
    } catch {
      toast.error("Failed to request restock.");
    }
    setRestockLoading(false);
  };

  if (!mounted) return null;
  if (!product) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  // Breadcrumbs
  // Build breadcrumbs from all category levels if available
  const breadcrumbItems = [
    ...(product.category ? [{
      label: product.category.name,
      href: `/category/${product.category.slug}`
    }] : []),
    ...(product.sub_category ? [{
      label: product.sub_category.name,
      href: `/category/${product.category?.slug || ""}/sub-category/${product.sub_category.slug}`
    }] : []),
    ...(product.child_category ? [{
      label: product.child_category.name,
      href: `/category/${product.category?.slug || ""}/sub-category/${product.sub_category?.slug || ""}/child-category/${product.child_category.slug}`
    }] : []),
    { label: product.name }
  ];

  // Gallery
  let galleryImages = product.images_full_url || [];
  if (selectedColor && product.color_images_full_url?.length) {
    const colorImg = product.color_images_full_url.find(c => c.color === selectedColor);
    if (colorImg) {
      galleryImages = [
        colorImg.image_name,
        ...product.images_full_url.filter(img => img.key !== colorImg.image_name.key),
      ];
    }
  }

  // Color swatches
  const colorSwatches = product.color_images_full_url?.map((c) => ({
    color: c.color,
    image: c.image_name?.path,
    code: product.colors_formatted?.find((f) => f.code === "#" + c.color)?.code || "#" + c.color,
    name: product.colors_formatted?.find((f) => f.code === "#" + c.color)?.name || c.color,
  }));

  // Variations excluding colors
  const norm = (s) => String(s || "").trim().toLowerCase();
  const colorNameSet = new Set((product.colors_formatted || []).map((c) => norm(c.name)));
  const variations = (product.variation || []).filter((v) => !colorNameSet.has(norm(v.type)));

  // Price/discount logic
  let price = product.unit_price;
  let discount = product.discount;
  let discountType = product.discount_type;
  let oldPrice = null;
  if (discountType === "flat" && discount > 0) oldPrice = price + discount;
  else if (discountType === "percent" && discount > 0) oldPrice = Math.round(price / (1 - discount / 100));
  // If variation selected, override price
  if (selectedVariation && product.variation?.length) {
    const v = product.variation.find((v) => v.type === selectedVariation);
    if (v) price = v.price;
  }

  // Handle zoom
  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setZoomPos({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Specification table
  const specificationRows = (product.specifications || [])
    .filter((s) => s?.pivot?.value)
    .map((s, idx) => (
      <tr key={idx}>
        <td className="fw-semibold">{s.name || "-"}</td>
        <td>{s.pivot.value}</td>
      </tr>
    ));

  const hasSpec = specificationRows.length > 0;

  // FAQ
  const faqs = parseFaqs(product.faqs);

  return (
    <div className="container py-4">
      {/* Breadcrumb */}
      <div className="row mb-3">
        <div className="col-12">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Product Main Section */}
      <div className="row g-4">
        {/* Left: Image Gallery */}
        <div className="col-12 col-lg-6 p-0">
          <div
            className="bg-white rounded-4 p-3 shadow-sm border"
            style={{
              position: "sticky",
              top: 24,
              height: "fit-content",
              zIndex: 2,
            }}
          >
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
        <div className="col-12 col-lg-6 p-0">
          <div className="ps-lg-3">
            <div className="bg-white rounded-4 p-4 shadow-sm border h-100 d-flex flex-column">
              {/* Brand badge */}
              {product.brand && (
              <div className="mb-2 d-flex align-items-center gap-2">
                  {/* {product.brand?.image_full_url?.path && (
                  <img
                      src={product.brand.image_full_url.path}
                      alt={product.brand.name}
                      width={34}
                      height={34}
                      style={{ objectFit: "contain", borderRadius: 6 }}
                  />
                  )} */}

                  <Link
                  href={`/brand/${product.brand.id}`}
                  className="text-decoration-none fw-semibold snap-shadow text-primary px-2 py-1 rounded"
                  style={{ color: "#222", fontSize: 12 }}
                  >
                  Brand: {product.brand.name}
                  </Link>
              </div>
              )}
              <h4 className="fw-bold mb-2">{product.name}</h4>
              <div className="mb-2">
                <span className="fw-bold" style={{ fontSize: 18, color: "#222" }}>{moneyBDT(price)}</span>
                {oldPrice && (
                  <span className="text-muted ms-2 text-decoration-line-through" style={{ fontSize: 16 }}>
                    {moneyBDT(oldPrice)}
                  </span>
                )}
                {discount > 0 && (
                  <span className="badge bg-warning text-dark ms-2">{discountType === "flat" ? `${moneyBDT(discount)} OFF` : `${discount}% OFF`}</span>
                )}
              </div>
              <div className="w-100">
                <span className={` ${stock > 0 ? "text-success" : "text-danger"} fw-semibold fs-12`}>
                  Availability: {stock > 0 ? "In Stock" : "Out of Stock"}
                </span>
                <span className="ms-3 text-muted small fs-12">
                  SKU: {product.code}
                </span>
              </div>
              {/* Short details */}
              {product.short_details && (
                <div className="my-3" dangerouslySetInnerHTML={{ __html: product.short_details }} />
              )}
            </div>
          
            <div className="bg-white rounded-4 p-4 my-3 shadow-sm border h-100 d-flex flex-column">
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

                      // ✅ if variation types are color names, sync it
                      const matchVar = (product.variation || []).find(
                          (v) => norm(v.type) === norm(c.name)
                      );
                      if (matchVar) setSelectedVariation(matchVar.type);
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
                    {variations.map((v) => (
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
            </div>  
            <div className="bg-white rounded-4 p-4 shadow-sm border h-100 d-flex flex-column">
              {/* Actions */}
              <div className="d-flex gap-3 mb-3 flex-wrap">
                {/* If in stock, show Add to Cart */}
                {stock > 0 ? (
                  <button
                    className="btn btn-warning fw-bold px-4 rounded-pill"
                    style={{ background: "#F67535", color: "#fff" }}
                    onClick={handleAddToCart}
                    disabled={adding || stock < 1}
                  >
                    {adding ? "Adding..." : "Add To Cart"}
                  </button>
                ) : isAuth ? (
                  // If out of stock and authenticated, show restock request
                  restockStatus === "requested" ? (
                    <button
                      className="btn btn-outline-secondary fw-bold px-4 rounded-pill"
                      disabled
                      style={{ color: "#888", borderColor: "#bbb" }}
                    >
                      Already Requested
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-warning fw-bold px-4 rounded-pill"
                      style={{ color: "#F67535", borderColor: "#F67535" }}
                      onClick={handleRestockRequest}
                      disabled={restockLoading}
                    >
                      {restockLoading ? "Requesting..." : "Request Restock"}
                    </button>
                  )
                ) : (
                  // If out of stock and not authenticated, show Stock Out
                  <button
                    className="btn btn-danger fw-bold px-4 rounded-pill"
                    disabled
                  >
                    Stock Out
                  </button>
                )}
                <button
                  className="btn btn-outline-dark fw-bold px-4 rounded-pill"
                  disabled
                >
                  <i className="fas fa-shopping-cart me-2"></i>Shop Now
                </button>
              </div>
            </div>
            {/* EMI, Whatsapp, etc. */}
            <div className="d-flex gap-3 mt-3 align-items-center flex-wrap">
              <span className="badge bg-light text-dark border px-3 py-2">
                <i className="fas fa-credit-card me-2"></i>EMI Available <a href="#" className="text-primary ms-1">View Plans</a>
              </span>
              <a href="https://wa.me/8801000000000" target="_blank" rel="noopener noreferrer" className="badge bg-success-subtle text-success border px-3 py-2">
                <i className="fab fa-whatsapp me-2"></i>Whatsapp
              </a>
            </div>
          </div>
        </div>
      </div>      {/* Tabs: Specification, Description, FAQ */}
      <div className="row mt-5">
        <div className="col-12 col-lg-8">
            <div className="d-flex gap-2 mb-4 flex-wrap">
            {hasSpec && (
                <button
                className={`btn ${tab === "spec" ? "btn-warning text-white" : "btn-outline-light border"} fw-semibold nav-btn`}
                style={{ background: "#F67535", borderRadius: 8, minWidth: 140 }}
                onClick={() => setTab("spec")}
                >
                Specification
                </button>
            )}

            <button
                className={`btn ${tab === "desc" ? "btn-warning text-white" : "btn-outline-light border"} fw-semibold nav-btn`}
                style={{ borderRadius: 8, minWidth: 140 }}
                onClick={() => setTab("desc")}
            >
                Description
            </button>

            <button
                className={`btn ${tab === "faq" ? "btn-warning text-white" : "btn-outline-light border"} fw-semibold nav-btn`}
                style={{ borderRadius: 8, minWidth: 140 }}
                onClick={() => setTab("faq")}
            >
                FAQ
            </button>
        </div>
        <div className="bg-whitep-4">
            {tab === "spec" && hasSpec && (
            <>
                <h4 className="fw-bold mb-3">Specification</h4>
                {specificationRows.length > 0 ? (
                <div className="table-responsive spec-table-wrapper">
                    <table className="table align-middle mb-0">
                    <tbody>
                        {specificationRows}
                    </tbody>
                    </table>
                </div>
                ) : (
                <div className="text-center py-5 text-muted">No specification found.</div>
                )}
            </>
            )}
            {tab === "desc" && (
            <>
                <h4 className="fw-bold mb-3">Description</h4>
                <div dangerouslySetInnerHTML={{ __html: product.details || "<div class='text-muted'>No description found.</div>" }} />
            </>
            )}
            {tab === "faq" && (
            <>
                <h4 className="fw-bold mb-3">FAQ</h4>
                {faqs.length > 0 ? (
                <div className="accordion" id="productFaqAccordion">
                    {faqs.map((faq, idx) => (
                    <div className="accordion-item" key={idx}>
                        <h2 className="accordion-header" id={`faq-heading-${idx}`}>
                        <button
                            className={`accordion-button${idx !== 0 ? " collapsed" : ""}`}
                            type="button"
                            data-bs-toggle="collapse"
                            data-bs-target={`#faq-collapse-${idx}`}
                            aria-expanded={idx === 0 ? "true" : "false"}
                            aria-controls={`faq-collapse-${idx}`}
                        >
                            {faq.question}
                        </button>
                        </h2>
                        <div
                        id={`faq-collapse-${idx}`}
                        className={`accordion-collapse collapse${idx === 0 ? " show" : ""}`}
                        aria-labelledby={`faq-heading-${idx}`}
                        data-bs-parent="#productFaqAccordion"
                        >
                        <div className="accordion-body">{faq.answer}</div>
                        </div>
                    </div>
                    ))}
                </div>
                ) : (
                <div className="text-center py-5 text-muted">No FAQs found for this product.</div>
                )}
            </>
            )}
        </div>
        </div>
        <div className="col-12 col-lg-4">
            {/* recently viewed products place holder */}
            {recentlyViewed.length > 0 && (
            <div className="bg-white p-3">
              <h5 className="fw-bold mb-3">
                <i className="fas fa-history me-2" style={{ color: "#F67535" }}></i>Recently Viewed
              </h5>
              <div className="d-flex flex-column gap-3">
                {recentlyViewed.map((p, idx) => (
                  <div key={`${p.id}-${idx}`} style={{ position: "relative" }}>
                    {/* Show "Currently Viewing" badge if this is the current product */}
                    {p.id === product.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          zIndex: 10,
                          background: "#F67535",
                          color: "#fff",
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "11px",
                          fontWeight: 600,
                        }}
                      >
                        Currently Viewing
                      </div>
                    )}
                    <ProductCardType2 product={p} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ✅ Related Products Section */}
      {relatedProducts.length > 0 && (
        <div className="row mt-5">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="fw-bold mb-0">Related Product</h3>
              <div className="d-flex gap-2">
                <button
                  className="btn btn-outline-secondary rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 40, height: 40 }}
                  onClick={() => handleCarouselScroll("prev")}
                  title="Previous"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  className="btn btn-dark rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: 40, height: 40 }}
                  onClick={() => handleCarouselScroll("next")}
                  title="Next"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
              </div>
            </div>

            {/* Carousel */}
            <div
              ref={carouselRef}
              className="d-flex gap-3 overflow-auto pb-3"
              style={{
                scrollBehavior: "smooth",
                scrollbarWidth: "none",
              }}
            >
              {relatedProducts.map((prod, idx) => (
                <div
                  key={`${prod.id}-${idx}`}
                  style={{
                    minWidth: 250,
                    maxWidth: 250,
                    flex: "0 0 250px",
                  }}
                >
                  <ProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`
      .spec-table-wrapper {
        border-radius: .75rem;
        border: 1px solid #e5e7eb;
      }

      .spec-table-wrapper table tr :nth-child(odd) {
        background-color: #fafafa;
        border-right: 1px solid #e5e7eb;
      }

        .product-zoom-img {
          transition: transform 0.2s;
        }
        .product-zoom-img:hover {
          transform: scale(1.08);
          z-index: 2;
        }
        .nav-btn {
        color:#333;
          transition: background-color 0.2s, color 0.2s, border-color 0.2s;
        }
        .nav-btn:hover {
          background-color: #F67535 !important;
          color: #fff !important;
          border-color: #F67535 !important;
        }

        /* Hide scrollbar for carousel */
        div::-webkit-scrollbar {
          display: none;
        }
        
        .related-product-carousel {
          scroll-behavior: smooth;
          overflow-x: auto;
          overflow-y: hidden;
        }
        
        .related-product-carousel::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}
