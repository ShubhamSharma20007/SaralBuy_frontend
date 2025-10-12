//Default
import  { useEffect, useState } from "react";

//Images and Banners
import smartPhoneBanner from "../../image/Banners/smartPhoneBanner.png";
import raiseAQuotationBanner from "../../image/Banners/raiseAQuoationBanner.png";

//Styles
import "../../Styling/Banner/Banner.css";

//Variables
const banners = [
  {
    image: smartPhoneBanner,
    text: (
      <>
        All the Latest Smartphones. One
        <br />
        Place. Smart Deals Inside!
      </>
    ),
    buttonLabel: "Place a Requirement",
    textClass: "banner-text-1",
    buttonClass: "banner-button-1",
    containerClass: "banner-content-1",
  },
  {
    image: raiseAQuotationBanner,
    text: "Everything You Wanna Sell, All in One Place",
    buttonLabel: "Raise your Bids",
    header: "Build with Confidence",
    textClass: "banner-text-2",
    buttonClass: "banner-button-2",
    containerClass: "banner-content-2",
    headerClass: "banner-header-2",
  },
];

const Banner = () => {
  //useState
  const [currentIndex, setCurrentIndex] = useState(0);

  //useEffect
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length);
    }, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="banner-slider mt-5 sm:mt-10">
      {banners.map((banner, index) => (
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
              <button className={banner.buttonClass}>
                {banner.buttonLabel}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default Banner;
