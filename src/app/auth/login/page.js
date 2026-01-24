import Login from "./Login";

export const metadata = {
  title: "Login - Snapcart",
  description:
    "Access your Snapcart account to manage your orders, track shipments, and enjoy a personalized shopping experience.",
};

export default function StoreLocationPage() {
  return (
    <section className="py-5">
        <Login />
    </section>
  );
}
