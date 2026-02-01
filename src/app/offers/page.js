import Link from "next/link";
import { getOffersType } from "@/lib/api/global.service";

const offerTypeImages = {
  discounted: "/images/offer-discounted.png",
  featured: "/images/offer-featured.png",
  // Add more keys and images as needed
};

// Use an async Server Component for data fetching
export default async function OffersPage() {
  let offers = [];
  try {
    const data = await getOffersType();
    offers = Array.isArray(data) ? data : [];
  } catch (e) {
    offers = [];
  }

  return (
    <div className="container py-4">
      <nav className="mb-3">
        <span className="text-muted">
          <i className="fas fa-home"></i>
        </span>
        <span className="mx-2">/</span>
        <span>Offers</span>
      </nav>
      <div className="row justify-content-center">
        {offers.length === 0 ? (
          <div className="text-center text-muted py-5">No offers found.</div>
        ) : (
          offers.map((offer) => (
            <div key={offer.key} className="col-12 col-md-6 col-lg-4 mb-4">
              <div className="card shadow-sm border-0 h-100">
                <div className="card-body d-flex flex-column align-items-center">
                  <img
                    src={offerTypeImages[offer.key] || "/images/offer-default.png"}
                    alt={offer.name}
                    style={{
                      width: "100%",
                      maxWidth: 320,
                      height: 160,
                      objectFit: "contain",
                      borderRadius: 12,
                      marginBottom: 16,
                      background: "#fafafa",
                    }}
                  />
                  <h5 className="fw-bold mb-2 text-center">{offer.name}</h5>
                  <p className="text-muted text-center mb-3" style={{ minHeight: 36 }}>
                    {offer.key === "discounted"
                      ? "Get the best discounts on top products. Limited time only!"
                      : offer.key === "featured"
                      ? "Handpicked featured products just for you."
                      : "Explore our special offers."}
                  </p>
                  <Link
                    href={`/category?offer_type=${offer.key}`}
                    className="btn btn-warning fw-bold px-4 rounded-pill"
                    style={{ background: "#F67535", color: "#fff" }}
                  >
                    See Details <i className="fas fa-arrow-right ms-2"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
