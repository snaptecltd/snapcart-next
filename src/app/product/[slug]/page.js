import ProductDetails from "./ProductDetails";
import { getProductDetails } from "@/lib/api/global.service";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const product = await getProductDetails(slug);

  const image =
    product.thumbnail_full_url?.path ||
    product.images_full_url?.[0]?.path;

  return {
    title: `${product.name} | SnapCart`,
    description: product.short_details?.replace(/<[^>]+>/g, "").slice(0, 160),
    openGraph: {
      type: "website",
      title: product.name,
      description: product.short_details,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: "summary_large_image",
    },
  };
}

export default function ProductPage({ params }) {
  return <ProductDetails />;
}
