"use client";

import Link from "next/link";
import { useState } from "react";

export default function OfferButton({ 
    href, 
    primaryColor, 
    secondaryColor, 
    children 
}) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <Link
            href={href}
            className="offer-btn btn fw-bold px-4 py-2 w-100"
            style={{ 
                background: isHovered ? primaryColor : primaryColor,
                color: "#fff",
                border: `2px solid ${primaryColor}`,
                transition: "all 0.3s ease",
                transform: isHovered ? "translateY(-2px)" : "translateY(0)",
                borderRadius: "50px",
                position: "relative",
                overflow: "hidden",
                letterSpacing: "0.5px"
            }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {children}
            <style>{`
                .offer-btn::after {
                    content: "";
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    width: 5px;
                    height: 5px;
                    background: rgba(255, 255, 255, 0.5);
                    opacity: 0;
                    border-radius: 100%;
                    transform: scale(1, 1) translate(-50%);
                    transform-origin: 50% 50%;
                }
                
                .offer-btn:hover::after {
                    animation: ripple 1s ease-out;
                }
                
                @keyframes ripple {
                    0% {
                        transform: scale(0, 0);
                        opacity: 0.5;
                    }
                    20% {
                        transform: scale(25, 25);
                        opacity: 0.3;
                    }
                    100% {
                        opacity: 0;
                        transform: scale(40, 40);
                    }
                }
            `}</style>
        </Link>
    );
}