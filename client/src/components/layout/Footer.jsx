import React from 'react'
import { Mail } from 'lucide-react'
import Logo from "../ui/Logo";
import { Link } from 'react-router-dom'
import content from '../../content/static.json'

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
    ],
    legal: [
      { name: 'Terms & Conditions', href: '/terms' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Refund Policy', href: '/refund-policy' },
      { name: 'Shipping Policy', href: '/shipping-policy' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
    ],
  }
  // legal links are stored separately in footerLinks.legal

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border-soft">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
          {/* Brand Column */}
          <div className="col-span-1">
            {/* Logo */}
             <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <Link to="/" className="flex items-center gap-3 no-underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">
                              <Logo className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
                              <div className="text-base sm:text-lg font-bold text-text-primary">{content.platformName}</div>
                            </Link>
                          </div>

            {/* Description */}
            <p className="text-text-secondary mb-4 max-w-sm text-sm md:text-base">
              Your trusted platform for mastering reading comprehension. Practice daily with
              expert-curated passages and improve your competitive exam scores.
            </p>

            {/* Social Links hidden for now */}

            {/* Newsletter moved to its own column on larger screens; it will occupy full row on small screens */}
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="text-text-primary font-semibold mb-3 text-base md:text-lg">Quick Links</h3>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm md:text-base block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter will be rendered after the Support column so it appears last and doesn't overlap */}

          {/* Support Links */}
          <div className="col-span-1">
            <h3 className="text-text-primary font-semibold mb-3 text-base md:text-lg">Support</h3>
            <ul className="space-y-2 md:space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm md:text-base block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter (placed last to avoid overlap) - hidden for now (do not delete) */}
          <div className="col-span-2 md:col-span-1 hidden">
            <h3 className="text-text-primary font-semibold mb-3 text-base md:text-lg">Stay Updated</h3>
              <p className="text-text-secondary text-xs md:text-sm mb-3">Get the latest RC tips and practice updates delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white border border-border-soft rounded-lg text-text-primary placeholder-neutral-grey focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent transition-all text-sm"
              />
              <button className="px-4 sm:px-6 py-2 sm:py-2.5 bg-gradient-to-r from-primary to-primary-light text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 text-sm whitespace-nowrap hover:from-primary-dark hover:to-primary">
                <Mail className="w-4 h-4" />
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Newsletter was moved into the Brand column to consolidate signup and brand content. */}
      </div>

      {/* Bottom Bar */}
     <div className="border-t border-border-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center text-center md:text-left">
            {/* Copyright */}
            <div className="text-text-secondary text-xs sm:text-sm order-2 md:order-1">
              © {currentYear} {content.platformName}. All rights reserved.
            </div>

            {/* Legal links in bottom bar (desktop) */}
            <div className="order-3 md:order-2">
                <nav className="flex flex-wrap md:flex-nowrap items-center justify-center md:justify-center gap-3">
                    {footerLinks.legal.map((link, idx) => (
                      <span key={idx} className="text-[12px] text-text-secondary md:whitespace-nowrap">
                        <a href={link.href} className="hover:text-primary">{link.name}</a>
                        {idx < footerLinks.legal.length - 1 && <span className="hidden md:inline mx-3 text-text-secondary">•</span>}
                      </span>
                    ))}
                </nav>
            </div>

            {/* Made with love by Delpat */}
            <div className="text-text-secondary text-xs sm:text-sm flex items-center justify-center md:justify-end gap-2 order-1 md:order-3">
              Made with <span className="text-error-red animate-pulse">❤️</span> by <a className="hover:text-primary ml-1" href="https://delpat.in" target="_blank" rel="noreferrer">Delpat</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}