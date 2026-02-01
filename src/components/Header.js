"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import styles from "../styles/Header.module.css";
import {
  getNavCategories,
  logoutUser,
  getTrendingSearches,
  getSearchedProducts,
  getCart, // <-- add this
} from "@/lib/api/global.service";
import { useGlobalConfig } from "@/context/GlobalConfigContext";
import ProductCard from "@/components/product/ProductCard";

export default function Header() {
  const { data, error, isLoading } = useSWR(
    "nav-categories",
    getNavCategories,
    {
      revalidateOnFocus: false, // tab change করলে আবার call না
      revalidateOnReconnect: false,
      dedupingInterval: 1000 * 60 * 10, // 10 মিনিটের মধ্যে একই key আবার call করবে না
    }
  );

  // API response: array বা {data: array} - দুটোই handle
  const categories = Array.isArray(data) ? data : (data?.data ?? []);

  const { data: config } = useGlobalConfig();
  const logo = config?.company_logo?.path || "/logo.png";

  // Auth state
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("snapcart_token")
          : null;
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener("snapcart-auth-change", checkAuth);
    return () => window.removeEventListener("snapcart-auth-change", checkAuth);
  }, []);

  const handleLogout = async () => {
    try {
      await logoutUser();
    } catch (e) {
      // ignore error, proceed with local logout
    }
    localStorage.removeItem("snapcart_token");
    localStorage.removeItem("snapcart_user");
    window.dispatchEvent(new Event("snapcart-auth-change"));
    window.location.href = "/";
  };

  // Search state
  const [showSearch, setShowSearch] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [trending, setTrending] = useState({ products: [], names: [] });
  const [searched, setSearched] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchInputRef = useRef();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch trending on open
  useEffect(() => {
    if (searchModalOpen) {
      getTrendingSearches().then((res) => {
        setTrending({
          products: res.products || [],
          names: (res.products || []).map((p) => p.name),
        });
      });
    }
  }, [searchModalOpen]);

  // Fetch searched products on input
  useEffect(() => {
    if (searchValue.trim().length > 0) {
      setSearchLoading(true);
      getSearchedProducts(searchValue.trim())
        .then((res) => setSearched(res.products || []))
        .finally(() => setSearchLoading(false));
    } else {
      setSearched([]);
    }
  }, [searchValue]);

  // Close modal on outside click
  useEffect(() => {
    if (!searchModalOpen) return;
    const handler = (e) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(e.target) &&
        !e.target.classList.contains("search-btn")
      ) {
        setSearchModalOpen(false);
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [searchModalOpen]);

  // Cart count state
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    // Fetch cart count on mount and on auth change
    const fetchCart = async () => {
      try {
        const cart = await getCart();
        setCartCount(Array.isArray(cart) ? cart.reduce((sum, item) => sum + (item.quantity || 0), 0) : 0);
      } catch {
        setCartCount(0);
      }
    };
    fetchCart();
    window.addEventListener("snapcart-auth-change", fetchCart);
    return () => window.removeEventListener("snapcart-auth-change", fetchCart);
  }, []);

  // Mobile category sidebar state
  const [mobileCatOpen, setMobileCatOpen] = useState(false);

  return (
    <header className={styles.snapheader}>
      {/* ================= TOP BAR ================= */}
      <div className="container-fluid bg-black text-white py-2">
        <div className="container">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-6 col-lg-2 d-flex align-items-center justify-content-start">
            {/* Mobile Category Toggler */}
              <button
                className="btn btn-dark border-0 d-lg-none"
                style={{ background: "transparent", fontSize: 24 }}
                onClick={() => setMobileCatOpen(true)}
                aria-label="Open categories"
              >
                <i className="fas fa-bars"></i>
              </button>
              <Link href="/" className="navbar-brand text-white fw-bold">
                <img
                  src={logo}
                  alt={config?.company_name || "Logo"}
                  width={140}
                  height={40}
                  style={{ objectFit: "contain" }}
                />
              </Link>
            </div>

              {/* Search */}
            <div className="col-12 col-lg-4 order-3 order-lg-2 mt-2 mt-lg-0 position-relative">
              {!showSearch ? (
                <button
                  type="button"
                  className={`btn btn-dark w-100 d-flex align-items-center justify-content-left h-100 py-2 px-3 flex-grow-1 rounded-pill border border-secondary search-btn ${styles.header_search_btn}`}
                  onClick={() => {
                    setShowSearch(true);
                    setSearchModalOpen(true);
                    setTimeout(() => {
                      if (searchInputRef.current)
                        searchInputRef.current.querySelector("input")?.focus();
                    }, 100);
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-search me-2 text-secondary"
                  >
                    <circle cx="11" cy="11" r="8"></circle>
                    <path d="m21 21-4.3-4.3"></path>
                  </svg>
                  <span className="w-100 text-start ps-1 small">Search...</span>
                </button>
              ) : (
                <div ref={searchInputRef} className="w-100 position-relative">
                  <div className="d-flex align-items-center w-100">
                    <input
                      type="text"
                      className="form-control rounded-pill px-4 py-2"
                      style={{ fontSize: 16, border: "1px solid #F67535" }}
                      placeholder="Search for products..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onFocus={() => setSearchModalOpen(true)}
                    />
                    <button
                      className="btn"
                      style={{
                        background: "#F67535",
                        color: "#fff",
                        borderRadius: "50%",
                        marginLeft: -43,
                        zIndex: 2,
                        height: 38,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      tabIndex={-1}
                    >
                      <i className="fas fa-search"></i>
                    </button>
                  </div>
                  {/* Floating Modal */}
                  {mounted && searchModalOpen && (
                    <div
                      className="shadow-lg bg-white rounded-4 p-4 search-modal"
                      style={{
                        position: "absolute",
                        top: "110%",
                        left: 0,
                        zIndex: 9999,
                        overflowY: "auto",
                        border: "1px solid #eee",
                        display: "flex",
                      }}
                    >
                      {/* Left: Recent/Trending */}
                      <div style={{ minWidth: 180, flex: "0 0 180px" }} className="d-none">
                        <div className="fw-bold mb-2">Recent Searches</div>
                        {/* For demo, just show last search */}
                        {searchValue && <div className="mb-2">{searchValue}</div>}
                        <button
                          className="btn btn-link btn-sm text-secondary p-0"
                          style={{ fontSize: 13 }}
                          onClick={() => setSearchValue("")}
                        >
                          <i className="fas fa-trash-alt"></i> Clear
                        </button>
                        <div className="fw-bold mt-4 mb-2">Trending Search</div>
                        <div>
                          {trending.names.map((name, idx) => (
                            <div
                              key={idx}
                              className="mb-1"
                              style={{ fontSize: 15 }}
                            >
                              {name}
                            </div>
                          ))}
                        </div>
                      </div>
                      {/* Right: Trending Products & Searched */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div className="row g-3 overflow-y-auto" style={{ maxHeight: 450 }}>
                          <style>{`
                            .badge{
                                font-size: 8px !important;
                                }
                                .fw-semibold{
                                font-size: 14px !important;
                                }
                            `}
                            </style>
                          /* Searched products row */
                          {searchValue && searched.length > 0 ? (
                            <>
                              <div className="col-12">
                                <div className="fw-semibold mb-3 text-dark" style={{ fontSize: 15 }}>
                                  Search Results: {searched.length}
                                </div>

                                <div className="row fw-semibold m-auto">
                                  {searched.map((product) => (
                                    <div
                                      className="col-6 col-md-3 col-lg-3 p-1"
                                      key={product.id}
                                    >
                                      <ProductCard product={product} />
                                    </div>
                                  ))}
                                </div>

                                <hr />
                              </div>
                            </>
                          ) : (
                            searchValue &&
                            !searchLoading && (
                              <div className="col-12 text-center text-muted py-4">
                                No product found.
                              </div>
                            )
                          )}

                        <div className="col-12">
                         <div className="fw-bold mb-3 text-dark">Trending Products</div>
                            <div className="row fw-semibold m-auto">
                              {trending.products.map((product) => (
                                  <div className="col-6 col-md-3 col-lg-3 p-1" key={product.id}>
                                    <ProductCard product={product} />
                                  </div>
                              ))}
                          </div>
                        </div>
                        </div>
                        {searchLoading && (
                          <div className="text-center py-3">Searching...</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right links */}
            <div className="col-6 col-lg-6 order-2 order-lg-4 text-end">
              <div className="d-flex justify-content-end align-items-center gap-4 small">
                <Link
                  href="/store-location"
                  className={`d-none d-md-flex ext-white text-decoration-none ${styles.nav_link}`}
                >
                  Store
                </Link>

                <Link
                  href="/order/preorder"
                  className={`d-none d-md-flex text-white text-decoration-none ${styles.nav_link}`}
                >
                  Pre-order
                </Link>

                <Link
                  href="/offers"
                  className={`d-flex text-decoration-none ${styles.nav_link} ${styles.nav_link_offers}`}
                >
                  🎁 Offers
                </Link>

                <Link
                  href="/compare"
                  className={`d-none d-md-flex text-white text-decoration-none d-flex align-items-center gap-1 ${styles.nav_link}`}
                >
                  <i className="fas fa-code-compare"></i>
                  Compare
                </Link>

                <div className="d-flex align-items-center gap-3">
                  {/* Cart – Desktop */}
                            <Link
                            href="/cart"
                            className={`btn ${styles.icon_btn} d-none d-xl-flex position-relative`}
                            type="button"
                            >
                            <i className="fas fa-shopping-cart"></i>
                            <span className={`${styles.cart_count} cartItemCount`}>{cartCount}</span>
                            </Link>

                            {/* Cart – Mobile */}
                  <Link
                    href="/cart"
                    className={`btn ${styles.icon_btn} d-flex d-xl-none position-relative`}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    <span className={styles.cart_count}>{cartCount}</span>
                  </Link>

                  {/* User – Desktop */}
                  {!isLoggedIn ? (
                    <Link
                      href="/auth/login"
                      className={`btn ${styles.icon_btn} d-none d-xl-flex`}
                      type="button"
                    >
                      <i className="fas fa-user"></i>
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/customer"
                        className={`btn ${styles.icon_btn} d-none d-xl-flex`}
                        type="button"
                        title="Profile"
                      >
                        <i className="fas fa-user-circle"></i>
                      </Link>
                      <button
                        className={`btn ${styles.icon_btn} d-none d-xl-flex`}
                        type="button"
                        title="Logout"
                        onClick={handleLogout}
                      >
                        <i className="fas fa-sign-out-alt"></i>
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MENU BAR ================= */}
      <nav className="navbar navbar-expand-lg navbar-light shadow-sm border-top pt-2 d-none d-lg-block">
        <div className="container">
          <ul className="navbar-nav gap-lg-2 flex-wrap">
            {/* Loading state */}
                  {isLoading && (
                    <>
                    {[...Array(6)].map((_, idx) => (
                      <li
                      className="nav-item"
                      key={idx}
                      style={{
                        minWidth: 90,
                        maxWidth: "100%",
                        flex: "1 1 90px",
                      }}
                      >
                      <span
                        className="nav-link disabled placeholder-glow"
                        style={{
                        minWidth: 70,
                        display: "inline-block",
                        width: "100%",
                        }}
                      >
                        <span
                        className="placeholder col-6"
                        style={{
                          minWidth: 60,
                          height: 18,
                          display: "inline-block",
                        }}
                        ></span>
                      </span>
                      </li>
                    ))}
                    </>
                  )}

                  {/* Error state */}
            {error && (
              <li className="nav-item">
                <span className="nav-link text-danger">
                  Failed to load categories
                </span>
              </li>
            )}

            {/* Data */}
            {!isLoading &&
              !error &&
              categories.map((category) => {
                const hasChildren = (category.childes?.length ?? 0) > 0;

                return (
                  <li
                    key={category.id}
                    className={`nav-item ${hasChildren ? "dropdown" : ""}`}
                  >
                    {/* Parent */}
                    <Link
                      href={`/${category.slug}`}
                      className="nav-link d-flex align-items-center gap-1"
                      role={hasChildren ? "button" : undefined}
                      aria-expanded="false"
                    >
                      {category.name}
                      {hasChildren && <i className="fas fa-chevron-down small"></i>}
                    </Link>

                    {/* Children */}
                    {hasChildren && (
                      <ul className="dropdown-menu shadow">
                        {category.childes.map((child) => (
                          <li key={child.id}>
                            <Link
                              className="dropdown-item"
                              href={`/${category.slug}/${child.slug}`}
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
          </ul>
        </div>
      </nav>

      {/* Mobile Category Sidebar */}
      {mobileCatOpen && (
        <div>
          <div
            className="mobile-cat-overlay"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              background: "rgba(0,0,0,0.35)",
              zIndex: 1200,
            }}
            onClick={() => setMobileCatOpen(false)}
          />
          <div
            className="mobile-cat-sidebar"
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "80vw",
              maxWidth: 320,
              height: "100vh",
              background: "#fff",
              zIndex: 1201,
              boxShadow: "2px 0 16px rgba(0,0,0,0.08)",
              overflowY: "auto",
              transition: "left 0.2s",
              padding: 0,
            }}
          >
            <div className="d-flex justify-content-between align-items-center border-bottom px-3 py-2">
              <div className="fw-bold">Categories & Menu</div>
              <button
                className="btn btn-link text-dark fs-4 p-0"
                style={{ lineHeight: 1 }}
                onClick={() => setMobileCatOpen(false)}
                aria-label="Close"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <div className="p-3">
              <ul className="list-unstyled mb-4">
                {categories.map((category) => (
                  <li key={category.id} className="mb-2">
                    <Link
                      href={`/${category.slug}`}
                      className="fw-semibold text-dark text-decoration-none"
                      onClick={() => setMobileCatOpen(false)}
                    >
                      {category.name}
                    </Link>
                    {/* Children */}
                    {category.childes?.length > 0 && (
                      <ul className="list-unstyled ms-3 mt-1">
                        {category.childes.map((child) => (
                          <li key={child.id}>
                            <Link
                              href={`/${category.slug}/${child.slug}`}
                              className="text-secondary text-decoration-none"
                              onClick={() => setMobileCatOpen(false)}
                            >
                              {child.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
              <hr />
              {/* Show hidden menu links on mobile */}
              <div className="mb-3">
                <Link href="/store-location" className="d-block mb-2 text-dark text-decoration-none fw-semibold" onClick={() => setMobileCatOpen(false)}><i className="fas fa-map-marker-alt me-2"></i>Store</Link>
                <Link href="/order/preorder" className="d-block mb-2 text-dark text-decoration-none fw-semibold" onClick={() => setMobileCatOpen(false)}> <i className="fas fa-shopping-cart me-2"></i>Pre-order</Link>
                <Link href="/compare" className="d-block mb-2 text-dark text-decoration-none fw-semibold" onClick={() => setMobileCatOpen(false)}> <i className="fas fa-exchange-alt me-2"></i>Compare</Link>
                <Link href="/cart" className="d-block mb-2 text-dark text-decoration-none fw-semibold" onClick={() => setMobileCatOpen(false)}> <i className="fas fa-shopping-cart me-2"></i>Cart</Link>
                
              {isLoggedIn ? (
                <>
                  <Link
                    href="/customer"
                    className="d-block mb-2 text-dark text-decoration-none fw-semibold"
                    onClick={() => setMobileCatOpen(false)}
                  >
                    <i className="fas fa-user-circle me-2"></i>Profile
                  </Link>
                  <button
                    className="d-block mb-2 text-dark text-decoration-none fw-semibold btn btn-link p-0"
                    style={{ textAlign: "left" }}
                    onClick={() => {
                      setMobileCatOpen(false);
                      handleLogout();
                    }}
                  >
                    <i className="fas fa-sign-out-alt me-2"></i>Logout
                  </button>
                </>
              ) : <Link href="/auth/login" className="d-block mb-2 text-dark text-decoration-none fw-semibold" onClick={() => setMobileCatOpen(false)}><i className="fas fa-user me-2"></i> Login</Link>}
              </div>
            </div>
          </div>
          <style>{`
            .mobile-cat-overlay {
              animation: fadeInBg 0.2s;
            }
            .mobile-cat-sidebar {
              animation: slideInLeft 0.2s;
            }
            @keyframes fadeInBg {
              from { background: rgba(0,0,0,0); }
              to { background: rgba(0,0,0,0.35); }
            }
            @keyframes slideInLeft {
              from { left: -100vw; }
              to { left: 0; }
            }
          `}</style>
        </div>
      )}
      <style>{`
        .search-btn:focus {
          outline: none;
          box-shadow: none;
        }
        .search-modal {
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        }
        .card.card-shadow {
          box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
        }
        .rounded-3xl {
          border-radius: 1.5rem !important;
        }
      `}</style>
    </header>
  );
}
