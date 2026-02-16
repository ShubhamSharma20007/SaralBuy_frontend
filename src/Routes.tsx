import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "./App.css";


import HomeNavbar from "./Components/Navbar/HomeNavbar";
import Footer from "./Components/Footer/Footer";
import Authentication from "./Components/auth/Authentication";
import { AccountSettings } from "./Pages/profile/components/account-setting";
const Home = lazy(() => import("./Pages/Home"));
const Profile = lazy(() => import("./Pages/profile/Profile"));
const Requirement = lazy(() => import("./Pages/Requirement"));
const ProductLisiting = lazy(() => import("./Pages/ProductLisiting"));
const ContactVerification = lazy(() => import("./Pages/ContactVerification"));
const BidRequirements = lazy(() => import("./Pages/profile/Requirements"));
const Chatbot = lazy(() => import("./Pages/Chatbot"));
const BidListing = lazy(() => import("./Pages/profile/BidListing"));
const Notification = lazy(() => import("./Pages/profile/Notification"));
const Deal = lazy(() => import("./Pages/profile/Deal"));
const Cart = lazy(() => import("./Pages/profile/Cart"));
const UpdateDraft = lazy(() => import("./Pages/UpdateProductDraft"));
const ProductOverView = lazy(() => import("./Pages/ProductOverView"));
const Category = lazy(() => import("./Components/Category/Category"));
const RequirementOverview = lazy(() => import("./Pages/RequirementOverview"));
const BidOverview = lazy(() => import("./Pages/bidOverView"));

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default function AppRouters() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener("session-expired", handler);
    return () => window.removeEventListener("session-expired", handler);
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <HomeNavbar />
      <Authentication open={open} setOpen={setOpen} />

      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center text-lg">
            Loading page...
          </div>
        }
      >
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/requirement" element={<Requirement />} />

          <Route
            path="/category/:categoryId/:subCategoryId"
            element={<Category />}
          />

          <Route path="/account" element={<Profile />}>
            <Route index element={<AccountSettings />} />
            <Route path="bid" element={<BidListing />} />
            <Route path="cart" element={<Cart />} />
            <Route path="deal" element={<Deal />} />
            <Route path="requirements" element={<BidRequirements />} />
            <Route
              path="requirements/:requirementId"
              element={<RequirementOverview />}
            />
            <Route path="notification" element={<Notification />} />
          </Route>

          <Route path="/bid-overview/:bidId" element={<BidOverview />} />
          <Route path="/product-listing" element={<ProductLisiting />} />
          <Route path="/product-overview" element={<ProductOverView />} />
          <Route
            path="/contact-verification"
            element={<ContactVerification />}
          />
          <Route path="/update-draft/:productId" element={<UpdateDraft />} />
          <Route path="/chat" element={<Chatbot />} />

          <Route path="*" element={<h1>No Page found</h1>} />
        </Routes>
      </Suspense>

      <Footer />
    </Router>
  );
}
