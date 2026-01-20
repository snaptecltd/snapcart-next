import "bootstrap/dist/css/bootstrap.min.css";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Script from "next/script";
import { GlobalConfigProvider } from "@/context/GlobalConfigContext";
import FaviconUpdater from "../components/FaviconUpdater";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />

        <GlobalConfigProvider>
          <FaviconUpdater />
          <Header />
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
          <Footer />
        </GlobalConfigProvider>
      </body>
    </html>
  );
}
