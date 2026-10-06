"use client";

import Link from "next/link";
import { useState } from "react";
import { FaBars, FaTimes, FaSearch } from "react-icons/fa";

export default function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="mobileNav">
     <button className="mobileMenuBtn" onClick={() => setOpen(true)}>
  <FaBars />
  <span>Menu</span>
</button>
      {open && (
        <div className="mobileMenuOverlay">
          <div className="mobileMenuPanel">
            <div className="mobileMenuTop">
              <h3>ODMM</h3>
              <button onClick={() => setOpen(false)}>
                <FaTimes />
              </button>
            </div>

            <div className="mobileSearch">
              <input type="text" placeholder="Search news..." />
            </div>

            <nav className="mobileLinks">
              <Link href="/" onClick={() => setOpen(false)}>
  Home
</Link>
              <Link href="/about-us" onClick={() => setOpen(false)}>
  About Us
</Link>
              <Link href="/members" onClick={() => setOpen(false)}>
  Members
</Link>
              <Link href="/women-cell" onClick={() => setOpen(false)}>
  Women Cell
</Link>
              <Link href="/supreme-council" onClick={() => setOpen(false)}>
  Supreme Council
</Link>
              <Link href="/mentors" onClick={() => setOpen(false)}>
  Advisory Board
</Link>
              <Link href="/self-regulatory-body" onClick={() => setOpen(false)}>
  Self Regulatory Body (SRB)
</Link>
              <Link href="/member-news-channels" onClick={() => setOpen(false)}>
  Member News Channel
</Link>
              <Link href="/web-news" onClick={() => setOpen(false)}>
  Web News
</Link>
              <Link href="/messages" onClick={() => setOpen(false)}>
  Video Message
</Link>
              <Link href="/gallery" onClick={() => setOpen(false)}>
  Gallery
</Link>
              <Link href="/contact-us" onClick={() => setOpen(false)}>
  Contact Us
</Link>
            </nav>

          </div>
        </div>
      )}
    </div>
  );
}