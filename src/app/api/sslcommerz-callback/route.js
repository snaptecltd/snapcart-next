// app/api/sslcommerz-callback/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    let data = {};

    const contentType = request.headers.get("content-type") || "";
    const url = new URL(request.url);

    console.log("SSLCommerz Content-Type:", contentType);

    // First: Always capture query params (very important)
    url.searchParams.forEach((value, key) => {
      data[key] = value;
    });

    // Then try to read body safely
    const rawBody = await request.text();

    if (rawBody && rawBody.trim() !== "") {
      try {
        if (contentType.includes("application/json")) {
          data = { ...data, ...JSON.parse(rawBody) };
        } else {
          const params = new URLSearchParams(rawBody);
          params.forEach((value, key) => {
            data[key] = value;
          });
        }
      } catch (e) {
        console.log("Body parse skipped (invalid or empty JSON)");
      }
    }

    console.log("Final Parsed SSLCommerz Data:", data);

    const redirectUrl = new URL(
      "/checkout/sslcommerz-callback",
      request.url
    );

    Object.keys(data).forEach((key) => {
      if (data[key]) {
        redirectUrl.searchParams.set(key, data[key]);
      }
    });

    return NextResponse.redirect(redirectUrl.toString());
  } catch (error) {
    console.error("SSLCommerz Callback Fatal Error:", error);

    return NextResponse.redirect(
      new URL("/checkout/sslcommerz-callback?status=error", request.url)
    );
  }
}

// GET request handle (optional)
export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'success';
  const tran_id = searchParams.get('tran_id') || '';
  
  return NextResponse.redirect(
    new URL(`/checkout/sslcommerz-callback?status=${status}&tran_id=${tran_id}`, request.url)
  );
}