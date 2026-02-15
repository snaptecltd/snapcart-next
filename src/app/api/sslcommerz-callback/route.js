// app/api/sslcommerz-callback/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  // CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
  
  // Handle OPTIONS request (preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { status: 204, headers });
  }

  try {
    let data = {};

    const contentType = request.headers.get("content-type") || "";
    const url = new URL(request.url);

    console.log("SSLCommerz Content-Type:", contentType);
    console.log("SSLCommerz Request URL:", request.url);

    // First: Always capture query params
    url.searchParams.forEach((value, key) => {
      data[key] = value;
    });

    // Then try to read body safely
    const rawBody = await request.text();
    console.log("Raw body length:", rawBody.length);

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
      } catch (e) {
        console.log("Body parse skipped:", e.message);
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

    console.log("Redirecting to:", redirectUrl.toString());

    return NextResponse.redirect(redirectUrl.toString(), { headers });
    
  } catch (error) {
    console.error("SSLCommerz Callback Fatal Error:", error);

    return NextResponse.redirect(
      new URL("/checkout/sslcommerz-callback?status=error", request.url),
      { headers }
    );
  }
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'success';
  const tran_id = searchParams.get('tran_id') || '';
  
  return NextResponse.redirect(
    new URL(`/checkout/sslcommerz-callback?status=${status}&tran_id=${tran_id}`, request.url)
  );
}

// Handle OPTIONS method for CORS preflight
export async function OPTIONS(request) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}