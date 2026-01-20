"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { getStoreDetails } from "@/lib/api/global.service";

export default function StoreDetailsPage() {
  const { slug } = useParams();
  const [store, setStore] = useState(null);

  useEffect(() => {
    if (!slug) return;
    getStoreDetails(slug).then((data) => {
      setStore(data?.store || null);
    });
  }, [slug]);

  if (!store) {
    return (
      <div className="container py-5">
        <div className="text-center py-5">Loading...</div>
      </div>
    );
  }

return (
    <div className="container py-4">
        <div className="row g-4 align-items-start">
            {/* Store Info and Banner */}
            <div className="col-12 col-lg-7">
                <h5 className="fw-bold mb-2">{store.store_name}</h5>
                <div className="mb-2 text-muted d-flex align-items-center gap-2">
                    <i className="fa-solid fa-location-dot"></i>
                    <span>{store.address}</span>
                </div>
                <div className="mb-2 text-muted d-flex align-items-center gap-2">
                    <i className="fa-solid fa-phone"></i>
                    <span>{store.contact_number}</span>
                </div>
            </div>
            <div className="col-12 col-lg-5">
                <img
                    src={store.banner_url?.path || "/placeholder/image.jpg"}
                    alt={store.store_name}
                    className="img-fluid rounded shadow-sm w-100"
                    style={{ objectFit: "cover", maxHeight: 180 }}
                />
            </div>
        </div>

        {/* Map */}
        <div className="row mt-4">
            <div className="col-12">
                <div className="rounded overflow-hidden shadow-sm" style={{ minHeight: 300 }}>
                    {store.map_embed_url ? (
                        <div
                            dangerouslySetInnerHTML={{ __html: store.map_embed_url }}
                            style={{ width: "100%", height: 340 }}
                        />
                    ) : (
                        <iframe
                            src="https://www.google.com/maps"
                            width="100%"
                            height="340"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Store Location Map"
                        ></iframe>
                    )}
                </div>
            </div>
        </div>
    </div>
);
}
