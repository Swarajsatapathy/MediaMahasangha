import Link from "next/link";
import LiveClock from "./LiveClock";
import MobileNav from "./MobileNav";
import SocialSidebar from "./SocialSidebar";

import {
  FaFacebookF,
  FaWhatsapp,
  FaInstagram,
  FaYoutube,
  FaTelegramPlane,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Header() {
  return (
    <>
      <SocialSidebar />

      <div className="topBar">
        <div className="clock">
          <LiveClock />
        </div>

        <div className="topSocials">
          <a className="topFb" href="#" aria-label="Facebook">
            <FaFacebookF />
          </a>

          <a className="topX" href="#" aria-label="X">
            <FaXTwitter />
          </a>

          <a className="topYt" href="#" aria-label="YouTube">
            <FaYoutube />
          </a>

          <a className="topIg" href="#" aria-label="Instagram">
            <FaInstagram />
          </a>

          <a className="topWa" href="#" aria-label="WhatsApp">
            <FaWhatsapp />
          </a>

          <a className="topTg" href="#" aria-label="Telegram">
            <FaTelegramPlane />
          </a>
        </div>

        <a className="joinMemberBtn">Join as Member</a>
      </div>

      <header className="siteHeader bannerHeader">
        <img src="/banner.jpg" alt="ODMM News Banner" />
      </header>

      <nav className="navBar">
        <Link href="/">Home</Link>
        <Link href="/about-us">About Us</Link>
        <Link href="/mentors">Mentors</Link>
        <Link href="/members">Members</Link>
        <Link href="/web-news">Web News</Link>
        <Link href="/messages">Messages</Link>
        <Link href="/srb">SRB</Link>
        <Link href="/contact-us">Contact Us</Link>
      </nav>

      <MobileNav />
    </>
  );
}