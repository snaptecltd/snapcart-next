import "bootstrap/dist/css/bootstrap.min.css";
import BootstrapClient from "@/components/BootstrapClient";
import "@fortawesome/fontawesome-free/css/all.min.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./globals.css";

import Header from "../components/Header";
import Footer from "../components/Footer";
import Script from "next/script";
import { GlobalConfigProvider } from "@/context/GlobalConfigContext";
import FaviconUpdater from "../components/FaviconUpdater";
import GuestInit from "./GuestInit";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        {/* Load Bootstrap CSS in head */}
        <link 
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" 
          rel="stylesheet" 
          integrity="sha384-QWTKZyjpPEjISv5WaRU9OFeRpok6YctnYmDr5pNlyT2bRjXh0JMhjY6hW+ALEwIH" 
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <BootstrapClient />
        <GlobalConfigProvider>
          <FaviconUpdater />
          <Header />
          <GuestInit />
          {children}
          <ToastContainer position="top-right" autoClose={3000} />
          <Footer />
        </GlobalConfigProvider>
        
        {/* Load Bootstrap JS bundle */}
        <script 
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js" 
          integrity="sha384-YvpcrYf0tY3lHB60NNkmXc5s9fDVZLESaAA55NDzOxhy9GkcIdslK1eN7N6jIeHz" 
          crossOrigin="anonymous"
          async
        ></script>
      </body>
    </html>
  );
}