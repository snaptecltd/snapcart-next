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

// useSWR for caching and fetching
const { data, error } = useSWR(
    slug ? ["dynamicPage", slug] : null,
    () => getDynamicPage(slug).then((res) => res?.data?.page || null),
    {
        dedupingInterval: 1800000, // 30 minutes in milliseconds
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    }
);

const page = data;

if (error || !page) {
    return (
        <div className="container py-5 d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
            <div className="text-center">
                <div className="spinner-border text-primary mb-3" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
                <div>Loading...</div>
            </div>
        </div>
    );
}

  const breadcrumbItems = [
    // { label: "Products", href: "/products" },
    { label: page.title },
  ];

// Split the page title into words
const titleWords = page.title ? page.title.split(" ") : [];
const firstWord = titleWords[0] || "";
const highlightWords = titleWords.slice(1).join(" ");

return (
    <div className="container py-3">
        <div className="d-flex justify-content-between align-items-center mb-3 pageheader">
            <SectionTitle first={firstWord} highlight={highlightWords} />
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
