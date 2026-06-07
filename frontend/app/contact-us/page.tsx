import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaTelegramPlane,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function ContactUsPage() {
  return (
    <main className="contactPage">
      <section className="contactDesk">
        <div className="contactDeskTop">
          <p>CONTACT DESK</p>
          <h1>Contact Us</h1>
          <span>For membership, updates and official communication</span>
        </div>

        <div className="contactDeskBody">
          <h2>Odisha Digital Media Mahasangha</h2>

          <div className="contactInfoGrid">
            <div className="contactInfoCard">
              <p>Mobile / WhatsApp / Telegram</p>
              <strong>7852922654</strong>
            </div>

            <div className="contactInfoCard">
              <p>E-Mail</p>
              <strong>odmmdigital@gmail.com</strong>
            </div>
          </div>

          <div className="socialPresenceBox">
            <h3>SOCIAL PRESENCE</h3>

            <div className="contactSocialIcons">
              <a href="#" aria-label="Facebook">
                <FaFacebookF />
              </a>

              <a href="#" aria-label="YouTube">
                <FaYoutube />
              </a>

              <a href="#" aria-label="Instagram">
                <FaInstagram />
              </a>

              <a href="#" aria-label="WhatsApp">
                <FaWhatsapp />
              </a>

              <a href="#" aria-label="Telegram">
                <FaTelegramPlane />
              </a>

              <a href="#" aria-label="X">
                <FaXTwitter />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}