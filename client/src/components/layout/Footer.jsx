import React from 'react'
import { BookOpen, Mail, Twitter, Linkedin, Facebook, Instagram } from 'lucide-react'
import Logo from "../ui/Logo";
import { Link } from 'react-router-dom'

export default function Footer() {
  const footerLinks = {
    product: [
      { name: 'Home', href: '/' },
      { name: 'About', href: '/about' },
    ],
    support: [
      { name: 'Contact Us', href: '/contact' },
      { name: 'Help Center', href: '/help' },
    ],
  }

  const legalLinks = [
    { name: 'Terms & Conditions', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Refund Policy', href: '/refund-policy' },
  ]

  const socialLinks = [
    { icon: Twitter, href: '#', label: 'Twitter', color: 'hover:text-primary' },
    { icon: Linkedin, href: '#', label: 'LinkedIn', color: 'hover:text-secondary' },
    { icon: Facebook, href: '#', label: 'Facebook', color: 'hover:text-primary' },
    { icon: Instagram, href: '#', label: 'Instagram', color: 'hover:text-accent-amber' },
  ]

  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-background border-t border-border-soft">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="sm:col-span-2">
            {/* Logo */}
             <div className="flex items-center gap-3 mb-6 sm:mb-8">
                            <Link to="/" className="flex items-center gap-3 no-underline focus:outline-none focus:ring-2 focus:ring-primary/30 rounded">
                              <Logo className="w-8 h-8 sm:w-9 sm:h-9 text-primary" />
                              <div className="text-base sm:text-lg font-bold text-text-primary">ARYC</div>
                            </Link>
                          </div>

            {/* Description */}
            <p className="text-text-secondary mb-6 max-w-sm text-sm sm:text-base">
              Your trusted platform for mastering reading comprehension. Practice daily with
              expert-curated passages and improve your competitive exam scores.
            </p>

            {/* Social Links */}
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social, index) => {
                const Icon = social.icon
                return (
                  <a
                    key={index}
                    href={social.href}
                    aria-label={social.label}
                    className={`w-10 h-10 rounded-lg bg-surface-muted flex items-center justify-center text-text-secondary ${social.color} transition-all duration-200 hover:scale-110 transform`}
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                )
              })}
            </div>
          </div>

          {/* Product Links */}
          <div className="sm:col-span-1">
            <h3 className="text-text-primary font-semibold mb-4 text-base sm:text-lg">Quick Links</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.product.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm sm:text-base block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Links */}
          <div className="sm:col-span-1">
            <h3 className="text-text-primary font-semibold mb-4 text-base sm:text-lg">Support</h3>
            <ul className="space-y-2 sm:space-y-3">
              {footerLinks.support.map((link, index) => (
                <li key={index}>
                  <a
                    href={link.href}
                    className="text-text-secondary hover:text-primary transition-colors duration-200 text-sm sm:text-base block"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="mt-8 sm:mt-12 pt-8 border-t border-border-soft">
          <div className="max-w-md mx-auto text-center px-2">
            <h3 className="text-text-primary font-semibold mb-2 text-lg sm:text-xl">Stay Updated</h3>
            <p className="text-text-secondary text-xs sm:text-sm mb-4">
              Get the latest RC tips and practice updates delivered to your inbox
            </p>
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
      </div>

      {/* Bottom Bar */}
     <div className="border-t border-border-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center text-center md:text-left">
            {/* Copyright */}
            <div className="text-text-secondary text-xs sm:text-sm order-2 md:order-1">
              © {currentYear} ARC Prep. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs sm:text-sm order-3 md:order-2">
              {legalLinks.map((link, index) => (
                <a
                  key={index}
                  href={link.href}
                  className="text-text-secondary hover:text-primary transition-colors duration-200"
                >
                  {link.name}
                </a>
              ))}
            </div>

            {/* Made with love */}
            <div className="text-text-secondary text-xs sm:text-sm flex items-center justify-center md:justify-end gap-2 order-1 md:order-3">
              Made with <span className="text-error-red animate-pulse">❤️</span> for aspirants
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}