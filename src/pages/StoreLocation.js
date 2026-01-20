"use client";

import React from "react";
import SectionTitle from "@/components/html/SectionTitle";

export default function StoreLocation() {
  return (
    <section className="py-5">
      <div className="container">
        {/* Section Title */}
        <SectionTitle first="Our" highlight="Store Locations" />

        <div className="row">
          {/* Store Information Column */}
          <div className="col-12 col-md-6">
            <h3>Our Store Locations</h3>
            <p className="lead">Visit us at one of our locations for the best tech deals and customer service.</p>

            {/* Store Details */}
            <div className="store-info">
              <h5>Bashundhara City Shopping Complex</h5>
              <p>
                <strong>Location:</strong> Basement 2, Shop 28
              </p>
              <p>
                <strong>Phone:</strong> <a href="tel:+09678181418">09678181418</a>
              </p>
              <p>
                <strong>Email:</strong> <a href="mailto:contact@applegadgetsbd.com">contact@applegadgetsbd.com</a>
              </p>
            </div>

            <div className="store-info mt-4">
              <h5>Jamuna Future Park</h5>
              <p>
                <strong>Location:</strong> Level 4, Zone A (West Court), Shop 28B
              </p>
              <p>
                <strong>Phone:</strong> <a href="tel:+09678181418">09678181418</a>
              </p>
              <p>
                <strong>Email:</strong> <a href="mailto:contact@applegadgetsbd.com">contact@applegadgetsbd.com</a>
              </p>
            </div>
          </div>

          {/* Map Column */}
          <div className="col-12 col-md-6">
            {/* Embed Google Map */}
            <div className="map-container">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3649.124708482618!2d90.37909211531958!3d23.810510394421328!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3755c7c2aefbbfe9%3A0x7c8d3ee9b3de650d!2sBashundhara%20City%20Shopping%20Complex!5e0!3m2!1sen!2sbd!4v1678703958473!5m2!1sen!2sbd"
                width="100%"
                height="300"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
