"use client";

import Link from "next/link";
import { getOffersType } from "@/lib/api/global.service";
import { useState, useEffect } from "react";
import OfferButton from "@/components/OfferButton"; // Import the client component

export default function OffersPage() {
    const [offers, setOffers] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchOffers() {
            try {
                const data = await getOffersType();
                setOffers(Array.isArray(data) ? data : []);
            } catch (e) {
                setOffers([]);
            } finally {
                setIsLoading(false);
            }
        }
        
        fetchOffers();
    }, []);

    // Define different banner styles based on offer key
    const getBannerStyle = (key) => {
        const styles = {
            discounted: {
                primary: "#F67535",
                secondary: "#FF8C42",
                gradient: "linear-gradient(135deg, #F67535, #FF8C42, #FFA726)",
                icon: "fa-percent",
                pattern: "discount-stripes"
            },
            featured: {
                primary: "#4A6FA5",
                secondary: "#6B8CBC",
                gradient: "linear-gradient(135deg, #4A6FA5, #6B8CBC, #8DAAE0)",
                icon: "fa-star",
                pattern: "star-pattern"
            },
            flash: {
                primary: "#D32F2F",
                secondary: "#FF5252",
                gradient: "linear-gradient(135deg, #D32F2F, #FF5252, #FF8A80)",
                icon: "fa-bolt",
                pattern: "flash-lines"
            },
            seasonal: {
                primary: "#388E3C",
                secondary: "#4CAF50",
                gradient: "linear-gradient(135deg, #388E3C, #4CAF50, #81C784)",
                icon: "fa-leaf",
                pattern: "leaf-pattern"
            },
            clearance: {
                primary: "#7B1FA2",
                secondary: "#9C27B0",
                gradient: "linear-gradient(135deg, #7B1FA2, #9C27B0, #CE93D8)",
                icon: "fa-tags",
                pattern: "zigzag-pattern"
            },
            bundle: {
                primary: "#0288D1",
                secondary: "#03A9F4",
                gradient: "linear-gradient(135deg, #0288D1, #03A9F4, #4FC3F7)",
                icon: "fa-box",
                pattern: "bundle-dots"
            }
        };

        return styles[key] || styles.featured;
    };

    // Get offer description
    const getOfferDescription = (key, name) => {
        const descriptions = {
            discounted: `Save big with our ${name}! Limited time discounts on selected items.`,
            featured: `Discover our ${name} - handpicked products just for you!`,
            flash: `Flash ${name}! Limited time offers that won't last long.`,
            seasonal: `Seasonal ${name} - perfect for the current season!`,
            clearance: `Clearance ${name} - massive discounts on outgoing stock!`,
            bundle: `Bundle ${name} - get more for less with special packages!`
        };
        return descriptions[key] || "Explore our special offers and deals.";
    };

    if (isLoading) {
        return (
            <div className="container py-4">
                <div className="text-center py-5">
                    <div className="spinner-border text-warning" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3 text-muted">Loading offers...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container py-4">
            <nav className="mb-4">
                <span className="text-muted">
                    <i className="fas fa-home me-1"></i> Home
                </span>
                <span className="mx-2">/</span>
                <span className="fw-bold">Special Offers</span>
            </nav>

            <div className="text-center mb-5">
                <h1 className="fw-bold display-5 mb-3">🎁 Special Offers</h1>
                <p className="text-muted lead">Discover amazing deals tailored just for you</p>
            </div>

            <style jsx>{`
                /* Offer Card Styles */
                .offer-card {
                    background: white;
                    border-radius: 16px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(0, 0, 0, 0.08);
                    height: 100%;
                }

                .offer-card:hover {
                    transform: translateY(-8px);
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
                }

                .offer-banner-wrapper {
                    position: relative;
                    height: 200px;
                    overflow: hidden;
                }

                .animated-banner {
                    position: relative;
                    width: 100%;
                    height: 100%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    overflow: hidden;
                }

                /* Banner Animations */
                @keyframes float {
                    0%, 100% {
                        transform: translateY(0) rotate(0deg);
                    }
                    50% {
                        transform: translateY(-10px) rotate(5deg);
                    }
                }

                @keyframes sparkle {
                    0%, 100% {
                        opacity: 0.5;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 1;
                        transform: scale(1.2);
                    }
                }

                @keyframes pulse {
                    0%, 100% {
                        transform: scale(1);
                        opacity: 0.6;
                    }
                    50% {
                        transform: scale(1.1);
                        opacity: 0.8;
                    }
                }

                @keyframes glow {
                    0%, 100% {
                        opacity: 0.4;
                    }
                    50% {
                        opacity: 0.8;
                    }
                }

                @keyframes shine {
                    0% {
                        transform: translateX(-100%) rotate(45deg);
                    }
                    100% {
                        transform: translateX(200%) rotate(45deg);
                    }
                }

                @keyframes flash {
                    0% {
                        opacity: 1;
                    }
                    100% {
                        opacity: 0.8;
                    }
                }

                /* Banner Elements */
                .banner-content {
                    position: relative;
                    z-index: 2;
                    text-align: center;
                    padding: 20px;
                }

                .banner-icon {
                    animation: float 3s ease-in-out infinite;
                    filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
                }

                .banner-title {
                    font-size: 2rem;
                    font-weight: 800;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                    margin-bottom: 10px;
                }

                .banner-badge {
                    display: inline-block;
                    background: rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(10px);
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 0.85rem;
                    letter-spacing: 1px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }

                .banner-sparkles {
                    position: absolute;
                    top: 20px;
                    right: 20px;
                    width: 40px;
                    height: 40px;
                    background: radial-gradient(circle, white 2px, transparent 3px);
                    background-size: 10px 10px;
                    animation: sparkle 2s infinite;
                    z-index: 1;
                }

                .banner-pulse {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 120%;
                    height: 120%;
                    border-radius: 50%;
                    border: 4px solid rgba(255, 255, 255, 0.3);
                    animation: pulse 3s infinite;
                    z-index: 1;
                }

                .banner-glow {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 150%;
                    height: 150%;
                    background: radial-gradient(circle, rgba(255,255,255,0.4) 0%, transparent 70%);
                    animation: glow 4s infinite;
                    z-index: 0;
                }

                /* Pattern Backgrounds */
                .discount-stripes {
                    background-image: 
                        repeating-linear-gradient(
                            45deg,
                            transparent,
                            transparent 10px,
                            rgba(255, 255, 255, 0.1) 10px,
                            rgba(255, 255, 255, 0.1) 20px
                        ) !important;
                    position: relative;
                }

                .discount-stripes::before {
                    content: "";
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: linear-gradient(
                        90deg,
                        transparent,
                        rgba(255, 255, 255, 0.1),
                        transparent
                    );
                    animation: shine 3s infinite;
                }

                .star-pattern {
                    background-image: 
                        radial-gradient(
                            circle at 10% 20%,
                            rgba(255, 255, 255, 0.1) 2px,
                            transparent 3px
                        ),
                        radial-gradient(
                            circle at 90% 80%,
                            rgba(255, 255, 255, 0.1) 2px,
                            transparent 3px
                        ),
                        radial-gradient(
                            circle at 50% 50%,
                            rgba(255, 255, 255, 0.1) 2px,
                            transparent 3px
                        ) !important;
                    background-size: 50px 50px, 60px 60px, 70px 70px;
                }

                .flash-lines {
                    background-image: 
                        repeating-linear-gradient(
                            -45deg,
                            transparent,
                            transparent 5px,
                            rgba(255, 255, 255, 0.15) 5px,
                            rgba(255, 255, 255, 0.15) 10px
                        ) !important;
                    animation: flash 1s infinite alternate;
                }

                .leaf-pattern {
                    background-image: 
                        url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M20 20c0 5.5-4.5 10-10 10S0 25.5 0 20 4.5 10 10 10s10 4.5 10 10z' fill='rgba(255,255,255,0.1)' fill-rule='evenodd'/%3E%3C/svg%3E") !important;
                    background-size: 30px 30px;
                }

                .zigzag-pattern {
                    background-image: 
                        linear-gradient(135deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%),
                        linear-gradient(225deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%) !important;
                    background-size: 20px 20px;
                }

                .bundle-dots {
                    background-image: 
                        radial-gradient(
                            circle,
                            rgba(255, 255, 255, 0.2) 2px,
                            transparent 3px
                        ) !important;
                    background-size: 20px 20px;
                }

                /* Offer Content */
                .offer-content {
                    padding: 24px;
                }

                .offer-title {
                    font-size: 1.5rem;
                    color: #333;
                    transition: color 0.3s ease;
                }

                .offer-card:hover .offer-title {
                    color: #F67535;
                }

                .offer-description {
                    font-size: 0.95rem;
                    line-height: 1.6;
                    min-height: 60px;
                }

                .offer-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                /* Responsive Design */
                @media (max-width: 768px) {
                    .offer-banner-wrapper {
                        height: 160px;
                    }
                    
                    .banner-title {
                        font-size: 1.5rem;
                    }
                    
                    .offer-content {
                        padding: 20px;
                    }
                }

                @media (max-width: 576px) {
                    .offer-banner-wrapper {
                        height: 140px;
                    }
                    
                    .offer-content {
                        padding: 16px;
                    }
                }
            `}</style>

            <div className="row justify-content-center g-4">
                {offers.length === 0 ? (
                    <div className="col-12">
                        <div className="text-center py-5">
                            <div className="mb-3">
                                <i className="fas fa-gift fa-3x text-muted"></i>
                            </div>
                            <h4 className="text-muted">No offers available at the moment</h4>
                            <p className="text-muted">Check back soon for exciting deals!</p>
                        </div>
                    </div>
                ) : (
                    offers.map((offer) => {
                        const style = getBannerStyle(offer.key);
                        const description = getOfferDescription(offer.key, offer.name);

                        return (
                            <div key={offer.key} className="col-12 col-md-6 col-lg-4">
                                <div className="offer-card">
                                    <div className="offer-banner-wrapper">
                                        <div 
                                            className={`animated-banner ${style.pattern}`}
                                            style={{ background: style.gradient }}
                                        >
                                            {/* Animated elements */}
                                            <div className="banner-sparkles"></div>
                                            <div className="banner-pulse"></div>
                                            <div className="banner-glow"></div>
                                            
                                            {/* Banner content */}
                                            <div className="banner-content">
                                                <i className={`fas ${style.icon} banner-icon fa-3x mb-3`}></i>
                                                <h3 className="banner-title">{offer.name}</h3>
                                                <div className="banner-badge">HOT DEAL</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="offer-content">
                                        <h5 className="offer-title fw-bold mb-2">{offer.name}</h5>
                                        <p className="offer-description text-muted mb-3">
                                            {description}
                                        </p>
                                        <div className="offer-meta mb-3">
                                            <span className="badge bg-light text-dark me-2">
                                                <i className="fas fa-clock me-1"></i> Limited Time
                                            </span>
                                            <span className="badge bg-light text-dark">
                                                <i className="fas fa-users me-1"></i> Popular
                                            </span>
                                        </div>
                                        <OfferButton
                                            href={`/category?offer_type=${offer.key}`}
                                            primaryColor={style.primary}
                                            secondaryColor={style.secondary}
                                        >
                                            Explore Now <i className="fas fa-arrow-right ms-2"></i>
                                        </OfferButton>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}