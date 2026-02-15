// app/api/sslcommerz-callback/route.js

import { NextResponse } from "next/server";

/**
 * SSLCommerz Callback Handler
 * Handles POST from SSLCommerz and safely redirects to frontend page
 */

export async function POST(request) {
  try {
    let data = {};

    const contentType = request.headers.get("content-type") || "";
    const url = new URL(request.url);

    console.log("SSLCommerz Content-Type:", contentType);
    console.log("SSLCommerz Request URL:", request.url);

    // ✅ 1. Always capture query params first
    url.searchParams.forEach((value, key) => {
      data[key] = value;
    });

    // ✅ 2. Safely read body
    const rawBody = await request.text();

    if (rawBody && rawBody.trim() !== "") {
      try {
        if (contentType.includes("application/json")) {
          const jsonData = JSON.parse(rawBody);
          data = { ...data, ...jsonData };
        } else {
          const params = new URLSearchParams(rawBody);
          params.forEach((value, key) => {
            data[key] = value;
          });
        }
      } catch (err) {
        console.log("Body parsing skipped:", err.message);
      }
    }

    console.log("Final Parsed SSLCommerz Data:", data);

    // ✅ 3. Build frontend redirect URL
    const redirectUrl = new URL(
      "/checkout/sslcommerz-callback",
      request.url
    );

    Object.keys(data).forEach((key) => {
      if (data[key]) {
        redirectUrl.searchParams.set(key, data[key]);
      }
    });

    console.log("Redirecting to:", redirectUrl.toString());

    // ✅ 4. IMPORTANT: Use 303 to convert POST → GET
    return NextResponse.redirect(redirectUrl.toString(), {
      status: 303,
    });

  } catch (error) {
    console.error("SSLCommerz Callback Fatal Error:", error);

    return NextResponse.redirect(
      new URL("/checkout/sslcommerz-callback?status=error", request.url),
      { status: 303 }
    );
  }
}

/**
 * Handle GET requests directly (if gateway ever sends GET)
 */
export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const redirectUrl = new URL(
    "/checkout/sslcommerz-callback",
    request.url
  );

  searchParams.forEach((value, key) => {
    redirectUrl.searchParams.set(key, value);
  });

  return NextResponse.redirect(redirectUrl.toString(), {
    status: 303,
  });
}
