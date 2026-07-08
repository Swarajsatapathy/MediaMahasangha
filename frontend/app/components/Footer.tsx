import Link from "next/link";

export default function Footer() {
return (
<footer className="footer">
  <div className="footerInner">
    <div className="footerBrand">
      <p className="footerKicker">ASSOCIATION OF DIGITAL MEDIA ACTIVISTS</p>
      <h3>ODMM</h3>
      <p className="footerTagline">
        Odisha Digital Media Mahasangha
      </p>
    </div>

    <div className="footerLinks">
      <h4>QUICK LINKS</h4>
      <Link href="/about-us">About Us</Link>
      <Link href="/contact-us">Contact Us</Link>
      <Link href="/member-news-channels">Member News Channels</Link>
      <Link href="/self-regulatory-body">Self Regulatory Body</Link>
      <Link href="/mentors">Mentors</Link>
      <Link href="/members">Members</Link>
      <Link href="/web-news">Web News</Link>
      <Link href="/messages">Messages</Link>
    </div>

    <div className="footerContact">
      <h4>CONTACT</h4>
      <p>Mobile / WhatsApp / Telegram: 7852922654</p>
      <p>E-Mail: odmmdigital@gmail.com</p>

      <div className="socialLinks">
        <a>Facebook</a>
        <a>Instagram</a>
        <a>YouTube</a>
        <a>WhatsApp</a>
        <a>Telegram</a>
        <a>X</a>
      </div>
    </div>
  </div>

  <div className="footerBottom">
    <p>© 2026 ODMM . All rights reserved.</p>
    <p>
      Designed &amp; Developed by S Swaraj |  Contact:{" "}
  <a href="tel:+918260190379" className="footerPhone">
    +91 8260190379
  </a>
    </p>
  </div>
</footer>
    );
}