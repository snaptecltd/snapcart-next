import ProductDetails from "./ProductDetails";

export const metadata = {
  title: "ProductDetails - Snapcart",
  description:
    "Discover detailed information about our products on Snapcart. Explore features, specifications, pricing, and customer reviews to make informed purchasing decisions. Shop with confidence and find the perfect products for your needs.",
};

export default function StoreLocationPage() {
  return (
    <section className="py-5">
        <ProductDetails />
    </section>
  );
}
