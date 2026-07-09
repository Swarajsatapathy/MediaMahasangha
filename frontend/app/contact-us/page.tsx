import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaTelegramPlane,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function ContactUsPage() {
  const phoneNumber = "7852922654";
  const email = "odmmdigital@gmail.com";
  const whatsappMessage = encodeURIComponent(
  "Hello Odisha Digital Media Mahasangha, I want to know more about membership and official updates."
);

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
              <p>Mobile</p>

              <strong>
                <a href={`tel:+91${phoneNumber}`} className="contactClickable">
                  {phoneNumber}
                </a>
              </strong>
            </div>

            <div className="contactInfoCard">
              <p>E-Mail</p>

              <strong>
                <a href={`mailto:${email}`} className="contactClickable">
                  {email}
                </a>
              </strong>
            </div>
          </div>

          <div className="socialPresenceBox">
            <h3>SOCIAL PRESENCE</h3>

            <div className="contactSocialIcons">
              <a
                href="https://www.facebook.com/share/18nEgqqvQd/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <FaFacebookF />
              </a>

              <a
                href="https://youtube.com/@mediamahasangha?si=_W3z9_PIuZR4RyYk"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
              >
                <FaYoutube />
              </a>

              <a
                href={`https://wa.me/91${phoneNumber}?text=${whatsappMessage} `}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
              >
                <FaWhatsapp />
              </a>

              <a
                href="https://x.com/odmmdigital"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X"
              >
                <FaXTwitter />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}