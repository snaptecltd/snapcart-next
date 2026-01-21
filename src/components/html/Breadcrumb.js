'use client';
import React from "react";
import { Link } from "next/link";

const Breadcrumb = ({ items = [] }) => {
  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb mb-0">
        <li className="breadcrumb-item">
          <Link to="/"><i className="fas fa-home"></i></Link>
        </li>
        {items.map((item, idx) => (
          <li
            key={idx}
            className={`breadcrumb-item ${
              idx === items.length - 1 ? "active" : ""
            }`}
            aria-current={idx === items.length - 1 ? "page" : undefined}
          >
            {item.href && idx !== items.length - 1 ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              item.label
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
