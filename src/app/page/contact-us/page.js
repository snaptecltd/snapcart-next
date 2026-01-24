import ContactUs from "./ContactUs";

export const metadata = {
  title: "Contact Us - Snapcart",
  description:
    "Get in touch with Snapcart for any inquiries, support, or feedback. We're here to help you with your shopping experience.",
};

export default function StoreLocationPage() {
  return (
    <section className="py-5">
        <ContactUs />
    </section>
  );
}
