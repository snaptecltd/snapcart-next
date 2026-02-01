"use client";

import Image from "next/image";
import Link from "next/link";
import { useGlobalConfig } from "@/context/GlobalConfigContext";

export default function Footer() {
  const { data: config } = useGlobalConfig();
  const socialMedias = Array.isArray(config?.social_media)
    ? config.social_media.filter((s) => s.active_status === 1)
    : [];

  return (
    <footer className="bg-black text-light pt-5 mt-5">
      <div className="container">
        {/* Top Section */}
        <div className="row g-4">
          {/* Brand / Logo */}
          <div className="col-12 col-md-6 col-lg-3">
            <h4 className="fw-bold mb-3">Snapcart</h4>
            <p className="text-secondary small">
              Your trusted online shopping destination for quality products
              and reliable service.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-6 col-lg-3">
            <h6 className="fw-semibold mb-3">QUICK LINKS</h6>
            <ul className="list-unstyled small">
              <li><Link href="/page/contact-us" className="text-secondary text-decoration-none">Contact Us</Link></li>
              <li><Link href="/page/faq" className="text-secondary text-decoration-none">FAQs</Link></li>
              <li>
                <Link href="/category?product_type=featured_product" className="text-secondary text-decoration-none">
                  Featured Products
                </Link>
              </li>
              <li>
                <Link href="/category?product_type=best_selling_products" className="text-secondary text-decoration-none">
                  Best Selling Product
                </Link>
              </li>
              <li>
                <Link href="/category?product_type=latest_products" className="text-secondary text-decoration-none">
                  Latest Products
                </Link>
              </li>
              <li>
                <Link href="/category?product_type=top_rated_product" className="text-secondary text-decoration-none">
                  Top Rated Product
                </Link>
              </li>
              <li><Link href="/order/tracking" className="text-secondary text-decoration-none">Track Order</Link></li>
            </ul>
          </div>

          {/* Other */}
          <div className="col-6 col-md-6 col-lg-3">
            <h6 className="fw-semibold mb-3">OTHER</h6>
            <ul className="list-unstyled small">
              <li><Link href="/page/about-us" className="text-secondary text-decoration-none">About Us</Link></li>
              <li><Link href="/page/terms-and-conditions" className="text-secondary text-decoration-none">Terms & Conditions</Link></li>
              <li><Link href="/page/privacy-policy" className="text-secondary text-decoration-none">Privacy Policy</Link></li>
              <li><Link href="/page/refund-policy" className="text-secondary text-decoration-none">Refund Policy</Link></li>
              <li><Link href="/page/return-policy" className="text-secondary text-decoration-none">Return Policy</Link></li>
              <li><Link href="/page/cancellation-policy" className="text-secondary text-decoration-none">Cancellation Policy</Link></li>
            </ul>
          </div>

          {/* Newsletter */}
          <div className="col-12 col-md-6 col-lg-3">
            <h6 className="fw-semibold mb-3">NEWSLETTER</h6>
            <p className="text-secondary small">
              Subscribe to get latest updates and offers.
            </p>
            <div className="input-group input-group-sm">
              <input
                type="email"
                className="form-control bg-dark text-light border-secondary"
                placeholder="Your Email Address"
              />
              <button className="btn btn-outline-light">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <hr className="border-secondary my-4" />
        <div className="row g-4">
          <Image src="/images/ssl-commerce2.png" alt="Payment Methods" width={0} height={40} style={{ width: "100%", height: "auto" }}
                sizes="100vw" />
        </div>
        <hr className="border-secondary my-4" />

        <div className="row g-4 align-items-center">
          {/* Contact */}
          <div className="col-12 col-md-6">
            <h6 className="fw-semibold mb-2">Start A Conversation</h6>
            <p className="small text-secondary mb-1">
              📞 +8801330011588
            </p>
            <p className="small text-secondary mb-1">
              ✉ rsminternationalbd@gmail.com
            </p>
            <p className="small text-secondary mb-0">
              <Link href="/customer/support" className="text-light text-decoration-none me-2" title="Support Ticket">
                <i className="fab fa-rocketchat me-1"></i> Support Ticket
              </Link>
            </p>
          </div>

          {/* Address + Social */}
                <div className="col-12 col-md-6 text-md-end">
                <p className="small text-secondary mb-2">
                  📍 Shop #4A-27D, Level# 4, Block# A, Jamuna Future Park
                </p>

                <div className="d-flex justify-content-md-end gap-3" id="footer-social-medias">
                  {socialMedias.map((s) => {
                  // Convert any 'fa fa-' to 'fab fa-' in the icon class
                  let iconClass = s.icon || "fa-globe";
                  iconClass = iconClass.replace(/^fa fa-/, "fab fa-");
                  return (
                    <a
                    key={s.id}
                    href={s.link || "#"}
                    className="text-light"
                    target="_blank"
                    rel="noopener noreferrer"
                    title={s.name}
                    >
                    <i className={iconClass}></i>
                    </a>
                  );
                  })}
                </div>
                </div>
              </div>

              {/* Bottom */}
        <hr className="border-secondary my-4" />
        <div className="text-center pb-4">
          <small className="text-secondary">
            © 2026 Snapcart. All rights reserved.
          </small>
        </div>
      </div>
    </footer>
  );
}
