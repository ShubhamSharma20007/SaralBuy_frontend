//Default
import  { useEffect, useState } from "react";

//Images and Banners
import smartPhoneBanner from "../../image/Banners/smartPhoneBanner.png";
import raiseAQuotationBanner from "../../image/Banners/raiseAQuoationBanner.png";
import { useNavigate } from "react-router-dom";
//Styles
import "../../Styling/Banner/Banner.css";
import { useFetch } from "@/helper/use-fetch";
import bannerService from "@/services/banner.service";

//Variables


const Banner = () => {
  const {fn,data}= useFetch(bannerService.getBanners)
  let [banners,setBanners] = useState([
  // {
  //   image: smartPhoneBanner,
  //   text: (
  //     <>
  //       All the Latest Smartphones. One
  //       <br />
  //       Place. Smart Deals Inside!
  //     </>
  //   ),
  //   buttonLabel: "Place a Requirement",
  //   textClass: "banner-text-1",
  //   buttonClass: "banner-button-1",
  //   containerClass: "banner-content-1",
  // },
  // {
  //   image: raiseAQuotationBanner,
  //   text: "Everything You Wanna Sell, All in One Place",
  //   buttonLabel: "Raise your Bids",
  //   header: "Build with Confidence",
  //   textClass: "banner-text-2",
  //   buttonClass: "banner-button-2",
  //   containerClass: "banner-content-2",
  //   headerClass: "banner-header-2",
  // },
]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(()=>{
    fn()
  },[])

  useEffect(()=>{
    if(data){
      const response = data.map((banner:any)=>({
        image:banner.imageUrl,
        linkUrl:banner.linkUrl,
        text:banner.title,
        buttonLabel: "Checkout to me ",
        textClass: "banner-text-1",
        buttonClass: "banner-button-1",
        containerClass: "banner-content-1",
      }))
      setBanners(response)
    }
  },[data])
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    console.log(banners.length)
    if(banners.length > 0){
      interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 10000); 
    }
    return () => clearInterval(interval!);
  }, [data,banners]);

  const handleNavigate = (link:string)=>{
    const url = new URL(link, window.location.origin);

   const pathname = url.pathname;
    if (import.meta.env.DEV) {
    navigate(pathname);
  } else {
    navigate(link);
  }
  }

  return (
    <div className="banner-slider mt-5 sm:mt-10">
      {banners.map((banner:any, index) => (
        <div key={index}>
          <img
            src={banner.image}
            alt={`Banner ${index + 1}`}
            className={`banner-image ${
              index === currentIndex ? "active" : "inactive"
            }`}
          />
          {index === currentIndex && (
            <div className={banner.containerClass}>
              {banner.header && (
                <div className={banner.headerClass}>{banner.header}</div>
              )}
              <div className={banner.textClass}>{banner.text}</div>
              {
                banner.buttonLabel && (
                  <button className={banner.buttonClass}
              onClick={()=>handleNavigate(banner?.linkUrl)}
              >
                {banner.buttonLabel}
              </button>
                )
              }
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Banner;
