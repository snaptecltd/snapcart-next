"use client";

import Link from "next/link";
import Image from "next/image";
import styles from "../styles/Header.module.css";

export default function Header() {
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
                  src="/logo.webp"
                  alt="Logo"
                  width={140}
                  height={40}
                />
              </Link>
            </div>

            {/* Search */}
            <div className="col-12 col-lg-5 order-3 order-lg-2 mt-2 mt-lg-0">
              <button type="button" className={`btn btn-dark w-100 d-flex align-items-center justify-content-left h-100 py-2 px-3 flex-grow-1 rounded-pill border border-secondary ${styles.header_search_btn}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-search me-2 text-secondary">
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.3-4.3"></path>
                </svg>
                <span className="w-100 text-start ps-1 small">Search...</span>
              </button>
            </div>
            <div className="col-6 col-lg-5 order-2 order-lg-4 text-end">
              <div className="d-flex justify-content-end align-items-center gap-4 small">

                <Link href="#" className={`text-white text-decoration-none ${styles.nav_link}`}>
                  Store
                </Link>

                <Link href="#" className={`d-none d-md-flex text-white text-decoration-none ${styles.nav_link}`}>
                  Pre-order
                </Link>

                <Link href="#" className={`d-none d-md-flex text-decoration-none ${styles.nav_link} ${styles.nav_link_offers}`}>
                  🎁 Offers
                </Link>

                <Link href="#" className={`d-none d-md-flex text-white text-decoration-none d-flex align-items-center gap-1 ${styles.nav_link}`}>
                  <i className="fas fa-code-compare"></i>
                  Compare
                </Link>

                <div className="d-flex align-items-center gap-3">

                  {/* Cart – Desktop */}
                  <button className={`btn ${styles.icon_btn} d-none d-xl-flex position-relative`} type="button">
                    <i className="fas fa-shopping-cart"></i>
                    <span className={styles.cart_count}>0</span>
                  </button>

                  {/* Cart – Mobile */}
                  <a href="/cart" className={`btn ${styles.icon_btn} d-flex d-xl-none position-relative`}>
                    <i className="fas fa-shopping-cart"></i>
                    <span className={styles.cart_count}>0</span>
                  </a>

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
      <nav className={`navbar navbar-expand-lg navbar-light shadow-sm border-top`}>
        <div className={`container justify-content-start`}>
          <ul className={`navbar-nav gap-lg-2 flex-wrap`}>
            {/* Apple Products Dropdown */}
            <li className={`nav-item dropdown mega-dropdown`}>
              <Link className={`nav-link d-flex align-items-center gap-1`} href="#">
                Apple Products <i className={`fas fa-chevron-down`}></i>
              </Link>
              <ul className={`dropdown-menu shadow`}>
                <li><Link className={`dropdown-item`} href="#">iPhone</Link></li>
                <li><Link className={`dropdown-item`} href="#">MacBook</Link></li>
                <li><Link className={`dropdown-item`} href="#">iPad</Link></li>
                <li><Link className={`dropdown-item`} href="#">Apple Watch</Link></li>
                <li><Link className={`dropdown-item`} href="#">AirPods</Link></li>
                <li><Link className={`dropdown-item`} href="#">AirTag</Link></li>
              </ul>
            </li>

            {/* Phones Dropdown */}
            <li className="nav-item dropdown mega-dropdown">
              <Link className="nav-link d-flex align-items-center gap-1" href="#">
                Phones <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdown-menu shadow">
                <li><Link className="dropdown-item" href="#">iPhone</Link></li>
                <li><Link className="dropdown-item" href="#">Samsung</Link></li>
                <li><Link className="dropdown-item" href="#">Google</Link></li>
                <li><Link className="dropdown-item" href="#">Xiaomi</Link></li>
                <li className="dropdown-submenu position-relative">
                  <Link className="dropdown-item d-flex align-items-center justify-content-between" href="#">
                    OnePlus <i className="fas fa-chevron-right ms-2"></i>
                  </Link>
                  <ul className="dropdown-menu shadow position-absolute start-100 top-0 mt-0">
                    <li><Link className="dropdown-item" href="#">2024 Edition</Link></li>
                    <li><Link className="dropdown-item" href="#">2025 Edition</Link></li>
                  </ul>
                </li>
              </ul>
            </li>

            {/* Tablet Dropdown */}
            <li className="nav-item dropdown mega-dropdown">
              <Link className="nav-link d-flex align-items-center gap-1" href="#">
                Tablet <i className="fas fa-chevron-down"></i>
              </Link>
              <ul className="dropdown-menu shadow">
                <li><Link className="dropdown-item" href="#">iPad</Link></li>
                <li><Link className="dropdown-item" href="#">Android Tablet</Link></li>
              </ul>
            </li>

            {/* Used Device Link */}
            <li className="nav-item">
              <Link className="nav-link" href="#">Used Device</Link>
            </li>
          </ul>
        </div>
      </nav>
    </header>
  );
}
