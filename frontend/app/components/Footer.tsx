import Link from "next/link";

export default function Footer() {
  const phoneNumber = "7852922654";
  const email = "odmmdigital@gmail.com";

  const whatsappMessage = encodeURIComponent(
    "Hello Odisha Digital Media Mahasangha, I want to know more about membership and official updates."
  );

  return (
    <footer className="footer">
      <div className="footerInner">
        <div className="footerBrand">
          <p className="footerKicker">ASSOCIATION OF DIGITAL MEDIA ACTIVISTS</p>
          <h3>ODMM</h3>
          <p className="footerTagline">Odisha Digital Media Mahasangha</p>
        </div>

        <div className="footerLinks">
          <h4>QUICK LINKS</h4>
          <Link href="/">Home</Link>
          <Link href="/about-us">About Us</Link>
          <Link href="/members">Members</Link>
          <Link href="/women-cell">Women Cell</Link>
          <Link href="/supreme-council">Supreme Council</Link>
          <Link href="/mentors">Advisory Board</Link>
          <Link href="/self-regulatory-body">Self Regulatory Body (SRB)</Link>
          <Link href="/member-news-channels">Member News Channel</Link>
          <Link href="/web-news">Web News</Link>
          <Link href="/messages">Video Message</Link>
          <Link href="/gallery">Gallery</Link>
          <Link href="/contact-us">Contact Us</Link>
        </div>

        <div className="footerContact">
          <h4>CONTACT</h4>

          <p>
            Mobile / WhatsApp:{" "}
            <a href={`tel:+91${phoneNumber}`} className="footerPhone">
              {phoneNumber}
            </a>
          </p>

          <p>
            E-Mail:{" "}
            <a href={`mailto:${email}`} className="footerEmail">
              {email}
            </a>
          </p>

          <div className="socialLinks">
            <a
              href="https://www.facebook.com/share/18nEgqqvQd/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Facebook
            </a>

            <a
              href="https://youtube.com/@mediamahasangha?si=_W3z9_PIuZR4RyYk"
              target="_blank"
              rel="noopener noreferrer"
            >
              YouTube
            </a>

            <a
              href={`https://wa.me/91${phoneNumber}?text=${whatsappMessage}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp
            </a>

            <a
              href="https://x.com/odmmdigital"
              target="_blank"
              rel="noopener noreferrer"
            >
              X
            </a>
          </div>
        </div>
      </div>

      <div className="footerBottom">
        <p>© 2026 ODMM . All rights reserved.</p>

        <p>
          Designed &amp; Developed by S Swaraj | Contact:{" "}
          <a href="tel:+918260190379" className="footerPhone">
            +91 8260190379
          </a>
        </p>
      </div>
    </footer>
  );
}