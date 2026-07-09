"use client";

import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaTelegramPlane,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function SocialSidebar() {
  return (
    <div className="desktopSocialSidebar">
      <a className="sideFb" href="https://www.facebook.com/share/18nEgqqvQd/" aria-label="Facebook">
        <FaFacebookF />
      </a>

      <a className="sideX" href="https://x.com/odmmdigital" aria-label="X">
        <FaXTwitter />
      </a>

      <a className="sideWa" href="https://wa.me/917852922654" aria-label="WhatsApp">
        <FaWhatsapp />
      </a>

      <a className="sideYt" href="https://youtube.com/@mediamahasangha?si=_W3z9_PIuZR4RyYk" aria-label="YouTube">
        <FaYoutube />
      </a>
    </div>
  );
}