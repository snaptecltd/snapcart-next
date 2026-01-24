import Register from "./Register";

export const metadata = {
  title: "Register - Snapcart",
  description:
    "Create an account on Snapcart to enjoy a personalized shopping experience, track your orders, and access exclusive deals.",
};

export default function StoreLocationPage() {
  return (
    <section className="py-5">
        <Register />
    </section>
  );
}
