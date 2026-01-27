import Cart from "./Cart";
export const metadata = {
  title: "Cart - Snapcart",
  description:
    "View and manage your shopping cart on Snapcart. Add, remove, or update items before checkout.",
};

export default function StoreLocationPage() {
  return (
    <section className="py-5">
        <Cart />
    </section>
  );
}
