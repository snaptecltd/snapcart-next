"use client";

export default function Footer() {
  return (
    <footer className="bg-dark text-light py-5 mt-5">
      <div className="container">
        <div className="row">
          {/* Left Column - Static Content */}
          <div className="col-12 col-md-6">
            <h5>Location</h5>
            <ul className="list-unstyled">
              <li>
                <i className="fas fa-map-marker-alt" /> Bashundhara City Shopping Complex, Basement 2, Shop 28
              </li>
              <li>
                <i className="fas fa-phone-alt" /> 09678181418
              </li>
              <li>
                <i className="fas fa-envelope" /> contact@applegadgetsbd.com
              </li>
            </ul>
          </div>

          {/* Right Column - Static Content */}
          <div className="col-12 col-md-6">
            <div className="d-flex justify-content-between">
              {/* Social Media Links */}
              <div className="social-icons">
                <a href="#" className="text-light me-3">
                  <i className="fab fa-facebook-f" />
                </a>
                <a href="#" className="text-light me-3">
                  <i className="fab fa-twitter" />
                </a>
                <a href="#" className="text-light me-3">
                  <i className="fab fa-instagram" />
                </a>
                <a href="#" className="text-light">
                  <i className="fab fa-linkedin-in" />
                </a>
              </div>

              {/* Policy Links */}
              <div className="policy-links">
                <h6>Policies</h6>
                <ul className="list-unstyled">
                  <li><a href="/privacy-policy" className="text-light">Privacy Policy</a></li>
                  <li><a href="/emi-policy" className="text-light">EMI and Payment Policy</a></li>
                  <li><a href="/warranty-policy" className="text-light">Warranty Policy</a></li>
                  <li><a href="/exchange-policy" className="text-light">Exchange Policy</a></li>
                  <li><a href="/return-policy" className="text-light">Return Policy</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="row mt-4">
          <div className="col text-center">
            <small>© 2026 Snapcart. All rights reserved.</small>
          </div>
        </div>
      </div>
    </footer>
  );
}
