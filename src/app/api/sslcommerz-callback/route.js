// app/api/sslcommerz-callback/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // POST data পarser করুন
    const formData = await request.formData();
    const data = {};
    
    for (const [key, value] of formData.entries()) {
      data[key] = value;
    }
    
    console.log('SSLCommerz POST Data:', data);
    
    // Redirect URL তৈরি করুন সব data সহ
    const redirectUrl = new URL('/checkout/sslcommerz-callback', request.url);
    
    // সব data query parameter হিসেবে যোগ করুন
    Object.keys(data).forEach(key => {
      if (data[key]) {
        redirectUrl.searchParams.set(key, data[key]);
      }
    });
    
    // বিশেষ করে important fields
    if (data.tran_id) redirectUrl.searchParams.set('tran_id', data.tran_id);
    if (data.status) redirectUrl.searchParams.set('status', data.status);
    if (data.bank_tran_id) redirectUrl.searchParams.set('bank_tran_id', data.bank_tran_id);
    if (data.amount) redirectUrl.searchParams.set('amount', data.amount);
    
    console.log('Redirecting to:', redirectUrl.toString());
    
    // Redirect to the client page
    return NextResponse.redirect(redirectUrl.toString());
    
  } catch (error) {
    console.error('SSLCommerz Callback Error:', error);
    return NextResponse.redirect(
      new URL('/checkout/sslcommerz-callback?status=error', request.url)
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