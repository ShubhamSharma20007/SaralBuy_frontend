
import "../../Styling/Footer/Footer.css";

import { FaFacebookF, FaTwitter, FaInstagram, FaPinterestP, FaYoutube, FaMapMarkerAlt, FaEnvelope, FaPhone } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import saralBuyLogo from "/footer-logo.png"
const Footer = () => {
  return (
    <footer className=" footer-container">
      <div className="footer-content">
        {/* Logo & Description */}
        <div className="footer-section">
          <Link to={'/'} className="flex items-center gap-2">
            
              <img
                src={saralBuyLogo}
                className="max-h-20  dark:invert mix-blend-light"
                alt={'company logo'}
              />
            </Link>
          <p className="footer-description">
            Lorem Ipsum is simply dummy text of the printing and typesetting industry. 
            Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, 
            when an unknown printer took a galley.
          </p>
        </div>

        {/* Category */}
        <div className="footer-section">
          <h4 className="footer-title">Category</h4>
          <ul>
            <li>Building Material</li>
            <li>Roofing</li>
            <li>Fencing</li>
            <li>Concrete</li>
            <li>Insulation</li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer-section">
          <h4 className="footer-title">Support</h4>
          <ul>
            <li>Help & Support</li>
            <li>Terms & Conditions</li>
            <li>Privacy Policy</li>
            <li>Help</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer-section">
          <h4 className="footer-title">Contact</h4>
          <ul className="footer-contact">
            <li><FaMapMarkerAlt /> Lorem Ipsum is simply dummy text of the printing & typesetting</li>
            <li><FaEnvelope /> support@tcf.com</li>
            <li><FaPhone /> 1234567890</li>
          </ul>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="footer-bottom">
          <div className="footer-socials">
            <FaFacebookF /><FaTwitter /><FaInstagram /><FaPinterestP /><FaYoutube />
          </div>

        <p>Copyright@bestbuy2025</p>
        <div className="footer-payments">
          <img src="https://img.icons8.com/color/48/000000/paypal.png" alt="PayPal" />
          <img src="https://img.icons8.com/color/48/000000/visa.png" alt="Visa" />
        </div>
      </div>
    </footer>
  );
};

export default Footer;
