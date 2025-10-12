import { lazy, Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
// import "@fontsource/poppins"; // Imports the default 400 weight
import "@fontsource/poppins/400.css"; // Imports the regular 400 weight
import "@fontsource/poppins/600.css"; // Imports the bold 700 weight
import Home from "./Pages/Home";
import Profile from "./Pages/profile/Profile";
import "./App.css";
import HomeNavbar from "./Components/Navbar/HomeNavbar";
import Footer from "./Components/Footer/Footer"
import Requirement from "./Pages/Requirement";
import ProductLisiting from "./Pages/ProductLisiting";
import ContactVerification from "./Pages/ContactVerification";
import  BidRequirements from "./Pages/profile/Requirements";
import Chatbot from "./Pages/Chatbot";
import BidListing from "./Pages/profile/BidListing";
import { AccountSettings } from "./Pages/profile/components/account-setting";
import Notification from "./Pages/profile/Notification";
import Deal from "./Pages/profile/Deal";
import Cart from "./Pages/profile/Cart";
import { useLocation } from "react-router-dom";
import UpdateDraft from "./Pages/UpdateProductDraft";
import Authentication from "./Components/auth/Authentication";
const ProductOverView = lazy(() => import("./Pages/ProductOverView"));
const Category = lazy(() => import("./Components/Category/Category"));
const RequirementOverview = lazy(()=>import("./Pages/RequirementOverview"))
const BidOverview = lazy(()=>import("./Pages/bidOverView"))
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};
export default function AppRouters() {
    const [open,setOpen] = useState(false)

    useEffect(()=>{
    const handler =()=> setOpen(true);
    window.addEventListener('session-expired',handler);
    return ()=>window.removeEventListener('session-expired',handler);
   },[])

 
  return (
    <Router>
        <ScrollToTop/>
        <HomeNavbar/>
        <Authentication open={open} setOpen={setOpen}/>

      <Suspense  fallback={<div className="h-screen"></div>}>
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/requirement" element={<Requirement/>} />
        <Route path="/category/:categoryId/:subCategoryId" element={<Category/>}/>
        <Route path="/account" element={<Profile />}  >
          <Route path="" element={<AccountSettings/>} index/>
          <Route path="bid" element={<BidListing/>}/>
        
          <Route path="cart" element={<Cart/>}/>
          <Route path="deal" element={<Deal/>}/>
          <Route path="requirements" element={<BidRequirements/>}/>
          <Route path="requirements/:requirementId" element={<RequirementOverview/>}/>
          <Route path="notification" element={<Notification/>}/>
        </Route>
        <Route path="/bid-overview/:bidId" element={<BidOverview/>}/>
        <Route path="/product-listing" element={ <ProductLisiting/>}/>
       <Route path="/product-overview" element={<ProductOverView />} />
        <Route path="/contact-verification" element={<ContactVerification/>}/>
        <Route path="/update-draft/:productId" element={<UpdateDraft/>}/>
        <Route path="/chat" element={<Chatbot/>}/>
      <Route path="*" element={<h1>No Page found</h1>}/>
      </Routes>
      </Suspense>
            <Footer/> 
    </Router>
  );
}

