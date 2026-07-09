"use client";

import {
  FaFacebookF,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function SocialSidebar() {
  const phoneNumber = "7852922654";

  const whatsappMessage = encodeURIComponent(
    "Hello Odisha Digital Media Mahasangha, I want to know more about membership and official updates."
  );

  return (
    <div className="desktopSocialSidebar">
      <a
        className="sideFb"
        href="https://www.facebook.com/share/18nEgqqvQd/"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Facebook"
      >
        <FaFacebookF />
      </a>

      <a
        className="sideX"
        href="https://x.com/odmmdigital"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="X"
      >
        <FaXTwitter />
      </a>

      <a
        className="sideWa"
        href={`https://wa.me/91${phoneNumber}?text=${whatsappMessage}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
      >
        <FaWhatsapp />
      </a>

      <a
        className="sideYt"
        href="https://youtube.com/@mediamahasangha?si=_W3z9_PIuZR4RyYk"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="YouTube"
      >
        <FaYoutube />
      </a>
    </div>
  );
}