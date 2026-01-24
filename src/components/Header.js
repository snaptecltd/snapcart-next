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
  const logo = config?.company_logo?.path || "/logo.webp";

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

  return (
    <header className={styles.snapheader}>
      {/* ================= TOP BAR ================= */}
      <div className="container-fluid bg-black text-white py-2">
        <div className="container">
          <div className="row align-items-center">
            {/* Logo */}
            <div className="col-6 col-lg-2">
              <Link href="/" className="navbar-brand text-white fw-bold">
                <Image
                  src={logo}
                  alt={config?.company_name || "Logo"}
                  width={140}
                  height={40}
                  unoptimized
                />
              </Link>
            </div>

            {/* Search */}
            <div className="col-12 col-lg-5 order-3 order-lg-2 mt-2 mt-lg-0 position-relative">
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
                        marginLeft: -48,
                        zIndex: 2,
                        width: 40,
                        height: 40,
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
                      className="shadow-lg bg-white rounded-4 p-4"
                      style={{
                        position: "absolute",
                        top: "110%",
                        left: 0,
                        width: "100%",
                        minWidth: 400,
                        maxWidth: 950,
                        zIndex: 9999,
                        minHeight: 350,
                        maxHeight: 500,
                        overflowY: "auto",
                        border: "1px solid #eee",
                        display: "flex",
                        gap: 24,
                      }}
                    >
                      {/* Left: Recent/Trending */}
                      <div style={{ minWidth: 180, flex: "0 0 180px" }}>
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
                        <div className="fw-bold mb-3">Trending Products</div>
                        <div className="row g-3 flex-nowrap overflow-auto" style={{ flexWrap: "nowrap" }}>
                          {/* Searched products row */}
                          {searchValue && searched.length > 0 && (
                            <>
                              <div className="col-12">
                                <div
                                  className="fw-semibold mb-2"
                                  style={{ fontSize: 15 }}
                                >
                                  Search Results
                                </div>
                                <div className="d-flex flex-row gap-3 overflow-auto pb-2">
                                  {searched.map((product) => (
                                    <div
                                      style={{
                                        minWidth: 180,
                                        maxWidth: 220,
                                        flex: "0 0 180px",
                                      }}
                                      key={product.id}
                                    >
                                      <ProductCard product={product} />
                                    </div>
                                  ))}
                                </div>
                                <hr />
                              </div>
                            </>
                          )}
                          {/* Trending products */}
                          <div className="d-flex flex-row gap-3 overflow-auto pb-2">
                            {trending.products.map((product) => (
                              <div
                                style={{
                                  minWidth: 180,
                                  maxWidth: 220,
                                  flex: "0 0 180px",
                                }}
                                key={product.id}
                              >
                                <ProductCard product={product} />
                              </div>
                            ))}
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
            <div className="col-6 col-lg-5 order-2 order-lg-4 text-end">
              <div className="d-flex justify-content-end align-items-center gap-4 small">
                <Link
                  href="/store-location"
                  className={`text-white text-decoration-none ${styles.nav_link}`}
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
                  href="#"
                  className={`d-none d-md-flex text-decoration-none ${styles.nav_link} ${styles.nav_link_offers}`}
                >
                  🎁 Offers
                </Link>

                <Link
                  href="#"
                  className={`d-none d-md-flex text-white text-decoration-none d-flex align-items-center gap-1 ${styles.nav_link}`}
                >
                  <i className="fas fa-code-compare"></i>
                  Compare
                </Link>

                <div className="d-flex align-items-center gap-3">
                  {/* Cart – Desktop */}
                  <button
                    className={`btn ${styles.icon_btn} d-none d-xl-flex position-relative`}
                    type="button"
                  >
                    <i className="fas fa-shopping-cart"></i>
                    <span className={styles.cart_count}>0</span>
                  </button>

                  {/* Cart – Mobile */}
                  <Link
                    href="/cart"
                    className={`btn ${styles.icon_btn} d-flex d-xl-none position-relative`}
                  >
                    <i className="fas fa-shopping-cart"></i>
                    <span className={styles.cart_count}>0</span>
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
                        href="/profile"
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
      <nav className="navbar navbar-expand-lg navbar-light shadow-sm border-top">
        <div className="container">
          <ul className="navbar-nav gap-lg-2 flex-wrap">
            {/* Loading state */}
            {isLoading && (
              <>
                <li className="nav-item">
                  <span className="nav-link text-muted">Loading...</span>
                </li>
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
                      href={`/category/${category.slug}`}
                      className="nav-link d-flex align-items-center gap-1"
                      role={hasChildren ? "button" : undefined}
                      data-bs-toggle={hasChildren ? "dropdown" : undefined}
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
                              href={`/category/${category.slug}/${child.slug}`}
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
      <style jsx global>{`
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
