"use client";
import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getProductDetails, getRelatedProducts, addToCart, checkRestockRequest, requestProductRestock, getEmiBanks } from "@/lib/api/global.service";
import { toast } from "react-toastify";
import Breadcrumb from "@/components/html/Breadcrumb";
import ProductCardType2 from "@/components/product/ProductCardType2";
import ProductCard from "@/components/product/ProductCard";
import { useGlobalConfig } from "@/context/GlobalConfigContext";

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
  const router = useRouter();
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
  const { data: config } = useGlobalConfig();
  const companyWhatsapp = config?.company_whatsapp;
  const is_emi_enabled = config?.is_emi_enabled; //return true or false
  const whatsappActive = companyWhatsapp?.status === "1";
  const whatsappPhone = (companyWhatsapp?.phone || "").replace(/^\+/, "");

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

  // --- Addons State ---
  const [addons, setAddons] = useState([]);
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Parse Addons when product loads
  useEffect(() => {
    if (!product?.addons) {
      setAddons([]);
      setSelectedAddons([]);
      return;
    }
    let parsed = [];
    try {
      parsed = typeof product.addons === "string" ? JSON.parse(product.addons) : product.addons;
      // Only show addons with stock > 0
      parsed = parsed.filter(a => Number(a.addons_stock) > 0);
    } catch {
      parsed = [];
    }
    setAddons(parsed);

    // Default checked: free addons (addons_price == 0)
    setSelectedAddons(parsed.filter(a => Number(a.addons_price) === 0).map(a => a.id));
  }, [product]);

  // Handle Addon Checkbox Change
  const handleAddonCheck = (id) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((aid) => aid !== id) : [...prev, id]
    );
  };

  // Add to Cart handler (with Addons)
  const handleAddToCart = async (redirectToCart = false) => {
    if (adding || stock < 1) return;
    setAdding(true);
    try {
      // Main product payload
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

      // Add checked addons
      for (const addon of addons) {
        if (selectedAddons.includes(addon.id)) {
          // For each checked addon, add to cart as a separate product with parent reference
          await addToCart({
            id: addon.id,
            quantity: qty,
            addons_price: Number(addon.addons_price), // ensure number
            addons_stock: Number(addon.addons_stock),
            addons_parent: product.id,
            // If addon has variations/choices, you may need to handle here
          });
        }
      }

      toast.success("Added to cart!");
      window.dispatchEvent(new Event("snapcart-auth-change"));
      if (redirectToCart) router.push("/cart");
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

  // --- EMI Modal State ---
  const [emiModalOpen, setEmiModalOpen] = useState(false);
  const [emiBanks, setEmiBanks] = useState([]);
  const [emiLoading, setEmiLoading] = useState(false);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [emiPrice, setEmiPrice] = useState(0);

  // Fetch EMI banks when modal opens
  useEffect(() => {
    if (!emiModalOpen) return;
    setEmiLoading(true);
    getEmiBanks()
      .then((data) => setEmiBanks(Array.isArray(data) ? data : []))
      .catch(() => setEmiBanks([]))
      .finally(() => setEmiLoading(false));
  }, [emiModalOpen]);

  // Set default price and reset selection when modal opens or product changes
  useEffect(() => {
    if (!emiModalOpen || !product) return;
    // Use regular price (without discount)
    let regularPrice = product.unit_price;
    if (selectedVariation && product.variation?.length) {
      const v = product.variation.find((v) => v.type === selectedVariation);
      if (v) regularPrice = v.price + (product.discount_type === "flat" ? product.discount : 0);
      else if (product.discount_type === "flat") regularPrice += product.discount;
    } else if (product.discount_type === "flat") {
      regularPrice += product.discount;
    } else if (product.discount_type === "percent" && product.discount > 0) {
      regularPrice = Math.round(product.unit_price / (1 - product.discount / 100));
    }
    setEmiPrice(regularPrice);
    setSelectedBank(null);
    setSelectedPlan(null);
  }, [emiModalOpen, product, selectedVariation]);

  // Calculate EMI and effective cost
  const calcEmi = (plan, price) => {
    if (!plan || !price) return { emi: 0, total: 0, effectiveCost: 0 };
    const chargePercent = parseFloat(plan.charge_percent || 0);
    const months = parseInt(plan.tenure_months || 1, 10);
    const totalCost = price + (price * chargePercent / 100);
    const emi = totalCost / months;
    return {
      emi: emi,
      total: totalCost,
      effectiveCost: totalCost - price,
    };
  };

  // Review image preview modal state (MUST be here, not after useEffect or returns)
  const [previewImg, setPreviewImg] = useState(null); // {src, list, idx}
  const handlePreview = (imgList, idx) => {
    setPreviewImg({ list: imgList, idx });
  };
  const closePreview = () => setPreviewImg(null);
  const showPrev = () => setPreviewImg((p) => ({ ...p, idx: (p.idx - 1 + p.list.length) % p.list.length }));
  const showNext = () => setPreviewImg((p) => ({ ...p, idx: (p.idx + 1) % p.list.length }));

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
      href: `/${product.category.slug}`
    }] : []),
    ...(product.sub_category ? [{
      label: product.sub_category.name,
      href: `/${product.category?.slug || ""}/${product.sub_category.slug}`
    }] : []),
    ...(product.sub_sub_category ? [{
      label: product.sub_sub_category.name,
      href: `/${product.category?.slug || ""}/${product.sub_category?.slug || ""}/${product.sub_sub_category.slug}`
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
  let unit_price = product.unit_price;
  let discount = product.discount;
  let discountType = product.discount_type;
  let price = unit_price;
  let oldPrice = null;
  if (discountType === "flat" && discount > 0) {
    price = unit_price - discount; 
    oldPrice = unit_price;
  }
  else if (discountType === "percent" && discount > 0) {
    price = unit_price - Math.round(unit_price * discount / 100);
    oldPrice = unit_price;
  }
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

  // Review breakdown helper
  function getRatingBreakdown(reviews) {
    const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    (reviews || []).forEach(r => {
      const rating = Math.round(Number(r.rating));
      if (breakdown[rating] !== undefined) breakdown[rating]++;
    });
    return breakdown;
  }
  const reviews = product.reviews || [];
  const reviewsCount = Number(product.reviews_count) || reviews.length;
  const averageReview = Number(product.average_review) || 0;
  const ratingBreakdown = getRatingBreakdown(reviews);

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
                    title = {qty >= stock ? "Maximum quantity reached" : ""}
                  >{qty >= stock ? "Max" : "+"}</button>
                </div>
              </div>
            </div>  
            {/* --- Product Add-ons Section --- */}
            {addons.length > 0 && (
              <div className="bg-white rounded-4 p-4 my-3 shadow-sm border">
                <div className="fw-bold mb-3">Product Add-ons</div>
                <div className="d-flex flex-column gap-3">
                  {addons.map((addon) => {
                    const isFree = Number(addon.addons_price) === 0;
                    const hasDiscount = Number(addon.unit_price) > Number(addon.addons_price);
                    const checked = selectedAddons.includes(addon.id);
                    return (
                      <label
                        key={addon.id}
                        className={`d-flex align-items-center gap-3 p-3 rounded-3 border ${checked ? "border-warning" : "border-light"} bg-light`}
                        style={{ cursor: addon.addons_stock > 0 ? "pointer" : "not-allowed", opacity: addon.addons_stock > 0 ? 1 : 0.6 }}
                      >
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={checked}
                          disabled={addon.addons_stock <= 0}
                          onChange={() => handleAddonCheck(addon.id)}
                          style={{ marginRight: 12, width: 20, height: 20 }}
                        />
                        <img
                          src={addon.thumbnail_full_url?.path}
                          alt={addon.name}
                          style={{ width: 48, height: 48, objectFit: "contain", borderRadius: 8, background: "#fff" }}
                        />
                        <div className="flex-grow-1">
                          <div className="fw-semibold">{addon.name}</div>
                          <div className="d-flex gap-2 mt-1">
                            {hasDiscount && (
                              <span className="badge bg-success-subtle text-success">Addons Discount</span>
                            )}
                            {isFree && (
                              <span className="badge bg-info-subtle text-info">Free</span>
                            )}
                          </div>
                        </div>
                        <div className="text-end">
                          <div className="fw-bold" style={{ fontSize: 16 }}>
                            ৳{Number(addon.addons_price).toLocaleString("en-BD")}
                          </div>
                          {hasDiscount && (
                            <div className="text-muted text-decoration-line-through" style={{ fontSize: 14 }}>
                              ৳{Number(addon.unit_price).toLocaleString("en-BD")}
                            </div>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="bg-white rounded-4 p-4 shadow-sm border h-100 d-flex flex-column">
              {/* Actions */}
              <div className="d-flex gap-3 mb-3 flex-wrap">
                {/* If in stock, show Add to Cart and Shop Now */}
                {stock > 0 ? (
                  <>
                    <button
                      className="btn btn-warning fw-bold px-4 rounded-pill"
                      style={{ background: "#F67535", color: "#fff" }}
                      onClick={() => handleAddToCart(false)}
                      disabled={adding || stock < 1}
                    >
                      <i className="fas fa-cart-plus me-2"></i>
                      {adding ? "Adding..." : "Add To Cart"}
                    </button>
                    <button
                      className="btn btn-outline-dark fw-bold px-4 rounded-pill"
                      onClick={() => handleAddToCart(true)}
                      disabled={adding || stock < 1}
                    >
                      <i className="fas fa-shopping-cart me-2"></i>Shop Now
                    </button>
                  </>
                ) : isAuth ? (
                  // If out of stock and authenticated, show restock request
                  restockStatus === "requested" ? (
                    <button
                      className="btn btn-outline-secondary fw-bold px-4 rounded-pill"
                      disabled
                      style={{ color: "#888", borderColor: "#bbb" }}
                    >
                      <i className="fas fa-check-circle me-2"></i>
                      Already Requested
                    </button>
                  ) : (
                    <button
                      className="btn btn-outline-danger text-danger fw-bold px-4 rounded-pill"
                      style={{ color: "#F67535", borderColor: "#F67535" }}
                      onClick={handleRestockRequest}
                      disabled={restockLoading}
                    >
                    <i className="fas fa-times-circle me-2"></i>
                      {restockLoading ? "Requesting..." : "Request Restock"}
                    </button>
                  )
                ) : (
                    // If out of stock and not authenticated, show Stock Out with login prompt
                    <button
                    className="btn btn-outline-danger text-danger fw-bold px-4 rounded-pill"
                    onClick={() => toast.info("Please login to request restock.")}
                    >
                    <i className="fas fa-times-circle me-2"></i>
                    Request Restock
                    </button>
                  )}
                  </div>
                </div>
                {/* EMI, Whatsapp, etc. */}
            <div className="d-flex gap-3 mt-3 align-items-center flex-wrap">
              {is_emi_enabled && (
                <span className="badge bg-light text-dark border px-3 py-2">
                  <i className="fas fa-credit-card me-2"></i>
                  EMI Available{" "}
                  <a
                    href="#"
                    className="text-primary ms-1"
                    id="emiPlans"
                    onClick={e => {
                      e.preventDefault();
                      setEmiModalOpen(true);
                    }}
                  >
                    View Plans
                  </a>
                </span>
              )}
              {whatsappActive && whatsappPhone && (
                <a
                href={`https://wa.me/${whatsappPhone.replace(/\D/g, "")}?text=${encodeURIComponent(
                          `I want to know more about this product: ${typeof window !== "undefined" ? window.location.href : ""}`
                          )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="badge bg-success-subtle text-success border px-3 py-2"
                >
                  <i className="fab fa-whatsapp me-2"></i>Whatsapp
                </a>
              )}
            </div>
          </div>
        </div>
      </div>      {/* Tabs: Specification, Description, FAQ, Reviews */}
      <div className="row mt-5">
        <div className="col-12 col-lg-8">
            <div className="d-flex gap-2 mb-4 flex-wrap">
            {hasSpec && (
                <button
                className={`btn ${tab === "spec" ? "btn-warning text-white" : "btn-outline-light border"} fw-semibold nav-btn`}
                style={{ borderRadius: 8, minWidth: 140 }}
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
            {reviewsCount > 0 && (
              <button
                className={`btn ${tab === "reviews" ? "btn-warning text-white" : "btn-outline-light border"} fw-semibold nav-btn`}
                style={{ borderRadius: 8, minWidth: 140 }}
                onClick={() => setTab("reviews")}
              >
                Reviews
              </button>
            )}
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
           {tab === "reviews" && (
             <div>
               <div className="d-flex flex-wrap align-items-center justify-content-between mb-4">
                 <div className="d-flex align-items-center gap-4">
                   <div style={{ fontSize: 48, fontWeight: 700, color: "#222" }}>
                     {averageReview.toFixed(2)}
                   </div>
                   <div>
                     <div style={{ fontSize: 24, color: "#F67535" }}>
                       {"★".repeat(Math.round(averageReview))}{" "}
                       <span style={{ color: "#bbb", fontSize: 18 }}>
                         {"★".repeat(5 - Math.round(averageReview))}
                       </span>
                     </div>
                     <div style={{ fontSize: 16, color: "#888" }}>
                       {reviewsCount} Rating{reviewsCount > 1 ? "s" : ""}
                     </div>
                   </div>
                 </div>
                 <div style={{ minWidth: 200 }}>
                   <div>Excellent <span className="ms-2">{ratingBreakdown[5]}</span></div>
                   <div>Good <span className="ms-2">{ratingBreakdown[4]}</span></div>
                   <div>Average <span className="ms-2">{ratingBreakdown[3]}</span></div>
                   <div>Below Average <span className="ms-2">{ratingBreakdown[2]}</span></div>
                   <div>Poor <span className="ms-2">{ratingBreakdown[1]}</span></div>
                 </div>
               </div>
               <div className="bg-light rounded-3 py-2 px-3 mb-3 text-center fw-semibold" style={{ fontSize: 18 }}>
                 Product Review
               </div>
               {reviews.length === 0 && (
                 <div className="text-center text-muted py-5">No reviews found.</div>
               )}
               {reviews.map((review) => (
                 <div key={review.id} className="d-flex align-items-start gap-3 py-3 border-bottom">
                   <div>
                     <img
                       src={review.customer?.image_full_url?.path || "/user.png"}
                       alt={review.customer?.name || "User"}
                       style={{ width: 56, height: 56, borderRadius: "50%", objectFit: "cover", border: "2px solid #eee" }}
                     />
                   </div>
                   <div className="flex-grow-1">
                     <div className="fw-bold">{review.customer?.name || "User"}</div>
                     <div className="text-warning" style={{ fontSize: 16 }}>
                       {"★".repeat(Math.round(review.rating))}
                       <span className="text-muted" style={{ fontSize: 14 }}>
                         {"★".repeat(5 - Math.round(review.rating))}
                       </span>
                       <span className="ms-2 text-dark">{review.rating} / 5</span>
                     </div>
                     <div className="mt-2">{review.comment}</div>
                     {Array.isArray(review.attachment_full_url) && review.attachment_full_url.length > 0 && (
                       <div className="d-flex gap-2 mt-2">
                         {review.attachment_full_url.map((img, idx) => (
                           <button
                             key={img.key || idx}
                             type="button"
                             className="p-0 border-0 bg-transparent"
                             style={{ outline: "none" }}
                             onClick={() => handlePreview(review.attachment_full_url, idx)}
                           >
                             <img
                               src={img.path}
                               alt="Review"
                               style={{ width: 64, height: 64, objectFit: "cover", borderRadius: 8, border: "1px solid #eee", cursor: "pointer" }}
                             />
                           </button>
                         ))}
                       </div>
                     )}
                   </div>
                   <div className="text-end text-muted" style={{ minWidth: 100 }}>
                     {review.created_at ? new Date(review.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "2-digit" }) : ""}
                   </div>
                 </div>
               ))}
              {/* Image Preview Modal */}
              {previewImg && (
                <div
                  className="review-img-modal"
                  tabIndex={-1}
                  onClick={closePreview}
                  style={{
                    position: "fixed",
                    top: 0,
                    left: 0,
                    width: "100vw",
                    height: "100vh",
                    background: "rgba(0,0,0,0.8)",
                    zIndex: 99999,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      maxWidth: "90vw",
                      maxHeight: "90vh",
                      display: "flex",
                      alignItems: "center",
                    }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      className="btn btn-light rounded-circle"
                      style={{ position: "absolute", left: -50, top: "50%", transform: "translateY(-50%)", zIndex: 2, fontSize: 24, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={showPrev}
                      disabled={previewImg.list.length <= 1}
                      tabIndex={0}
                    >
                      <i className="fa fa-chevron-left"></i>
                    </button>
                    <img
                      src={previewImg.list[previewImg.idx]?.path}
                      alt="Preview"
                      style={{
                        maxWidth: "80vw",
                        maxHeight: "80vh",
                        borderRadius: 12,
                        boxShadow: "0 4px 32px #0008",
                        background: "#fff",
                      }}
                    />
                    <button
                      type="button"
                      className="btn btn-light rounded-circle"
                      style={{ position: "absolute", right: -50, top: "50%", transform: "translateY(-50%)", zIndex: 2, fontSize: 24, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={showNext}
                      disabled={previewImg.list.length <= 1}
                      tabIndex={0}
                    >
                      <i className="fa fa-chevron-right"></i>
                    </button>
                    <button
                      type="button"
                      className="btn btn-danger rounded-circle"
                      style={{ position: "absolute", top: -20, right: -25, zIndex: 3, fontSize: 20, width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center" }}
                      onClick={closePreview}
                      tabIndex={0}
                    >
                      <i className="fa fa-times"></i>
                    </button>
                  </div>
                </div>
              )}
             </div>
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

      {/* EMI Modal */}
      {emiModalOpen && (
        <div className="emi-modal-backdrop" onClick={() => setEmiModalOpen(false)}>
          <div
            className="emi-modal"
            onClick={e => e.stopPropagation()}
            style={{
              maxWidth: 800,
              width: "100%",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
              padding: 0,
              display: "flex",
              minHeight: 400,
              zIndex: 9999,
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)"
            }}
          >
            {/* Left: Bank List */}
            <div style={{ width: 315, borderRight: "1px solid #eee", padding: 24, overflowY: "auto" }}>
              <div className="fw-bold mb-3" style={{ fontSize: 18 }}>EMI Banks</div>
              {emiLoading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" />
                </div>
              ) : (
                <ul className="list-unstyled m-0 p-0" style={{ maxHeight: 350, overflowY: "auto" }}>
                  {emiBanks.map(bank => (
                    <li key={bank.id}>
                      <button
                        className={`w-100 text-start btn btn-sm mb-2 ${selectedBank?.id === bank.id ? "btn-warning text-white" : "btn-light border"}`}
                        style={{
                          borderRadius: 8,
                          fontWeight: 500,
                          fontSize: 15,
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis"
                        }}
                        onClick={() => {
                          setSelectedBank(bank);
                          setSelectedPlan(null);
                        }}
                      >
                        {bank.name}
                        {bank.is_online ? <span className="badge bg-info ms-2">Online</span> : ""}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Right: Plans */}
            <div style={{ flex: 1, padding: 24, minWidth: 0 }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <div className="fw-bold" style={{ fontSize: 18 }}>
                  {selectedBank ? selectedBank.name : "Select a Bank"}
                </div>
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setEmiModalOpen(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              {selectedBank ? (
                <>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Product Price (৳)</label>
                    <input
                      type="number"
                      className="form-control"
                      value={emiPrice}
                      min={1}
                      onChange={e => setEmiPrice(Number(e.target.value) || 1)}
                      style={{ maxWidth: 200 }}
                    />
                  </div>
                  <div>
                    <div className="fw-semibold mb-2">Available EMI Plans:</div>
                    <div className="table-responsive">
                      <table className="table table-bordered align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Tenure (Months)</th>
                            <th>Charge (%)</th>
                            <th>EMI (৳/mo)</th>
                            <th>Effective Cost (৳)</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedBank.plans.map(plan => {
                            const { emi, effectiveCost } = calcEmi(plan, emiPrice);
                            return (
                              <tr key={plan.id} className={selectedPlan?.id === plan.id ? "table-warning" : ""}>
                                <td>{plan.tenure_months}</td>
                                <td>{plan.charge_percent}</td>
                                <td>{emi ? emi.toLocaleString("en-BD", { maximumFractionDigits: 2 }) : "-"}</td>
                                <td>{effectiveCost ? effectiveCost.toLocaleString("en-BD", { maximumFractionDigits: 2 }) : "-"}</td>
                                <td>
                                  <button
                                    className={`btn btn-sm ${selectedPlan?.id === plan.id ? "btn-warning text-white" : "btn-outline-warning"}`}
                                    onClick={() => setSelectedPlan(plan)}
                                  >
                                    {selectedPlan?.id === plan.id ? "Selected" : "Select"}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {selectedPlan && (
                    <div className="alert alert-info mt-4 mb-0">
                      <div>
                        <b>Selected Plan:</b> {selectedPlan.tenure_months} months, {selectedPlan.charge_percent}% charge
                      </div>
                      <div>
                        <b>Monthly EMI:</b> ৳{calcEmi(selectedPlan, emiPrice).emi.toLocaleString("en-BD", { maximumFractionDigits: 2 })}
                      </div>
                      <div>
                        <b>Total Cost:</b> ৳{(emiPrice + calcEmi(selectedPlan, emiPrice).effectiveCost).toLocaleString("en-BD", { maximumFractionDigits: 2 })}
                        {" "}(<b>Effective Cost:</b> ৳{calcEmi(selectedPlan, emiPrice).effectiveCost.toLocaleString("en-BD", { maximumFractionDigits: 2 })})
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-muted py-5 text-center">Select a bank to view EMI plans.</div>
              )}
            </div>
          </div>
          <style>{`
            .emi-modal-backdrop {
              position: fixed;
              top: 0; left: 0; right: 0; bottom: 0;
              background: rgba(0,0,0,0.25);
              z-index: 9998;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .emi-modal {
              animation: emiModalFadeIn .2s;
            }
            @keyframes emiModalFadeIn {
              from { opacity: 0; transform: scale(0.98) translate(-50%, -48%);}
              to { opacity: 1; transform: scale(1) translate(-50%, -50%);}
            }
          `}</style>
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

        .product-addon-badge {
          font-size: 12px;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: 6px;
          margin-left: 6px;
        }
     .review-img-modal {
       animation: fadeIn .15s;
     }
     @keyframes fadeIn {
       from { opacity: 0; }
       to { opacity: 1; }
     }
      .review-img-thumb:hover {
        box-shadow: 0 0 0 2px #F67535;
      }
      `}</style>
    </div>
  );
}
