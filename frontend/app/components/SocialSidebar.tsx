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
      <a className="sideFb" href="#" aria-label="Facebook">
        <FaFacebookF />
      </a>

      <a className="sideX" href="#" aria-label="X">
        <FaXTwitter />
      </a>

      <a className="sideWa" href="#" aria-label="WhatsApp">
        <FaWhatsapp />
      </a>

      <a className="sideIg" href="#" aria-label="Instagram">
        <FaInstagram />
      </a>

      <a className="sideYt" href="#" aria-label="YouTube">
        <FaYoutube />
      </a>

      <a className="sideTg" href="#" aria-label="Telegram">
        <FaTelegramPlane />
      </a>
    </div>
  );
}