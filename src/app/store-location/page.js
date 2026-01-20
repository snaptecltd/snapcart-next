import SectionTitle from "@/components/html/SectionTitle";
import StoreLists from "./partials/StoreLists";

export const metadata = {
  title: "Store Locations - Snapcart",
  description:
    "Welcome to Snapcart, your one-stop shop for all your needs.",
};

export default function StoreLocationPage() {
  return (
    <section className="py-5">
      <div className="container">
        <SectionTitle first="Our" highlight="Store Locations" />
        <StoreLists />
      </div>
    </section>
  );
}
