"use client";
import React from "react";

const CategorySkeleton = ({ count = 5 }) => {
    return (
        <div style={{ display: "flex", gap: "24px", overflowX: "auto" }} className="hide-scrollbar">
            {Array.from({ length: count }).map((_, idx) => (
                <div
                    key={idx}
                    style={{
                        width: 240,
                        minWidth: 240,
                        background: "#fff",
                        borderRadius: 20,
                        boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                        padding: 24,
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: 16,
                    }}
                >
                    {/* Image Skeleton */}
                    <div
                        style={{
                            width: 120,
                            height: 120,
                            borderRadius: "50%",
                            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                            animation: "skeleton-loading 1.2s infinite linear",
                            marginBottom: 16,
                        }}
                    />
                    {/* Title Skeleton */}
                    <div
                        style={{
                            width: "70%",
                            height: 20,
                            borderRadius: 6,
                            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                            animation: "skeleton-loading 1.2s infinite linear",
                            marginBottom: 8,
                        }}
                    />
                    {/* Price Skeleton */}
                    <div
                        style={{
                            width: "40%",
                            height: 18,
                            borderRadius: 6,
                            background: "linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)",
                            animation: "skeleton-loading 1.2s infinite linear",
                        }}
                    />
                </div>
            ))}
            <style>
                {`
                    @keyframes skeleton-loading {
                        0% {
                            background-position: -200px 0;
                        }
                        100% {
                            background-position: calc(200px + 100%) 0;
                        }
                    }
                `}
            </style>
        </div>
    );
};

export default CategorySkeleton;