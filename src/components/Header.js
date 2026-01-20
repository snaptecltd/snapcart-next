"use client";

import useSWR from "swr";
import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Header.module.css";
import { getNavCategories } from "@/lib/api/global.service";
import { useGlobalConfig } from "@/context/GlobalConfigContext";

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
            <div className="col-12 col-lg-5 order-3 order-lg-2 mt-2 mt-lg-0">
              <button
                type="button"
                className={`btn btn-dark w-100 d-flex align-items-center justify-content-left h-100 py-2 px-3 flex-grow-1 rounded-pill border border-secondary ${styles.header_search_btn}`}
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
            </div>

            {/* Right links */}
            <div className="col-6 col-lg-5 order-2 order-lg-4 text-end">
              <div className="d-flex justify-content-end align-items-center gap-4 small">
                <Link href="/store-location" className={`text-white text-decoration-none ${styles.nav_link}`}>
                  Store
                </Link>

                <Link
                  href="#"
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
                  <button className={`btn ${styles.icon_btn} d-none d-xl-flex`} type="button">
                    <i className="fas fa-user"></i>
                  </button>
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
    </header>
  );
}
