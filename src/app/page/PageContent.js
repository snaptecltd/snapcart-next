"use client";

import { use, useEffect, useState } from "react";
import useSWR from "swr";
import { getStoreLocations } from "@/lib/api/global.service";
import Breadcrumb from "@/components/html/Breadcrumb";
import SectionTitle from "@/components/html/SectionTitle";
import { useParams } from "next/navigation";
import { getDynamicPage } from "@/lib/api/global.service";

export default function StoreLists() {
  const { slug } = useParams();
  const [page, setPage] = useState(null);

  useEffect(() => {
    getDynamicPage(slug).then((res) => {
      setPage(res?.data?.page || null);
    });
  }, [slug]);

  if (!page) {
    return (
      <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <h1 className="display-4 mb-3">404</h1>
          <p className="lead mb-4">Page Not Found</p>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    // { label: "Products", href: "/products" },
    { label: page.title },
  ];

  return (
    <div className="container py-3">
      <div className="d-flex justify-content-between align-items-center mb-3 pageheader">
        <SectionTitle first="Our" highlight="Store Locations" />
        <Breadcrumb items={breadcrumbItems} />
      </div>
      <div className="row mt-4">
        <div className="col-12">
            {/* Render HTML description */}
            {page.description && (
              <div
                className="page-description"
                dangerouslySetInnerHTML={{ __html: page.description }}
              />
            )}
        </div>
      </div>
    </div>
  );
}
