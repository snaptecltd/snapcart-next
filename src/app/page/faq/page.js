import Faq from "./Faq";

export const metadata = {
  title: "FAQ - Snapcart",
  description:
    "Find answers to frequently asked questions about Snapcart, our services, and how we can assist you in your shopping experience.",
};

export default function StoreLocationPage() {
  return (
    <section className="py-5">
        <Faq />
    </section>
  );
}
