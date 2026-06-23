"use client";

import { useState, useEffect } from "react";

export default function MinimalHeader() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header id="site-header" className={scrolled ? "scrolled" : ""}>
      {/* Desktop */}
      <div id="site-header__desktop" style={{ display: "flex", width: "100%", alignItems: "center", justifyContent: "space-between" }}>
        <div id="site-header__logo">
          <a href="#home-hero" aria-label="Ardhiansyah">
            <svg width="48" height="28" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* AR monogram */}
              <path d="M8 24L16 4L24 24H20.5L18.5 18H13.5L11.5 24H8ZM14.5 15H17.5L16 9L14.5 15Z" fill="#F8F7F2" />
              <path d="M26 4H34C36.2 4 38 4.8 39.2 6.2C40.4 7.6 40.8 9.2 40.8 11C40.8 13.2 40 15 38.4 16.2L42 24H37.5L34.4 17H30V24H26V4ZM30 14H33.5C35 14 36.2 13 36.2 11C36.2 9 35 8 33.5 8H30V14Z" fill="#F8F7F2" />
            </svg>
          </a>
        </div>
      </div>

      {/* Mobile */}
      <div id="site-header__mobile">
        <div id="site-header__mobile-logo">
          <a href="#home-hero" aria-label="Ardhiansyah">
            <svg width="36" height="20" viewBox="0 0 48 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M8 24L16 4L24 24H20.5L18.5 18H13.5L11.5 24H8ZM14.5 15H17.5L16 9L14.5 15Z" fill="#F8F7F2" />
              <path d="M26 4H34C36.2 4 38 4.8 39.2 6.2C40.4 7.6 40.8 9.2 40.8 11C40.8 13.2 40 15 38.4 16.2L42 24H37.5L34.4 17H30V24H26V4ZM30 14H33.5C35 14 36.2 13 36.2 11C36.2 9 35 8 33.5 8H30V14Z" fill="#F8F7F2" />
            </svg>
          </a>
        </div>
      </div>
    </header>
  );
}
